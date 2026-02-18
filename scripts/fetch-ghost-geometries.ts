/**
 * Fetch parcel geometries for ghost (demolished) buildings from ArcGIS.
 * The ghost-buildings.json contains TAXKEYs of demolished properties;
 * their parcel boundaries often still exist in the city's parcel dataset
 * (as vacant lots). This script queries for those geometries.
 *
 * Usage:
 *   npx tsx scripts/fetch-ghost-geometries.ts
 *
 * Prerequisites:
 *   - data/ghost-buildings.json must exist (from detect-ghost-buildings.ts)
 *
 * Outputs:
 *   data/ghost-buildings.geojson — GeoJSON of demolished building parcels
 */

import fs from "fs";
import path from "path";
import https from "https";

const PROJECT_ROOT = path.resolve(__dirname, "..");

const ARCGIS_BASE =
  "https://milwaukeemaps.milwaukee.gov/arcgis/rest/services/property/parcels_mprop/MapServer/2/query";

// Batch size for TAXKEY queries (URL length limits)
const BATCH_SIZE = 100;

interface GhostRecord {
  taxkey: string;
  lastSeenYear: number;
  firstMissingYear: number;
}

/** Fetch JSON from HTTPS URL (with redirect handling). */
function fetchJson(url: string, redirectCount = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error("Too many redirects"));
      return;
    }
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: { "User-Agent": "redlined-data-pipeline/1.0" },
    };

    https
      .get(url, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirect = res.headers.location;
          if (redirect) {
            fetchJson(redirect, redirectCount + 1).then(resolve).catch(reject);
            return;
          }
        }
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
  // Step 1: Load ghost building data
  console.log("Step 1: Loading ghost building data...");
  const ghostPath = path.join(PROJECT_ROOT, "data", "ghost-buildings.json");

  if (!fs.existsSync(ghostPath)) {
    console.error("  data/ghost-buildings.json not found. Run detect-ghost-buildings.ts first.");
    process.exit(1);
  }

  const ghosts: GhostRecord[] = JSON.parse(fs.readFileSync(ghostPath, "utf8"));
  console.log(`  Ghost buildings: ${ghosts.length}`);

  // Build lookup for ghost metadata
  const ghostMeta = new Map<string, GhostRecord>();
  for (const g of ghosts) {
    ghostMeta.set(g.taxkey, g);
  }

  // Step 2: Load HOLC zones for spatial join
  console.log("\nStep 2: Loading HOLC zone boundaries...");
  const zonesPath = path.join(PROJECT_ROOT, "data", "milwaukee-holc-zones.json");
  const holcZones = JSON.parse(fs.readFileSync(zonesPath, "utf8"));
  const zones = holcZones.features.map((f: any) => ({
    areaId: String(f.properties.area_id),
    grade: f.properties.grade,
    polygon: f.geometry.coordinates[0][0] as number[][],
  }));
  console.log(`  HOLC zones: ${zones.length}`);

  // Step 3: Fetch geometries in batches
  console.log("\nStep 3: Fetching ghost parcel geometries from ArcGIS...");
  const allFeatures: any[] = [];
  const taxkeys = ghosts.map((g) => g.taxkey);
  let fetched = 0;

  for (let i = 0; i < taxkeys.length; i += BATCH_SIZE) {
    const batch = taxkeys.slice(i, i + BATCH_SIZE);
    const whereClause = `TAXKEY IN (${batch.map((k) => `'${k}'`).join(",")})`;
    const url = `${ARCGIS_BASE}?where=${encodeURIComponent(whereClause)}&outFields=TAXKEY&returnGeometry=true&outSR=4326&f=geojson&resultRecordCount=2000`;

    try {
      const data = await fetchJson(url);
      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          const taxkey = feature.properties?.TAXKEY;
          const meta = taxkey ? ghostMeta.get(taxkey) : null;

          // Spatial join to HOLC zone
          let holcZoneId: string | null = null;
          let holcGrade: string | null = null;

          if (feature.geometry) {
            const coords = feature.geometry.coordinates;
            let ring: number[][];
            if (feature.geometry.type === "Polygon") {
              ring = coords[0];
            } else {
              ring = coords[0][0];
            }
            const centroid = polygonCentroid(ring);

            for (const zone of zones) {
              if (pointInPolygon(centroid, zone.polygon)) {
                holcZoneId = zone.areaId;
                holcGrade = zone.grade;
                break;
              }
            }
          }

          allFeatures.push({
            ...feature,
            properties: {
              TAXKEY: taxkey,
              lastSeenYear: meta?.lastSeenYear ?? 0,
              firstMissingYear: meta?.firstMissingYear ?? 0,
              holcZoneId,
              holcGrade,
            },
          });
        }
        fetched += data.features.length;
      }
    } catch (err) {
      console.error(`  Error at batch ${i}: ${err}`);
    }

    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  Fetched ${fetched} geometries (batch ${i / BATCH_SIZE + 1}/${Math.ceil(taxkeys.length / BATCH_SIZE)})...`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`  Total ghost geometries found: ${allFeatures.length} of ${ghosts.length} TAXKEYs`);

  // Only keep ghosts that are within HOLC zones
  const holcGhosts = allFeatures.filter((f) => f.properties.holcZoneId);
  console.log(`  Ghost buildings within HOLC zones: ${holcGhosts.length}`);

  // Step 4: Save GeoJSON
  console.log("\nStep 4: Saving ghost buildings GeoJSON...");
  const geojson = {
    type: "FeatureCollection",
    features: holcGhosts,
  };

  const outPath = path.join(PROJECT_ROOT, "data", "ghost-buildings.geojson");
  fs.writeFileSync(outPath, JSON.stringify(geojson));
  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  console.log(`  Saved: ${outPath} (${sizeMB} MB, ${holcGhosts.length} features)`);

  // Summary by grade
  const byGrade = new Map<string, number>();
  for (const f of holcGhosts) {
    const grade = f.properties.holcGrade || "ungraded";
    byGrade.set(grade, (byGrade.get(grade) ?? 0) + 1);
  }
  console.log("\n  Ghost buildings by HOLC grade:");
  for (const [grade, count] of [...byGrade.entries()].sort()) {
    console.log(`    Grade ${grade}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
