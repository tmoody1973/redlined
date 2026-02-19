"use client";

import { useState } from "react";
import { useDecadesData } from "@/lib/useDecadesData";
import {
  generateOwnershipNarrative,
  generateIncomeNarrative,
  generateZoneNarrative,
} from "@/lib/narrative-text";
import { SourceCitation } from "./SourceCitation";

const HOLC_COLORS: Record<string, string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
};

const GRADE_LABELS: Record<string, string> = {
  A: '"Best" rated (A)',
  B: '"Still Desirable" (B)',
  C: '"Declining" (C)',
  D: '"Hazardous" rated (D)',
};

interface DecadesPanelProps {
  grade: string | null;
  areaId: string;
  zoneName: string;
}

function formatIncome(val: number | null): string {
  if (val === null) return "\u2014";
  return `$${Math.round(val).toLocaleString("en-US")}`;
}

/**
 * Renders a horizontal bar scaled to a max value.
 */
function MiniBar({
  value,
  maxValue,
  color,
  label,
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}) {
  const width = maxValue > 0 ? Math.max(3, (value / maxValue) * 100) : 3;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div
          className="h-2.5 rounded-sm transition-all duration-300"
          style={{ width: `${width}%`, backgroundColor: color }}
          role="img"
          aria-label={label}
        />
      </div>
    </div>
  );
}

/**
 * Insight callout — amber box highlighting a key takeaway.
 */
function InsightCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
      <p
        className="text-[11px] leading-relaxed text-amber-400/90"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </p>
    </div>
  );
}

/**
 * Displays decade-by-decade statistics combining Chang & Smith (2016)
 * published research (1950-2010 grade averages) with Census API data
 * (2010-2020 zone-level detail). Written for museum visitors.
 */
