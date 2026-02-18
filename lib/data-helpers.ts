// Utility functions for HOLC data loading, filtering, and joining.
// Used by the seed script and available for client-side data processing.

export interface GeoJSONFeatureProperties {
  area_id: number;
  city_id: number;
  grade: string | null;
  fill: string;
  label: string;
  name: string;
  bounds: number[][];
  label_coords: number[];
  residential: boolean;
  commercial: boolean;
  industrial: boolean;
}

export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][][];
  };
  properties: GeoJSONFeatureProperties;
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface AreaDescriptionRaw {
  area_id: number;
  city_id: number;
  grade: string | null;
  label?: string;
  clarifying_remarks?: string;
  detrimental_influences?: string;
  favorable_influences?: string;
  infiltration_of?: string;
  negro_yes_or_no?: string;
  negro_percent?: string;
  estimated_annual_family_income?: string;
  occupation_or_type?: string;
  description_of_terrain?: string;
  trend_of_desirability?: string;
}

/** Filter area descriptions to Milwaukee records (city_id=201). */
export function filterMilwaukeeDescriptions(
  records: AreaDescriptionRaw[],
): AreaDescriptionRaw[] {
  return records.filter((record) => record.city_id === 201);
}

/**
 * Join GeoJSON zone features with area description records on area_id.
 * Returns a map of area_id to description record, plus arrays of matched
 * and unmatched zone area_ids.
 */
export function joinZonesWithDescriptions(
  zones: GeoJSONFeature[],
  descriptions: AreaDescriptionRaw[],
): {
  descriptionsByAreaId: Map<string, AreaDescriptionRaw>;
  matchedZoneIds: string[];
  unmatchedZoneIds: string[];
} {
  const descriptionsByAreaId = new Map<string, AreaDescriptionRaw>();

  for (const desc of descriptions) {
    descriptionsByAreaId.set(String(desc.area_id), desc);
  }

  const matchedZoneIds: string[] = [];
  const unmatchedZoneIds: string[] = [];

  for (const zone of zones) {
    const areaId = String(zone.properties.area_id);
    if (descriptionsByAreaId.has(areaId)) {
      matchedZoneIds.push(areaId);
    } else {
      unmatchedZoneIds.push(areaId);
    }
  }

  return { descriptionsByAreaId, matchedZoneIds, unmatchedZoneIds };
}

/**
 * Transform a GeoJSON feature into a Convex-compatible zone record shape.
 * Validates that the data conforms to the expected schema structure.
 */
export function transformZoneForConvex(feature: GeoJSONFeature) {
  const props = feature.properties;
  const bounds = props.bounds;

  return {
    areaId: String(props.area_id),
    cityId: props.city_id,
    grade: props.grade ?? null,
    label: props.label,
    name: props.name,
    polygon: feature.geometry.coordinates,
    labelCoords: props.label_coords,
    bounds: {
      north: bounds[1][0],
      south: bounds[0][0],
      east: bounds[1][1],
      west: bounds[0][1],
    },
    fill: props.fill,
    residential: props.residential,
    commercial: props.commercial,
    industrial: props.industrial,
    createdAt: Date.now(),
  };
}

/**
 * Transform a raw area description record into a Convex-compatible shape.
 */
export function transformDescriptionForConvex(record: AreaDescriptionRaw) {
  return {
    areaId: String(record.area_id),
    cityId: record.city_id,
    grade: record.grade ?? null,
    clarifyingRemarks: record.clarifying_remarks ?? "",
    detrimentalInfluences: record.detrimental_influences ?? "",
    favorableInfluences: record.favorable_influences ?? "",
    infiltrationOf: record.infiltration_of ?? "",
    negroYesOrNo: record.negro_yes_or_no ?? "",
    negroPercent: record.negro_percent ?? "",
    estimatedAnnualFamilyIncome: record.estimated_annual_family_income ?? "",
    occupationType: record.occupation_or_type ?? "",
    descriptionOfTerrain: record.description_of_terrain ?? "",
    trendOfDesirability: record.trend_of_desirability ?? "",
    createdAt: Date.now(),
  };
}

/**
 * Validate that a transformed zone record has all required fields with
 * correct types, matching the Convex schema shape.
 */
export function validateZoneRecord(record: ReturnType<typeof transformZoneForConvex>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof record.areaId !== "string") errors.push("areaId must be string");
  if (typeof record.cityId !== "number") errors.push("cityId must be number");
  if (record.grade !== null && typeof record.grade !== "string")
    errors.push("grade must be string or null");
  if (typeof record.label !== "string") errors.push("label must be string");
  if (typeof record.name !== "string") errors.push("name must be string");
  if (!Array.isArray(record.polygon)) errors.push("polygon must be array");
  if (!Array.isArray(record.labelCoords))
    errors.push("labelCoords must be array");
  if (typeof record.bounds !== "object" || record.bounds === null)
    errors.push("bounds must be object");
  else {
    if (typeof record.bounds.north !== "number")
      errors.push("bounds.north must be number");
    if (typeof record.bounds.south !== "number")
      errors.push("bounds.south must be number");
    if (typeof record.bounds.east !== "number")
      errors.push("bounds.east must be number");
    if (typeof record.bounds.west !== "number")
      errors.push("bounds.west must be number");
  }
  if (typeof record.fill !== "string") errors.push("fill must be string");
  if (typeof record.residential !== "boolean")
    errors.push("residential must be boolean");
  if (typeof record.commercial !== "boolean")
    errors.push("commercial must be boolean");
  if (typeof record.industrial !== "boolean")
    errors.push("industrial must be boolean");
  if (typeof record.createdAt !== "number")
    errors.push("createdAt must be number");

  return { valid: errors.length === 0, errors };
}

/**
 * Validate that a transformed description record has all required fields
 * with correct types.
 */
export function validateDescriptionRecord(
  record: ReturnType<typeof transformDescriptionForConvex>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof record.areaId !== "string") errors.push("areaId must be string");
  if (typeof record.cityId !== "number") errors.push("cityId must be number");
  if (record.grade !== null && typeof record.grade !== "string")
    errors.push("grade must be string or null");
  if (typeof record.clarifyingRemarks !== "string")
    errors.push("clarifyingRemarks must be string");
  if (typeof record.detrimentalInfluences !== "string")
    errors.push("detrimentalInfluences must be string");
  if (typeof record.favorableInfluences !== "string")
    errors.push("favorableInfluences must be string");
  if (typeof record.infiltrationOf !== "string")
    errors.push("infiltrationOf must be string");
  if (typeof record.negroYesOrNo !== "string")
    errors.push("negroYesOrNo must be string");
  if (typeof record.negroPercent !== "string")
    errors.push("negroPercent must be string");
  if (typeof record.estimatedAnnualFamilyIncome !== "string")
    errors.push("estimatedAnnualFamilyIncome must be string");
  if (typeof record.occupationType !== "string")
    errors.push("occupationType must be string");
  if (typeof record.descriptionOfTerrain !== "string")
    errors.push("descriptionOfTerrain must be string");
  if (typeof record.trendOfDesirability !== "string")
    errors.push("trendOfDesirability must be string");
  if (typeof record.createdAt !== "number")
    errors.push("createdAt must be number");

  return { valid: errors.length === 0, errors };
}
