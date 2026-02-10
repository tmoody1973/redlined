// =============================================================================
// Data Types
// =============================================================================

export type HOLCGrade = 'A' | 'B' | 'C' | 'D'

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

export interface ZoneOverlayData {
  zoneId: string
  holcId: string
  holcGrade: HOLCGrade
  name: string
  metrics: Record<OverlayLayerId, MetricValue>
}

export interface GradeAverages {
  A: Record<OverlayLayerId, number>
  B: Record<OverlayLayerId, number>
  C: Record<OverlayLayerId, number>
  D: Record<OverlayLayerId, number>
}

// =============================================================================
// Component Props
// =============================================================================

export interface DataOverlaysProps {
  /** Available overlay layers with color scales and ranges */
  overlayLayers: OverlayLayer[]
  /** Per-zone metric values for all overlay layers */
  zoneOverlayData: ZoneOverlayData[]
  /** Citywide averages grouped by HOLC grade for comparison */
  gradeAverages: GradeAverages
  /** Currently active overlay layer */
  activeLayer: OverlayLayerId | null
  /** Opacity of the choropleth overlay (0–1) */
  overlayOpacity: number
  /** Currently selected zone for stats panel (null if none) */
  selectedZoneId: string | null
  /** Called when user selects a different overlay layer */
  onLayerChange?: (layerId: OverlayLayerId | null) => void
  /** Called when user adjusts overlay opacity */
  onOpacityChange?: (opacity: number) => void
  /** Called when user clicks a zone to see stats */
  onZoneSelect?: (zoneId: string) => void
  /** Called when user hovers a zone */
  onZoneHover?: (zoneId: string | null) => void
}
