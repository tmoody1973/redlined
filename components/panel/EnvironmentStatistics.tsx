"use client";

import { useZoneEnvironment } from "@/lib/useZoneEnvironment";
import { SourceCitation } from "./SourceCitation";

interface EnvironmentStatisticsProps {
  areaId: string;
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
 * Generate a plain English summary of what the environmental burden
 * percentile means for people living in this zone.
 */
function describeEnvironmentBurden(
  percentile: number | null,
  rank: number | null,
  measures: { label: string; value: number | null }[],
): string {
  if (percentile === null) return "";

  // Burden level description
  let level: string;
  if (percentile < 30) level = "relatively low";
  else if (percentile < 50) level = "moderate";
  else if (percentile < 70) level = "elevated";
  else level = "high";

  let summary = `This zone has ${level} environmental and social vulnerability. `;

  // Percentile context
  if (rank !== null) {
    if (rank <= 15) {
      summary += `It ranks in the bottom ${100 - rank}% of Milwaukee HOLC zones — among the most burdened in the city. `;
    } else if (rank <= 40) {
      summary += `Conditions here are worse than ${100 - rank}% of Milwaukee\u2019s HOLC zones. `;
    } else if (rank >= 75) {
      summary += `Conditions here are better than most Milwaukee HOLC zones. `;
    }
  }

  // Specific callouts
  const details: string[] = [];
  const disability = measures.find((m) => m.label === "Disability")?.value ?? null;
  const uninsured = measures.find((m) => m.label === "Uninsured")?.value ?? null;
  const housing = measures.find((m) => m.label === "Housing Burden")?.value ?? null;

  if (disability !== null && disability > 15) {
    details.push(
      `${Math.round(disability)}% of residents have a disability (national avg is ~13%)`,
    );
  }
  if (uninsured !== null && uninsured > 12) {
    details.push(
      `${Math.round(uninsured)}% lack health insurance (national avg is ~8%)`,
    );
  }
  if (housing !== null && housing > 35) {
    details.push(
      `${Math.round(housing)}% are housing cost-burdened (spending >30% of income on housing)`,
    );
  }

  if (details.length > 0) {
    summary += `Notably, ${details.join(" and ")}.`;
  }

  return summary;
}

function burdenColor(value: number | null, maxExpected: number): string {
  if (value === null) return "#64748b";
  const ratio = Math.min(value / maxExpected, 1);
  if (ratio < 0.33) return "#2196F3";
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
  const color = burdenColor(value, maxExpected);

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
          {value !== null ? value.toFixed(1) : "N/A"}
        </span>
      </div>
    </div>
  );
}

/**
 * Displays environmental burden statistics for a selected zone when the
 * environment overlay is active. Shows composite EJ percentile, individual
 * burden proxy measures, and A-zone vs D-zone comparison.
 */
export default function EnvironmentStatistics({ areaId }: EnvironmentStatisticsProps) {
  const envData = useZoneEnvironment(areaId);

  if (!envData) {
    return (
      <p
        className="text-sm text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Loading environment data...
      </p>
    );
  }

  const { ejPercentile, percentileRank, measures, gradeAverages, insightRatio } =
    envData;

  const maxGrade = Math.max(
    ...[gradeAverages.A, gradeAverages.D, ejPercentile].filter(
      (v): v is number => v !== null,
    ),
    1,
  );

  return (
    <section aria-label="Environmental Statistics" className="space-y-5">
      {/* EJ headline */}
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Environmental Burden
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {ejPercentile !== null ? ejPercentile.toFixed(1) : "N/A"}
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
          Present-day data &middot; CDC PLACES / SVI Proxies
        </p>
        {describeEnvironmentBurden(ejPercentile, percentileRank, measures) && (
          <p
            className="mt-2 text-xs leading-relaxed text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {describeEnvironmentBurden(ejPercentile, percentileRank, measures)}
          </p>
        )}
      </div>

      {/* Individual measures */}
      <div>
        <h3
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Burden Indicators
        </h3>
        <div className="space-y-2">
          {measures.map((m) => (
            <MeasureBar
              key={m.label}
              label={m.label}
              value={m.value}
              unit={m.unit}
              description={m.description}
              maxExpected={30}
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
            value={ejPercentile}
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
            Environmental burden still tracks 1938 HOLC grades
          </p>
        </div>
      )}

      {/* Research citation */}
      <SourceCitation
        paperId="lynch-et-al-2021"
        label="Lynch et al., 2021"
        finding="Neighborhoods today are a manifestation of a myriad of racist housing policies and practices that have fundamentally shaped housing tenure, the built environment, and health."
      />
    </section>
  );
}
