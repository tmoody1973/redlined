"use client";

import { HOLC_COLORS, HOLC_DESCRIPTORS, type HOLCGrade } from "@/types/holc";

const GRADES: HOLCGrade[] = ["A", "B", "C", "D"];

/**
 * HOLC grade legend overlay positioned in the upper-right of the canvas.
 * Displays color swatches with text labels for each HOLC grade.
 */
export function HOLCLegend() {
  return (
    <div
      className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 rounded-lg bg-slate-950/80 px-3 py-2.5 backdrop-blur-sm"
      aria-label="HOLC grade legend"
      role="region"
    >
      {GRADES.map((grade) => (
        <div key={grade} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: HOLC_COLORS[grade] }}
            aria-hidden="true"
          />
          <span
            className="text-xs text-slate-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="font-semibold">{grade}</span>{" "}
            {HOLC_DESCRIPTORS[grade]}
          </span>
        </div>
      ))}
    </div>
  );
}
