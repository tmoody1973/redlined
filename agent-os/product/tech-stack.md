# Tech Stack

## Framework & Runtime

- **Application Framework:** Next.js (App Router)
- **Language/Runtime:** Node.js (ES modules, TypeScript)
- **Package Manager:** npm (or pnpm)

## Frontend

- **JavaScript Framework:** React (via Next.js)
- **CSS Framework:** Tailwind CSS v4
- **UI Components:** Custom components (bespoke design system for the project)
- **Fonts:** Space Grotesk (headings), Inter (body), IBM Plex Mono (data) via Google Fonts / next/font

## Backend & Database

- **Backend Platform:** Convex (real-time backend-as-a-service)
- **Database:** Convex document database (stores HOLC zone metadata, processed MPROP records, Census/demographic data, AI conversation history)
- **Server Functions:** Convex queries, mutations, and actions for data access and LLM/voice API proxying
- **Real-time:** Convex reactive queries for live data subscriptions (e.g., community annotations in future phases)
- **File Storage:** Convex file storage for processed GeoJSON, Sanborn tile caches, and static data assets

## 3D Rendering & Animation

- **3D Engine:** Three.js (r128+) via React Three Fiber
- **Animation:** GSAP (GreenSock) for smooth transitions between view modes, time periods, and camera movements
- **Map Tiles (optional):** Mapbox GL JS or OpenStreetMap as a base map layer beneath the 3D scene

## AI & Voice

- **LLM Backend:** Claude API (Sonnet 4) for the AI narrative guide with contextual system prompts containing HOLC zone data, called via Convex actions
- **Voice Synthesis:** ElevenLabs API for NPR-style audio narration of HOLC appraiser descriptions and contextual commentary

## Data Processing

- **Primary Processing:** Node.js scripts for GeoJSON parsing, MPROP CSV joining, coordinate transformation, and data normalization
- **GIS Processing:** Python scripts for shapefile conversion, georeferencing, and spatial joins where Node.js tooling is insufficient
- **Data Formats:** GeoJSON (zone and parcel boundaries), JSON (processed MPROP records, Census data), CSV (raw MPROP source)
- **Data Ingestion:** Processed data loaded into Convex via seed scripts or Convex actions

## Testing & Quality

- **Test Framework:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript (strict mode)

## Deployment & Infrastructure

- **Hosting:** Vercel (Next.js deployment with edge/serverless rendering)
- **Backend Hosting:** Convex Cloud (managed — handles database, server functions, and file storage)
- **API Proxying:** Convex actions proxy Claude API and ElevenLabs API calls (protecting API keys from client exposure)
- **CI/CD:** GitHub Actions for automated linting, testing, and preview deployments
- **Environment Variables:** API keys managed via Convex environment variables and Vercel environment variables; never committed to version control

## Data Sources

### Acquired

