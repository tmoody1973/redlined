"use client";

import type { EraMetadata, TimelineEra } from "@/types/archive";

interface TimelineProgressBarProps {
  eras: EraMetadata[];
  activeEra: TimelineEra;
  onEraClick: (era: TimelineEra) => void;
}

/**
 * Horizontal progress bar showing timeline eras with clickable markers.
 */
export function TimelineProgressBar({
  eras,
  activeEra,
  onEraClick,
}: TimelineProgressBarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-6 py-3">
      {eras.map((era, i) => {
        const isActive = activeEra === era.id;
        return (
          <button
            key={era.id}
            onClick={() => onEraClick(era.id)}
            className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              fontFamily: "var(--font-heading)",
              borderColor: isActive ? era.color : "rgb(51 65 85 / 0.5)",
              backgroundColor: isActive ? era.color + "18" : "transparent",
              color: isActive ? era.color : "#64748b",
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: era.color }}
            />
            {era.yearRange}
            <span className="hidden sm:inline">&middot; {era.label}</span>
          </button>
        );
      })}
    </div>
  );
}
