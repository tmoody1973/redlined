import type { Building, ParentZone } from "../types";

interface BuildingInfoPanelProps {
  building: Building | null;
  parentZone: ParentZone;
  onBackToZone?: () => void;
}

const GRADE_COLORS: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  A: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  B: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  C: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  D: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

const ERA_LABELS: Record<string, { label: string; color: string }> = {
  "pre-1938": { label: "Pre-Redlining", color: "#B87333" },
  "1938-1970": { label: "Urban Renewal", color: "#808080" },
  "post-1970": { label: "Modern", color: "#4FC3F7" },
};

export function BuildingInfoPanel({
  building,
  parentZone,
  onBackToZone,
}: BuildingInfoPanelProps) {
  const grade = GRADE_COLORS[parentZone.holcGrade] || GRADE_COLORS["D"];

  if (!building) {
    return (
      <div className="p-4 space-y-4">
        {/* Zone header */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
            style={{
              backgroundColor: parentZone.color,
              color: parentZone.holcGrade === "C" ? "#0f172a" : "#fff",
            }}
          >
            {parentZone.holcGrade}
          </div>
          <span
            className="text-sm font-semibold text-slate-200 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {parentZone.name}
          </span>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-9 h-9 rounded-lg bg-slate-800/60 flex items-center justify-center mb-3">
            <svg
              className="w-4.5 h-4.5 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            className="text-sm text-slate-400 font-medium"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Select a building
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Click any structure to see property details
          </p>
        </div>
      </div>
    );
  }

  const era = ERA_LABELS[building.era];
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div
      className="p-4 space-y-4"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Breadcrumb: Zone > Building */}
      <nav className="flex items-center gap-1.5 text-[11px]">
        <button
          onClick={onBackToZone}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <div
            className="w-3.5 h-3.5 rounded-[2px] flex items-center justify-center text-[7px] font-bold"
            style={{
              backgroundColor: parentZone.color,
              color: parentZone.holcGrade === "C" ? "#0f172a" : "#fff",
            }}
          >
            {parentZone.holcGrade}
          </div>
          <span>{parentZone.holcId}</span>
        </button>
        <svg
          className="w-3 h-3 text-slate-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            d="M9 18l6-6-6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-slate-300 font-medium truncate">
          {building.address}
        </span>
      </nav>

      <div className="h-px bg-slate-800" />

      {/* Building address header */}
      <div>
        <h2
          className="text-base font-bold text-slate-100 tracking-tight leading-tight"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {building.address}
        </h2>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: `${era.color}15`,
              color: era.color,
              border: `1px solid ${era.color}30`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: era.color }}
            />
            {era.label}
          </span>
          <span
            className="text-[10px] text-slate-600"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Built {building.yearBuilt}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* MPROP Data Fields */}
      <div className="space-y-3">
        <h3
          className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-600"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          Property Record (MPROP)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Stories */}
          <div className="bg-slate-800/40 rounded-lg px-3 py-2.5 border border-slate-700/20">
            <div
              className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Stories
            </div>
            <div
              className="text-lg font-bold text-slate-200 leading-none"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {building.stories}
            </div>
          </div>

          {/* Assessed Value */}
          <div className="bg-slate-800/40 rounded-lg px-3 py-2.5 border border-slate-700/20">
            <div
              className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Assessed
            </div>
            <div
              className="text-lg font-bold text-slate-200 leading-none"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {formatCurrency(building.assessedValue)}
            </div>
          </div>

          {/* Land Use */}
          <div className="bg-slate-800/40 rounded-lg px-3 py-2.5 border border-slate-700/20">
            <div
              className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Land Use
            </div>
            <div className="text-sm font-medium text-slate-300 leading-tight">
              {building.landUse}
            </div>
          </div>

          {/* Owner Occupied */}
          <div className="bg-slate-800/40 rounded-lg px-3 py-2.5 border border-slate-700/20">
            <div
              className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Owner-Occ.
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${building.ownerOccupied ? "bg-green-500" : "bg-red-500/60"}`}
              />
              <span className="text-sm font-medium text-slate-300">
                {building.ownerOccupied ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* TAXKEY */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/20 rounded-lg border border-slate-800/40">
          <span
            className="text-[9px] text-slate-600 uppercase tracking-wider"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Taxkey
          </span>
          <span
            className="text-[11px] text-slate-400 font-medium"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {building.taxkey}
          </span>
        </div>
      </div>

      {/* Zone context footer */}
      <div className="h-px bg-slate-800" />
      <div className="flex items-center gap-2">
        <div className={`px-2 py-1 rounded ${grade.bg} border ${grade.border}`}>
          <span className={`text-[10px] font-bold ${grade.text}`}>
            {parentZone.holcGrade}
          </span>
        </div>
        <div>
          <div className="text-[11px] text-slate-400">{parentZone.name}</div>
          <div
            className="text-[9px] text-slate-600"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {parentZone.holcId} zone
          </div>
        </div>
      </div>
    </div>
  );
}
