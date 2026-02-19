/** A curated FSA photograph from the Library of Congress */
export interface ArchivePhoto {
  /** LOC call number, used as unique ID */
  id: string;
  /** Descriptive title from LOC catalog */
  title: string;
  /** Photographer name */
  photographer: string;
  /** Date string (e.g., "April 1936") */
  date: string;
  /** Path to 800px thumbnail in /public/archive/photos/ */
  thumbnailSrc: string;
  /** Path to 2048px full image in /public/archive/photos/ */
  fullSrc: string;
  /** Original LOC URL for attribution */
  locUrl: string;
  /** Category for filtering */
  category: "housing" | "industry" | "neighborhoods" | "people" | "streets";
  /** Short descriptive caption for display */
  caption: string;
  /** Slight random rotation for "scattered prints" effect (-3 to 3 degrees) */
  rotation: number;
}

/** A single event on the timeline */
export interface TimelineEvent {
  id: string;
  /** Year of the event */
  year: number;
  /** Which era this belongs to */
  era: TimelineEra;
  /** Event title */
  title: string;
  /** 2-3 sentence description */
  description: string;
  /** Optional photo path */
  imageSrc?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Color treatment: sepia for early, muted for transitional, full for modern */
  colorTreatment: "sepia" | "muted" | "full";
}

export type TimelineEra =
  | "survey"
  | "redlining"
  | "fair-housing"
  | "decline"
  | "today";

/** Era metadata for the timeline progress bar */
export interface EraMetadata {
  id: TimelineEra;
  label: string;
  yearRange: string;
  color: string;
  description: string;
}
