// =============================================================================
// Data Types
// =============================================================================

export type HOLCGrade = 'A' | 'B' | 'C' | 'D'

export type DemolitionCause = 'highway' | 'urban-renewal' | 'disinvestment'

export interface ParentZone {
  id: string
  holcId: string
  holcGrade: HOLCGrade
  name: string
  color: string
  ghostCount: number
}

export interface GhostBuilding {
  id: string
  zoneId: string
  address: string
  originalYearBuilt: number
  yearDemolished: number
  stories: number
  demolitionCause: DemolitionCause
  demolitionDetail: string
  currentSite: string
  originalUse: string
  parcelBoundary: [number, number][]
}

export interface EraMarker {
  year: number
  label: string
  description: string
  ghostsVisible: boolean
  buildingsVisible: boolean
}

// =============================================================================
// Component Props
// =============================================================================

export interface GhostBuildingsTimeSliderProps {
  /** The HOLC zone containing the ghost buildings */
  parentZone: ParentZone
  /** Demolished structures within the active zone */
  ghostBuildings: GhostBuilding[]
  /** Time slider era markers with visibility rules */
  eraMarkers: EraMarker[]
  /** Current year displayed by the time slider */
  currentYear: number
  /** Whether the time slider is auto-animating through eras */
  isAutoPlaying: boolean
  /** Currently selected ghost building (null if none) */
  selectedGhostBuilding: GhostBuilding | null
  /** Called when user clicks a ghost building to inspect it */
  onSelectGhost?: (id: string) => void
  /** Called when user hovers over a ghost building */
  onHoverGhost?: (id: string | null) => void
  /** Called when user drags the time slider to a new year */
  onYearChange?: (year: number) => void
  /** Called when user clicks breadcrumb to return to zone view */
  onBackToZone?: () => void
  /** Called when user toggles the ghost layer on/off */
  onToggleGhostLayer?: (visible: boolean) => void
  /** Called when user clicks the auto-play button */
  onToggleAutoPlay?: () => void
}
