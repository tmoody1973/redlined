interface SelectedZone {
  holcGrade: string
  holcId: string
  name: string
  description: string
}

interface InfoPanelProps {
  selectedZone?: SelectedZone | null
  children?: React.ReactNode
}

const GRADE_STYLES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  A: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Best', border: 'border-green-500/30' },
  B: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Still Desirable', border: 'border-blue-500/30' },
  C: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Declining', border: 'border-yellow-500/30' },
  D: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Hazardous', border: 'border-red-500/30' },
}

export function InfoPanel({ selectedZone, children }: InfoPanelProps) {
  if (children) {
    return <div className="p-4">{children}</div>
  }

  if (!selectedZone) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
        </div>
        <p
          className="text-sm font-medium text-slate-300"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          Select a neighborhood
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Click any zone or building on the map to see its details
        </p>
      </div>
    )
  }

  const grade = GRADE_STYLES[selectedZone.holcGrade] || GRADE_STYLES['D']

  return (
    <div className="p-4 space-y-4">
      {/* Grade Badge */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-lg font-bold text-slate-100 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
          >
            {selectedZone.name}
          </h2>
          <span
            className="text-xs text-slate-500 font-mono"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {selectedZone.holcId}
          </span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${grade.bg} border ${grade.border}`}>
          <div className={`text-lg font-bold ${grade.text} leading-none`}>
            {selectedZone.holcGrade}
          </div>
          <div className={`text-[10px] ${grade.text} opacity-70 mt-0.5`}>
            {grade.label}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800" />

      {/* Original Appraiser Description */}
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
          1938 HOLC Assessment
        </h3>
        <blockquote className="text-sm text-slate-300 leading-relaxed border-l-2 border-red-500/30 pl-3 italic">
          {selectedZone.description}
        </blockquote>
      </div>
    </div>
  )
}
