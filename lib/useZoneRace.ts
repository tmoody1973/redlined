"use client";

import { useState, useEffect, useMemo } from "react";

interface HOLC1938 {
  negroPresence: string;
  negroPercent: string | null;
  infiltrationOf: string;
  foreignBornPercent: string;
  foreignBornNationality: string;
}

interface ZoneRaceEntry {
  areaId: string;
  label: string;
  grade: string;
  totalPop: number;
  pctWhite: number;
  pctBlack: number;
  pctHispanic: number;
  pctAsian: number;
  pctOther: number;
  holc1938: HOLC1938;
}

interface GradeRaceAverage {
  avgPctWhite: number;
  avgPctBlack: number;
  avgPctHispanic: number;
  avgPctAsian: number;
  avgTotalPop: number;
  zoneCount: number;
}

interface RaceData {
  zones: Record<string, ZoneRaceEntry>;
  gradeAverages: Record<string, GradeRaceAverage>;
}

export interface ZoneRaceData {
  zone: ZoneRaceEntry;
  gradeAverages: Record<string, GradeRaceAverage>;
}

/**
 * Loads racial demographics data for a given zone, including modern Census
 * race percentages and 1938 HOLC appraiser racial assessments.
 */
export function useZoneRace(areaId: string | null): ZoneRaceData | null {
  const [data, setData] = useState<RaceData | null>(null);

  useEffect(() => {
    fetch("/data/race-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  return useMemo(() => {
    if (!areaId || !data) return null;
    const zone = data.zones[areaId];
    if (!zone) return null;
    return { zone, gradeAverages: data.gradeAverages };
  }, [areaId, data]);
}
