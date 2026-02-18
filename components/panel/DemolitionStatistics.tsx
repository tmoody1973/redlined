"use client";

import { useState, useEffect, useMemo } from "react";
import type { HOLCGrade } from "@/types/holc";

interface DemolitionStatisticsProps {
  areaId: string;
  grade: HOLCGrade | null;
}

interface GhostZoneData {
  zones: Record<
    string,
    { grade: string; total: number; byPeriod: Record<string, number> }
  >;
  gradeTotals: Record<string, number>;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
};

/**
 * Displays demolition statistics for a selected zone when ghost mode
 * is active. Shows the count of demolished buildings, comparison across
 * HOLC grades, and a plain English summary.
 */
export default function DemolitionStatistics({
  areaId,
  grade,
}: DemolitionStatisticsProps) {
  const [data, setData] = useState<GhostZoneData | null>(null);

  useEffect(() => {
    fetch("/data/ghost-buildings-by-zone.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {});
  }, []);

  const zoneStats = data?.zones[areaId];
  const gradeTotals = data?.gradeTotals;

  const summary = useMemo(() => {
    if (!zoneStats || !gradeTotals) return null;

    const thisCount = zoneStats.total;
    const thisGrade = grade || zoneStats.grade;

    if (thisCount === 0) {
      return "No demolished buildings detected in this zone between 2005 and 2020.";
    }

    let text = `${thisCount.toLocaleString()} buildings were demolished in this zone between 2005 and 2020. `;

    if (thisGrade === "D" || thisGrade === "C") {
      const aTotal = gradeTotals.A || 0;
      const dTotal = gradeTotals.D || 0;
      text += `Across all of Milwaukee, D-grade zones lost ${dTotal.toLocaleString()} buildings while A-grade zones lost just ${aTotal.toLocaleString()}. `;
      text +=
        "This pattern reflects decades of disinvestment in neighborhoods marked \u2018Hazardous\u2019 by HOLC appraisers in 1938.";
    } else if (thisGrade === "A" || thisGrade === "B") {
      text +=
        "Neighborhoods graded favorably by HOLC appraisers experienced far fewer demolitions \u2014 a lasting benefit of 1938 investment patterns.";
    }

    return text;
  }, [zoneStats, gradeTotals, grade]);

  if (!data) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading demolition data...
      </p>
    );
  }

  if (!zoneStats) {
    return (
      <p
        className="text-sm text-slate-500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        No demolition data for this zone.
      </p>
    );
  }

  const maxGrade = Math.max(
    ...(Object.values(gradeTotals || {}) as number[]),
    1,
  );

  return (
    <section aria-label="Demolition Statistics" className="space-y-4">
      {/* Headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Buildings Demolished
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-red-400"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {zoneStats.total.toLocaleString()}
          </span>
          <span
            className="text-sm text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            2005&ndash;2020
          </span>
        </div>
      </div>

      {/* Plain English summary */}
      {summary && (
        <p
          className="text-xs leading-relaxed text-slate-300"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {summary}
        </p>
      )}

      {/* Grade comparison bars */}
      {gradeTotals && (
        <div>
          <h3
            className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Demolitions by HOLC Grade
          </h3>
          <div className="space-y-1.5">
            {(["A", "B", "C", "D"] as const).map((g) => {
              const count = gradeTotals[g] || 0;
              const width = Math.max(3, (count / maxGrade) * 100);
              const isThisGrade = grade === g;
              return (
                <div key={g} className="flex items-center gap-3">
                  <div className="flex w-20 shrink-0 items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: GRADE_COLORS[g] }}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-[11px] ${isThisGrade ? "font-semibold text-white" : "text-slate-400"}`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {g}-Zones
                    </span>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className="h-3 rounded-sm transition-all duration-300"
                      style={{
                        width: `${width}%`,
                        backgroundColor: GRADE_COLORS[g],
                        opacity: isThisGrade ? 1 : 0.5,
                      }}
                      role="presentation"
                    />
                    <span
                      className={`shrink-0 text-xs ${isThisGrade ? "font-semibold text-white" : "text-slate-300"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insight callout */}
      {gradeTotals && gradeTotals.D > 0 && gradeTotals.A > 0 && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <p
            className="text-sm font-semibold text-red-400"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {Math.round(gradeTotals.D / Math.max(gradeTotals.A, 1))}x more demolitions in D-zones
          </p>
          <p
            className="mt-0.5 text-xs text-red-400/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Redlined neighborhoods lost the most built environment
          </p>
        </div>
      )}
    </section>
  );
}
