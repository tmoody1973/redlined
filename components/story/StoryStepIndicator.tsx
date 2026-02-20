"use client";

import { motion } from "motion/react";

interface StoryStepIndicatorProps {
  currentIndex: number;
  totalBeats: number;
  onGoToBeat: (index: number) => void;
}

/**
 * Horizontal progress dots for the guided story.
 * Active dot uses layoutId for a smooth gliding animation.
 */
export function StoryStepIndicator({
  currentIndex,
  totalBeats,
  onGoToBeat,
}: StoryStepIndicatorProps) {
  return (
    <div
      className="flex items-center gap-3"
      role="tablist"
      aria-label="Story progress"
    >
      <span
        className="text-[10px] tabular-nums text-slate-500"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {currentIndex + 1} of {totalBeats}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalBeats }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoToBeat(i)}
            className="relative flex h-5 w-5 items-center justify-center"
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Go to beat ${i + 1}`}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-transparent"
                  : i < currentIndex
                    ? "bg-slate-500"
                    : "bg-slate-700"
              }`}
            />
            {i === currentIndex && (
              <motion.span
                layoutId="story-step-active"
                className="absolute h-2.5 w-2.5 rounded-full bg-red-500"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
