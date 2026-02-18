"use client";

import { useCallback, useState } from "react";
import { useTimeSlider, MIN_YEAR, MAX_YEAR } from "@/lib/time-slider";

/** Notable eras for tick marks on the slider. */
const ERA_MARKS = [
  { year: 1870, label: "1870" },
  { year: 1938, label: "HOLC" },
  { year: 1968, label: "Fair Housing" },
  { year: 2025, label: "Now" },
];

/**
 * Always-visible timeline bar at the bottom of the canvas.
 * Collapsed: slim track with play button and year label.
 * Expanded: full controls with slider, era annotations, ghost toggle.
 */
export function TimeSlider() {
  const {
    currentYear,
    isExpanded,
    isPlaying,
    currentEra,
    setCurrentYear,
    setIsExpanded,
    togglePlayback,
  } = useTimeSlider();

  const [isHovered, setIsHovered] = useState(false);
  const showExpanded = isExpanded || isHovered;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentYear(parseInt(e.target.value));
    },
    [setCurrentYear],
  );

  const pct = ((currentYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30"
      style={{ fontFamily: "var(--font-body)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed bar */}
      {!showExpanded && (
        <div
          className="flex cursor-pointer items-center gap-3 border-t border-slate-700/50 bg-slate-950/90 px-4 py-2 backdrop-blur-sm transition-all"
          onClick={() => setIsExpanded(true)}
          role="button"
          tabIndex={0}
          aria-label="Expand timeline"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsExpanded(true);
          }}
        >
          {/* Play button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              togglePlayback();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 transition-colors hover:border-red-500 hover:text-white"
            aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
          >
            {isPlaying ? (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                <rect x="1" y="1" width="3" height="8" />
                <rect x="6" y="1" width="3" height="8" />
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="2,0 10,5 2,10" />
              </svg>
            )}
          </button>

          {/* Mini progress track */}
          <div className="relative flex-1">
            <div className="time-slider-track h-1 w-full rounded-full" />
            <div
              className="absolute top-0 left-0 h-1 rounded-full bg-red-500/80 transition-all duration-75"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Year + label */}
          <span
            className="shrink-0 text-sm tabular-nums text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Milwaukee {MIN_YEAR}&ndash;{MAX_YEAR}
          </span>
        </div>
      )}

      {/* Expanded bar */}
      {showExpanded && (
        <div className="border-t border-slate-700/50 bg-slate-950/95 px-4 pt-3 pb-3 backdrop-blur-sm">
          {/* Era annotation row */}
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: currentEra.color,
                }}
              >
                {currentEra.label}
              </span>
              <p
                className="mt-0.5 text-xs leading-relaxed text-slate-400 transition-opacity duration-300"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {currentEra.annotation}
              </p>
            </div>

            {/* Close / collapse */}
            <button
              onClick={() => setIsExpanded(false)}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              aria-label="Collapse timeline"
            >
              &times;
            </button>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlayback}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 transition-colors hover:border-red-500 hover:text-white"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <rect x="1" y="1" width="3" height="8" />
                  <rect x="6" y="1" width="3" height="8" />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <polygon points="2,0 10,5 2,10" />
                </svg>
              )}
            </button>

            {/* Year display */}
            <span
              className="w-14 shrink-0 text-2xl font-bold tabular-nums text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {currentYear}
            </span>

            {/* Range slider */}
            <div className="relative flex-1">
              <input
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                step={1}
                value={currentYear}
                onChange={handleSliderChange}
                className="time-slider-range w-full"
                aria-label="Select year"
                aria-valuemin={MIN_YEAR}
                aria-valuemax={MAX_YEAR}
                aria-valuenow={currentYear}
                aria-valuetext={`${currentYear}, ${currentEra.label}`}
              />

              {/* Era tick marks */}
              <div className="relative mt-1 h-3">
                {ERA_MARKS.map((mark) => {
                  const markPct =
                    ((mark.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
                  return (
                    <button
                      key={mark.year}
                      onClick={() => setCurrentYear(mark.year)}
                      className="absolute text-[9px] tabular-nums text-slate-500 transition-colors hover:text-slate-300"
                      style={{
                        left: `${markPct}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {mark.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
