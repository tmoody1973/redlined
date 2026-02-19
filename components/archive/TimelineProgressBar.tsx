"use client";

import { motion } from "motion/react";
import type { EraMetadata, TimelineEra } from "@/types/archive";

interface TimelineProgressBarProps {
  eras: EraMetadata[];
  activeEra: TimelineEra;
  onEraClick: (era: TimelineEra) => void;
}

/**
 * Horizontal era navigation pills with a Motion.dev layoutId animated
 * indicator that slides between eras. Active era is driven by scroll
 * position (IntersectionObserver in TimelineSection). Clicking scrolls
 * to the era section.
 */
export function TimelineProgressBar({
  eras,
  activeEra,
  onEraClick,
}: TimelineProgressBarProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-6 py-3">
      {eras.map((era) => {
        const isActive = activeEra === era.id;
        return (
          <button
            key={era.id}
            onClick={() => onEraClick(era.id)}
            className="relative flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              fontFamily: "var(--font-heading)",
              color: isActive ? era.color : "#64748b",
            }}
          >
            {/* Animated pill background */}
            {isActive && (
              <motion.div
                layoutId="timeline-era-indicator"
                className="absolute inset-0 rounded-full border"
                style={{
                  borderColor: era.color,
                  backgroundColor: era.color + "18",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: era.color }}
              />
              {era.yearRange}
              <span className="hidden sm:inline">&middot; {era.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
