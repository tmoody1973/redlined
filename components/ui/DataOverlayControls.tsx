"use client";

import { useDataOverlay, type OverlayType } from "@/lib/data-overlay";

interface LayerButton {
  id: OverlayType;
  label: string;
  enabled: boolean;
}

const LAYERS: LayerButton[] = [
  { id: "income", label: "Median Income", enabled: true },
  { id: "health", label: "Health Outcomes", enabled: true },
  { id: "environment", label: "Environmental Burden", enabled: true },
  { id: "value", label: "Assessed Value", enabled: true },
];

/**
 * Data overlay toggle controls positioned in the upper-left of the canvas.
 * Provides layer toggle buttons and an opacity slider for the active overlay.
 */
export function DataOverlayControls() {
  const { activeOverlay, overlayOpacity, toggleOverlay, setOverlayOpacity } =
    useDataOverlay();

  const opacityPercent = Math.round(overlayOpacity * 100);

  return (
    <div
      className="flex flex-col gap-3"
      role="region"
      aria-label="Data overlay controls"
    >
      {/* Section label -- slate-400 for 4.5:1 contrast on dark backgrounds */}
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Data Overlay
      </span>

      {/* Layer toggle buttons */}
      <div className="flex flex-col gap-1.5">
        {LAYERS.map((layer) => {
          const isActive = activeOverlay === layer.id;
          const isDisabled = !layer.enabled;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={
                layer.enabled ? () => toggleOverlay(layer.id!) : undefined
              }
              disabled={isDisabled}
              className={`focus-ring rounded px-3 py-1.5 text-left text-xs transition-colors ${
                isActive
                  ? "border border-red-500/40 bg-red-500/15 text-slate-100"
                  : isDisabled
                    ? "cursor-not-allowed border border-slate-800 bg-slate-900/50 text-slate-600"
                    : "border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
              title={isDisabled ? "Coming Soon" : undefined}
              aria-pressed={isActive}
            >
              <span className="flex items-center gap-2">
                {isActive && (
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-red-400"
                    aria-hidden="true"
                  />
                )}
                {layer.label}
                {isDisabled && (
                  <span className="ml-auto text-[9px] uppercase text-slate-600">
                    Soon
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Opacity slider (visible when any overlay is active) */}
      {activeOverlay && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="overlay-opacity"
            className="text-[10px] text-slate-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Opacity
          </label>
          <input
            id="overlay-opacity"
            type="range"
            min={0}
            max={100}
            value={opacityPercent}
            onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
            className="focus-ring h-1 w-20 cursor-pointer appearance-none rounded-full bg-slate-700 accent-red-500"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={opacityPercent}
            aria-label="Overlay opacity"
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
