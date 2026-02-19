"use client";

import { useState, useEffect, useMemo } from "react";

interface ZoneHRS {
  areaId: string;
  hrs2010: number | null;
  hrs2020: number | null;
  hrsChange: number | null;
  category: string;
  tractCount: number;
}

interface GradeStats {
  avgHRS: number;
  minHRS: number;
  maxHRS: number;
  zoneCount: number;
}

interface HRSData {
  source: string;
  methodology: string;
  gradeStats: Record<string, GradeStats>;
  zones: Record<string, ZoneHRS>;
}

export interface ZoneHRSResult {
  zone: ZoneHRS | null;
  gradeStats: Record<string, GradeStats>;
  source: string;
  methodology: string;
}

let cached: HRSData | null = null;

/**
 * Loads Historic Redlining Score (HRS) data for a given zone.
 * HRS is a continuous 1.0–4.0 score per Census tract, computed as the
 * area-weighted average of HOLC grades (A=1, B=2, C=3, D=4).
 */
export function useZoneHRS(areaId: string | null): ZoneHRSResult | null {
  const [data, setData] = useState<HRSData | null>(cached);

  useEffect(() => {
    if (!cached) {
      fetch("/data/hrs-by-zone.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((d: HRSData | null) => {
          if (d) {
            cached = d;
            setData(d);
          }
        })
        .catch(() => {});
    }
  }, []);

  return useMemo(() => {
    if (!data) return null;

    return {
      zone: areaId && data.zones[areaId] ? data.zones[areaId] : null,
      gradeStats: data.gradeStats,
      source: data.source,
      methodology: data.methodology,
    };
  }, [data, areaId]);
}
