// =============================================================================
// Data Types
// =============================================================================

export type HOLCGrade = 'A' | 'B' | 'C' | 'D'

export interface City {
  id: string
  name: string
  state: string
  year: number
  centerLat: number
  centerLng: number
  zoomLevel: number
}

export interface HOLCZone {
  id: string
  holcGrade: HOLCGrade
  holcId: string
  name: string
  description: string
  polygon: [number, number][]
  extrusionHeight: number
  color: string
  medianIncome: number
  medianHomeValue: number
  populationDensity: number
  percentOwnerOccupied: number
}

export interface ViewMode {
  id: string
  label: string
  isActive: boolean
}

export interface TimeMarker {
  year: number
  label: string
  description: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface MapExplorerProps {
  /** The city whose HOLC zones are being rendered */
  city: City
  /** HOLC zones to render as extruded 3D polygons */
  holcZones: HOLCZone[]
  /** Available view mode toggles */
  viewModes: ViewMode[]
  /** Time markers for the time slider */
  timeMarkers: TimeMarker[]
  /** The currently selected year on the time slider */
  year: number
  /** Called when the user hovers over a zone */
  onZoneHover?: (zoneId: string | null) => void
  /** Called when the user clicks a zone to select it */
  onZoneSelect?: (zoneId: string) => void
  /** Called when the user toggles a view mode on or off */
  onViewModeToggle?: (modeId: string) => void
  /** Called when the user changes the time slider year */
  onYearChange?: (year: number) => void
}
