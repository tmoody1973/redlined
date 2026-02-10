import { useState, useMemo } from 'react'
import type { MapExplorerProps, HOLCZone } from '../types'
import { ZoneBlock } from './ZoneBlock'

/**
 * MapExplorer — CSS perspective representation of the 3D HOLC zone viewport.
 *
 * In the actual product, this component will be replaced with a Three.js scene
 * using ExtrudeGeometry for real 3D rendering. This design preview captures
 * the visual intent: extruded zones on a dark canvas with hover/click interactions.
 *
 * Fonts: Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
 * Colors: red (primary), amber (secondary), slate (neutral)
 */
export function MapExplorer({
  city,
  holcZones,
  viewModes,
  timeMarkers,
  year,
  onZoneHover,
  onZoneSelect,
  onViewModeToggle,
  onYearChange,
}: MapExplorerProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const selectedZoneData = useMemo(
    () => holcZones.find((z) => z.id === selectedZone) || null,
    [holcZones, selectedZone]
  )

  // Convert lat/lng polygons to relative positions within the viewport
  const zonePositions = useMemo(() => {
    const allLats = holcZones.flatMap((z) => z.polygon.map((p) => p[1]))
    const allLngs = holcZones.flatMap((z) => z.polygon.map((p) => p[0]))
    const minLat = Math.min(...allLats)
    const maxLat = Math.max(...allLats)
    const minLng = Math.min(...allLngs)
    const maxLng = Math.max(...allLngs)
    const latRange = maxLat - minLat || 1
    const lngRange = maxLng - minLng || 1

    return holcZones.map((zone) => {
      const centerLng = zone.polygon.reduce((s, p) => s + p[0], 0) / zone.polygon.length
      const centerLat = zone.polygon.reduce((s, p) => s + p[1], 0) / zone.polygon.length
      const lngSpan = Math.max(...zone.polygon.map((p) => p[0])) - Math.min(...zone.polygon.map((p) => p[0]))
      const latSpan = Math.max(...zone.polygon.map((p) => p[1])) - Math.min(...zone.polygon.map((p) => p[1]))

      return {
        zone,
        left: ((centerLng - minLng) / lngRange) * 80 + 10,
        // Invert lat so north is up
        top: ((maxLat - centerLat) / latRange) * 70 + 10,
        width: (lngSpan / lngRange) * 80,
        height: (latSpan / latRange) * 70,
      }
    })
  }, [holcZones])

  const handleZoneHover = (zoneId: string | null) => {
    setHoveredZone(zoneId)
    onZoneHover?.(zoneId)
  }

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId)
    onZoneSelect?.(zoneId)
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="absolute inset-0 bg-[#1A1A2E] overflow-hidden select-none">
      {/* Atmospheric grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Perspective container for isometric-ish view */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 35%',
        }}
      >
        <div
          className="absolute inset-[5%]"
          style={{
            transform: 'rotateX(35deg) rotateZ(-5deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Ground plane with subtle grid */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(30,30,60,0.8), rgba(15,15,35,0.9))',
              boxShadow: '0 0 120px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          />

          {/* Zone blocks */}
          {zonePositions.map(({ zone, left, top, width, height }) => (
            <ZoneBlock
              key={zone.id}
              zone={zone}
              isSelected={selectedZone === zone.id}
              isHovered={hoveredZone === zone.id}
              onHover={() => handleZoneHover(zone.id)}
              onHoverEnd={() => handleZoneHover(null)}
              onSelect={() => handleZoneSelect(zone.id)}
              style={{
                left: `${left - width / 2}%`,
                top: `${top - height / 2}%`,
                width: `${Math.max(width, 8)}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* City label — top left */}
      <div className="absolute top-5 left-5">
        <div className="flex items-center gap-3">
          <div
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {city.name}, {city.state}
          </div>
          <div className="h-px flex-1 bg-slate-700/50 w-16" />
        </div>
        <div
          className="text-[10px] text-slate-600 mt-1 tracking-wider"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {city.centerLat.toFixed(4)}°N, {Math.abs(city.centerLng).toFixed(4)}°W
        </div>
      </div>

      {/* Legend — top right */}
      <div className="absolute top-5 right-5">
        <div className="flex flex-col gap-1.5">
          {[
            { grade: 'A', label: 'Best', color: '#4CAF50' },
            { grade: 'B', label: 'Still Desirable', color: '#2196F3' },
            { grade: 'C', label: 'Declining', color: '#FFEB3B' },
            { grade: 'D', label: 'Hazardous', color: '#F44336' },
          ].map((item) => (
            <div key={item.grade} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: item.color, opacity: 0.75 }}
              />
              <span
                className="text-[10px] text-slate-500"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                {item.grade}
              </span>
              <span className="text-[10px] text-slate-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered zone tooltip */}
      {hoveredZone && !selectedZone && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2.5 shadow-2xl">
            {(() => {
              const zone = holcZones.find((z) => z.id === hoveredZone)
              if (!zone) return null
              return (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: zone.color,
                      opacity: 0.85,
                      color: zone.holcGrade === 'C' ? '#1A1A2E' : '#fff',
                    }}
                  >
                    {zone.holcGrade}
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold text-slate-200"
                      style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
                    >
                      {zone.name}
                    </div>
                    <div
                      className="text-[10px] text-slate-500"
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {zone.holcId} · {formatCurrency(zone.medianIncome)} median income
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Year indicator — bottom left */}
      <div className="absolute bottom-5 left-5">
        <div
          className="text-4xl font-bold text-slate-700/40 tabular-nums"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {year}
        </div>
      </div>

      {/* Orbit controls hint — bottom right */}
      <div className="absolute bottom-5 right-5 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M21 9v6M3 9v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] text-slate-600">Drag to orbit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] text-slate-600">Scroll to zoom</span>
        </div>
      </div>

      {/* Design note overlay — only for design preview */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
        <div className="text-center">
          <p
            className="text-slate-500/40 text-xs"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Three.js viewport renders here
          </p>
        </div>
      </div>
    </div>
  )
}
