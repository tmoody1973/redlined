import { useState, useMemo } from "react";
import type {
  DataOverlaysProps,
  OverlayLayerId,
  ZoneOverlayData,
} from "../types";
import { OverlayStatsPanel } from "./OverlayStatsPanel";

/**
 * DataOverlays — CSS perspective representation of HOLC zones with choropleth
 * color fills driven by present-day outcome data.
 *
 * In the actual product, choropleth fills are applied to Three.js zone geometry
 * with smooth crossfade transitions. This design preview captures the visual
 * intent: zones colored by metric value, layer controls, opacity slider,
 * color scale legend, and comparison stats panel.
 *
 * Fonts: Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
 * Colors: red (primary), amber (secondary), slate (neutral)
 */
export function DataOverlays({
  overlayLayers,
  zoneOverlayData,
  gradeAverages,
  activeLayer: controlledActiveLayer,
  overlayOpacity: controlledOpacity,
  selectedZoneId: controlledSelectedZoneId,
  onLayerChange,
  onOpacityChange,
  onZoneSelect,
  onZoneHover,
}: DataOverlaysProps) {
  const [internalActiveLayer, setInternalActiveLayer] =
    useState<OverlayLayerId | null>(controlledActiveLayer);
  const [internalOpacity, setInternalOpacity] = useState(controlledOpacity);
  const [internalSelectedZoneId, setInternalSelectedZoneId] = useState<
    string | null
  >(controlledSelectedZoneId);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const activeLayerId = controlledActiveLayer ?? internalActiveLayer;
  const opacity = controlledOpacity ?? internalOpacity;
  const selectedZoneId = controlledSelectedZoneId ?? internalSelectedZoneId;

  const activeLayerData = useMemo(
    () => overlayLayers.find((l) => l.id === activeLayerId) || null,
    [overlayLayers, activeLayerId]
  );

  const selectedZone = useMemo(
    () => zoneOverlayData.find((z) => z.zoneId === selectedZoneId) || null,
    [zoneOverlayData, selectedZoneId]
  );

  const hoveredZone = useMemo(
    () => zoneOverlayData.find((z) => z.zoneId === hoveredZoneId) || null,
    [zoneOverlayData, hoveredZoneId]
  );

  // Position zones
  const zonePositions = useMemo(() => {
    // Use a grid layout for the design preview
    const cols = 4;
    return zoneOverlayData.map((zone, i) => ({
      zone,
      left: (i % cols) * 22 + 8,
      top: Math.floor(i / cols) * 35 + 12,
      width: 18,
    }));
  }, [zoneOverlayData]);

  const handleLayerChange = (layerId: OverlayLayerId | null) => {
    setInternalActiveLayer(layerId);
    onLayerChange?.(layerId);
  };

  const handleOpacityChange = (newOpacity: number) => {
    setInternalOpacity(newOpacity);
    onOpacityChange?.(newOpacity);
  };

  const handleZoneSelect = (zoneId: string) => {
    setInternalSelectedZoneId(zoneId);
    onZoneSelect?.(zoneId);
  };

  const handleZoneHover = (zoneId: string | null) => {
    setHoveredZoneId(zoneId);
    onZoneHover?.(zoneId);
  };

  function formatTooltipValue(value: number, unit: string): string {
    if (unit === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (unit === "percentile") return `${value}th pctile`;
    return `${value}/100`;
  }

  const HOLC_GRADE_COLORS: Record<string, string> = {
    A: "#4CAF50",
    B: "#2196F3",
    C: "#FFEB3B",
    D: "#F44336",
  };

  return (
    <div
      className="flex h-full"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Viewport */}
      <div className="flex-1 relative bg-[#141428] overflow-hidden select-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Perspective container */}
        <div
          className="absolute inset-0"
          style={{ perspective: "1000px", perspectiveOrigin: "50% 32%" }}
        >
          <div
            className="absolute inset-[6%]"
            style={{
              transform: "rotateX(38deg) rotateZ(-4deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Ground plane */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(25,25,50,0.9), rgba(12,12,30,0.95))",
                boxShadow: "0 0 80px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            />

            {/* Choropleth zones */}
            {zonePositions.map(({ zone, left, top, width }) => {
              const isSelected = selectedZoneId === zone.zoneId;
              const isHovered = hoveredZoneId === zone.zoneId;
              const isHighlighted = isSelected || isHovered;

              // Get color: choropleth if overlay active, grade color otherwise
              const fillColor = activeLayerId
                ? zone.metrics[activeLayerId]?.choroplethColor ||
                  HOLC_GRADE_COLORS[zone.holcGrade]
                : HOLC_GRADE_COLORS[zone.holcGrade];

              const height =
                zone.holcGrade === "A"
                  ? 40
                  : zone.holcGrade === "B"
                    ? 30
                    : zone.holcGrade === "C"
                      ? 20
                      : 10;

              return (
                <div
                  key={zone.zoneId}
                  className="absolute cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    zIndex: isHighlighted ? 50 : Math.round(height),
                  }}
                  onMouseEnter={() => handleZoneHover(zone.zoneId)}
                  onMouseLeave={() => handleZoneHover(null)}
                  onClick={() => handleZoneSelect(zone.zoneId)}
                >
                  <div
                    className="relative w-full transition-all duration-500"
                    style={{ height: `${height * 2.5}px`, minHeight: "30px" }}
                  >
                    <div
                      className="absolute inset-0 rounded-sm transition-all duration-500"
                      style={{
                        backgroundColor: fillColor,
                        opacity: activeLayerId
                          ? opacity * (isHighlighted ? 1 : 0.85)
                          : isHighlighted
                            ? 0.9
                            : 0.6,
                        boxShadow: isHighlighted
                          ? `0 0 24px ${fillColor}80, inset 0 1px 0 rgba(255,255,255,0.15)`
                          : `0 ${height / 4}px ${height / 2}px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
                        borderColor: isHighlighted
                          ? `${fillColor}CC`
                          : "transparent",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        transform: isHighlighted
                          ? "translateY(-4px) scale(1.03)"
                          : "none",
                      }}
                    >
                      {/* Bottom edge depth */}
                      <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                          height: `${Math.max(height / 3, 6)}px`,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                          borderRadius: "0 0 2px 2px",
                        }}
                      />

                      {/* Zone label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-[10px] font-bold drop-shadow-md"
                          style={{
                            fontFamily:
                              '"Space Grotesk", system-ui, sans-serif',
                            color: zone.holcGrade === "C" ? "#1A1A2E" : "#fff",
                            opacity: 0.9,
                          }}
                        >
                          {zone.holcId}
                        </span>
                      </div>
                    </div>

                    {/* Selection ring */}
                    {isSelected && (
                      <div
                        className="absolute -inset-1 rounded-sm animate-pulse"
                        style={{
                          border: `2px solid ${fillColor}CC`,
                          boxShadow: `0 0 20px ${fillColor}60`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer selector — top left */}
        <div className="absolute top-4 left-4">
          <div
            className="text-[8px] font-bold tracking-[0.15em] uppercase text-slate-600 mb-2"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Data Overlay
          </div>
          <div className="flex flex-col gap-1">
            {overlayLayers.map((layer) => {
              const isActive = activeLayerId === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => handleLayerChange(isActive ? null : layer.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800/90 border-slate-600/50 text-slate-200"
                      : "bg-slate-900/60 border-slate-800/40 text-slate-500 hover:text-slate-300 hover:border-slate-700/40"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-200"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${layer.colorScale[0]}, ${layer.colorScale[4]})`
                        : "rgba(100,116,139,0.3)",
                    }}
                  />
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Opacity slider — top right */}
        {activeLayerId && (
          <div className="absolute top-4 right-4">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] text-slate-500"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  Opacity
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(opacity * 100)}
                  onChange={(e) =>
                    handleOpacityChange(Number(e.target.value) / 100)
                  }
                  className="w-20 h-1 accent-red-500 cursor-pointer"
                />
                <span
                  className="text-[10px] text-slate-400 w-8 text-right tabular-nums"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {Math.round(opacity * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Color scale legend — bottom left */}
        {activeLayerData && (
          <div className="absolute bottom-4 left-4">
            <div
              className="text-[8px] font-bold tracking-[0.15em] uppercase text-slate-600 mb-1.5"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              {activeLayerData.label}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] text-slate-500"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {activeLayerData.minLabel}
              </span>
              <div className="flex h-3 rounded-sm overflow-hidden">
                {activeLayerData.colorScale.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span
                className="text-[9px] text-slate-500"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {activeLayerData.maxLabel}
              </span>
            </div>
          </div>
        )}

        {/* Hovered zone tooltip */}
        {hoveredZoneId && hoveredZone && activeLayerData && !selectedZoneId && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3.5 py-2 shadow-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor:
                      hoveredZone.metrics[activeLayerId!]?.choroplethColor ||
                      "#666",
                    color: hoveredZone.holcGrade === "C" ? "#1A1A2E" : "#fff",
                  }}
                >
                  {hoveredZone.holcGrade}
                </div>
                <div>
                  <div
                    className="text-[12px] font-semibold text-slate-200"
                    style={{
                      fontFamily: '"Space Grotesk", system-ui, sans-serif',
                    }}
                  >
                    {hoveredZone.name}
                  </div>
                  <div
                    className="text-[10px] text-slate-500"
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    {activeLayerData.label}:{" "}
                    {formatTooltipValue(
                      hoveredZone.metrics[activeLayerId!].value,
                      activeLayerData.unit
                    )}
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
            Three.js choropleth overlay renders here
          </p>
        </div>
      </div>

      {/* Stats panel — right side */}
      <div className="w-[300px] shrink-0 bg-slate-950/80 border-l border-slate-800/80 overflow-y-auto">
        <OverlayStatsPanel
          zone={selectedZone}
          activeLayer={activeLayerData}
          gradeAverages={gradeAverages}
        />
      </div>
    </div>
  );
}
