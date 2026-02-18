// HOLC data model types adapted from product-plan/data-model/types.ts.
// Phase 2 fields (audioState, isAutoNarrated, narrationMuted) are omitted.

export type HOLCGrade = "A" | "B" | "C" | "D";

export type MessageRole = "user" | "assistant" | "zone-context";

export type OverlayLayerId = "income" | "health" | "environment" | "value";

export type MetricUnit = "currency" | "index" | "percentile";

export interface HOLCZone {
  id: string;
  areaId: string;
  cityId: number;
  grade: HOLCGrade | null;
  label: string;
  name: string;
  polygon: number[][][];
  labelCoords: [number, number];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  fill: string;
  residential: boolean;
  commercial: boolean;
  industrial: boolean;
}

export interface AreaDescription {
  areaId: string;
  cityId: number;
  grade: HOLCGrade | null;
  clarifyingRemarks: string;
  detrimentalInfluences: string;
  favorableInfluences: string;
  infiltrationOf: string;
  negroYesOrNo: string;
  negroPercent: string;
  estimatedAnnualFamilyIncome: string;
  occupationType: string;
  descriptionOfTerrain: string;
  trendOfDesirability: string;
}

export interface CensusDataRecord {
  areaId: string;
  geoid: string;
  pctTract: number;
  medianIncome: number | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  zoneId?: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  sessionId: string;
  messages: Message[];
}

export interface OverlayLayer {
  id: OverlayLayerId;
  label: string;
  description: string;
  unit: MetricUnit;
  source: string;
  colorScale: string[];
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface MetricValue {
  value: number;
  percentile: number;
  choroplethColor: string;
}

export interface GradeAverages {
  A: Record<OverlayLayerId, number>;
  B: Record<OverlayLayerId, number>;
  C: Record<OverlayLayerId, number>;
  D: Record<OverlayLayerId, number>;
}

// HOLC grade color mapping
export const HOLC_COLORS: Record<HOLCGrade | "ungraded", string> = {
  A: "#4CAF50",
  B: "#2196F3",
  C: "#FFEB3B",
  D: "#F44336",
  ungraded: "#9E9E9E",
};

// HOLC grade descriptors
export const HOLC_DESCRIPTORS: Record<HOLCGrade | "ungraded", string> = {
  A: "Best",
  B: "Still Desirable",
  C: "Declining",
  D: "Hazardous",
  ungraded: "Ungraded",
};

// HOLC grade extrusion heights (D = tallest)
// Kept low to create a relief-map effect rather than tall walls
export const HOLC_HEIGHTS: Record<HOLCGrade | "ungraded", number> = {
  A: 0.25,
  B: 0.5,
  C: 0.8,
  D: 1.2,
  ungraded: 0.15,
};
