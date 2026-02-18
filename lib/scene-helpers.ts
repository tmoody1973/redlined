// Pure utility functions for 3D scene rendering: color mapping, height
// mapping, and geometry validation for HOLC zone extrusions.

import { HOLC_COLORS, HOLC_HEIGHTS, type HOLCGrade } from "@/types/holc";

/**
 * Return the hex color for a given HOLC grade. Null/undefined grades
 * map to the neutral gray used for ungraded zones.
 */
export function getGradeColor(grade: HOLCGrade | null | undefined): string {
  if (!grade) return HOLC_COLORS.ungraded;
  return HOLC_COLORS[grade] ?? HOLC_COLORS.ungraded;
}

/**
 * Return the extrusion height for a given HOLC grade.
 * D = tallest (4.0), C = 3.0, B = 2.0, A = 1.0, ungraded = 0.5.
 */
export function getGradeHeight(grade: HOLCGrade | null | undefined): number {
  if (!grade) return HOLC_HEIGHTS.ungraded;
  return HOLC_HEIGHTS[grade] ?? HOLC_HEIGHTS.ungraded;
}

/**
 * Compute a brighter emissive color for hover feedback. Takes a hex color
 * and returns a hex string with increased brightness.
 */
export function getEmissiveColor(baseHex: string): string {
  const r = parseInt(baseHex.slice(1, 3), 16);
  const g = parseInt(baseHex.slice(3, 5), 16);
  const b = parseInt(baseHex.slice(5, 7), 16);

  // Brighten each channel by ~40%, clamped to 255
  const brighten = (c: number) => Math.min(255, Math.round(c * 1.4));

  const rr = brighten(r).toString(16).padStart(2, "0");
  const gg = brighten(g).toString(16).padStart(2, "0");
  const bb = brighten(b).toString(16).padStart(2, "0");

  return `#${rr}${gg}${bb}`;
}

/**
 * Format a zone label for display. The data uses compact labels like "A1"
 * but the mockups show "A-1" style. This normalizes to the display format.
 */
export function formatZoneLabel(label: string): string {
  if (!label) return "";
  // If label already contains a dash or is a word like "Commercial", return as-is
  if (label.includes("-") || !/^[A-D]\d+$/i.test(label)) return label;
  // Insert dash between letter and number: "A1" -> "A-1", "D12" -> "D-12"
  return label.replace(/^([A-D])(\d+)$/i, "$1-$2");
}

/**
 * Check whether a projected polygon ring is non-degenerate: has at least
 * 3 unique points and a non-zero area.
 */
// ── deck.gl helpers ──────────────────────────────────────────────────

/** Convert a hex color string (#RRGGBB) to a deck.gl RGBA array (0-255). */
export function hexToRgba(
  hex: string,
  alpha = 220,
): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, alpha];
}

/** Return the deck.gl RGBA fill color for a given HOLC grade. */
export function getGradeColorRgba(
  grade: HOLCGrade | null | undefined,
  alpha = 220,
): [number, number, number, number] {
  return hexToRgba(getGradeColor(grade), alpha);
}

/** deck.gl elevation in meters for each HOLC grade. D = tallest. */
const DECK_ELEVATIONS: Record<HOLCGrade | "ungraded", number> = {
  A: 30,
  B: 60,
  C: 100,
  D: 150,
  ungraded: 15,
};

/** Return deck.gl elevation (meters) for a given HOLC grade. */
export function getGradeElevation(
  grade: HOLCGrade | null | undefined,
): number {
  if (!grade) return DECK_ELEVATIONS.ungraded;
  return DECK_ELEVATIONS[grade] ?? DECK_ELEVATIONS.ungraded;
}

// ── geometry validation ──────────────────────────────────────────────

export function isValidPolygonRing(
  points: [number, number][],
): boolean {
  if (points.length < 3) return false;

  // Check for non-zero signed area using the shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }

  return Math.abs(area) > 1e-10;
}
