// =============================================================================
// Data Types
// =============================================================================

export type HOLCGrade = "A" | "B" | "C" | "D";

export type BuildingEra = "pre-1938" | "1938-1970" | "post-1970";

export type LandUse =
  | "Residential"
  | "Commercial"
  | "Vacant Land"
  | "Industrial"
  | "Institutional";

export interface ParentZone {
  id: string;
  holcId: string;
  holcGrade: HOLCGrade;
  name: string;
  color: string;
}

export interface Building {
  id: string;
  zoneId: string;
  taxkey: string;
  address: string;
  yearBuilt: number;
  stories: number;
  era: BuildingEra;
  eraColor: string;
  assessedValue: number;
  landUse: LandUse;
  landUseCode: string;
  ownerOccupied: boolean;
  parcelBoundary: [number, number][];
}

export interface EraCategory {
  id: BuildingEra;
  label: string;
  description: string;
  color: string;
}

// =============================================================================
// Component Props
// =============================================================================

export interface BuildingDetailProps {
  /** The HOLC zone containing the loaded buildings */
  parentZone: ParentZone;
  /** Buildings within the active zone's bounding box */
  buildings: Building[];
  /** Construction-era legend categories */
  eraCategories: EraCategory[];
  /** Currently selected building (null if none) */
  selectedBuilding: Building | null;
  /** Called when user clicks a building to inspect it */
  onSelectBuilding?: (id: string) => void;
  /** Called when user hovers over a building */
  onHoverBuilding?: (id: string | null) => void;
  /** Called when user clicks breadcrumb to return to zone view */
  onBackToZone?: () => void;
  /** Called when user toggles the buildings layer on/off */
  onToggleLayer?: (visible: boolean) => void;
}
