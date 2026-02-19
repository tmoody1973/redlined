"use client";

import { useDecadesData } from "@/lib/useDecadesData";
import { SourceCitation } from "./SourceCitation";

const HOLC_COLORS: Record<string, string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
};

interface DecadesPanelProps {
  grade: string | null;
  areaId: string;
}

function formatIncome(val: number | null): string {
  if (val === null) return "—";
  return `$${Math.round(val).toLocaleString("en-US")}`;
}

/**
 * Renders a horizontal bar scaled to a max value.
 */
function MiniBar({
  value,
  maxValue,
  color,
}: {
  value: number;
  maxValue: number;
  color: string;
}) {
  const width = maxValue > 0 ? Math.max(3, (value / maxValue) * 100) : 3;
  return (
    <div
      className="h-2 rounded-sm transition-all duration-300"
      style={{ width: `${width}%`, backgroundColor: color }}
    />
  );
}

/**
 * Displays decade-by-decade statistics combining Chang & Smith (2016)
 * published research (1950-2010 grade averages) with Census API data
 * (2010-2020 zone-level detail).
 */
export default function DecadesPanel({ grade, areaId }: DecadesPanelProps) {
  const data = useDecadesData(grade, areaId);

  if (!data) return null;

  const { decades, keyInsights, census, selectedZone } = data;

  // Research data: 4 decades (1950, 1970, 1990, 2010)
  const researchYears = decades.map((d) => d.year);

  // Build ownership trend from research for A vs D mini-chart
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

  return (
    <section aria-label="Decades of Change" className="space-y-4">
      {/* Section heading */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Decades of Change
        </span>
        <p
          className="mt-0.5 text-[11px] text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Grade-level trends, 1950&ndash;{chartYears[chartYears.length - 1]}
        </p>
      </div>

      {/* Home Ownership Rate trend — visual mini-chart */}
      <div>
        <h3
          className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Home Ownership Rate
        </h3>
        <div className="space-y-1.5">
          {(["A", "D"] as const).map((g) => (
            <div key={g}>
              <div className="mb-0.5 flex items-center justify-between">
                <span
                  className="text-[10px] text-slate-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Grade {g}
                </span>
              </div>
              <div className="flex items-end gap-[3px]">
                {chartYears.map((year, i) => {
                  const rate = ownershipByGrade[g][i] ?? 0;
                  const height = Math.max(4, rate * 40);
                  const isSelected = g === grade;
                  return (
                    <div
                      key={year}
                      className="group relative flex flex-col items-center"
                      style={{ flex: 1 }}
                    >
                      <div
                        className="w-full rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${height}px`,
                          backgroundColor: HOLC_COLORS[g],
                          opacity: isSelected ? 1 : 0.7,
                        }}
                      />
                      <span
                        className="mt-0.5 text-[8px] text-slate-500"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {String(year).slice(2)}
                      </span>
                      <span
                        className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-200 opacity-0 shadow transition-opacity group-hover:opacity-100"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {Math.round(rate * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Compact A vs D summary */}
        <div className="mt-2 flex gap-4 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
          <span className="text-slate-400">
            A: {Math.round(keyInsights.ownershipGap1950.A * 100)}%
            <span className="mx-0.5 text-slate-600">&rarr;</span>
            {Math.round(keyInsights.ownershipGap2010.A * 100)}%
          </span>
          <span className="text-slate-400">
            D: {Math.round(keyInsights.ownershipGap1950.D * 100)}%
            <span className="mx-0.5 text-slate-600">&rarr;</span>
            {Math.round(keyInsights.ownershipGap2010.D * 100)}%
          </span>
        </div>
      </div>

      {/* Median Income by grade and decade */}
      <div>
        <h3
          className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Median Household Income
        </h3>
        <table className="w-full text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
          <thead>
            <tr className="text-slate-500">
              <th className="pb-1 text-left font-normal">Grade</th>
              {incomeYears.map((y) => (
                <th key={y} className="pb-1 text-right font-normal">
                  {String(y).slice(2)}
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
                      {val > 0 ? `$${Math.round(val / 1000)}K` : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Income mini-bars: A vs D latest */}
        <div className="mt-2 space-y-1">
          {(["A", "D"] as const).map((g) => {
            const latest = incomeByGrade[g][incomeByGrade[g].length - 1] ?? 0;
            const yearLabel = incomeYears[incomeYears.length - 1];
            return (
              <div key={g} className="flex items-center gap-2">
                <span className="w-10 text-[9px] text-slate-500" style={{ fontFamily: "var(--font-mono)" }}>
                  {g} &apos;{String(yearLabel).slice(2)}
                </span>
                <div className="flex-1">
                  <MiniBar value={latest} maxValue={maxIncome} color={HOLC_COLORS[g]} />
                </div>
                <span className="text-[9px] text-slate-400" style={{ fontFamily: "var(--font-mono)" }}>
                  {latest > 0 ? `$${Math.round(latest / 1000)}K` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone-specific income trend (2010 vs 2020) — shown when census data is loaded */}
      {selectedZone && census && (
        <div className="rounded-md border border-slate-700/50 bg-slate-800/30 px-3 py-2.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            This Zone ({selectedZone.label})
          </p>
          <div className="mt-2 space-y-1.5">
            {census.decades
              .map((year, i) => {
                const income = selectedZone.income[i];
                const ownership = selectedZone.homeOwnership[i];
                if (income === null && ownership === null) return null;
                return (
                  <div key={year} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400" style={{ fontFamily: "var(--font-mono)" }}>
                      {year}
                    </span>
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-mono)" }}>
                      {formatIncome(income)}
                    </span>
                    <span className="text-slate-400" style={{ fontFamily: "var(--font-mono)" }}>
                      {ownership !== null ? `${Math.round(ownership * 100)}% own` : "—"}
                    </span>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
          {selectedZone.income[census.decades.indexOf(2010)] !== null &&
            selectedZone.income[census.decades.indexOf(2020)] !== null && (
              <p className="mt-2 text-[10px] text-slate-500" style={{ fontFamily: "var(--font-body)" }}>
                Income change:{" "}
                {(() => {
                  const inc2010 = selectedZone.income[census.decades.indexOf(2010)] ?? 0;
                  const inc2020 = selectedZone.income[census.decades.indexOf(2020)] ?? 0;
                  if (inc2010 === 0) return "—";
                  const pctChange = ((inc2020 - inc2010) / inc2010) * 100;
                  return `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(0)}% (2010–2020)`;
                })()}
              </p>
            )}
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
