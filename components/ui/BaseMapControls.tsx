"use client";

import { useBaseMap } from "@/lib/base-map";

/**
 * Base map toggle and opacity controls, positioned below the data overlay
 * controls. Allows users to show/hide the CartoDB dark street map under
 * the HOLC zones and adjust its opacity.
 */
export function BaseMapControls() {
  const { baseMapVisible, baseMapOpacity, toggleBaseMap, setBaseMapOpacity } =
    useBaseMap();

  const opacityPercent = Math.round(baseMapOpacity * 100);

  return (
    <div
      className="flex flex-col gap-2"
      role="region"
      aria-label="Base map controls"
    >
      {/* Section label */}
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Base Map
      </span>

      {/* Toggle button */}
      <button
        type="button"
        onClick={toggleBaseMap}
        className={`focus-ring rounded px-3 py-1.5 text-left text-xs transition-colors ${
          baseMapVisible
            ? "border border-red-500/40 bg-red-500/15 text-slate-100"
            : "border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600 hover:text-slate-300"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
        aria-pressed={baseMapVisible}
      >
        <span className="flex items-center gap-2">
          {baseMapVisible && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-red-400"
              aria-hidden="true"
            />
          )}
          Street Map
        </span>
      </button>

      {/* Opacity slider (visible when map is active) */}
      {baseMapVisible && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="basemap-opacity"
            className="text-[10px] text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Opacity
          </label>
          <input
            id="basemap-opacity"
            type="range"
            min={0}
            max={100}
            value={opacityPercent}
            onChange={(e) => setBaseMapOpacity(Number(e.target.value) / 100)}
            className="focus-ring h-1 w-20 cursor-pointer appearance-none rounded-full bg-slate-700 accent-red-500"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={opacityPercent}
            aria-label="Base map opacity"
          />
          <span
            className="min-w-[2rem] text-right text-[10px] text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {opacityPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