| Dataset | File / Source | Format | Status |
|---------|--------------|--------|--------|
| HOLC Zones — Milwaukee (primary) | `geojson (1).json` in project root | GeoJSON, 114 features. **Has neighborhood names** (`name`), `label_coords`, `bounds`, `city_id`. Use this for Phase 1-2. Grades: 10 A, 29 B, 49 C, 24 D | In project folder |
| HOLC Zones — All Cities (multi-city) | `mappinginequality (1).json` in project root | GeoJSON, 10,154 features across 300 cities. No neighborhood names. Use for Phase 3 multi-city expansion | In project folder |
| HOLC Zones — GeoPackage | `mappinginequality.gpkg` in project root | GeoPackage, 10,154 rows, same as all-cities JSON | In project folder |
| HOLC Area Descriptions | `holc_ad_data.json` in project root | JSON, 7,930 records (112 Milwaukee). Original appraiser text: `clarifying_remarks`, `infiltration_of`, `negro_yes_or_no/percent`, `detrimental_influences`, `estimated_annual_family_income`, `occupation_or_type`. Joins to GeoJSON on `area_id`. Source: [americanpanorama/HOLC_Area_Description_Data](https://github.com/americanpanorama/HOLC_Area_Description_Data) | In project folder |
| Original 1938 HOLC Map (Milwaukee) | Scanned map image in project | High-res scan of the original Residential Security Map for Milwaukee County showing color-coded zones. Reference for visual accuracy and potential overlay | In project folder |
| Census-HOLC Crosswalk | [americanpanorama/mapping-inequality-census-crosswalk](https://github.com/americanpanorama/mapping-inequality-census-crosswalk) | GeoJSON + GeoPackage for 2010 and 2020 tract boundaries. Fields: `area_id`, `GEOID`, `GISJOIN`, `pct_tract`, HOLC grade/category | GitHub repo (needs download) |
| Historic Redlining Scores | [openICPSR project 141121 V3](https://www.openicpsr.org/openicpsr/project/141121/version/V3/view) | Continuous redlining score per Census tract (2000, 2010, 2020 boundaries). Weights: A=1, B=2, C=3, D=4, area-weighted. 142 cities. By Meier & Mitchell | Needs download |

### Still Needed

| Dataset | Source | Format | Access | Phase |
|---------|--------|--------|--------|-------|
| Milwaukee MPROP (Master Property Record) | [data.milwaukee.gov](https://data.milwaukee.gov) | CSV, ~160K properties, 90+ fields (TAXKEY, YR_BUILT, NR_STORIES, C_A_TOTAL, LAND_USE_GP, etc.) | Free direct download, updated daily | Phase 2 |
| Historical MPROP Snapshots (2005-2022) | [data.milwaukee.gov/dataset/historical-master-property-file](https://data.milwaukee.gov/dataset/historical-master-property-file) | CSV archives by year. Compare TAXKEYs across years for demolition tracking | Free direct download | Phase 2 (ghost buildings) |
| Milwaukee Parcel Boundaries | [city.milwaukee.gov GIS](https://city.milwaukee.gov/mapmilwaukee/DownloadMapData3497) | Shapefile (State Plane South NAD27 -- requires reprojection to WGS84). Joins to MPROP on TAXKEY | Free direct download | Phase 2 |
| Sanborn Fire Insurance Maps (georeferenced) | [MCLIO / UWM ArcGIS](https://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer) | ArcGIS tile service (PNG tiles). Covers 1894, 1910, 1927 Milwaukee atlases | Free public endpoint, no signup | Phase 2 |
| Urban Renewal Project Data | [americanpanorama/Renewing_Inequality_Data](https://github.com/americanpanorama/Renewing_Inequality_Data) | GeoJSON (762 project boundaries, 5 Milwaukee) + CSV (127K rows: displacement counts by race, units razed, federal funding, acres, reuse). Milwaukee Hillside project: 317 non-white families displaced, 416 units razed. | Free, CC-BY-NC | Phase 2-3 (ghost buildings, Bronzeville narrative) |
| Census ACS 5-Year | [api.census.gov](https://api.census.gov/data.html) | JSON API. Median income, home values, race, education, health insurance by tract | Free API key required ([signup](https://api.census.gov/data/key_signup.html)) | Phase 1 |
| CDC PLACES | [cdc.gov/places](https://cdc.gov/places/) | CSV download. Tract-level health outcomes: asthma, diabetes, life expectancy, etc. | Free download | Phase 3 |
| CDC Social Vulnerability Index (SVI) | [atsdr.cdc.gov/placeandhealth/svi](https://atsdr.cdc.gov/placeandhealth/svi) | CSV/Shapefile. Composite vulnerability scores by tract | Free download | Phase 3 |
| EPA EJScreen | [ejscreen.epa.gov](https://ejscreen.epa.gov/mapper/) | API / CSV. Environmental burden scores, contaminated site proximity | Free API | Phase 3 |
| Tree Canopy Coverage (Milwaukee) | Milwaukee County LIO or USDA Urban Tree Canopy dataset | Raster or vector. Canopy percentage by area | TBD -- needs source identification | Phase 3 |
| Historical Photographs | [LOC HABS/HAER](https://loc.gov/pictures/collection/hh/), [LOC FSA/OWI](https://loc.gov/pictures/search/?co=fsa) | JSON API + IIIF Image API. Architectural drawings, 1939-1944 documentary photos | Free, no signup | Phase 3 |
| Microsoft Building Footprints (optional) | [github.com/microsoft/USBuildingFootprints](https://github.com/microsoft/USBuildingFootprints) | GeoJSON. ML-generated current building polygons for footprint comparison | Free | Optional |

## Third-Party Services & APIs

- **Claude API (Anthropic):** AI narrative guide via Convex actions. [console.anthropic.com](https://console.anthropic.com) -- $5 credit on signup
- **ElevenLabs:** Voice narration via Convex actions. [elevenlabs.io](https://elevenlabs.io) -- 10K chars/month free tier
- **Census API:** Free unlimited access with API key
- **Map Tiles (optional):** Mapbox GL JS (50K loads/month free) or OpenStreetMap (no limit)

## Design System

- **Colors:** Primary red (#F44336, HOLC D-grade), Secondary amber (callouts), Neutral slate (backgrounds)
- **HOLC Palette:** A=#4CAF50 (Green), B=#2196F3 (Blue), C=#FFEB3B (Yellow), D=#F44336 (Red)
- **Background:** Dark theme, base color 0x1A1A2E
- **Typography:** Space Grotesk (headings), Inter (body), IBM Plex Mono (data values and labels)
- **Styling:** Tailwind CSS v4 utility classes with custom theme configuration
