"use client";

import { useZoneValue } from "@/lib/useZoneValue";
import { useZoneValueHistory } from "@/lib/useZoneValueHistory";

interface ValueStatisticsProps {
  areaId: string;
}

function formatDollars(value: number | null): string {
  if (value === null) return "N/A";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

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

function ComparisonBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number | null;
  maxValue: number;
  color: string;
}) {
  const width =
    value !== null && maxValue > 0
      ? Math.max(5, (value / maxValue) * 100)
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
          {formatDollars(value)}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays assessed property value statistics for a selected zone when
 * the value overlay is active. Shows average assessed value, parcel count,
 * average year built, and A-zone vs D-zone comparison.
 */
export default function ValueStatistics({ areaId }: ValueStatisticsProps) {
  const valueData = useZoneValue(areaId);

  if (!valueData) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading property data...
      </p>
    );
  }

  const {
    avgAssessedValue,
    parcelCount,
    avgYrBuilt,
    percentileRank,
    gradeAverages,
    insightRatio,
  } = valueData;

  const maxGrade = Math.max(
    ...[gradeAverages.A, gradeAverages.D, avgAssessedValue].filter(
      (v): v is number => v !== null,
    ),
    1,
  );

  return (
    <section aria-label="Property Value Statistics" className="space-y-5">
      {/* Value headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Avg. Assessed Value
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatDollars(avgAssessedValue)}
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
          Present-day data &middot; Milwaukee MPROP
        </p>
        <p
          className="mt-0.5 text-[10px] italic text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Property assessments reflecting decades of investment disparity
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-6">
        <div>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Parcels
          </span>
          <p
            className="text-lg font-bold text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {parcelCount.toLocaleString()}
          </p>
        </div>
        <div>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Avg. Year Built
          </span>
          <p
            className="text-lg font-bold text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {avgYrBuilt ?? "N/A"}
          </p>
        </div>
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
            value={gradeAverages.A}
            maxValue={maxGrade}
            color="#4CAF50"
          />
          <ComparisonBar
            label="This Zone"
            value={avgAssessedValue}
            maxValue={maxGrade}
            color="#F44336"
          />
          <ComparisonBar
            label="D-Zone Avg"
            value={gradeAverages.D}
            maxValue={maxGrade}
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
            Property values still reflect 1938 HOLC grade boundaries
          </p>
        </div>
      )}

      {/* 1938 vs Today comparison */}
      <HistoricalComparison areaId={areaId} />
    </section>
  );
}

/**
 * Shows 1930s appraiser-estimated property prices alongside today's
 * assessed values, revealing how HOLC grades shaped property wealth.
 */
function HistoricalComparison({ areaId }: { areaId: string }) {
  const history = useZoneValueHistory(areaId);

  if (!history) return null;

  const { zone, gradeAverages } = history;

  // Need at least the 1930s price data to show this section
  if (!zone.price1930sMid) {
    return null;
  }

  const maxGrowthValue = Math.max(
    ...[
      gradeAverages.A?.avgToday,
      gradeAverages.D?.avgToday,
    ].filter((v): v is number => v !== null),
    1,
  );

  return (
    <div className="space-y-4 rounded-md border border-amber-600/20 bg-amber-950/20 px-3 py-3">
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/80"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          1938 vs Today
        </span>
      </div>

      {/* 1930s price */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Appraiser&apos;s Estimate ({zone.surveyYear})
        </span>
        <p
          className="text-lg font-bold text-amber-300"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {formatDollars(zone.price1930sLow!)} &ndash; {formatDollars(zone.price1930sHigh!)}
        </p>
        <p
          className="text-[10px] text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          HOLC Area Description Survey
        </p>
      </div>

      {/* Growth factor */}
      {zone.nominalGrowth && (
        <div className="flex gap-6">
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Nominal Growth
            </span>
            <p
              className="text-lg font-bold text-slate-200"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {zone.nominalGrowth}
            </p>
          </div>
          {zone.realGrowth && (
            <div>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Inflation-Adjusted
              </span>
              <p
                className="text-lg font-bold text-slate-200"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {zone.realGrowth}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inflation context */}
      {zone.price1930sAdjusted && zone.priceToday && (
        <p
          className="text-[10px] leading-relaxed text-slate-400"
          style={{ fontFamily: "var(--font-body)" }}
        >
          In 2024 dollars, the 1930s midpoint of {formatDollars(zone.price1930sMid!)} equals{" "}
          ~{formatDollars(zone.price1930sAdjusted)}.{" "}
          {zone.priceToday > zone.price1930sAdjusted
            ? "Today's assessment exceeds this — real value growth."
            : "Today's assessment is below this — real value has eroded."}
        </p>
      )}

      {/* Grade comparison */}
      {gradeAverages.A?.avgToday && gradeAverages.D?.avgToday && (
        <div>
          <h3
            className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Growth by HOLC Grade
          </h3>
          <div className="space-y-1.5">
            {(["A", "B", "C", "D"] as const).map((grade) => {
              const avg = gradeAverages[grade];
              if (!avg?.avg1930s || !avg?.avgToday) return null;
              const colors: Record<string, string> = {
                A: "#4CAF50",
                B: "#2196F3",
                C: "#FFEB3B",
                D: "#F44336",
              };
              return (
                <div key={grade} className="flex items-center gap-2">
                  <span
                    className="w-16 shrink-0 text-[10px] text-slate-400"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <span className="font-semibold">{grade}</span>{" "}
                    {avg.avgGrowth}
                  </span>
                  <div className="flex flex-1 items-center gap-1.5">
                    <div
                      className="h-2.5 rounded-sm transition-all duration-300"
                      style={{
                        width: `${Math.max(5, (avg.avgToday / maxGrowthValue) * 100)}%`,
                        backgroundColor: colors[grade],
                        opacity: 0.7,
                      }}
                    />
                    <span
                      className="shrink-0 text-[10px] tabular-nums text-slate-400"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatDollars(avg.avgToday)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p
            className="mt-2 text-[9px] text-slate-500"
            style={{ fontFamily: "var(--font-body)" }}
          >
            1930s avg → today&apos;s avg assessed value
          </p>
        </div>
      )}
    </div>
  );
}
