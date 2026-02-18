"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useZoneSelection } from "@/lib/zone-selection";
import { HOLC_DESCRIPTORS, type HOLCGrade } from "@/types/holc";

interface ConvexZoneRecord {
  _id: string;
  areaId: string;
  grade: string | null;
  label: string;
  name: string;
}

const GRADE_ORDER: (HOLCGrade | null)[] = ["A", "B", "C", "D", null];

/**
 * Invisible overlay of keyboard-focusable proxy elements for HOLC zones.
 * Provides Tab navigation through zones in logical order (A -> B -> C -> D)
 * and Enter/Space to select the focused zone. A visible focus indicator
 * is shown for the currently-focused zone via an outline.
 */
export function ZoneKeyboardNav() {
  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;
  const { selectZone, selectedZoneId } = useZoneSelection();
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);

  // Sort zones by grade (A first, then B, C, D, ungraded) and then by label
  const sortedZones = useMemo(() => {
    if (!zones) return [];
    return [...zones].sort((a, b) => {
      const gradeA = GRADE_ORDER.indexOf(a.grade as HOLCGrade | null);
      const gradeB = GRADE_ORDER.indexOf(b.grade as HOLCGrade | null);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return a.label.localeCompare(b.label, undefined, { numeric: true });
    });
  }, [zones]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, areaId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectZone(areaId);
      }
    },
    [selectZone],
  );

  const handleFocus = useCallback((areaId: string) => {
    setFocusedZoneId(areaId);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedZoneId(null);
  }, []);

  // Announce the focused zone to screen readers
  useEffect(() => {
    if (focusedZoneId) {
      const zone = sortedZones.find((z) => z.areaId === focusedZoneId);
      if (zone) {
        const gradeDesc = zone.grade
          ? `Grade ${zone.grade} - ${HOLC_DESCRIPTORS[zone.grade as HOLCGrade] ?? "Unknown"}`
          : "Ungraded";
        // Update the live region
        const liveRegion = document.getElementById(
          "zone-keyboard-nav-live",
        );
        if (liveRegion) {
          liveRegion.textContent = `${zone.name || zone.label}, ${gradeDesc}. Press Enter to select.`;
        }
      }
    }
  }, [focusedZoneId, sortedZones]);

  if (!sortedZones.length) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-label="Zone keyboard navigation"
    >
      {/* Live region for screen reader announcements */}
      <div
        id="zone-keyboard-nav-live"
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      {/* Hidden focusable proxy elements for each zone */}
      <div
        role="group"
        aria-label="HOLC zones - use Tab to navigate, Enter to select"
        className="pointer-events-auto absolute left-0 top-0 flex flex-wrap gap-0 opacity-0 focus-within:opacity-100"
        style={{ width: "1px", height: "1px", overflow: "hidden" }}
      >
        {sortedZones.map((zone) => {
          const gradeDesc = zone.grade
            ? `${zone.grade} - ${HOLC_DESCRIPTORS[zone.grade as HOLCGrade] ?? "Unknown"}`
            : "Ungraded";
          const isSelected = selectedZoneId === zone.areaId;

          return (
            <button
              key={zone.areaId}
              type="button"
              className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:border focus:border-red-500 focus:bg-slate-900/95 focus:px-3 focus:py-2 focus:text-sm focus:text-slate-100"
              style={{ fontFamily: "var(--font-heading)" }}
              tabIndex={0}
              role="option"
              aria-selected={isSelected}
              aria-label={`${zone.name || zone.label}, ${gradeDesc}${isSelected ? ", selected" : ""}`}
              onKeyDown={(e) => handleKeyDown(e, zone.areaId)}
              onClick={() => selectZone(zone.areaId)}
              onFocus={() => handleFocus(zone.areaId)}
              onBlur={handleBlur}
            >
              {zone.label} - {zone.name || "Unknown"} ({gradeDesc})
            </button>
          );
        })}
      </div>
    </div>
  );
}
