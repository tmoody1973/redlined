"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useZoneSelection } from "@/lib/zone-selection";
import { useDataOverlay } from "@/lib/data-overlay";
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

interface ZoneData {
  areaId: string;
  grade: HOLCGrade | null;
  name: string;
}

interface ZoneDetailProps {
  zone: ZoneData;
}

/**
 * Displays the full detail panel for a selected HOLC zone, including the
 * zone name, grade badge, content warning (when applicable), appraiser
 * description fields, and data overlay statistics based on the active overlay.
 */
export default function ZoneDetail({ zone }: ZoneDetailProps) {
  const description = useQuery(api.queries.getAreaDescription, {
    areaId: zone.areaId,
  }) as AreaDescription | null | undefined;

  const { activeOverlay, overlayActive } = useDataOverlay();
  const { ghostsVisible } = useTimeSlider();
  const { sanbornVisible } = useLayerVisibility();

  const badgeClass = getGradeBadgeClass(zone.grade);
  const badgeLabel = getGradeBadgeLabel(zone.grade);
  const showWarning = shouldShowContentWarning(zone.grade, description);

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

      {/* Data overlay statistics — show the panel matching the active overlay */}
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

      {/* Sanborn map context — show when Sanborn overlay is active */}
      {sanbornVisible && (
        <SanbornContext
          areaId={zone.areaId}
          grade={zone.grade}
          zoneName={zone.name}
        />
      )}

      {/* Demolition statistics — show when ghost mode is active */}
      {ghostsVisible && (
        <DemolitionStatistics areaId={zone.areaId} grade={zone.grade} />
      )}

      {/* Appraiser description with optional content warning */}
      {description === undefined ? (
        <p className="text-sm text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
          Loading description...
        </p>
      ) : description === null ? null : showWarning ? (
        <ContentWarning>
          <AppraiserDescription description={description} />
        </ContentWarning>
      ) : (
        <AppraiserDescription description={description} />
      )}
    </div>
  );
}

// Re-export helpers for testing
export { getGradeBadgeClass, getGradeBadgeLabel, shouldShowContentWarning };
