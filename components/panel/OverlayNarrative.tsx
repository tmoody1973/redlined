"use client";

import type { ReactNode } from "react";
import {
  generateOverlayHeadline,
  generateDefaultSummary,
  type OverlayType,
} from "@/lib/narrative-text";
import type { HOLCGrade } from "@/types/holc";
import { useZoneIncome } from "@/lib/useZoneIncome";
import { useZoneHealth } from "@/lib/useZoneHealth";
import { useZoneEnvironment } from "@/lib/useZoneEnvironment";
import { useZoneValue } from "@/lib/useZoneValue";
import { useZoneRace } from "@/lib/useZoneRace";

interface OverlayNarrativeProps {
  activeOverlay: OverlayType | null;
  overlayActive: boolean;
  areaId: string;
  grade: HOLCGrade | null;
  zoneName: string;
  children: ReactNode;
}

/**
 * Renders a plain-language headline above the overlay content.
 */
function HeadlineBlock({
  headline,
  subtext,
}: {
  headline: string;
  subtext: string;
}) {
  return (
    <div className="mb-4">
      <p
        className="text-sm font-semibold leading-snug text-slate-100"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {headline}
      </p>
      <p
        className="mt-1 text-[11px] text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {subtext}
      </p>
    </div>
  );
}

/* ---------- Per-overlay headline components ---------- */

function IncomeHeadline({ areaId }: { areaId: string }) {
  const data = useZoneIncome(areaId);
  if (!data) return null;
  const result = generateOverlayHeadline("income", {
    income: {
      weightedIncome: data.weightedIncome,
      percentileRank: data.percentileRank,
      insightRatio: data.insightRatio,
    },
  });
  return result ? <HeadlineBlock {...result} /> : null;
}

function HealthHeadline({ areaId }: { areaId: string }) {
  const data = useZoneHealth(areaId);
  if (!data) return null;
  const result = generateOverlayHeadline("health", {
    health: {
      healthRiskIndex: data.healthRiskIndex,
      percentileRank: data.percentileRank,
      insightRatio: data.insightRatio,
      measures: data.measures,
    },
  });
  return result ? <HeadlineBlock {...result} /> : null;
}

function EnvironmentHeadline({ areaId }: { areaId: string }) {
  const data = useZoneEnvironment(areaId);
  if (!data) return null;
  const result = generateOverlayHeadline("environment", {
    environment: {
      ejPercentile: data.ejPercentile,
      percentileRank: data.percentileRank,
      insightRatio: data.insightRatio,
    },
  });
  return result ? <HeadlineBlock {...result} /> : null;
}

function ValueHeadline({ areaId }: { areaId: string }) {
  const data = useZoneValue(areaId);
  if (!data) return null;
  const result = generateOverlayHeadline("value", {
    value: {
      avgAssessedValue: data.avgAssessedValue,
      insightRatio: data.insightRatio,
    },
  });
  return result ? <HeadlineBlock {...result} /> : null;
}

function RaceHeadline({ areaId }: { areaId: string }) {
  const data = useZoneRace(areaId);
  if (!data) return null;
  const result = generateOverlayHeadline("race", {
    race: {
      white: data.zone.pctWhite,
      black: data.zone.pctBlack,
      hispanic: data.zone.pctHispanic,
    },
  });
  return result ? <HeadlineBlock {...result} /> : null;
}

/* ---------- Map overlay type → headline component ---------- */

const HEADLINE_COMPONENTS: Record<
  OverlayType,
  React.ComponentType<{ areaId: string }>
> = {
  income: IncomeHeadline,
  health: HealthHeadline,
  environment: EnvironmentHeadline,
  value: ValueHeadline,
  race: RaceHeadline,
};

/**
 * Act 3 wrapper: renders a narrative headline above the active overlay's
 * statistics panel. When no overlay is active, shows a prompt to toggle one.
 */
export default function OverlayNarrative({
  activeOverlay,
  overlayActive,
  areaId,
  grade,
  zoneName,
  children,
}: OverlayNarrativeProps) {
  if (!overlayActive || !activeOverlay) {
    const { headline, subtext } = generateDefaultSummary(grade, zoneName);
    return (
      <section aria-label="What It Means Today" className="space-y-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          What It Means Today
        </span>
        <HeadlineBlock headline={headline} subtext={subtext} />
      </section>
    );
  }

  const HeadlineComponent = HEADLINE_COMPONENTS[activeOverlay];

  return (
    <section aria-label="What It Means Today" className="space-y-3">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        What It Means Today
      </span>
      <HeadlineComponent areaId={areaId} />
      {children}
    </section>
  );
}
