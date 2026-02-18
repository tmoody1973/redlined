import type { GhostBuilding, ParentZone, DemolitionCause } from "../types";

interface GhostInfoPanelProps {
  ghost: GhostBuilding | null;
  parentZone: ParentZone;
  onBackToZone?: () => void;
}

const CAUSE_LABELS: Record<
  DemolitionCause,
  { label: string; icon: string; color: string }
> = {
  highway: {
    label: "Highway Construction",
    icon: "M4 15s1-1 4-1 5 2 8 2 2-1 2-1V3s0 1-2 1-3-2-8-2-4 1-4 1z",
    color: "#F44336",
  },
  "urban-renewal": {
    label: "Urban Renewal",
    icon: "M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16",
    color: "#FF7043",
  },
  disinvestment: {
    label: "Disinvestment",
    icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    color: "#FF8A65",
  },
};

export function GhostInfoPanel({
  ghost,
  parentZone,
  onBackToZone,
}: GhostInfoPanelProps) {
  if (!ghost) {
    return (
      <div
        className="p-4 space-y-4"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
      >
        {/* Zone header */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: parentZone.color, color: "#fff" }}
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

        {/* Ghost count */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm border border-red-500/40 border-dashed" />
            <span
              className="text-[10px] font-bold tracking-[0.1em] uppercase text-red-500/60"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              Structures Lost
            </span>
          </div>
          <div
            className="text-3xl font-bold text-red-400/80 leading-none"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {parentZone.ghostCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            demolished in {parentZone.holcId} zone
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-9 h-9 rounded-lg bg-slate-800/40 flex items-center justify-center mb-3 border border-red-500/10">
            <svg
              className="w-4 h-4 text-red-500/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
          <p
            className="text-sm text-slate-400 font-medium"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Select a ghost building
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Click any red wireframe to see what was demolished
          </p>
        </div>
      </div>
    );
  }

  const cause = CAUSE_LABELS[ghost.demolitionCause];
  const yearsStood = ghost.yearDemolished - ghost.originalYearBuilt;
  const yearsGone = 2025 - ghost.yearDemolished;

  return (
    <div
      className="p-4 space-y-4"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Breadcrumb: Zone > Ghost Building */}
      <nav className="flex items-center gap-1.5 text-[11px]">
        <button
          onClick={onBackToZone}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <div
            className="w-3.5 h-3.5 rounded-[2px] flex items-center justify-center text-[7px] font-bold"
            style={{ backgroundColor: parentZone.color, color: "#fff" }}
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
        <span className="text-red-400/80 font-medium truncate">
          {ghost.address}
        </span>
      </nav>

      <div className="h-px bg-slate-800" />

      {/* Ghost address header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-sm border border-red-500/50 border-dashed" />
          <span
            className="text-[9px] font-bold tracking-[0.12em] uppercase text-red-500/50"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Demolished Structure
          </span>
        </div>
        <h2
          className="text-base font-bold text-slate-100 tracking-tight leading-tight"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {ghost.address}
        </h2>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: `${cause.color}12`,
              color: cause.color,
              border: `1px solid ${cause.color}25`,
            }}
          >
            <svg
              className="w-2.5 h-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d={cause.icon}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cause.label}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Timeline: built → demolished */}
      <div className="relative">
        <div className="flex items-stretch gap-0">
          {/* Built */}
          <div className="flex-1 text-center">
            <div
              className="text-lg font-bold text-slate-300"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {ghost.originalYearBuilt}
            </div>
            <div
              className="text-[9px] text-slate-600 uppercase tracking-wider"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Built
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center px-2">
            <div className="flex items-center gap-1">
              <div className="w-8 h-px bg-gradient-to-r from-slate-600 to-red-500/50" />
              <svg
                className="w-3 h-3 text-red-500/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Demolished */}
          <div className="flex-1 text-center">
            <div
              className="text-lg font-bold text-red-400/80"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {ghost.yearDemolished}
            </div>
            <div
              className="text-[9px] text-red-500/40 uppercase tracking-wider"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              Demolished
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-2 px-2">
          <span className="text-[10px] text-slate-600">
            Stood {yearsStood} years
          </span>
          <span className="text-[10px] text-red-500/40">
            Gone {yearsGone} years
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Detail fields */}
      <div className="space-y-3">
        {/* Original use */}
        <div>
          <div
            className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            What it was
          </div>
          <p className="text-[13px] text-slate-300 leading-relaxed">
            {ghost.originalUse}
          </p>
        </div>

        {/* Demolition detail */}
        <div>
          <div
            className="text-[9px] text-red-500/40 uppercase tracking-wider mb-1"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            What happened
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            {ghost.demolitionDetail}
          </p>
        </div>

        {/* Current site */}
        <div className="bg-slate-800/30 rounded-lg px-3 py-2.5 border border-slate-700/20">
          <div
            className="text-[9px] text-slate-600 uppercase tracking-wider mb-1"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            What&apos;s there now
          </div>
          <p className="text-[13px] text-slate-300 font-medium">
            {ghost.currentSite}
          </p>
        </div>
      </div>

      {/* Zone context footer */}
      <div className="h-px bg-slate-800" />
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
          <span className="text-[10px] font-bold text-red-400">
            {parentZone.holcGrade}
          </span>
        </div>
        <div>
          <div className="text-[11px] text-slate-400">{parentZone.name}</div>
          <div
            className="text-[9px] text-slate-600"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {parentZone.ghostCount} structures demolished
          </div>
        </div>
      </div>
    </div>
  );
}
