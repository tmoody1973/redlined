"use client";

import { useZoneIncome } from "@/lib/useZoneIncome";

interface IncomeStatisticsProps {
  areaId: string;
}

/**
 * Formats a number as a dollar amount with commas and no decimals.
 */
function formatIncome(value: number | null): string {
  if (value === null) return "N/A";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/**
 * Formats a percentile rank as an ordinal string (e.g., "8th percentile").
 */
function formatPercentile(rank: number | null): string {
  if (rank === null) return "N/A";
  const r = Math.round(rank);
  const suffix =
    r % 100 >= 11 && r % 100 <= 13
      ? "th"
      : r % 10 === 1
        ? "st"
        : r % 10 === 2
          ? "nd"
          : r % 10 === 3
            ? "rd"
            : "th";
  return `${r}${suffix} percentile`;
}

/**
 * Income comparison bar component. Renders a horizontal bar with a label
 * and income value, scaled proportionally to maxIncome.
 */
function ComparisonBar({
  label,
  income,
  maxIncome,
  color,
}: {
  label: string;
  income: number | null;
  maxIncome: number;
  color: string;
}) {
  const width = income !== null && maxIncome > 0
    ? Math.max(5, (income / maxIncome) * 100)
    : 5;

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 shrink-0 items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span
          className="text-[11px] text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div
          className="h-3 rounded-sm transition-all duration-300"
          style={{ width: `${width}%`, backgroundColor: color }}
          role="presentation"
        />
        <span
          className="shrink-0 text-xs text-slate-300"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatIncome(income)}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays income statistics for a selected zone when the income overlay
 * is active. Shows median income, percentile rank, grade comparison bars,
 * and an insight callout about the A-zone to D-zone income gap.
 */
export default function IncomeStatistics({ areaId }: IncomeStatisticsProps) {
  const incomeData = useZoneIncome(areaId);

  if (!incomeData) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading income data...
      </p>
    );
  }

  const { weightedIncome, percentileRank, gradeAverages, insightRatio, yearsSinceHOLC } =
    incomeData;

  // Determine the max income for scaling comparison bars
  const allIncomes = [
    gradeAverages.A,
    gradeAverages.D,
    weightedIncome,
  ].filter((v): v is number => v !== null);
  const maxIncome = allIncomes.length > 0 ? Math.max(...allIncomes) : 120000;

  return (
    <section aria-label="Income Statistics" className="space-y-5">
      {/* Income headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Median Income
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatIncome(weightedIncome)}
          </span>
          <span
            className="text-sm font-medium text-amber-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPercentile(percentileRank)}
          </span>
        </div>
        <p
          className="mt-1 text-[11px] text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Present-day data &middot; U.S. Census ACS 5-Year Estimates
        </p>
        <p
          className="mt-0.5 text-[10px] italic text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Modern income reflecting the lasting economic impact of 1930s redlining
        </p>
      </div>

      {/* Grade comparison bars */}
      <div>
        <h3
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          A-Zone vs D-Zone
        </h3>
        <div className="space-y-2">
          <ComparisonBar
            label="A-Zone Avg"
            income={gradeAverages.A}
            maxIncome={maxIncome}
            color="#4CAF50"
          />
          <ComparisonBar
            label="This Zone"
            income={weightedIncome}
            maxIncome={maxIncome}
            color="#F44336"
          />
          <ComparisonBar
            label="D-Zone Avg"
            income={gradeAverages.D}
            maxIncome={maxIncome}
            color="#F44336"
          />
        </div>
      </div>

      {/* Insight callout */}
      {insightRatio && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <p
            className="text-sm font-semibold text-amber-400"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {insightRatio} higher in A-zones
          </p>
          <p
            className="mt-0.5 text-xs text-amber-400/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {yearsSinceHOLC} years after HOLC grades were assigned
          </p>
        </div>
      )}
    </section>
  );
}
