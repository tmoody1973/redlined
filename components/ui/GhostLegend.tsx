"use client";

/**
 * Floating legend card shown when ghost/demolished mode is active.
 * Positioned in the lower-left above the timeline bar.
 */
export function GhostLegend() {
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
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-red-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Demolished 2005&ndash;2020
      </span>

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
