interface MainNavProps {
  cityName?: string
  cities?: string[]
  onCityChange?: (city: string) => void
  showContentWarning?: boolean
  onContentWarningToggle?: () => void
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function MainNav({
  cityName = 'Milwaukee',
  cities = ['Milwaukee'],
  onCityChange,
  showContentWarning,
  onContentWarningToggle,
}: MainNavProps) {
  return (
    <header className="h-12 shrink-0 border-b border-slate-800 bg-slate-950 flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1
          className="text-base font-bold tracking-widest text-red-500 uppercase"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          REDLINED
        </h1>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:inline">
          The Shape of Inequality
        </span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-700" />

      {/* City Selector */}
      <button
        className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-100 transition-colors"
        onClick={() => {
          if (cities.length > 1 && onCityChange) {
            const currentIndex = cities.indexOf(cityName)
            const nextCity = cities[(currentIndex + 1) % cities.length]
            onCityChange(nextCity)
          }
        }}
      >
        <span className="font-medium">{cityName}</span>
        {cities.length > 1 && (
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className="text-slate-600 text-xs">1938</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Content Warning Toggle */}
      {onContentWarningToggle && (
        <button
          onClick={onContentWarningToggle}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${
            showContentWarning
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <AlertTriangleIcon className="w-3 h-3" />
          <span className="hidden sm:inline">Content Warning</span>
        </button>
      )}
    </header>
  )
}
