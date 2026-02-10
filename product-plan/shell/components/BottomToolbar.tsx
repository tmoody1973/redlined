import type { ViewMode } from './AppShell'

interface BottomToolbarProps {
  year?: number
  onYearChange?: (year: number) => void
  viewModes?: ViewMode[]
  onViewModeToggle?: (id: string) => void
}

const TIME_MARKERS = [
  { year: 1910, label: '1910' },
  { year: 1938, label: '1938' },
  { year: 1960, label: '1960s' },
  { year: 2025, label: 'Now' },
]

const HOLC_GRADE_COLORS: Record<string, string> = {
  'holc-grades': 'bg-green-500',
  'sanborn': 'bg-amber-600',
  'buildings': 'bg-sky-400',
  'ghost': 'bg-red-500',
  'income': 'bg-emerald-500',
  'health': 'bg-rose-500',
  'displacement': 'bg-orange-500',
}

export function BottomToolbar({
  year = 2025,
  onYearChange,
  viewModes = [],
  onViewModeToggle,
}: BottomToolbarProps) {
  const minYear = 1910
  const maxYear = 2025
  const progress = ((year - minYear) / (maxYear - minYear)) * 100

  return (
    <div className="h-16 shrink-0 border-t border-slate-800 bg-slate-950 flex items-center px-4 gap-6">
      {/* Time Slider */}
      <div className="flex-1 flex items-center gap-3 max-w-xl">
        <span
          className="text-xs font-semibold text-slate-400 w-10 text-right tabular-nums"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          {year}
        </span>

        <div className="flex-1 relative">
          {/* Track */}
          <div className="h-1.5 bg-slate-800 rounded-full relative">
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />

            {/* Time markers */}
            {TIME_MARKERS.map((marker) => {
              const position = ((marker.year - minYear) / (maxYear - minYear)) * 100
              return (
                <button
                  key={marker.year}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                  style={{ left: `${position}%` }}
                  onClick={() => onYearChange?.(marker.year)}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                      marker.year <= year
                        ? 'bg-red-500 border-red-400'
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  />
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 group-hover:text-slate-300 whitespace-nowrap transition-colors">
                    {marker.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Range input overlay */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={year}
            onChange={(e) => onYearChange?.(parseInt(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-800" />

      {/* View Mode Toggles */}
      <div className="flex items-center gap-1">
        {viewModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onViewModeToggle?.(mode.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
              mode.isActive
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                HOLC_GRADE_COLORS[mode.id] || 'bg-slate-500'
              }`}
            />
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  )
}
