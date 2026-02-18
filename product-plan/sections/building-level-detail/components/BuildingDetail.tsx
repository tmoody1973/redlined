import { useState, useMemo } from "react";
import type { BuildingDetailProps, Building } from "../types";
import { BuildingBlock } from "./BuildingBlock";
import { BuildingInfoPanel } from "./BuildingInfoPanel";

/**
 * BuildingDetail — CSS perspective representation of individual MPROP buildings
 * within a selected HOLC zone.
 *
 * In the actual product, these buildings render as Three.js ExtrudeGeometry
 * parcels inside the 3D scene. This design preview captures the visual intent:
 * buildings extruded by stories, color-coded by construction era, with hover
 * tooltips and a click-to-inspect info panel.
 *
 * Fonts: Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
 * Colors: red (primary), amber (secondary), slate (neutral)
 * Era colors: copper (#B87333), gray (#808080), light blue (#4FC3F7)
 */
export function BuildingDetail({
  parentZone,
  buildings,
  eraCategories,
  selectedBuilding: controlledSelectedBuilding,
  onSelectBuilding,
  onHoverBuilding,
  onBackToZone,
  onToggleLayer,
}: BuildingDetailProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  );
  const [layerVisible, setLayerVisible] = useState(true);

  const selectedId = controlledSelectedBuilding?.id ?? internalSelectedId;
  const selectedBuildingData = useMemo(
    () => buildings.find((b) => b.id === selectedId) || null,
    [buildings, selectedId]
  );

  const hoveredBuilding = useMemo(
    () => buildings.find((b) => b.id === hoveredId) || null,
    [buildings, hoveredId]
  );

  // Position buildings based on parcel boundaries
  const buildingPositions = useMemo(() => {
    const allLats = buildings.flatMap((b) => b.parcelBoundary.map((p) => p[1]));
    const allLngs = buildings.flatMap((b) => b.parcelBoundary.map((p) => p[0]));
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return buildings.map((building) => {
      const bounds = building.parcelBoundary;
      const centerLng = bounds.reduce((s, p) => s + p[0], 0) / bounds.length;
      const centerLat = bounds.reduce((s, p) => s + p[1], 0) / bounds.length;
      const lngSpan =
        Math.max(...bounds.map((p) => p[0])) -
        Math.min(...bounds.map((p) => p[0]));
      const latSpan =
        Math.max(...bounds.map((p) => p[1])) -
        Math.min(...bounds.map((p) => p[1]));

      return {
        building,
        left: ((centerLng - minLng) / lngRange) * 70 + 15,
        top: ((maxLat - centerLat) / latRange) * 60 + 15,
        width: Math.max((lngSpan / lngRange) * 70, 5),
        height: Math.max((latSpan / latRange) * 60, 5),
      };
    });
  }, [buildings]);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    onHoverBuilding?.(id);
  };

  const handleSelect = (id: string) => {
    setInternalSelectedId(id);
    onSelectBuilding?.(id);
  };

  const handleToggleLayer = () => {
    const next = !layerVisible;
    setLayerVisible(next);
    onToggleLayer?.(next);
  };

  const handleBackToZone = () => {
    setInternalSelectedId(null);
    onBackToZone?.();
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div
      className="flex h-full"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Viewport — zoomed-in zone with buildings */}
      <div className="flex-1 relative bg-[#13132B] overflow-hidden select-none">
        {/* Atmospheric grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Zone footprint glow on ground */}
        <div
          className="absolute inset-[15%] rounded-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${parentZone.color}08 0%, transparent 70%)`,
            border: `1px solid ${parentZone.color}10`,
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
                background: `linear-gradient(135deg, rgba(25,25,50,0.9), rgba(12,12,30,0.95))`,
                boxShadow: `0 0 80px rgba(0,0,0,0.4), inset 0 0 60px ${parentZone.color}05`,
                border: `1px solid ${parentZone.color}15`,
              }}
            />

            {/* Building blocks */}
            {layerVisible &&
              buildingPositions.map(({ building, left, top, width }) => (
                <BuildingBlock
                  key={building.id}
                  building={building}
                  isSelected={selectedId === building.id}
                  isHovered={hoveredId === building.id}
                  onHover={() => handleHover(building.id)}
                  onHoverEnd={() => handleHover(null)}
                  onSelect={() => handleSelect(building.id)}
                  style={{
                    left: `${left - width / 2}%`,
                    top: `${top}%`,
                    width: `${Math.max(width, 4)}%`,
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
              style={{
                backgroundColor: parentZone.color,
                color: parentZone.holcGrade === "C" ? "#0f172a" : "#fff",
              }}
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
                className="text-[9px] text-slate-600"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {parentZone.holcId} · {buildings.length} buildings loaded
              </div>
            </div>
          </div>
        </div>

        {/* Layer toggle — top right */}
        <button
          onClick={handleToggleLayer}
          className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-[11px] ${
            layerVisible
              ? "bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-800"
              : "bg-slate-900/80 border-slate-800/50 text-slate-600 hover:text-slate-400"
          }`}
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Buildings {layerVisible ? "ON" : "OFF"}
        </button>

        {/* Era legend — bottom left */}
        <div className="absolute bottom-4 left-4">
          <div
            className="text-[8px] font-bold tracking-[0.15em] uppercase text-slate-600 mb-2"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Construction Era
          </div>
          <div className="flex flex-col gap-1.5">
            {eraCategories.map((era) => (
              <div key={era.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: era.color, opacity: 0.8 }}
                />
                <span
                  className="text-[10px] text-slate-500"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {era.label}
                </span>
                <span className="text-[10px] text-slate-600">
                  {era.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hovered building tooltip */}
        {hoveredId && hoveredBuilding && !selectedId && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3.5 py-2 shadow-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-6 rounded-sm"
                  style={{ backgroundColor: hoveredBuilding.eraColor }}
                />
                <div>
                  <div
                    className="text-[12px] font-semibold text-slate-200"
                    style={{
                      fontFamily: '"Space Grotesk", system-ui, sans-serif',
                    }}
                  >
                    {hoveredBuilding.address}
                  </div>
                  <div
                    className="text-[10px] text-slate-500"
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    Built {hoveredBuilding.yearBuilt} ·{" "}
                    {hoveredBuilding.stories}{" "}
                    {hoveredBuilding.stories === 1 ? "story" : "stories"} ·{" "}
                    {formatCurrency(hoveredBuilding.assessedValue)}
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
            Three.js building-level detail renders here
          </p>
        </div>
      </div>

      {/* Info panel — right side */}
      <div className="w-[300px] shrink-0 bg-slate-950/80 border-l border-slate-800/80 overflow-y-auto">
        <BuildingInfoPanel
          building={selectedBuildingData}
          parentZone={parentZone}
          onBackToZone={handleBackToZone}
        />
      </div>
    </div>
  );
}
