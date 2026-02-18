import { useState, useMemo } from "react";
import type { GhostBuildingsTimeSliderProps, GhostBuilding } from "../types";
import { GhostBlock } from "./GhostBlock";
import { GhostInfoPanel } from "./GhostInfoPanel";

/**
 * GhostBuildingsTimeSlider — CSS perspective representation of demolished
 * structures as red wireframes, with time-driven era transitions.
 *
 * In the actual product, ghost buildings render as Three.js wireframe geometry
 * with GSAP-powered crossfade animations driven by the time slider.
 * This design preview captures the visual intent: red dashed wireframes
 * that haunt the scene, fading in/out by era.
 *
 * Fonts: Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
 * Colors: red (primary), amber (secondary), slate (neutral)
 */
export function GhostBuildingsTimeSlider({
  parentZone,
  ghostBuildings,
  eraMarkers,
  currentYear: controlledYear,
  isAutoPlaying: controlledAutoPlay,
  selectedGhostBuilding: controlledSelected,
  onSelectGhost,
  onHoverGhost,
  onYearChange,
  onBackToZone,
  onToggleGhostLayer,
  onToggleAutoPlay,
}: GhostBuildingsTimeSliderProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  );
  const [ghostLayerVisible, setGhostLayerVisible] = useState(true);
  const [internalYear, setInternalYear] = useState(controlledYear);
  const [internalAutoPlay, setInternalAutoPlay] = useState(controlledAutoPlay);

  const year = controlledYear ?? internalYear;
  const isAutoPlaying = controlledAutoPlay ?? internalAutoPlay;
  const selectedId = controlledSelected?.id ?? internalSelectedId;

  const selectedGhostData = useMemo(
    () => ghostBuildings.find((g) => g.id === selectedId) || null,
    [ghostBuildings, selectedId]
  );

  const hoveredGhost = useMemo(
    () => ghostBuildings.find((g) => g.id === hoveredId) || null,
    [ghostBuildings, hoveredId]
  );

  // Determine which ghosts are visible based on current year
  const ghostVisibility = useMemo(() => {
    return ghostBuildings.reduce<Record<string, boolean>>((acc, ghost) => {
      // Ghost becomes visible after its demolition year
      acc[ghost.id] = year >= ghost.yearDemolished;
      return acc;
    }, {});
  }, [ghostBuildings, year]);

  const visibleGhostCount =
    Object.values(ghostVisibility).filter(Boolean).length;

  // Current era info
  const currentEra = useMemo(() => {
    const sorted = [...eraMarkers].sort((a, b) => a.year - b.year);
    let current = sorted[0];
    for (const marker of sorted) {
      if (year >= marker.year) current = marker;
    }
    return current;
  }, [eraMarkers, year]);

  // Position ghosts
  const ghostPositions = useMemo(() => {
    const allLats = ghostBuildings.flatMap((g) =>
      g.parcelBoundary.map((p) => p[1])
    );
    const allLngs = ghostBuildings.flatMap((g) =>
      g.parcelBoundary.map((p) => p[0])
    );
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return ghostBuildings.map((ghost) => {
      const bounds = ghost.parcelBoundary;
      const centerLng = bounds.reduce((s, p) => s + p[0], 0) / bounds.length;
      const centerLat = bounds.reduce((s, p) => s + p[1], 0) / bounds.length;
      const lngSpan =
        Math.max(...bounds.map((p) => p[0])) -
        Math.min(...bounds.map((p) => p[0]));

      return {
        ghost,
        left: ((centerLng - minLng) / lngRange) * 70 + 15,
        top: ((maxLat - centerLat) / latRange) * 60 + 15,
        width: Math.max((lngSpan / lngRange) * 70, 5),
      };
    });
  }, [ghostBuildings]);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    onHoverGhost?.(id);
  };

  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    onSelectGhost?.(id);
  };

  const handleYearChange = (newYear: number) => {
    setInternalYear(newYear);
    onYearChange?.(newYear);
  };

  const handleToggleGhostLayer = () => {
    const next = !ghostLayerVisible;
    setGhostLayerVisible(next);
    onToggleGhostLayer?.(next);
  };

  const handleToggleAutoPlay = () => {
    setInternalAutoPlay(!internalAutoPlay);
    onToggleAutoPlay?.();
  };

  const handleBackToZone = () => {
    setInternalSelectedId(null);
    onBackToZone?.();
  };

  return (
    <div
      className="flex h-full"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Viewport */}
      <div className="flex-1 relative bg-[#0F0F22] overflow-hidden select-none">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(244, 67, 54, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(244, 67, 54, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Red-tinted vignette for ghostly atmosphere */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 25%, rgba(10,5,5,0.6) 100%)",
          }}
        />

        {/* Zone footprint */}
        <div
          className="absolute inset-[12%] rounded-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${parentZone.color}06 0%, transparent 70%)`,
            border: `1px solid ${parentZone.color}08`,
          }}
        />

        {/* Perspective container */}
        <div
          className="absolute inset-0"
          style={{
            perspective: "900px",
            perspectiveOrigin: "50% 30%",
          }}
        >
          <div
            className="absolute inset-[8%]"
            style={{
              transform: "rotateX(40deg) rotateZ(-3deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Ground plane */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,15,30,0.9), rgba(10,8,20,0.95))",
                boxShadow: `0 0 80px rgba(0,0,0,0.4), inset 0 0 40px rgba(244,67,54,0.02)`,
                border: "1px solid rgba(244,67,54,0.06)",
              }}
            />

            {/* Ghost blocks */}
            {ghostLayerVisible &&
              ghostPositions.map(({ ghost, left, top, width }) => (
                <GhostBlock
                  key={ghost.id}
                  ghost={ghost}
                  isSelected={selectedId === ghost.id}
                  isHovered={hoveredId === ghost.id}
                  isVisible={ghostVisibility[ghost.id]}
                  onHover={() => handleHover(ghost.id)}
                  onHoverEnd={() => handleHover(null)}
                  onSelect={() => handleSelect(ghost.id)}
                  style={{
                    left: `${left - width / 2}%`,
                    top: `${top}%`,
                    width: `${Math.max(width, 4.5)}%`,
                  }}
                />
              ))}
          </div>
        </div>

        {/* Zone label — top left */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: parentZone.color, color: "#fff" }}
            >
              {parentZone.holcGrade}
            </div>
            <div>
              <div
                className="text-[11px] font-bold tracking-tight text-slate-300"
                style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
              >
                {parentZone.name}
              </div>
              <div
                className="text-[9px] text-red-500/40"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {visibleGhostCount} of {ghostBuildings.length} structures
                demolished
              </div>
            </div>
          </div>
        </div>

        {/* Controls — top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Auto-play button */}
          <button
            onClick={handleToggleAutoPlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-[11px] ${
              isAutoPlaying
                ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/20"
                : "bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-slate-300"
            }`}
          >
            {isAutoPlaying ? (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
            {isAutoPlaying ? "Pause" : "Auto-play"}
          </button>

          {/* Ghost layer toggle */}
          <button
            onClick={handleToggleGhostLayer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-[11px] ${
              ghostLayerVisible
                ? "bg-red-500/10 border-red-500/20 text-red-400/80"
                : "bg-slate-900/80 border-slate-800/50 text-slate-600 hover:text-slate-400"
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-[1px]"
              style={{
                border: "1.5px dashed",
                borderColor: ghostLayerVisible
                  ? "rgba(244,67,54,0.5)"
                  : "rgba(100,116,139,0.4)",
                backgroundColor: "transparent",
              }}
            />
            Ghosts {ghostLayerVisible ? "ON" : "OFF"}
          </button>
        </div>

        {/* Era description overlay — center bottom */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/30 rounded-lg px-4 py-2 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="text-2xl font-bold text-slate-300 tabular-nums"
                style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
              >
                {currentEra.label}
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <p className="text-[12px] text-slate-400 max-w-[300px]">
                {currentEra.description}
              </p>
            </div>
          </div>
        </div>

        {/* Mini time slider in viewport */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            {/* Era dots */}
            <div className="flex items-center flex-1">
              <div className="relative flex-1 h-1">
                {/* Track */}
                <div className="absolute inset-0 bg-slate-800 rounded-full" />

                {/* Progress */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-slate-600 to-red-500/50 rounded-full transition-all duration-500"
                  style={{
                    width: `${((year - 1910) / (2025 - 1910)) * 100}%`,
                  }}
                />

                {/* Era markers */}
                {eraMarkers.map((marker) => {
                  const pos = ((marker.year - 1910) / (2025 - 1910)) * 100;
                  const isActive = year >= marker.year;
                  return (
                    <button
                      key={marker.year}
                      onClick={() => handleYearChange(marker.year)}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                      style={{ left: `${pos}%` }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-red-500/80 border-red-400 shadow-[0_0_8px_rgba(244,67,54,0.4)]"
                            : "bg-slate-800 border-slate-600 group-hover:border-slate-400"
                        }`}
                      />
                      <span
                        className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap ${
                          isActive ? "text-slate-400" : "text-slate-600"
                        }`}
                        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                      >
                        {marker.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Hovered ghost tooltip */}
        {hoveredId &&
          hoveredGhost &&
          !selectedId &&
          ghostVisibility[hoveredId] && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-slate-900/95 backdrop-blur-sm border border-red-500/20 rounded-lg px-3.5 py-2 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 rounded-sm border border-dashed border-red-500/40" />
                  <div>
                    <div
                      className="text-[12px] font-semibold text-slate-200"
                      style={{
                        fontFamily: '"Space Grotesk", system-ui, sans-serif',
                      }}
                    >
                      {hoveredGhost.address}
                    </div>
                    <div
                      className="text-[10px] text-red-400/60"
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      Demolished {hoveredGhost.yearDemolished} ·{" "}
                      {hoveredGhost.demolitionCause.replace("-", " ")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Design note */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <p
            className="text-slate-500/30 text-xs"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Three.js wireframe ghosts + GSAP animation renders here
          </p>
        </div>
      </div>

      {/* Info panel — right side */}
      <div className="w-[300px] shrink-0 bg-slate-950/80 border-l border-slate-800/80 overflow-y-auto">
        <GhostInfoPanel
          ghost={selectedGhostData}
          parentZone={parentZone}
          onBackToZone={handleBackToZone}
        />
      </div>
    </div>
  );
}
