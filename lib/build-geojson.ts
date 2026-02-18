// Builds GeoJSON FeatureCollections from Convex zone records for Mapbox GL.

import { HOLC_COLORS, type HOLCGrade } from "@/types/holc";
import { getGradeElevation } from "./scene-helpers";
import neighborhoodMap from "@/data/zone-neighborhood-map.json";

type NeighborhoodEntry = { holc_name: string; neighborhood: string | null; label: string };
const nhoodMap = neighborhoodMap as Record<string, NeighborhoodEntry>;

export interface ConvexZoneRecord {
  _id: string;
  areaId: string;
  grade: string | null;
  label: string;
  name: string;
  polygon: number[][][];
  labelCoords: number[];
}

export interface ZoneFeatureProperties {
  areaId: string;
  grade: string | null;
  label: string;
  name: string;
  color: string;
  height: number;
}

export interface ZoneFeature {
  type: "Feature";
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
  properties: ZoneFeatureProperties;
}

export interface ZoneFeatureCollection {
  type: "FeatureCollection";
  features: ZoneFeature[];
}

/** Point FeatureCollection for zone labels. */
export interface LabelFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { label: string; name: string; areaId: string };
  }>;
}

function gradeColor(grade: string | null): string {
  if (!grade) return HOLC_COLORS.ungraded;
  return HOLC_COLORS[grade as HOLCGrade] ?? HOLC_COLORS.ungraded;
}

function formatLabel(raw: string): string {
  const match = raw.match(/^([A-D])(\d+)$/i);
  return match ? `${match[1]}-${match[2]}` : raw;
}

/** Resolve the best available name for a zone from the neighborhood map. */
function resolveZoneName(areaId: string, fallbackName: string): string {
  const entry = nhoodMap[areaId];
  if (!entry) return fallbackName || "";
  // Prefer ArcGIS neighborhood, then HOLC name, then Convex name
  if (entry.neighborhood) return entry.neighborhood;
  if (entry.holc_name) return entry.holc_name;
  return fallbackName || "";
}

/**
 * Build a GeoJSON FeatureCollection of zone polygons for Mapbox fill-extrusion.
 * Includes pre-computed `color` and `height` properties for data-driven styling.
 */
export function buildFeatureCollection(
  zones: ConvexZoneRecord[],
): ZoneFeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones.map((zone) => ({
      type: "Feature" as const,
      geometry: {
        type: "MultiPolygon" as const,
        coordinates: zone.polygon as unknown as number[][][][],
      },
      properties: {
        areaId: zone.areaId,
        grade: zone.grade,
        label: zone.label,
        name: zone.name,
        color: gradeColor(zone.grade),
        height: getGradeElevation(zone.grade as HOLCGrade | null),
      },
    })),
  };
}

/**
 * Build a GeoJSON FeatureCollection of Point features for zone labels.
 * Convex stores labelCoords as [lat, lng]; GeoJSON needs [lng, lat].
 */
export function buildLabelCollection(
  zones: ConvexZoneRecord[],
): LabelFeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones
      .filter((z) => z.label && z.labelCoords?.length === 2)
      .map((zone) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [zone.labelCoords[1], zone.labelCoords[0]] as [number, number],
        },
        properties: {
          label: formatLabel(zone.label),
          name: resolveZoneName(zone.areaId, zone.name),
          areaId: zone.areaId,
        },
      })),
  };
}
