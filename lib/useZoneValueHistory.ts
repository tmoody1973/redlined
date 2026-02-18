"use client";

import { useState, useEffect, useMemo } from "react";

interface ValueHistoryEntry {
  areaId: string;
  label: string;
  grade: string;
  price1930sLow: number | null;
  price1930sHigh: number | null;
  price1930sMid: number | null;
  price1930sAdjusted: number | null;
  priceToday: number | null;
  nominalGrowth: string | null;
  realGrowth: string | null;
  surveyYear: string;
}

interface GradeAverage {
  avg1930s: number | null;
  avgToday: number | null;
  avgGrowth: string | null;
  zoneCount: number;
}

interface ValueHistoryData {
  zones: Record<string, ValueHistoryEntry>;
  gradeAverages: Record<string, GradeAverage>;
}

export interface ZoneValueHistory {
  zone: ValueHistoryEntry;
  gradeAverages: Record<string, GradeAverage>;
}

/**
 * Loads the 1938-vs-today value comparison data for a given zone.
 */
export function useZoneValueHistory(
  areaId: string | null,
): ZoneValueHistory | null {
  const [data, setData] = useState<ValueHistoryData | null>(null);

  useEffect(() => {
    fetch("/data/value-history-by-zone.json")
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
