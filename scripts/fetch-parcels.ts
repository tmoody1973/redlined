/**
 * Fetch Milwaukee parcel boundaries + MPROP data from the city ArcGIS
 * service, join to HOLC zones, and output GeoJSON files for Mapbox rendering.
 *
 * Usage:
 *   npx tsx scripts/fetch-parcels.ts
 *
 * Outputs:
 *   data/milwaukee-parcels.geojson — All parcels with MPROP fields
 *   data/milwaukee-parcels-by-zone.json — Parcel stats grouped by HOLC zone
 */

import fs from "fs";
import path from "path";
import https from "https";

const PROJECT_ROOT = path.resolve(__dirname, "..");

// ArcGIS service for parcels with full MPROP data
const ARCGIS_BASE =
  "https://milwaukeemaps.milwaukee.gov/arcgis/rest/services/property/parcels_mprop/MapServer/2/query";

const OUT_FIELDS = [
  "TAXKEY",
  "YR_BUILT",
  "NR_STORIES",
  "C_A_TOTAL",
  "LAND_USE_GP",
  "BLDG_TYPE",
  "NR_UNITS",
].join(",");

const BATCH_SIZE = 2000; // ArcGIS max return per request

interface ArcGISFeature {
  type: "Feature";
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
  properties: {
    TAXKEY: string;
    YR_BUILT: number;
    NR_STORIES: number;
    C_A_TOTAL: number;
    LAND_USE_GP: number;
    BLDG_TYPE: string;
    NR_UNITS: number;
  };
}

/** Fetch JSON from HTTPS URL. */
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

/** Point-in-polygon test using ray casting algorithm. */
function pointInPolygon(
  point: [number, number],
  polygon: number[][],
): boolean {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Compute centroid of a polygon ring. */
function polygonCentroid(ring: number[][]): [number, number] {
  let cx = 0,
    cy = 0;
  for (const [x, y] of ring) {
    cx += x;
    cy += y;
  }
  return [cx / ring.length, cy / ring.length];
}

async function main() {
  // Step 1: Load HOLC zones for spatial join
  console.log("Step 1: Loading HOLC zone boundaries...");
  const zonesPath = path.join(PROJECT_ROOT, "data", "milwaukee-holc-zones.json");
  const holcZones = JSON.parse(fs.readFileSync(zonesPath, "utf8"));

  // Build zone lookup: array of { areaId, grade, polygon }
  const zones = holcZones.features.map((f: any) => ({
    areaId: String(f.properties.area_id),
    grade: f.properties.grade,
    label: f.properties.label,
    // Use first ring of first polygon for point-in-polygon test
    polygon: f.geometry.coordinates[0][0] as number[][],
  }));
  console.log(`  HOLC zones: ${zones.length}`);

  // Step 2: Fetch all parcels from ArcGIS (paginated)
  console.log("\nStep 2: Fetching parcels from ArcGIS...");
  const allFeatures: ArcGISFeature[] = [];
  let offset = 0;
  let exceededTransferLimit = true;

  while (exceededTransferLimit) {
    const url = `${ARCGIS_BASE}?where=YR_BUILT>0&outFields=${OUT_FIELDS}&returnGeometry=true&outSR=4326&f=geojson&resultRecordCount=${BATCH_SIZE}&resultOffset=${offset}`;

    try {
      const data = await fetchJson(url);

      if (data.features && data.features.length > 0) {
        allFeatures.push(...data.features);
        console.log(`  Fetched ${allFeatures.length} parcels (offset ${offset})...`);
        offset += data.features.length;
        exceededTransferLimit = data.features.length === BATCH_SIZE;
      } else {
        exceededTransferLimit = false;
      }
    } catch (err) {
      console.error(`  Error at offset ${offset}: ${err}`);
      exceededTransferLimit = false;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`  Total parcels fetched: ${allFeatures.length}`);

  // Step 3: Spatial join — assign each parcel to a HOLC zone
  console.log("\nStep 3: Joining parcels to HOLC zones...");
  let matched = 0;
  let unmatched = 0;

  const enrichedFeatures = allFeatures.map((feature) => {
    // Get centroid of parcel
    const coords = feature.geometry.coordinates;
    let ring: number[][];
    if (feature.geometry.type === "Polygon") {
      ring = coords[0] as number[][];
    } else {
      // MultiPolygon — use first polygon's outer ring
      ring = (coords as number[][][][])[0][0];
    }
    const centroid = polygonCentroid(ring);

    // Find which HOLC zone contains this centroid
    let holcZoneId: string | null = null;
    let holcGrade: string | null = null;

    for (const zone of zones) {
      if (pointInPolygon(centroid, zone.polygon)) {
        holcZoneId = zone.areaId;
        holcGrade = zone.grade;
        break;
      }
    }

    if (holcZoneId) {
      matched++;
    } else {
      unmatched++;
    }

    return {
      ...feature,
      properties: {
        ...feature.properties,
        holcZoneId,
        holcGrade,
        // Pre-compute rendering properties
        height: Math.max(3, (feature.properties.NR_STORIES || 1) * 3),
        era:
          feature.properties.YR_BUILT <= 1938
            ? "pre-holc"
            : feature.properties.YR_BUILT <= 1970
              ? "post-war"
              : feature.properties.YR_BUILT <= 2000
                ? "modern"
                : "recent",
      },
    };
  });

  console.log(`  Matched to HOLC zones: ${matched}`);
  console.log(`  Outside HOLC zones: ${unmatched}`);

  // Step 4: Save GeoJSON
  console.log("\nStep 4: Saving GeoJSON...");
  const geojson = {
    type: "FeatureCollection",
    features: enrichedFeatures,
  };

  const outPath = path.join(PROJECT_ROOT, "data", "milwaukee-parcels.geojson");
  fs.writeFileSync(outPath, JSON.stringify(geojson));
  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  console.log(`  Saved: ${outPath} (${sizeMB} MB)`);

  // Step 5: Compute zone-level stats
  console.log("\nStep 5: Computing zone-level parcel statistics...");
  const zoneStats = new Map<
    string,
    {
      count: number;
      totalValue: number;
      avgYrBuilt: number;
      yrBuiltSum: number;
    }
  >();

  for (const f of enrichedFeatures) {
    const zoneId = f.properties.holcZoneId;
    if (!zoneId) continue;

    const existing = zoneStats.get(zoneId) ?? {
      count: 0,
      totalValue: 0,
      avgYrBuilt: 0,
      yrBuiltSum: 0,
    };

    existing.count++;
    existing.totalValue += f.properties.C_A_TOTAL || 0;
    existing.yrBuiltSum += f.properties.YR_BUILT || 0;
    zoneStats.set(zoneId, existing);
  }

  // Compute averages
  const statsObj: Record<string, any> = {};
  for (const [zoneId, stats] of zoneStats) {
    statsObj[zoneId] = {
      parcelCount: stats.count,
      totalAssessedValue: stats.totalValue,
      avgAssessedValue: Math.round(stats.totalValue / stats.count),
      avgYrBuilt: Math.round(stats.yrBuiltSum / stats.count),
    };
  }

  const statsPath = path.join(
    PROJECT_ROOT,
    "data",
    "milwaukee-parcels-by-zone.json",
  );
  fs.writeFileSync(statsPath, JSON.stringify(statsObj, null, 2));
  console.log(`  Saved: ${statsPath}`);

  // Summary
  console.log("\nPipeline complete:");
  console.log(`  Total parcels: ${allFeatures.length}`);
  console.log(`  In HOLC zones: ${matched}`);
  console.log(`  GeoJSON: ${outPath} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
