"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

interface ZoneParcelStats {
  parcelCount: number;
  totalAssessedValue: number;
  avgAssessedValue: number | null;
  avgYrBuilt: number | null;
  grade: string | null;
}

interface ConvexZoneRecord {
  areaId: string;
  grade: string | null;
}

export interface ZoneValueData {
  avgAssessedValue: number | null;
  totalAssessedValue: number | null;
  parcelCount: number;
  avgYrBuilt: number | null;
  percentileRank: number | null;
  gradeAverages: Record<string, number | null>;
  insightRatio: string | null;
}

/**
 * Hook that provides assessed value statistics for a given HOLC zone
 * using pre-computed parcel stats from the static JSON file.
 */
export function useZoneValue(areaId: string | null): ZoneValueData | null {
  const [allStats, setAllStats] = useState<Record<string, ZoneParcelStats> | null>(null);
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;

  useEffect(() => {
    fetch("/data/milwaukee-parcels-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAllStats(data);
      })
      .catch(() => {});
  }, []);

  return useMemo(() => {
    if (!areaId || !allStats || !zones) return null;

    const thisZone = allStats[areaId];
    if (!thisZone) return null;

    // Compute percentile rank across all zones
    const allValues = Object.entries(allStats)
      .filter(([, s]) => s.avgAssessedValue !== null)
      .map(([id, s]) => ({ areaId: id, value: s.avgAssessedValue! }))
      .sort((a, b) => a.value - b.value);

    const thisIdx = allValues.findIndex((z) => z.areaId === areaId);
    const percentileRank =
      thisIdx >= 0 && allValues.length > 1
        ? Math.round((thisIdx / (allValues.length - 1)) * 100)
        : null;

    // Compute grade averages
    const gradeByAreaId = new Map<string, string | null>();
    for (const zone of zones) {
      gradeByAreaId.set(zone.areaId, zone.grade);
    }

    const gradeSums = new Map<string, { sum: number; count: number }>();
    for (const [id, stats] of Object.entries(allStats)) {
      if (stats.avgAssessedValue === null) continue;
      const grade = gradeByAreaId.get(id) ?? stats.grade ?? "ungraded";
      const existing = gradeSums.get(grade) ?? { sum: 0, count: 0 };
      existing.sum += stats.avgAssessedValue;
      existing.count++;
      gradeSums.set(grade, existing);
    }

    const gradeAverages: Record<string, number | null> = {};
    for (const grade of ["A", "B", "C", "D"]) {
      const data = gradeSums.get(grade);
      gradeAverages[grade] = data && data.count > 0 ? data.sum / data.count : null;
    }

    // Insight ratio
    let insightRatio: string | null = null;
    if (gradeAverages.A && gradeAverages.D && gradeAverages.D > 0) {
      const ratio = gradeAverages.A / gradeAverages.D;
      insightRatio = `${ratio.toFixed(1)}x`;
    }

    return {
      avgAssessedValue: thisZone.avgAssessedValue,
      totalAssessedValue: thisZone.totalAssessedValue,
      parcelCount: thisZone.parcelCount,
      avgYrBuilt: thisZone.avgYrBuilt,
      percentileRank,
      gradeAverages,
      insightRatio,
    };
  }, [areaId, allStats, zones]);
}