export default function DecadesPanel({ grade, areaId, zoneName }: DecadesPanelProps) {
  const data = useDecadesData(grade, areaId);
  const [showAllGrades, setShowAllGrades] = useState(false);

  if (!data) return null;

  const { decades, keyInsights, census, selectedZone } = data;

  // Research data: 4 decades (1950, 1970, 1990, 2010)
  const researchYears = decades.map((d) => d.year);

  // Build ownership trend from research for A vs D
  const ownershipByGrade: Record<string, number[]> = { A: [], B: [], C: [], D: [] };
  for (const decade of decades) {
    for (const g of ["A", "B", "C", "D"]) {
      ownershipByGrade[g].push(decade.metrics[g]?.homeOwnership ?? 0);
    }
  }

  // If census data is loaded, append 2020 ownership from grade time series
  if (census?.gradeTimeSeries) {
    const idx2020 = census.decades.indexOf(2020);
    if (idx2020 >= 0) {
      for (const g of ["A", "B", "C", "D"]) {
        const ts = census.gradeTimeSeries[g];
        ownershipByGrade[g].push(ts?.homeOwnership?.[idx2020] ?? 0);
      }
    }
  }

  // Build merged decade labels for the chart
  const chartYears = [...researchYears];
  if (census && census.decades.includes(2020)) {
    chartYears.push(2020);
  }

  // Build income data from research
  const incomeByGrade: Record<string, number[]> = { A: [], B: [], C: [], D: [] };
  for (const decade of decades) {
    for (const g of ["A", "B", "C", "D"]) {
      incomeByGrade[g].push(decade.metrics[g]?.medianIncome ?? 0);
    }
  }
  // Append 2020 income from census
  if (census?.gradeTimeSeries) {
    const idx2020 = census.decades.indexOf(2020);
    if (idx2020 >= 0) {
      for (const g of ["A", "B", "C", "D"]) {
        const ts = census.gradeTimeSeries[g];
        incomeByGrade[g].push(ts?.income?.[idx2020] ?? 0);
      }
    }
  }

  const incomeYears = [...researchYears];
  if (census && census.decades.includes(2020)) {
    incomeYears.push(2020);
  }

  const maxIncome = Math.max(
    ...Object.values(incomeByGrade).flat().filter(Boolean),
  );

  // Generate plain-English narratives
  const ownershipNarrative = generateOwnershipNarrative(
    ownershipByGrade["A"],
    ownershipByGrade["D"],
    chartYears,
  );

  const incomeNarrative = generateIncomeNarrative(
    incomeByGrade["A"],
    incomeByGrade["D"],
    incomeYears,
  );

  // Zone-specific narrative
  const idx2010 = census?.decades.indexOf(2010) ?? -1;
  const idx2020 = census?.decades.indexOf(2020) ?? -1;
  const zoneIncome2010 = selectedZone && idx2010 >= 0 ? selectedZone.income[idx2010] : null;
  const zoneIncome2020 = selectedZone && idx2020 >= 0 ? selectedZone.income[idx2020] : null;
  const zoneOwnership2010 = selectedZone && idx2010 >= 0 ? selectedZone.homeOwnership[idx2010] : null;
  const zoneOwnership2020 = selectedZone && idx2020 >= 0 ? selectedZone.homeOwnership[idx2020] : null;

  // Average income for this zone's grade (from latest year across all zones of that grade)
  let gradeAvgIncome: number | null = null;
  if (grade && census?.gradeTimeSeries?.[grade]) {
    const ts = census.gradeTimeSeries[grade];
    const latestIdx = ts.income.length - 1;
    if (latestIdx >= 0) gradeAvgIncome = ts.income[latestIdx];
  }

  const zoneNarrative = selectedZone
    ? generateZoneNarrative(
        zoneName,
        grade,
        zoneIncome2010,
        zoneIncome2020,
        zoneOwnership2010,
        zoneOwnership2020,
        gradeAvgIncome,
      )
    : "";

  // Insight callout text
  const firstD = Math.round((ownershipByGrade["D"][0] ?? 0) * 100);
  const lastD = Math.round((ownershipByGrade["D"][ownershipByGrade["D"].length - 1] ?? 0) * 100);
  const latestIncomeA = incomeByGrade["A"][incomeByGrade["A"].length - 1] ?? 0;
  const latestIncomeD = incomeByGrade["D"][incomeByGrade["D"].length - 1] ?? 0;
  const incomeRatio = latestIncomeD > 0 ? (latestIncomeA / latestIncomeD).toFixed(1) : null;

  return (
    <section aria-label="Decades of Change" className="space-y-5">
      {/* ── Who Owned Their Home? ── */}
      <div>
        <h3
          className="mb-1.5 text-sm font-semibold text-slate-200"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Who Owned Their Home?
        </h3>

        {/* Narrative paragraph */}
        {ownershipNarrative && (
          <p
            className="mb-3 text-[12px] leading-relaxed text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {ownershipNarrative}
          </p>
        )}

        {/* A vs D bar chart */}
        <div className="space-y-2">
          {(["A", "D"] as const).map((g) => (
            <div key={g}>
              <div className="mb-1 flex items-center justify-between">
                <span
                  className="text-[11px] text-slate-300"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {GRADE_LABELS[g]}
                </span>
              </div>
              <div className="flex items-end gap-[3px]">
                {chartYears.map((year, i) => {
                  const rate = ownershipByGrade[g][i] ?? 0;
                  const height = Math.max(4, rate * 44);
                  const pct = Math.round(rate * 100);
                  return (
                    <div
                      key={year}
                      className="group relative flex flex-col items-center"
                      style={{ flex: 1 }}
                    >
                      <span
                        className="mb-0.5 text-[8px] font-medium text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {pct}%
                      </span>
                      <div
                        className="w-full rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${height}px`,
                          backgroundColor: HOLC_COLORS[g],
                          opacity: g === grade ? 1 : 0.7,
                        }}
                      />
                      <span
                        className="mt-0.5 text-[9px] text-slate-500"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {year}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Insight callout */}
        <div className="mt-3">
          <InsightCallout>
            {Math.abs(lastD - firstD) <= 5
              ? `Ownership barely changed in redlined areas \u2014 ${firstD}% in ${chartYears[0]}, still ${lastD}% in ${chartYears[chartYears.length - 1]}.`
              : lastD < firstD
                ? `Ownership actually fell in redlined areas \u2014 from ${firstD}% in ${chartYears[0]} to ${lastD}% in ${chartYears[chartYears.length - 1]}.`
                : `Even after decades, redlined areas only reached ${lastD}% ownership \u2014 up from ${firstD}% in ${chartYears[0]}.`}
          </InsightCallout>
        </div>
      </div>

      {/* ── How Much Did Families Earn? ── */}
      <div>
        <h3
          className="mb-1.5 text-sm font-semibold text-slate-200"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          How Much Did Families Earn?
        </h3>

        {/* Narrative paragraph */}
        {incomeNarrative && (
          <p
            className="mb-3 text-[12px] leading-relaxed text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {incomeNarrative}
          </p>
        )}

        {/* A vs D income bars — primary visual */}
        <div className="space-y-2">
          {(["A", "D"] as const).map((g) => {
            const latest = incomeByGrade[g][incomeByGrade[g].length - 1] ?? 0;
            const yearLabel = incomeYears[incomeYears.length - 1];
            return (
              <div key={g}>
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className="text-[11px] text-slate-300"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {GRADE_LABELS[g]}
                  </span>
                  <span
                    className="text-[11px] font-medium text-slate-200"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {latest > 0 ? `$${Math.round(latest / 1000)}K` : "\u2014"}{" "}
                    <span className="text-slate-500">({yearLabel})</span>
                  </span>
                </div>
                <MiniBar
                  value={latest}
                  maxValue={maxIncome}
                  color={HOLC_COLORS[g]}
                  label={`${GRADE_LABELS[g]}: $${Math.round(latest / 1000)}K in ${yearLabel}`}
                />
              </div>
            );
          })}
        </div>

        {/* Insight callout */}
        {incomeRatio && (
          <div className="mt-3">
            <InsightCallout>
              Families in best-rated areas earn {incomeRatio}x more than in redlined areas.
            </InsightCallout>
          </div>
        )}

        {/* Full 4-grade table behind progressive disclosure */}
        <details className="mt-3">
          <summary
            className="cursor-pointer text-[11px] text-slate-500 transition-colors hover:text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
            onClick={() => setShowAllGrades(!showAllGrades)}
          >
            Show all grades
          </summary>
          <table className="mt-2 w-full text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
            <thead>
              <tr className="text-slate-500">
                <th className="pb-1 text-left font-normal">Grade</th>
                {incomeYears.map((y) => (
                  <th key={y} className="pb-1 text-right font-normal">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["A", "B", "C", "D"] as const).map((g) => {
                const isSelected = g === grade;
                return (
                  <tr
                    key={g}
                    className={isSelected ? "text-slate-100" : "text-slate-400"}
                  >
                    <td className="py-0.5">
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-sm"
                          style={{ backgroundColor: HOLC_COLORS[g] }}
                        />
                        {g}
                      </span>
                    </td>
                    {incomeByGrade[g].map((val, i) => (
                      <td key={incomeYears[i]} className="py-0.5 text-right">
                        {val > 0 ? `$${Math.round(val / 1000)}K` : "\u2014"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      </div>

      {/* ── This Neighborhood ── */}
      {selectedZone && census && (
        <div className="rounded-md border border-slate-700/50 bg-slate-800/30 px-3 py-3">
          <h3
            className="mb-1 text-sm font-semibold text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {zoneName || "This Neighborhood"}
          </h3>

          {/* Narrative paragraph */}
          {zoneNarrative && (
            <p
              className="mb-3 text-[12px] leading-relaxed text-slate-400"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {zoneNarrative}
            </p>
          )}

          {/* Key stats */}
          <div className="space-y-1.5">
            {zoneIncome2020 !== null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
                  Median income (2020)
                </span>
                <span className="font-medium text-slate-200" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatIncome(zoneIncome2020)}
                  {zoneIncome2010 !== null && zoneIncome2010 > 0 && (
                    <span className="ml-1 text-slate-500">
                      ({(() => {
                        const pct = Math.round(((zoneIncome2020 - zoneIncome2010) / zoneIncome2010) * 100);
                        return `${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}%`;
                      })()})
                    </span>
                  )}
                </span>
              </div>
            )}
            {zoneOwnership2020 !== null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
                  Home ownership (2020)
                </span>
                <span className="font-medium text-slate-200" style={{ fontFamily: "var(--font-mono)" }}>
                  {Math.round(zoneOwnership2020 * 100)}%
                  {zoneOwnership2010 !== null && (
                    <span className="ml-1 text-slate-500">
                      ({(() => {
                        const diff = Math.round(zoneOwnership2020 * 100) - Math.round(zoneOwnership2010 * 100);
                        if (Math.abs(diff) <= 2) return "steady";
                        return `${diff > 0 ? "up" : "down"} ${Math.abs(diff)}pt`;
                      })()})
                    </span>
                  )}
                </span>
              </div>
            )}
            {gradeAvgIncome !== null && grade && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
                  Avg. for all &ldquo;{grade === "A" ? "Best" : grade === "D" ? "Hazardous" : grade === "C" ? "Declining" : "Still Desirable"}&rdquo; zones
                </span>
                <span className="text-slate-400" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatIncome(gradeAvgIncome)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Source citation */}
      <SourceCitation
        paperId="chang-smith-2016"
        label="Chang & Smith, 2016"
        finding="The socioeconomic conditions of redlined neighborhoods in Milwaukee County became more isolated from the rest of the city in recent years."
      />
    </section>
  );
}
