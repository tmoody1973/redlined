import type { ZoneOverlayData, OverlayLayer, GradeAverages, OverlayLayerId } from '../types'

interface OverlayStatsPanelProps {
  zone: ZoneOverlayData | null
  activeLayer: OverlayLayer | null
  gradeAverages: GradeAverages
  onZoneSelect?: (zoneId: string) => void
}

const GRADE_STYLES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  A: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Best', border: 'border-green-500/30' },
  B: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Still Desirable', border: 'border-blue-500/30' },
  C: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Declining', border: 'border-yellow-500/30' },
  D: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Hazardous', border: 'border-red-500/30' },
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  }
  if (unit === 'percentile') {
    return `${value}th pctile`
  }
  return `${value}/100`
}

export function OverlayStatsPanel({ zone, activeLayer, gradeAverages }: OverlayStatsPanelProps) {
  if (!activeLayer) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
        <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3 3v18h18M7 16l4-4 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p
          className="text-sm text-slate-400 font-medium"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          Select an overlay
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Choose Income, Health, Environment, or Value to see data
        </p>
      </div>
    )
  }

  if (!zone) {
    return (
      <div className="p-4 space-y-4" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
        {/* Active layer header */}
        <div>
          <div
            className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-600 mb-1"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Active Overlay
          </div>
          <h2
            className="text-base font-bold text-slate-200 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {activeLayer.label}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            {activeLayer.description}
          </p>
          <p
            className="text-[9px] text-slate-600 mt-1"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Source: {activeLayer.source}
          </p>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Grade comparison — quick overview */}
        <div>
          <div
            className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-600 mb-2"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            Grade Comparison
          </div>
          <div className="space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((grade) => {
              const style = GRADE_STYLES[grade]
              const avg = gradeAverages[grade][activeLayer.id as OverlayLayerId]
              return (
                <div key={grade} className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${style.bg} ${style.text} border ${style.border}`}>
                    {grade}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{style.label}</span>
                      <span
                        className="text-[12px] font-semibold text-slate-200"
                        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                      >
                        {formatMetricValue(avg, activeLayer.unit)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="flex flex-col items-center py-4 text-center">
          <p className="text-[11px] text-slate-600">
            Click a zone on the map to see detailed stats
          </p>
        </div>
      </div>
    )
  }

  const grade = GRADE_STYLES[zone.holcGrade]
  const metric = zone.metrics[activeLayer.id as OverlayLayerId]
  const aAvg = gradeAverages.A[activeLayer.id as OverlayLayerId]
  const dAvg = gradeAverages.D[activeLayer.id as OverlayLayerId]

  // Calculate A-to-D ratio
  const isHigherBetter = activeLayer.unit === 'currency'
  const differential = isHigherBetter
    ? `${(aAvg / dAvg).toFixed(1)}x higher in A-zones`
    : `${(dAvg / aAvg).toFixed(1)}x worse in D-zones`

  return (
    <div className="p-4 space-y-4" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Zone header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-base font-bold text-slate-100 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {zone.name}
          </h2>
          <span
            className="text-[11px] text-slate-500"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {zone.holcId}
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-lg ${grade.bg} border ${grade.border}`}>
          <div className={`text-base font-bold ${grade.text} leading-none`}>
            {zone.holcGrade}
          </div>
          <div className={`text-[9px] ${grade.text} opacity-70 mt-0.5`}>
            {grade.label}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Active metric — big number */}
      <div>
        <div
          className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-600 mb-1"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {activeLayer.label}
        </div>
        <div className="flex items-end gap-3">
          <div
            className="text-3xl font-bold text-slate-100 leading-none"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {formatMetricValue(metric.value, activeLayer.unit)}
          </div>
          <div className="pb-0.5">
            <span
              className="text-[11px] font-medium"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color: metric.choroplethColor,
              }}
            >
              {metric.percentile}th percentile
            </span>
          </div>
        </div>
        <p
          className="text-[9px] text-slate-600 mt-1"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {activeLayer.source}
        </p>
      </div>

      <div className="h-px bg-slate-800" />

      {/* A-zone vs D-zone comparison */}
      <div>
        <div
          className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-600 mb-2.5"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          A-Zone vs D-Zone
        </div>

        <div className="space-y-2.5">
          {/* A-zone average */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">A-Zone Avg</span>
                <span
                  className="text-[12px] font-semibold text-green-400"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {formatMetricValue(aAvg, activeLayer.unit)}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500/60"
                  style={{
                    width: `${((aAvg - activeLayer.min) / (activeLayer.max - activeLayer.min)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* This zone */}
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${grade.bg} ${grade.text} border ${grade.border}`}
            >
              {zone.holcGrade}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">This Zone</span>
                <span
                  className="text-[12px] font-bold text-slate-200"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {formatMetricValue(metric.value, activeLayer.unit)}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((metric.value - activeLayer.min) / (activeLayer.max - activeLayer.min)) * 100}%`,
                    backgroundColor: metric.choroplethColor,
                  }}
                />
              </div>
            </div>
          </div>

          {/* D-zone average */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
              D
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">D-Zone Avg</span>
                <span
                  className="text-[12px] font-semibold text-red-400"
                  style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {formatMetricValue(dAvg, activeLayer.unit)}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500/60"
                  style={{
                    width: `${((dAvg - activeLayer.min) / (activeLayer.max - activeLayer.min)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Differential callout */}
        <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
          <p className="text-[11px] text-amber-400/80 font-medium">
            {differential}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            85 years after HOLC grades were assigned
          </p>
        </div>
      </div>
    </div>
  )
}
