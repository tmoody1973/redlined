"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDataOverlay } from "@/lib/data-overlay";
import { useDecadesData } from "@/lib/useDecadesData";
import { generateDecadesHeadline } from "@/lib/narrative-text";
import {
  HOLC_DESCRIPTORS,
  type HOLCGrade,
  type AreaDescription,
} from "@/types/holc";
import { useTimeSlider } from "@/lib/time-slider";
import { useLayerVisibility } from "@/lib/layer-visibility";
import AppraiserDescription from "./AppraiserDescription";
import SanbornContext from "./SanbornContext";
import ContentWarning from "./ContentWarning";
import CollapsibleSection from "./CollapsibleSection";
import NarrativeHeader from "./NarrativeHeader";
import OverlayNarrative from "./OverlayNarrative";
import DecadesPanel from "./DecadesPanel";
import DemolitionStatistics from "./DemolitionStatistics";
import IncomeStatistics from "./IncomeStatistics";
import HealthStatistics from "./HealthStatistics";
import EnvironmentStatistics from "./EnvironmentStatistics";
import ValueStatistics from "./ValueStatistics";
import RaceStatistics from "./RaceStatistics";

/** Maps HOLC grade to the Tailwind CSS utility class name defined in globals.css. */
function getGradeBadgeClass(grade: HOLCGrade | null): string {
  if (!grade) return "holc-badge-ungraded";
  const map: Record<HOLCGrade, string> = {
    A: "holc-badge-a",
    B: "holc-badge-b",
    C: "holc-badge-c",
    D: "holc-badge-d",
  };
  return map[grade] ?? "holc-badge-ungraded";
}

/** Returns the full badge label such as "A - Best" or "Ungraded". */
function getGradeBadgeLabel(grade: HOLCGrade | null): string {
  if (!grade) return HOLC_DESCRIPTORS.ungraded;
  const descriptor = HOLC_DESCRIPTORS[grade] ?? "Unknown";
  return `${grade} - ${descriptor}`;
}

/** Determines whether the content warning should be shown for a zone. */
function shouldShowContentWarning(
  grade: HOLCGrade | null,
  description: AreaDescription | null | undefined,
): boolean {
  if (grade === "D") return true;
  if (!description) return false;
  const sensitiveFields: (keyof AreaDescription)[] = [
    "infiltrationOf",
    "negroYesOrNo",
  ];
  return sensitiveFields.some((field) => {
    const value = description[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/** HOLC grade to accent color for collapsible section borders. */
const GRADE_ACCENT: Record<string, string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
};

interface ZoneData {
  areaId: string;
  grade: HOLCGrade | null;
  name: string;
}

interface ZoneDetailProps {
  zone: ZoneData;
}

/**
 * Three-act narrative panel for a selected HOLC zone:
 *
 * Act 1 — "The 1938 Decision": What the appraisers wrote and why
 * Act 2 — "What Happened Next": Decades of divergence (collapsible)
 * Act 3 — "What It Means Today": Active data overlay with narrative headline
 */
export default function ZoneDetail({ zone }: ZoneDetailProps) {
  const description = useQuery(api.queries.getAreaDescription, {
    areaId: zone.areaId,
  }) as AreaDescription | null | undefined;

  const { activeOverlay, overlayActive } = useDataOverlay();
  const { ghostsVisible } = useTimeSlider();
  const { sanbornVisible } = useLayerVisibility();
  const decadesData = useDecadesData(zone.grade, zone.areaId);

  const badgeClass = getGradeBadgeClass(zone.grade);
  const badgeLabel = getGradeBadgeLabel(zone.grade);
  const showWarning = shouldShowContentWarning(zone.grade, description);

  // Generate the decades headline for Act 2
  const decadesHeadline = generateDecadesHeadline(
    decadesData?.keyInsights ?? null,
  );

  const accentColor = zone.grade ? GRADE_ACCENT[zone.grade] ?? "rgb(51 65 85)" : "rgb(51 65 85)";

  return (
    <div className="space-y-6 p-4">
      {/* Zone header */}
      <div>
        <h2
          className="text-xl font-bold text-slate-100"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {zone.name || "Unknown Zone"}
        </h2>
        <span
          className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* ── Act 1: The 1938 Decision ── */}
      <NarrativeHeader
        zoneName={zone.name}
        grade={zone.grade}
        description={description}
        areaId={zone.areaId}
      />

      {/* Appraiser description with contextual content warning */}
      {description === undefined ? (
        <p className="text-sm text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
          Loading description...
        </p>
      ) : description === null ? null : showWarning ? (
        <ContentWarning grade={zone.grade}>
          <AppraiserDescription description={description} areaId={zone.areaId} />
        </ContentWarning>
      ) : (
        <AppraiserDescription description={description} areaId={zone.areaId} />
      )}

      {/* ── Act 2: What Happened Next (collapsible) ── */}
      <CollapsibleSection
        heading={
          <span
            className="text-sm font-semibold text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {decadesHeadline.headline}
          </span>
        }
        subtext={
          <span
            className="text-[11px] text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {decadesHeadline.subtext}
          </span>
        }
        defaultOpen={false}
        accentColor={accentColor}
        ariaLabel="What Happened Next"
      >
        <DecadesPanel grade={zone.grade} areaId={zone.areaId} zoneName={zone.name} />
      </CollapsibleSection>

      {/* ── Act 3: What It Means Today ── */}
      <OverlayNarrative
        activeOverlay={activeOverlay}
        overlayActive={overlayActive}
        areaId={zone.areaId}
        grade={zone.grade}
        zoneName={zone.name}
      >
        {overlayActive && activeOverlay === "income" && (
          <IncomeStatistics areaId={zone.areaId} />
        )}
        {overlayActive && activeOverlay === "health" && (
          <HealthStatistics areaId={zone.areaId} />
        )}
        {overlayActive && activeOverlay === "environment" && (
          <EnvironmentStatistics areaId={zone.areaId} />
        )}
        {overlayActive && activeOverlay === "value" && (
          <ValueStatistics areaId={zone.areaId} />
        )}
        {overlayActive && activeOverlay === "race" && (
          <RaceStatistics areaId={zone.areaId} />
        )}
      </OverlayNarrative>

      {/* ── Conditional layers ── */}
      {sanbornVisible && (
        <SanbornContext
          areaId={zone.areaId}
          grade={zone.grade}
          zoneName={zone.name}
        />
      )}
      {ghostsVisible && (
        <DemolitionStatistics areaId={zone.areaId} grade={zone.grade} />
      )}
    </div>
  );
}

// Re-export helpers for testing
export { getGradeBadgeClass, getGradeBadgeLabel, shouldShowContentWarning };
