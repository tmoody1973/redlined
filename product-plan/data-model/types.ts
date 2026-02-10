// =============================================================================
// Global Data Model Types for Redlined
// =============================================================================

// --- Shared Enums ---

export type HOLCGrade = 'A' | 'B' | 'C' | 'D'

// --- City ---

export interface City {
  id: string
  name: string
  state: string
  year: number
  centerLat: number
  centerLng: number
  zoomLevel: number
}

// --- HOLC Zone ---

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

// --- Building (MPROP) ---

export type BuildingEra = 'pre-1938' | '1938-1970' | 'post-1970'
export type LandUse = 'Residential' | 'Commercial' | 'Vacant Land' | 'Industrial' | 'Institutional'

export interface Building {
  id: string
  zoneId: string
  taxkey: string
  address: string
  yearBuilt: number
  stories: number
  era: BuildingEra
  eraColor: string
  assessedValue: number
  landUse: LandUse
  landUseCode: string
  ownerOccupied: boolean
  parcelBoundary: [number, number][]
}

// --- Ghost Building ---

export type DemolitionCause = 'highway' | 'urban-renewal' | 'disinvestment'

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

// --- Census Tract ---

export interface CensusTract {
  id: string
  tractId: string
  holcZoneIds: string[]
  medianIncome: number
  healthBurdenIndex: number
  environmentalBurden: number
  assessedValueMedian: number
}

// --- Sanborn Map ---

export interface SanbornMap {
  id: string
  year: number
  tileUrl: string
  bounds: { north: number; south: number; east: number; west: number }
  holcZoneIds: string[]
}

// --- Conversation (AI Guide) ---

export type MessageRole = 'user' | 'assistant' | 'system-narration'
export type AudioState = 'idle' | 'playing' | 'paused' | 'finished' | null

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  audioState: AudioState
  isAutoNarrated: boolean
}

export interface Conversation {
  id: string
  zoneId: string
  narrationMuted: boolean
  messages: Message[]
}

// --- Data Overlays ---

export type OverlayLayerId = 'income' | 'health' | 'environment' | 'value'
export type MetricUnit = 'currency' | 'index' | 'percentile'

export interface OverlayLayer {
  id: OverlayLayerId
  label: string
  description: string
  unit: MetricUnit
  source: string
  colorScale: string[]
  min: number
  max: number
  minLabel: string
  maxLabel: string
}

export interface MetricValue {
  value: number
  percentile: number
  choroplethColor: string
}

export interface GradeAverages {
  A: Record<OverlayLayerId, number>
  B: Record<OverlayLayerId, number>
  C: Record<OverlayLayerId, number>
  D: Record<OverlayLayerId, number>
}
