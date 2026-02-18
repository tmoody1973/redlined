"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ConvexHealthRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  asthma: number | null;
  diabetes: number | null;
  mentalHealth: number | null;
  physicalHealth: number | null;
  lifeExpectancy: number | null;
  healthRiskIndex: number | null;
}

interface ConvexZoneRecord {
  areaId: string;
  grade: string | null;
}

interface HealthMeasure {
  label: string;
  value: number | null;
  unit: string;
  description: string;
}

export interface ZoneHealthData {
  healthRiskIndex: number | null;
  percentileRank: number | null;
  measures: HealthMeasure[];
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
 * Hook that computes health outcome statistics for a given zone.
 */
export function useZoneHealth(areaId: string | null): ZoneHealthData | null {
  const healthData = useQuery(api.queries.getAllHealthData) as
    | ConvexHealthRecord[]
    | undefined;
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;

  return useMemo(() => {
    if (!areaId || !healthData || !zones) return null;

    // Group records by areaId
    const byArea = new Map<string, ConvexHealthRecord[]>();
    for (const r of healthData) {
      const arr = byArea.get(r.areaId) ?? [];
      arr.push(r);
      byArea.set(r.areaId, arr);
    }

    const zoneRecords = byArea.get(areaId);
    if (!zoneRecords || zoneRecords.length === 0) return null;

    // Compute weighted measures for this zone
    const healthRiskIndex = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.healthRiskIndex })),
    );
    const asthma = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.asthma })),
    );
    const diabetes = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.diabetes })),
    );
    const mentalHealth = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.mentalHealth })),
    );
    const physicalHealth = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.physicalHealth })),
    );
    const lifeExpectancy = computeWeightedValue(
      zoneRecords.map((r) => ({ pctTract: r.pctTract, value: r.lifeExpectancy })),
    );

    // Compute health risk index for all zones for percentile ranking
    const allZoneRisks: { areaId: string; risk: number }[] = [];
    for (const [id, records] of byArea) {
      const risk = computeWeightedValue(
        records.map((r) => ({ pctTract: r.pctTract, value: r.healthRiskIndex })),
      );
      if (risk !== null) allZoneRisks.push({ areaId: id, risk });
    }

    // Sort ascending (lower risk = better health = higher percentile)
    allZoneRisks.sort((a, b) => a.risk - b.risk);
    const thisIdx = allZoneRisks.findIndex((z) => z.areaId === areaId);
    const percentileRank =
      thisIdx >= 0 ? Math.round(((allZoneRisks.length - 1 - thisIdx) / (allZoneRisks.length - 1)) * 100) : null;

    // Compute grade averages for health risk
    const gradeByAreaId = new Map<string, string | null>();
    for (const zone of zones) {
      gradeByAreaId.set(zone.areaId, zone.grade);
    }

    const gradeRisks = new Map<string, { sum: number; count: number }>();
    for (const z of allZoneRisks) {
      const grade = gradeByAreaId.get(z.areaId) ?? "ungraded";
      const existing = gradeRisks.get(grade) ?? { sum: 0, count: 0 };
      existing.sum += z.risk;
      existing.count++;
      gradeRisks.set(grade, existing);
    }

    const gradeAverages: Record<string, number | null> = {};
    for (const grade of ["A", "B", "C", "D"]) {
      const data = gradeRisks.get(grade);
      gradeAverages[grade] = data && data.count > 0 ? data.sum / data.count : null;
    }

    // Insight: D-zone vs A-zone health risk ratio
    let insightRatio: string | null = null;
    if (gradeAverages.A && gradeAverages.D && gradeAverages.A > 0) {
      const ratio = gradeAverages.D / gradeAverages.A;
      insightRatio = `${ratio.toFixed(1)}x`;
    }

    return {
      healthRiskIndex,
      percentileRank,
      measures: [
        { label: "Asthma", value: asthma, unit: "%", description: "Adult asthma prevalence" },
        { label: "Diabetes", value: diabetes, unit: "%", description: "Adult diabetes prevalence" },
        { label: "Mental Distress", value: mentalHealth, unit: "%", description: "Frequent mental distress" },
        { label: "Physical Distress", value: physicalHealth, unit: "%", description: "Frequent physical distress" },
        { label: "Life Expectancy", value: lifeExpectancy, unit: " yrs", description: "Average life expectancy" },
      ],
      gradeAverages,
      insightRatio,
    };
  }, [areaId, healthData, zones]);
}
