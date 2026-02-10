import { MainNav } from './MainNav'
import { BottomToolbar } from './BottomToolbar'
import { InfoPanel } from './InfoPanel'

export interface ViewMode {
  id: string
  label: string
  isActive: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  cityName?: string
  cities?: string[]
  onCityChange?: (city: string) => void
  year?: number
  onYearChange?: (year: number) => void
  viewModes?: ViewMode[]
  onViewModeToggle?: (id: string) => void
  selectedZone?: {
    holcGrade: string
    holcId: string
    name: string
    description: string
  } | null
  infoPanelContent?: React.ReactNode
  chatPanelContent?: React.ReactNode
  showContentWarning?: boolean
  onContentWarningToggle?: () => void
}

export default function AppShell({
  children,
  cityName = 'Milwaukee',
  cities = ['Milwaukee'],
  onCityChange,
  year = 2025,
  onYearChange,
  viewModes = [],
  onViewModeToggle,
  selectedZone = null,
  infoPanelContent,
  chatPanelContent,
  showContentWarning,
  onContentWarningToggle,
}: AppShellProps) {
  return (
    <div
      className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden"
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Top Navigation Bar */}
      <MainNav
        cityName={cityName}
        cities={cities}
        onCityChange={onCityChange}
        showContentWarning={showContentWarning}
        onContentWarningToggle={onContentWarningToggle}
      />

      {/* Main Content Area: Viewport + Right Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport (left ~70%) */}
        <div className="flex-1 relative min-w-0">
          {children}
        </div>

        {/* Right Panel (info + chat, ~30%) */}
        <div className="w-[380px] shrink-0 border-l border-slate-800 flex flex-col bg-slate-900/80 backdrop-blur-sm">
          {/* Neighborhood Info - top section */}
          <div className="flex-1 overflow-y-auto border-b border-slate-800">
            <InfoPanel selectedZone={selectedZone}>
              {infoPanelContent}
            </InfoPanel>
          </div>

          {/* AI Chat - bottom section */}
          <div className="h-[45%] shrink-0 flex flex-col overflow-hidden">
            {chatPanelContent || (
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span
                      className="text-sm font-semibold text-slate-200 tracking-tight"
                      style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
                    >
                      AI Narrative Guide
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ask about any neighborhood, building, or zone
                  </p>
                </div>

                {/* Suggested prompts */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-2">
                    {[
                      'What happened to Bronzeville?',
                      'Why was this area graded D?',
                      'What\u2019s the income gap between A and D zones?',
                      'What was here before the highway?',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-sm text-slate-300 hover:text-slate-100 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat input */}
                <div className="px-4 py-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about this neighborhood..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                    <button className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar
        year={year}
        onYearChange={onYearChange}
        viewModes={viewModes}
        onViewModeToggle={onViewModeToggle}
      />
    </div>
  )
}
