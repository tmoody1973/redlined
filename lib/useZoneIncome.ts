"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  computeWeightedIncomeByZone,
  computeGradeAverages,
  computePercentileRanks,
  computeInsightRatio,
  type ZoneIncomeWithRank,
  type GradeAverages,
} from "./census-helpers";

interface ConvexCensusRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  medianIncome: number | null;
}

interface ConvexZoneRecord {
  areaId: string;
  grade: string | null;
}

export interface ZoneIncomeData {
  weightedIncome: number | null;
  percentileRank: number | null;
  gradeAverages: GradeAverages;
  insightRatio: string | null;
  yearsSinceHOLC: number;
}

/**
 * Hook that computes income statistics for a given zone by fetching all
 * Census data and zone grades from Convex and computing weighted incomes,
 * percentile ranks, grade averages, and the insight ratio.
 */
export function useZoneIncome(areaId: string | null): ZoneIncomeData | null {
  const censusData = useQuery(api.queries.getAllCensusData) as
    | ConvexCensusRecord[]
    | undefined;
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;

  return useMemo(() => {
    if (!areaId || !censusData || !zones) return null;

    // Build crosswalk and income maps from census data
    const crosswalkByAreaId = new Map<
      string,
      { geoid: string; pctTract: number }[]
    >();
    const incomeByGeoid = new Map<string, number>();

    for (const record of censusData) {
      const tracts = crosswalkByAreaId.get(record.areaId) ?? [];
      tracts.push({ geoid: record.geoid, pctTract: record.pctTract });
      crosswalkByAreaId.set(record.areaId, tracts);

      if (record.medianIncome !== null && !incomeByGeoid.has(record.geoid)) {
        incomeByGeoid.set(record.geoid, record.medianIncome);
      }
    }

    const zoneIncomes = computeWeightedIncomeByZone(crosswalkByAreaId, incomeByGeoid);

    // Build grade map
    const gradeByAreaId = new Map<string, string | null>();
    for (const zone of zones) {
      gradeByAreaId.set(zone.areaId, zone.grade);
    }

    const gradeAverages = computeGradeAverages(zoneIncomes, gradeByAreaId);
    const rankedZones = computePercentileRanks(zoneIncomes);
    const insightRatio = computeInsightRatio(gradeAverages);

    const thisZone = rankedZones.find((z) => z.areaId === areaId);
    if (!thisZone) return null;

    const currentYear = new Date().getFullYear();
    const yearsSinceHOLC = currentYear - 1938;

    return {
      weightedIncome: thisZone.weightedIncome,
      percentileRank: thisZone.percentileRank,
      gradeAverages,
      insightRatio,
      yearsSinceHOLC,
    };
  }, [areaId, censusData, zones]);
}
