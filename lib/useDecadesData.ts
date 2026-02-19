"use client";

import { useState, useEffect, useMemo } from "react";

// --- Research-only types (decades-research-stats.json) ---

interface GradeMetrics {
  medianIncome: number | null;
  homeOwnership: number | null;
  medianHomeValue: number | null;
}

interface DecadeEntry {
  year: number;
  metrics: Record<string, GradeMetrics>;
}

interface DecadesKeyInsights {
  ownershipGap1950: { A: number; D: number; gap: number };
  ownershipGap2010: { A: number; D: number; gap: number };
  ownershipGapChange: string;
  incomeGap1950: { A: number; D: number; ratio: number };
  incomeGap2010: { A: number; D: number; ratio: number };
  incomeGapChange: string;
  gradeAOwnershipGrowth: string;
  gradeDOwnershipStagnation: string;
}

interface DecadesResearchData {
  source: string;
  decades: DecadeEntry[];
  keyInsights: DecadesKeyInsights;
}

// --- Census-enriched types (decades-by-zone.json) ---

interface GradeTimeSeries {
  income: (number | null)[];
  homeOwnership: (number | null)[];
}

interface ZoneTimeSeries {
  areaId: string;
  label: string;
  grade: string;
  income: (number | null)[];
  homeOwnership: (number | null)[];
}

interface DecadesCensusData {
  source: string;
  decades: number[];
  gradeTimeSeries: Record<string, GradeTimeSeries>;
  zones: Record<string, ZoneTimeSeries>;
  censusInsights: {
    incomeRatio2010: number | null;
    incomeRatio2020: number | null;
    ownershipGap2010: number | null;
    ownershipGap2020: number | null;
  };
}

// --- Public return type ---

export interface DecadesData {
  /** Research-level data (1950-2010 grade averages) */
  decades: DecadeEntry[];
  keyInsights: DecadesKeyInsights;
  source: string;
  /** Census-enriched data (zone-level 2010+2020) — null if not loaded yet */
  census: DecadesCensusData | null;
  /** Zone-specific time series for the selected zone */
  selectedZone: ZoneTimeSeries | null;
}

let cachedResearch: DecadesResearchData | null = null;
let cachedCensus: DecadesCensusData | null = null;

/**
 * Loads decade-by-decade statistics combining Chang & Smith (2016)
 * published research with Census API data for 2010 and 2020.
 */
export function useDecadesData(
  selectedGrade: string | null,
  areaId?: string | null,
): DecadesData | null {
  const [research, setResearch] = useState<DecadesResearchData | null>(cachedResearch);
  const [census, setCensus] = useState<DecadesCensusData | null>(cachedCensus);

  useEffect(() => {
    if (!cachedResearch) {
      fetch("/data/decades-research-stats.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((d: DecadesResearchData | null) => {
          if (d) {
            cachedResearch = d;
            setResearch(d);
          }
        })
        .catch(() => {});
    }

    if (!cachedCensus) {
      fetch("/data/decades-by-zone.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((d: DecadesCensusData | null) => {
          if (d) {
            cachedCensus = d;
            setCensus(d);
          }
        })
        .catch(() => {});
    }
  }, []);

  return useMemo(() => {
    if (!research) return null;

    const selectedZone =
      areaId && census?.zones?.[areaId] ? census.zones[areaId] : null;

    return {
      decades: research.decades,
      keyInsights: research.keyInsights,
      source: research.source,
      census,
      selectedZone,
    };
  }, [research, census, selectedGrade, areaId]);
}
