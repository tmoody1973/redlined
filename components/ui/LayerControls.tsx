"use client";

import { useState } from "react";
import { useLayerVisibility, type SanbornYear } from "@/lib/layer-visibility";
import { useDataOverlay, type OverlayType } from "@/lib/data-overlay";
import { useBaseMap } from "@/lib/base-map";
import { useTimeSlider } from "@/lib/time-slider";

interface LayerToggle {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  color?: string;
}

const DATA_OVERLAYS: { id: OverlayType; label: string }[] = [
  { id: "income", label: "Median Income" },
  { id: "health", label: "Health Outcomes" },
  { id: "environment", label: "Env. Burden" },
  { id: "value", label: "Assessed Value" },
  { id: "race", label: "Race & Demographics" },
];

/**
 * Unified layer controls panel. Compact "Layers" button that expands to
 * show toggles for map layers (zones, labels, neighborhoods, buildings,
 * base map) and data overlays (income, health, environment, value).
 */
export function LayerControls() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    zonesVisible, labelsVisible, neighborhoodNamesVisible, buildingsVisible,
    sanbornVisible, sanbornYear, sanbornOpacity,
    toggleZones, toggleLabels, toggleNeighborhoodNames, toggleBuildings,
    toggleSanborn, setSanbornYear, setSanbornOpacity,
  } = useLayerVisibility();
  const { activeOverlay, overlayOpacity, toggleOverlay, setOverlayOpacity } =
    useDataOverlay();
  const { baseMapVisible, baseMapOpacity, toggleBaseMap, setBaseMapOpacity } =
    useBaseMap();
  const { ghostsVisible, toggleGhosts } = useTimeSlider();

  const mapLayers: LayerToggle[] = [
    { id: "zones", label: "HOLC Zones", active: zonesVisible, onToggle: toggleZones, color: "#F44336" },
    { id: "labels", label: "Zone IDs", active: labelsVisible, onToggle: toggleLabels },
    { id: "neighborhoods", label: "Neighborhoods", active: neighborhoodNamesVisible, onToggle: toggleNeighborhoodNames },
    { id: "buildings", label: "Buildings", active: buildingsVisible, onToggle: toggleBuildings },
    { id: "basemap", label: "Street Map", active: baseMapVisible, onToggle: toggleBaseMap },
    { id: "sanborn", label: "Sanborn Maps", active: sanbornVisible, onToggle: toggleSanborn, color: "#d97706" },
  ];

  const overlayOpacityPct = Math.round(overlayOpacity * 100);
  const baseOpacityPct = Math.round(baseMapOpacity * 100);

  return (
    <div
      className="absolute top-4 left-4 z-20"
      role="region"
      aria-label="Layer controls"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
          isOpen
            ? "border-slate-600 bg-slate-900/95 text-white"
            : "border-slate-700 bg-slate-950/80 text-slate-300 hover:border-slate-600 hover:text-white"
        } backdrop-blur-sm`}
        style={{ fontFamily: "var(--font-body)" }}
        aria-expanded={isOpen}
        aria-controls="layer-panel"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        Layers
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id="layer-panel"
          className="mt-1.5 w-48 rounded-lg border border-slate-700 bg-slate-950/95 px-2.5 py-2.5 backdrop-blur-sm"
        >
          {/* Map Layers */}
          <span
            className="text-[9px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Map Layers
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            {mapLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={layer.onToggle}
                className="flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-slate-800/60"
                style={{ fontFamily: "var(--font-body)" }}
                aria-pressed={layer.active}
              >
                <span
                  className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                    layer.active
                      ? "border-red-500/60 bg-red-500/20"
                      : "border-slate-600 bg-slate-800"
                  }`}
                >
                  {layer.active && (
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke={layer.color ?? "#f87171"} strokeWidth="2.5">
                      <polyline points="2,5 4.5,7.5 8,2.5" />
                    </svg>
                  )}
                </span>
                <span className={layer.active ? "text-slate-200" : "text-slate-500"}>
                  {layer.label}
                </span>
              </button>
            ))}
          </div>

          {/* Base map opacity — inline under Street Map when active */}
          {baseMapVisible && (
            <div className="mt-1 flex items-center gap-1.5 pl-7">
              <input
                type="range"
                min={0}
                max={100}
                value={baseOpacityPct}
                onChange={(e) => setBaseMapOpacity(Number(e.target.value) / 100)}
                className="h-0.5 w-14 cursor-pointer appearance-none rounded-full bg-slate-700 accent-red-500"
                aria-label="Base map opacity"
              />
              <span
                className="text-[9px] tabular-nums text-slate-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {baseOpacityPct}%
              </span>
            </div>
          )}

          {/* Sanborn controls — year picker + opacity when active */}
          {sanbornVisible && (
            <div className="mt-1 space-y-1 pl-7">
              <div className="flex items-center gap-1">
                {([1894, 1910] as SanbornYear[]).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSanbornYear(year)}
                    className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                      sanbornYear === year
                        ? "bg-amber-600/30 text-amber-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(sanbornOpacity * 100)}
                  onChange={(e) => setSanbornOpacity(Number(e.target.value) / 100)}
                  className="h-0.5 w-14 cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-500"
                  aria-label="Sanborn map opacity"
                />
                <span
                  className="text-[9px] tabular-nums text-slate-500"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {Math.round(sanbornOpacity * 100)}%
                </span>
              </div>
            </div>
          )}
          {sanbornVisible && (
            <p
              className="mt-1.5 px-1.5 text-[10px] leading-relaxed text-amber-400/70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Fire insurance atlases documenting every building in Milwaukee.
              These maps show what HOLC appraisers evaluated when grading
              neighborhoods in 1938. Click a zone to see how the buildings
              they recorded connect to today.
            </p>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-slate-800" />

          {/* Data Overlays */}
          <span
            className="text-[9px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Data Overlay
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            {DATA_OVERLAYS.map((overlay) => {
              const isActive = activeOverlay === overlay.id;
              return (
                <button
                  key={overlay.id}
                  onClick={() => toggleOverlay(overlay.id!)}
                  className="flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-slate-800/60"
                  style={{ fontFamily: "var(--font-body)" }}
                  aria-pressed={isActive}
                >
                  <span
                    className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isActive
                        ? "border-red-500/60 bg-red-500/20"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    )}
                  </span>
                  <span className={isActive ? "text-slate-200" : "text-slate-500"}>
                    {overlay.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Overlay opacity — inline when active */}
          {activeOverlay && (
            <div className="mt-1 flex items-center gap-1.5 pl-7">
              <input
                type="range"
                min={0}
                max={100}
                value={overlayOpacityPct}
                onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                className="h-0.5 w-14 cursor-pointer appearance-none rounded-full bg-slate-700 accent-red-500"
                aria-label="Overlay opacity"
              />
              <span
                className="text-[9px] tabular-nums text-slate-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {overlayOpacityPct}%
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-slate-800" />

          {/* Analysis */}
          <span
            className="text-[9px] font-semibold uppercase tracking-widest text-slate-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Analysis
          </span>
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              onClick={toggleGhosts}
              className="flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-slate-800/60"
              style={{ fontFamily: "var(--font-body)" }}
              aria-pressed={ghostsVisible}
            >
              <span
                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  ghostsVisible
                    ? "border-red-500/60 bg-red-500/20"
                    : "border-slate-600 bg-slate-800"
                }`}
              >
                {ghostsVisible && (
                  <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#f87171" strokeWidth="2.5">
                    <polyline points="2,5 4.5,7.5 8,2.5" />
                  </svg>
                )}
              </span>
              <span className={ghostsVisible ? "text-slate-200" : "text-slate-500"}>
                Demolished
              </span>
            </button>
          </div>
          {ghostsVisible && (
            <p
              className="mt-1.5 px-1.5 text-[10px] leading-relaxed text-red-400/70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Red circles show buildings demolished 2005&ndash;2020, sized by count per HOLC zone.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
