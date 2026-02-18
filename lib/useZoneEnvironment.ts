"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ConvexEnvironmentRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  ejPercentile: number | null;
  pm25: number | null;
  ozone: number | null;
  dieselPM: number | null;
  toxicReleases: number | null;
  superfundProximity: number | null;
}

interface ConvexZoneRecord {
  areaId: string;
  grade: string | null;
}

interface EnvironmentMeasure {
  label: string;
  value: number | null;
  unit: string;
  description: string;
}

export interface ZoneEnvironmentData {
  ejPercentile: number | null;
  percentileRank: number | null;
  measures: EnvironmentMeasure[];
  gradeAverages: Record<string, number | null>;
  insightRatio: string | null;
}

/**
 * Compute an area-weighted value for a zone from tract-level records.
 */
function computeWeightedValue(
  records: { pctTract: number; value: number | null }[],
): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of records) {
    if (r.value === null) continue;
    weightedSum += r.value * r.pctTract;
    totalWeight += r.pctTract;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

/**
 * Hook that computes environmental burden statistics for a given zone.
 */
export function useZoneEnvironment(areaId: string | null): ZoneEnvironmentData | null {
  const envData = useQuery(api.queries.getAllEnvironmentData) as
    | ConvexEnvironmentRecord[]
    | undefined;
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;

  return useMemo(() => {
    if (!areaId || !envData || !zones) return null;

    // Group records by areaId
    const byArea = new Map<string, ConvexEnvironmentRecord[]>();
    for (const r of envData) {
      const arr = byArea.get(r.areaId) ?? [];
      arr.push(r);
      byArea.set(r.areaId, arr);
    }

    const zoneRecords = byArea.get(areaId);
    if (!zoneRecords || zoneRecords.length === 0) return null;

    // Compute weighted measures for this zone
    const ejPercentile = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.ejPercentile })),
    );
    const pm25 = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.pm25 })),
    );
    const ozone = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.ozone })),
    );
    const dieselPM = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.dieselPM })),
    );
    const toxicReleases = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.toxicReleases })),
    );
    const superfundProximity = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.superfundProximity })),
    );

    // Compute EJ percentile for all zones for ranking
    const allZoneEJ: { areaId: string; ej: number }[] = [];
    for (const [id, records] of byArea) {
      const ej = computeWeightedValue(
        records.map((r) => ({ pctTract: r.pctTract, value: r.ejPercentile })),
      );
      if (ej !== null) allZoneEJ.push({ areaId: id, ej });
    }

    // Sort ascending (lower burden = better environment = higher percentile rank)
    allZoneEJ.sort((a, b) => a.ej - b.ej);
    const thisIdx = allZoneEJ.findIndex((z) => z.areaId === areaId);
    const percentileRank =
      thisIdx >= 0 ? Math.round(((allZoneEJ.length - 1 - thisIdx) / (allZoneEJ.length - 1)) * 100) : null;

    // Compute grade averages
    const gradeByAreaId = new Map<string, string | null>();
    for (const zone of zones) {
      gradeByAreaId.set(zone.areaId, zone.grade);
    }

    const gradeEJ = new Map<string, { sum: number; count: number }>();
    for (const z of allZoneEJ) {
      const grade = gradeByAreaId.get(z.areaId) ?? "ungraded";
      const existing = gradeEJ.get(grade) ?? { sum: 0, count: 0 };
      existing.sum += z.ej;
      existing.count++;
      gradeEJ.set(grade, existing);
    }

    const gradeAverages: Record<string, number | null> = {};
    for (const grade of ["A", "B", "C", "D"]) {
      const data = gradeEJ.get(grade);
      gradeAverages[grade] = data && data.count > 0 ? data.sum / data.count : null;
    }

    // Insight: D-zone vs A-zone environmental burden ratio
    let insightRatio: string | null = null;
    if (gradeAverages.A && gradeAverages.D && gradeAverages.A > 0) {
      const ratio = gradeAverages.D / gradeAverages.A;
      insightRatio = `${ratio.toFixed(1)}x`;
    }

    return {
      ejPercentile,
      percentileRank,
      measures: [
        { label: "Respiratory", value: pm25, unit: "%", description: "Adult asthma prevalence (air quality proxy)" },
        { label: "Disability", value: ozone, unit: "%", description: "Disability prevalence" },
        { label: "Food Insecurity", value: dieselPM, unit: "%", description: "Food insecurity prevalence" },
        { label: "Uninsured", value: toxicReleases, unit: "%", description: "Lack of health insurance" },
        { label: "Housing Burden", value: superfundProximity, unit: "%", description: "Housing insecurity" },
      ],
      gradeAverages,
      insightRatio,
    };
  }, [areaId, envData, zones]);
}
