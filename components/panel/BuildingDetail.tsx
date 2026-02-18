"use client";

import { useZoneSelection, type BuildingProperties } from "@/lib/zone-selection";
import { HOLC_DESCRIPTORS, type HOLCGrade } from "@/types/holc";

const LAND_USE_LABELS: Record<number, string> = {
  1: "Residential",
  2: "Commercial",
  3: "Manufacturing",
  4: "Government / Institutional",
  5: "Exempt / Special",
  7: "Vacant Land",
};

const ERA_LABELS: Record<string, string> = {
  "pre-holc": "Pre-HOLC Era",
  "post-war": "Post-War Era",
  modern: "Modern Era",
  recent: "Recent",
};

function getGradeBadgeClass(grade: string | null): string {
  if (!grade) return "holc-badge-ungraded";
  const map: Record<string, string> = {
    A: "holc-badge-a",
    B: "holc-badge-b",
    C: "holc-badge-c",
    D: "holc-badge-d",
  };
  return map[grade] ?? "holc-badge-ungraded";
}

function formatDollars(value: number): string {
  if (!value) return "N/A";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

interface ZoneInfo {
  areaId: string;
  grade: HOLCGrade | null;
  name: string;
}

interface BuildingDetailProps {
  building: BuildingProperties;
  zone: ZoneInfo | null;
}

export default function BuildingDetail({ building, zone }: BuildingDetailProps) {
  const { selectZone, clearSelection } = useZoneSelection();

  const gradeLabel = building.holcGrade
    ? `${building.holcGrade} - ${HOLC_DESCRIPTORS[building.holcGrade as HOLCGrade] ?? "Unknown"}`
    : "Ungraded";

  return (
    <div className="space-y-5 p-4">
      {/* Back button */}
      <button
        onClick={() => {
          if (building.holcZoneId) {
            selectZone(building.holcZoneId);
          } else {
            clearSelection();
          }
        }}
        className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-slate-200"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {zone ? `Back to ${zone.name || "Zone"}` : "Back"}
      </button>

      {/* Building header */}
      <div>
        <h2
          className="text-xl font-bold text-slate-100"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Building Details
        </h2>
        <code
          className="mt-1 inline-block text-[11px] text-slate-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          TAXKEY {building.TAXKEY}
        </code>
      </div>

      {/* HOLC zone badge */}
      <div>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getGradeBadgeClass(building.holcGrade)}`}
        >
          {gradeLabel}
        </span>
        {zone?.name && (
          <p
            className="mt-1 text-[11px] text-slate-400"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {zone.name}
          </p>
        )}
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatBlock label="Year Built" value={building.YR_BUILT ? String(building.YR_BUILT) : "N/A"} sub={ERA_LABELS[building.era] ?? building.era} />
        <StatBlock label="Assessed Value" value={formatDollars(building.C_A_TOTAL)} sub="Current MPROP" />
        <StatBlock label="Stories" value={building.NR_STORIES ? String(building.NR_STORIES) : "N/A"} />
        <StatBlock label="Units" value={building.NR_UNITS ? String(building.NR_UNITS) : "N/A"} />
      </div>

      {/* Building type and land use */}
      <div className="space-y-3">
        {building.BLDG_TYPE && (
          <DetailRow label="Building Type" value={building.BLDG_TYPE} />
        )}
        <DetailRow
          label="Land Use"
          value={LAND_USE_LABELS[building.LAND_USE_GP] ?? `Code ${building.LAND_USE_GP}`}
        />
      </div>

      {/* Context callout */}
      {building.holcGrade === "D" && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5">
          <p
            className="text-sm font-semibold text-red-400"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Redlined Zone
          </p>
          <p
            className="mt-0.5 text-xs text-red-400/70"
            style={{ fontFamily: "var(--font-body)" }}
          >
            This building sits in a zone the HOLC graded &ldquo;Hazardous&rdquo;
            in 1938, restricting access to mortgage lending.
          </p>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-500"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <p
        className="text-lg font-bold text-slate-200"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[10px] text-slate-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[11px] text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-medium text-slate-200"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}
