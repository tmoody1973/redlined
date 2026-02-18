"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useZoneSelection } from "@/lib/zone-selection";
import { EmptyState } from "./EmptyState";
import ZoneDetail from "./ZoneDetail";
import BuildingDetail from "./BuildingDetail";
import ChatPanel from "./ChatPanel";
import type { HOLCGrade, AreaDescription } from "@/types/holc";

interface ConvexZoneRecord {
  _id: string;
  areaId: string;
  grade: string | null;
  label: string;
  name: string;
}

/**
 * Top-level info panel that switches between empty state and zone detail
 * based on whether a zone is currently selected. Includes the AI Narrative
 * Guide chat panel below the zone details.
 */
export default function InfoPanel() {
  const { selectedZoneId, selectedBuilding } = useZoneSelection();

  const zones = useQuery(api.queries.getAllMilwaukeeZones) as
    | ConvexZoneRecord[]
    | undefined;

  const selectedZone = zones?.find((z) => z.areaId === selectedZoneId);

  const description = useQuery(
    api.queries.getAreaDescription,
    selectedZoneId ? { areaId: selectedZoneId } : "skip",
  ) as AreaDescription | null | undefined;

  // Build zone context for the chat panel
  const zoneContext = selectedZone
    ? {
        areaId: selectedZone.areaId,
        name: selectedZone.name,
        grade: selectedZone.grade,
        clarifyingRemarks: description?.clarifyingRemarks,
        detrimentalInfluences: description?.detrimentalInfluences,
        favorableInfluences: description?.favorableInfluences,
        infiltrationOf: description?.infiltrationOf,
        negroYesOrNo: description?.negroYesOrNo,
        negroPercent: description?.negroPercent,
        estimatedAnnualFamilyIncome: description?.estimatedAnnualFamilyIncome,
        occupationType: description?.occupationType,
        descriptionOfTerrain: description?.descriptionOfTerrain,
        trendOfDesirability: description?.trendOfDesirability,
      }
    : null;

  if (!selectedZoneId) {
    return (
      <section aria-label="Zone details" className="flex h-full flex-col overflow-y-auto">
        <EmptyState />
        <div className="mt-4 border-t border-slate-700/50 p-4">
          <ChatPanel zoneContext={null} />
        </div>
      </section>
    );
  }

  if (!selectedZone) {
    return (
      <section aria-label="Zone details" className="flex h-full flex-col overflow-y-auto">
        <div className="p-4">
          <p
            className="text-sm text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Loading zone data...
          </p>
        </div>
      </section>
    );
  }

  if (selectedBuilding) {
    return (
      <section aria-label="Building details" className="flex h-full flex-col overflow-y-auto">
        <BuildingDetail
          building={selectedBuilding}
          zone={
            selectedZone
              ? {
                  areaId: selectedZone.areaId,
                  grade: selectedZone.grade as HOLCGrade | null,
                  name: selectedZone.name,
                }
              : null
          }
        />
        <div className="mt-4 border-t border-slate-700/50 p-4">
          <ChatPanel zoneContext={zoneContext} />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Zone details" className="flex h-full flex-col overflow-y-auto">
      <ZoneDetail
        zone={{
          areaId: selectedZone.areaId,
          grade: selectedZone.grade as HOLCGrade | null,
          name: selectedZone.name,
        }}
      />
      <div className="mt-4 border-t border-slate-700/50 p-4">
        <ChatPanel zoneContext={zoneContext} />
      </div>
    </section>
  );
}
