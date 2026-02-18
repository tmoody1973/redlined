"use client";

import { useZoneHealth } from "@/lib/useZoneHealth";

interface HealthStatisticsProps {
  areaId: string;
}

function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
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

/**
 * Generate a plain English summary of what the health risk index means
 * for people living in this zone.
 */
function describeHealthRisk(
  index: number | null,
  percentile: number | null,
  measures: { label: string; value: number | null }[],
): string {
  if (index === null) return "";

  const asthma = measures.find((m) => m.label === "Asthma")?.value ?? null;
  const diabetes = measures.find((m) => m.label === "Diabetes")?.value ?? null;

  // Risk level description
  let level: string;
  if (index < 0.25) level = "relatively low";
  else if (index < 0.35) level = "moderate";
  else if (index < 0.45) level = "elevated";
  else level = "high";

  let summary = `Residents of this zone face ${level} health risks. `;

  // Percentile context
  if (percentile !== null) {
    if (percentile <= 15) {
      summary += `This zone ranks in the bottom ${100 - percentile}% of Milwaukee HOLC zones for health outcomes — among the worst in the city. `;
    } else if (percentile <= 40) {
      summary += `Health outcomes here are worse than ${100 - percentile}% of Milwaukee\u2019s HOLC zones. `;
    } else if (percentile >= 75) {
      summary += `Health outcomes here are better than most Milwaukee HOLC zones. `;
    }
  }

  // Specific callouts
  const details: string[] = [];
  if (asthma !== null && asthma > 12) {
    details.push(
      `about ${Math.round(asthma)}% of adults have asthma (national avg is ~8%)`,
    );
  }
  if (diabetes !== null && diabetes > 15) {
    details.push(
      `${Math.round(diabetes)}% have diabetes (national avg is ~11%)`,
    );
  }

  if (details.length > 0) {
    summary += `Notably, ${details.join(" and ")}.`;
  }

  return summary;
}

/** Risk level color — green (low) to red (high). */
function riskColor(value: number | null, maxExpected: number): string {
  if (value === null) return "#64748b";
  const ratio = Math.min(value / maxExpected, 1);
  if (ratio < 0.33) return "#4CAF50";
  if (ratio < 0.66) return "#FFEB3B";
  return "#F44336";
}

function MeasureBar({
  label,
  value,
  unit,
  description,
  maxExpected,
}: {
  label: string;
  value: number | null;
  unit: string;
  description: string;
  maxExpected: number;
}) {
  const width =
    value !== null && maxExpected > 0
      ? Math.max(5, (value / maxExpected) * 100)
      : 5;
  const color = riskColor(value, maxExpected);

  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <div className="flex w-28 shrink-0 items-center gap-1.5">
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
            {value !== null ? `${value.toFixed(1)}${unit}` : "N/A"}
          </span>
        </div>
      </div>
      <p className="mt-0.5 hidden text-[9px] text-slate-600 group-hover:block">
        {description}
      </p>
    </div>
  );
}

function GradeComparisonBar({
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
          {value !== null ? value.toFixed(2) : "N/A"}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays health outcome statistics for a selected zone when the
 * health overlay is active. Shows composite health risk index,
 * individual CDC PLACES measures, and A-zone vs D-zone comparison.
 */
export default function HealthStatistics({ areaId }: HealthStatisticsProps) {
  const healthData = useZoneHealth(areaId);

  if (!healthData) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading health data...
      </p>
    );
  }

  const { healthRiskIndex, percentileRank, measures, gradeAverages, insightRatio } =
    healthData;

  const maxGrade = Math.max(
    ...[gradeAverages.A, gradeAverages.D, healthRiskIndex].filter(
      (v): v is number => v !== null,
    ),
    1,
  );

  return (
    <section aria-label="Health Statistics" className="space-y-5">
      {/* Health Risk headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Health Risk Index
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {healthRiskIndex !== null ? healthRiskIndex.toFixed(2) : "N/A"}
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
          Present-day data &middot; CDC PLACES
        </p>
        {describeHealthRisk(healthRiskIndex, percentileRank, measures) && (
          <p
            className="mt-2 text-xs leading-relaxed text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {describeHealthRisk(healthRiskIndex, percentileRank, measures)}
          </p>
        )}
      </div>

      {/* Individual measures */}
      <div>
        <h3
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Health Measures
        </h3>
        <div className="space-y-2">
          {measures.map((m) => (
            <MeasureBar
              key={m.label}
              label={m.label}
              value={m.value}
              unit={m.unit}
              description={m.description}
              maxExpected={m.label === "Life Expectancy" ? 85 : 25}
            />
          ))}
        </div>
      </div>

      {/* Grade comparison */}
      <div>
        <h3
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          A-Zone vs D-Zone
        </h3>
        <div className="space-y-2">
          <GradeComparisonBar
            label="A-Zone Avg"
            value={gradeAverages.A}
            maxValue={maxGrade}
            color="#4CAF50"
          />
          <GradeComparisonBar
            label="This Zone"
            value={healthRiskIndex}
            maxValue={maxGrade}
            color="#F44336"
          />
          <GradeComparisonBar
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
            {insightRatio} worse in D-zones
          </p>
          <p
            className="mt-0.5 text-xs text-amber-400/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Health outcomes still track 1938 HOLC grades
          </p>
        </div>
      )}
    </section>
  );
}
