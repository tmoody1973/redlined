"use client";

import { useTimeSlider } from "@/lib/time-slider";

/**
 * Floating legend card shown when ghost/demolished mode is active.
 * Positioned in the lower-left above the timeline bar.
 * Includes a close button to toggle the layer off directly.
 */
export function GhostLegend() {
  const { toggleGhosts } = useTimeSlider();

  const grades = [
    { grade: "A", count: 39, color: "#4CAF50" },
    { grade: "B", count: 636, color: "#2196F3" },
    { grade: "C", count: 7714, color: "#FFEB3B" },
    { grade: "D", count: 7349, color: "#F44336" },
  ];

  return (
    <div
      className="absolute bottom-16 left-4 z-20 rounded-lg border border-red-500/30 bg-slate-950/90 px-3 py-2.5 backdrop-blur-sm"
      aria-label="Demolished buildings legend"
      role="region"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest text-red-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Demolished 2005&ndash;2020
        </span>
        <button
          onClick={toggleGhosts}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          aria-label="Hide demolished buildings layer"
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="2" x2="8" y2="8" />
            <line x1="8" y1="2" x2="2" y2="8" />
          </svg>
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {grades.map((g) => (
          <div key={g.grade} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-red-500/60"
              style={{ backgroundColor: g.color, opacity: 0.4 }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] text-slate-300"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="font-semibold">{g.grade}</span>{" "}
              <span
                className="tabular-nums text-slate-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {g.count.toLocaleString()}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-2 text-[9px] leading-relaxed text-slate-500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Circle size = demolition count per zone
      </p>
    </div>
  );
}
