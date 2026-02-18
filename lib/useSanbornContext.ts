"use client";

import { useState, useEffect, useMemo } from "react";

export interface SanbornZoneContext {
  areaId: string;
  label: string;
  grade: string;
  buildingsType: string;
  construction: string;
  averageAge: string;
  repair: string;
  dwellingUnits: string;
  newConstruction: string;
  terrain: string;
  demolitionCount: number;
  approxAge1910: string | null;
  approxAge1894: string | null;
}

export interface SanbornGradeSummary {
  totalZones: number;
  avgDemolitions: number;
  totalDemolitions: number;
  dominantConstruction: string;
  dominantRepair: string;
}

interface SanbornContextData {
  zones: Record<string, SanbornZoneContext>;
  gradeSummaries: Record<string, SanbornGradeSummary>;
}

let cachedData: SanbornContextData | null = null;

/**
 * Hook to load pre-computed Sanborn context data (1938 building assessments
 * combined with demolition counts). Returns zone-specific context and
 * grade-level summaries.
 */
export function useSanbornContext(areaId: string) {
  const [data, setData] = useState<SanbornContextData | null>(cachedData);

  useEffect(() => {
    if (cachedData) return;
    fetch("/data/sanborn-context-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) {
          cachedData = d;
          setData(d);
        }
      })
      .catch(() => {});
  }, []);

  const zone = useMemo(() => data?.zones[areaId] ?? null, [data, areaId]);
  const gradeSummaries = data?.gradeSummaries ?? null;

  return { zone, gradeSummaries };
}
