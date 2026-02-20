# Redlined: The Shape of Inequality

> An interactive 3D visualization of HOLC redlining maps revealing how 1930s policy decisions shaped American cities, building by building.

## Overview

Redlined transforms the Home Owners' Loan Corporation's 1938 neighborhood grading data into an immersive 3D experience. Users can explore Milwaukee's 114 HOLC zones as extruded geometry on a Mapbox GL map, read the original racist appraiser descriptions, ask an AI guide questions about what they're seeing, and toggle data overlays to see how 1930s policy maps onto present-day inequality.

The project starts with Milwaukee, Wisconsin — one of the most segregated cities in America — where the connection between 1938 HOLC grades and today's outcomes is stark and well-documented.

**Created by [Tarik Moody](https://github.com/tmoody1973)** | Radio Milwaukee / The Intersection | Black History Month 2026

## Features

- **The Archive** — Museum-quality interactive gallery (Motion.dev spring animations) with three sections:
  - **The Original Map** — Pinch/zoom/drag viewer for the 1938 HOLC security map scan (43MB → optimized 2K/4K progressive JPEGs)
  - **Through the Lens** — 20 curated 1936 Library of Congress FSA photographs by Carl Mydans, with category filters, staggered spring entrance, lightbox with keyboard navigation
  - **The Timeline** — 12 events across 5 eras (1933–2020) tracing the arc from HOLC's creation to Milwaukee's present-day segregation
- **3D HOLC Zone Explorer** — 114 Milwaukee zones as Mapbox GL fill layers with 45-degree pitch, color-coded with the original HOLC palette (A=green, B=blue, C=yellow, D=red)
- **148K Building Extrusions** — Individual buildings rendered from PMTiles vector tiles at zoom 11+, with click-to-inspect showing street address, TAXKEY, year built, assessed value, stories, and HOLC zone context
- **Click-to-Inspect** — Select any zone to read the original 1938 appraiser language, including explicitly racist descriptions, with content warnings
- **AI Narrative Guide ("Ask the Guide")** — Ask Claude questions grounded in actual HOLC data and appraiser text, with zone-aware suggested questions, contextual placeholder text, rate limiting (5/min, 30/hour, 100/day per session), topic guardrails, and bot protection
- **Narrative Zone Detail Panel** — Three-act story structure connecting 1938 decisions to present-day outcomes:
  - **Act 1 — "The 1938 Decision"**: Dynamic sentence citing the appraiser's specific reasoning (racial composition, "infiltration," detrimental influences), inline Historic Redlining Score badge, and the original appraisal behind a contextual content warning
  - **Act 2 — "What Happened Next"**: Collapsible decades-of-change section written for museum visitors — plain-English narratives ("Who Owned Their Home?", "How Much Did Families Earn?"), amber insight callouts, progressive-disclosure income table, full year labels, and zone-specific neighborhood narrative
  - **Act 3 — "What It Means Today"**: Plain-language headline above the active data overlay (e.g., "Families here earn 2.7x less than in best-rated neighborhoods") with a prompt to toggle overlays when none is active
- **Historic Redlining Scores (HRS)** — Continuous 1.0–4.0 severity score per zone from Lynch et al.'s openICPSR dataset, showing how redlining intensity correlates with present-day outcomes (D-zone avg: 3.70, A-zone avg: 1.74)
- **Data Overlays** — Five toggleable overlays reveal 87 years of consequences:
  - **Median Income** — Census ACS household income by HOLC zone
  - **Health Outcomes** — CDC PLACES health risk index
  - **Environmental Burden** — EPA EJScreen environmental justice data
  - **Assessed Value** — Milwaukee MPROP property assessments with 1938-vs-today comparison
  - **Race & Demographics** — Census race data alongside 1938 HOLC racial assessments, revealing persistent segregation
- **Racial Covenants Layer** — 32,219 geocoded racial covenants from Milwaukee County property deeds (1910-1959), sourced from UWM's Mapping Racism & Resistance project. Heatmap at low zoom, individual amber dots at high zoom. Timeline-linked: scrub the time slider to watch covenants accumulate year by year (71% filed in the 1920s alone). Click any dot to read the original deed language with content warning.
- **Ghost Buildings** — 15,738 demolished structures (2005-2020) visualized as grade-colored circles, sized by demolition count per zone, with close button on the floating legend
- **Sanborn Map Context** — Fire insurance atlas overlay connecting 1938 building conditions to modern-day demolition patterns
- **Decades of Change** — Grade-level income and home ownership trends across 5 decades (1950-2020), combining published research statistics with Census API data, presented as plain-English narratives for general audiences
- **Research-Sourced Citations** — Every data panel cites peer-reviewed Milwaukee research with in-app PDF viewer modal
- **Time Slider** — GSAP-animated timeline (1870-2025) with zone opacity pulsing by development era, covenant accumulation count, and era annotations
- **Layer Controls** — Toggle zones, labels, neighborhoods, buildings, covenants, base map, and all overlays independently
- **Responsive Design** — Desktop split-panel layout, tablet adaptation, mobile bottom-sheet pattern

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack) + TypeScript   |
| Backend      | Convex (database, server functions, file storage)  |
| Map          | Mapbox GL v3 via react-map-gl                      |
| Buildings    | PMTiles vector tiles (148K parcels)                |
| Animation    | GSAP (GreenSock) + Motion.dev (spring physics, gestures) |
| AI           | Claude API (Sonnet 4) via Convex actions           |
| Styling      | Tailwind CSS v4                                    |
| Testing      | Vitest + Testing Library                           |
| Deployment   | Vercel + Convex Cloud                              |

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- [Convex account](https://convex.dev) (free tier)
- [Mapbox access token](https://account.mapbox.com/access-tokens/) (for map rendering)
- [Anthropic API key](https://console.anthropic.com) (for AI guide)
- [Census API key](https://api.census.gov/data/key_signup.html) (free, optional for data pipelines)

### Installation

```bash
git clone https://github.com/tmoody1973/redlined.git
cd redlined
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
CONVEX_DEPLOYMENT=           # From `npx convex dev`
NEXT_PUBLIC_CONVEX_URL=      # From `npx convex dev`
NEXT_PUBLIC_MAPBOX_TOKEN=    # Mapbox GL access token
```

Set API keys in your Convex dashboard (Settings > Environment Variables):

| Variable              | Description                           | Required |
| --------------------- | ------------------------------------- | -------- |
| `ANTHROPIC_API_KEY`   | Claude API key for AI narrative guide | Yes      |
| `CENSUS_API_KEY`      | US Census API key for data pipelines  | Optional |

### Development

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev
```

### Seed Data

```bash
# Load HOLC zones and area descriptions into Convex
npm run seed

# Load Census income data
npm run seed:census

# Seed health and environment data
npx tsx scripts/seed-health.ts
npx tsx scripts/seed-environment.ts
```

### Data Pipelines

Pre-computed data files in `public/data/` are generated by scripts:

```bash
npx tsx scripts/build-zone-timeline.ts      # Zone development timeline
npx tsx scripts/build-ghost-zone-stats.ts   # Ghost building statistics
npx tsx scripts/build-value-history.ts      # 1938 vs today property values
npx tsx scripts/build-race-data.ts          # Racial demographics by zone
npx tsx scripts/build-sanborn-context.ts    # Sanborn map context by zone
npx tsx scripts/build-decades-census.ts     # Decade-by-decade income/ownership (Census API)
npx tsx scripts/build-hrs-overlay.ts        # Historic Redlining Scores (openICPSR)
npx tsx scripts/download-2020-crosswalk.ts  # Download 2020 Census tract crosswalk
npx tsx scripts/process-covenants.ts       # Geocode racial covenants → GeoJSON (Census Bureau API)
```

### Building Parcels

The 148K building extrusions use a PMTiles vector tileset (`public/data/milwaukee-parcels.pmtiles`, 23 MB, included in the repo). Each parcel includes street address (HOUSE_NR_LO, SDIR, STREET, STTYPE), TAXKEY, year built, assessed value, building type, and HOLC zone assignment. The source GeoJSON (`data/milwaukee-parcels.geojson`, 119 MB) is excluded from git due to GitHub's file size limit. To regenerate it locally:

```bash
npx tsx scripts/fetch-parcels.ts            # Downloads MPROP parcels → data/milwaukee-parcels.geojson
tippecanoe -o public/data/milwaukee-parcels.pmtiles -Z11 -z16 -l parcels --drop-densest-as-needed data/milwaukee-parcels.geojson
```

## Project Structure

```
redlined/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Main application page
│   ├── globals.css              # Tailwind + design tokens
│   └── api/tiles/               # PMTiles tile server endpoint
│
├── components/
│   ├── map/                     # Map rendering
│   │   ├── MapView.tsx          # Mapbox GL map with overlays
│   │   └── BuildingLayer.tsx    # Building extrusions + ghost circles
│   ├── panel/                   # Side panel (three-act narrative)
│   │   ├── InfoPanel.tsx        # Panel router (zone/building)
│   │   ├── ZoneDetail.tsx       # Three-act narrative orchestrator
│   │   ├── NarrativeHeader.tsx  # Act 1: dynamic 1938 decision sentence + HRS badge
│   │   ├── ContentWarning.tsx   # Grade-aware content warning with narrative framing
│   │   ├── CollapsibleSection.tsx # Reusable disclosure for Act 2
│   │   ├── OverlayNarrative.tsx # Act 3: plain-language headline wrapper
│   │   ├── DecadesPanel.tsx     # Decades of change charts and tables
│   │   ├── AppraiserDescription.tsx # Original 1938 appraiser text
│   │   ├── BuildingDetail.tsx   # Individual building properties
│   │   ├── ChatPanel.tsx        # AI narrative guide ("Ask the Guide")
│   │   ├── SuggestedQuestions.tsx # Zone-aware question pills
│   │   ├── IncomeStatistics.tsx # Income overlay panel
│   │   ├── HealthStatistics.tsx # Health overlay panel
│   │   ├── EnvironmentStatistics.tsx
│   │   ├── ValueStatistics.tsx  # Assessed value + 1938 comparison
│   │   ├── RaceStatistics.tsx   # Race demographics + 1938 HOLC data
│   │   ├── DemolitionStatistics.tsx # Ghost building stats
│   │   ├── SanbornContext.tsx   # Sanborn map narrative context
│   │   └── SourceCitation.tsx   # Research PDF citation links
│   ├── ui/                      # Overlay UI elements
│   │   ├── LayerControls.tsx    # Layer + overlay toggles
│   │   ├── TimeSlider.tsx       # Animated timeline bar
│   │   ├── HOLCLegend.tsx       # Grade color legend
│   │   ├── IncomeLegend.tsx     # Data overlay gradient legend
│   │   ├── GhostLegend.tsx      # Demolished buildings legend (with close button)
│   │   ├── AboutModal.tsx       # "About the Map" modal with data sources
│   │   └── ResearchModal.tsx    # PDF viewer modal for research papers
│   ├── archive/                  # "The Archive" gallery modal
│   │   ├── ArchiveModal.tsx      # Root shell: overlay, tabs, AnimatePresence
│   │   ├── ArchiveTabBar.tsx     # Tab nav with animated underline (layoutId)
│   │   ├── OriginalMapSection.tsx # Pinch/zoom/drag HOLC scan viewer
│   │   ├── PhotoGallerySection.tsx # FSA photo grid with filters
│   │   ├── PhotoCard.tsx         # Spring-animated "print" card
│   │   ├── PhotoLightbox.tsx     # Full-screen photo viewer with nav
│   │   ├── TimelineSection.tsx   # Era-based timeline browser
│   │   ├── TimelineCard.tsx      # Expandable event card
│   │   └── TimelineProgressBar.tsx # Era navigation pills
│   └── layout/                  # App shell + navigation
│
├── convex/                      # Convex backend
│   ├── schema.ts                # Database schema (zones, messages, rateLimits)
│   ├── queries.ts               # Data queries
│   ├── mutations.ts             # Data mutations (with input validation)
│   ├── ai.ts                    # Claude AI actions (rate limited, topic guarded)
│   ├── rateLimit.ts             # Per-session rate limiting (internalMutation)
│   └── seed.ts                  # Seed data functions
│
├── lib/                         # Client utilities
│   ├── narrative-text.ts        # Pure text generation for narrative panel
│   ├── zone-selection.tsx       # Zone/building selection context
│   ├── data-overlay.tsx         # Overlay state context
│   ├── time-slider.tsx          # Timeline state context
│   ├── layer-visibility.tsx     # Layer toggle context
│   ├── colorScale.ts            # Overlay color mapping functions
│   ├── census-helpers.ts        # Crosswalk + weighted averages
│   ├── useZoneIncome.ts         # Income data hook
│   ├── useZoneHealth.ts         # Health data hook
│   ├── useZoneEnvironment.ts    # Environment data hook
│   ├── useZoneValue.ts          # Property value data hook
│   ├── useZoneValueHistory.ts   # 1938 vs today value hook
│   ├── useZoneRace.ts           # Race demographics hook
│   ├── useZoneHRS.ts            # Historic Redlining Score hook
│   ├── useDecadesData.ts        # Decade trends data hook
│   ├── useSanbornContext.ts     # Sanborn map context hook
│   ├── research-context.tsx     # Research PDF modal context provider
│   └── ai-prompt.ts             # AI system prompt with research findings
│
├── scripts/                     # Data pipeline + asset scripts
│   ├── optimize-holc-scan.ts    # sharp: 43MB scan → 2K + 4K JPEGs
│   ├── curate-archive-photos.ts # Download LOC photos, generate manifest
│   ├── run-seed.ts              # Convex data seeding
│   ├── seed-census.ts           # Census API → Convex
│   ├── seed-health.ts           # CDC PLACES → Convex
│   ├── seed-environment.ts      # EPA EJScreen → Convex
│   ├── fetch-parcels.ts         # Milwaukee MPROP → PMTiles
│   ├── detect-ghost-buildings.ts # Demolished building detection
│   ├── build-zone-timeline.ts   # Development era timeline
│   ├── build-ghost-zone-stats.ts # Ghost building statistics
│   ├── build-value-history.ts   # 1938 property value comparison
│   ├── build-race-data.ts       # Racial demographics pipeline
│   ├── build-sanborn-context.ts # Sanborn map context pipeline
│   ├── build-decades-census.ts  # Decade-by-decade Census pipeline
│   ├── build-hrs-overlay.ts     # Historic Redlining Scores pipeline
│   ├── download-2020-crosswalk.ts # 2020 Census tract crosswalk
│   └── process-covenants.ts     # Geocode racial covenants (Census Bureau batch API)
│
├── data/                        # Source data files
│   ├── milwaukee-holc-zones.json      # 114 zone GeoJSON
│   ├── holc-area-descriptions.json    # 1938 appraiser records
│   ├── census-holc-crosswalk.json     # Tract-to-zone mapping
│   ├── milwaukee-parcels-by-zone.json # MPROP aggregates
│   ├── ghost-buildings.json           # Demolished structures
│   ├── research-context.json          # Structured research findings
│   ├── covenants/                     # UWM racial covenant records
│   │   └── covenants-wi-milwaukee-county.csv  # 32,506 raw records (42 MB)
│   └── hrs/                           # openICPSR HRS Excel files
│       ├── Historic Redlining Indicator 2000.xlsx
│       ├── Historic Redlining Indicator 2010.xlsx
│       └── Historic Redlining Indicator 2020.xlsx
│
├── public/archive/              # Optimized archive assets
│   ├── holc-scan-2k.jpg         # 2048px HOLC scan (1.0 MB)
│   ├── holc-scan-4k.jpg         # 4096px HOLC scan (4.1 MB)
│   └── photos/                  # 20 LOC FSA photos (thumb + full)
│
├── public/data/                 # Pre-computed JSON (served statically)
│   ├── zone-development-timeline.json
│   ├── ghost-buildings-by-zone.json
│   ├── value-history-by-zone.json
│   ├── race-by-zone.json
│   ├── sanborn-context-by-zone.json
│   ├── decades-research-stats.json
│   ├── decades-by-zone.json
│   ├── hrs-by-zone.json
│   ├── milwaukee-parcels-by-zone.json
│   ├── research-context.json
│   ├── covenants/                # Racial covenant map data
│   │   ├── milwaukee-covenants.geojson  # 32,219 geocoded Points (15 MB)
│   │   └── covenant-stats.json          # Summary statistics
│   └── archive/                  # Archive gallery data
│       ├── fsa-photos.json       # 20 curated LOC photo manifest
│       └── timeline-events.json  # 12 events across 5 eras
│
└── public/research/             # Academic research PDFs (in-app viewer)
    ├── chang-smith-2016.pdf
    ├── lynch-et-al-2021.pdf
    └── paulson-wierschke-kim-2016.pdf
```

## Data Sources

All data is freely available and publicly accessible.

| Dataset                 | Source                                                                                                                          | Use                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| HOLC Zones (Milwaukee)  | [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/)                                                              | 114 zone polygons with grades A-D               |
| HOLC Area Descriptions  | [americanpanorama/HOLC_Area_Description_Data](https://github.com/americanpanorama/HOLC_Area_Description_Data)                   | Original appraiser text (112 Milwaukee records) |
| Census-HOLC Crosswalk   | [americanpanorama/mapping-inequality-census-crosswalk](https://github.com/americanpanorama/mapping-inequality-census-crosswalk) | Links HOLC zones to Census tracts (717 records) |
| Census ACS 5-Year       | [api.census.gov](https://api.census.gov)                                                                                        | Income, race/ethnicity by tract (B19013, B02001, B03002) |
| CDC PLACES              | [cdc.gov/places](https://www.cdc.gov/places/)                                                                                   | Health risk indicators by tract                 |
| EPA EJScreen            | [epa.gov/ejscreen](https://www.epa.gov/ejscreen)                                                                                | Environmental burden percentiles by tract       |
| Historic Redlining Scores | [openICPSR #141121](https://www.openicpsr.org/openicpsr/project/141121)                                                       | Continuous 1.0–4.0 redlining severity per tract (2000, 2010, 2020) |
| Milwaukee MPROP         | [data.milwaukee.gov](https://data.milwaukee.gov/dataset/mprop)                                                                   | 148K property parcels with addresses, assessed values |
| MPROP Historical        | [data.milwaukee.gov](https://data.milwaukee.gov/dataset/historical-master-property-file)                                         | 1975-2024 property snapshots (ghost detection)  |
| LOC FSA/OWI Photos      | [Library of Congress](https://www.loc.gov/pictures/collection/fsa/)                                                               | 20 curated Carl Mydans Milwaukee photos (1936)  |
| HOLC Security Map Scan  | [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/)                                                              | Original 1938 HOLC scan (optimized 2K + 4K)     |
| Racial Covenants        | [UWM Mapping Racism & Resistance](https://github.com/UMNLibraries/mp-us-racial-covenants)                                      | 32,219 geocoded covenant deeds (1910-1959)      |
| HOLC Zones (All Cities) | [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/)                                                              | 10,154 zones across 300 cities (Phase 3)        |

## Data Overlay Details

### Race & Demographics

Compares 1938 HOLC racial assessments with modern Census data:

- **1938**: Appraisers recorded "Negro" presence, "infiltration" groups, and foreign-born populations as factors in downgrading neighborhoods
- **Today**: A-zones average 74.9% White / 14.8% Black; C-zones average 54.6% White / 28.1% Black
- **Zone D5**: Explicitly flagged for "Negro" presence (65%) in 1938 — today 68.2% Black. Segregation persisted for 87 years.

### 1938 vs Today Property Values

Parses 1930s appraiser-estimated prices from HOLC area descriptions alongside modern MPROP assessed values:

- **Nominal growth**: D-zones grew 51.5x (from $6,618 avg to $340,750)
- **Inflation-adjusted**: Many zones show real value erosion when adjusted for 22.3x CPI factor
- **Grade correlation**: A-zone average values remain significantly higher than D-zone values

### Racial Covenants

32,219 racial covenants in Milwaukee County property deeds, crowdsourced by ~5,000 volunteers through UWM's [Mapping Racism & Resistance](https://sites.uwm.edu/mappingracismresistance/) project and geocoded at 99.4% match rate via the US Census Bureau batch geocoder:

- **By decade**: 1910s: 238, 1920s: 23,035, 1930s: 5,290, 1940s: 3,532, 1950s: 124
- **By city**: Milwaukee: 21,192, Wauwatosa: 4,235, West Allis: 2,774, plus 14 other municipalities
- **Timeline integration**: Scrub the time slider through 1910-1959 to watch covenants accumulate — 71% were filed in the 1920s alone, showing how legal segregation preceded and informed HOLC redlining
- **Visualization**: Amber heatmap at low zoom (density), individual dots at high zoom (click for deed text with content warning)

### Historic Redlining Scores

Area-weighted continuous score (1.0–4.0) per Census tract measuring redlining intensity, joined to HOLC zones via the Census crosswalk:

- **A-zone average**: 1.74 (minimal redlining exposure)
- **B-zone average**: 2.25
- **C-zone average**: 2.99
- **D-zone average**: 3.70 (severe redlining exposure)
- Lynch et al. found 73% higher odds of current lending discrimination for every one-unit increase in HRS

## Research Sources

Three peer-reviewed papers on Milwaukee's redlining history are integrated into the application. Each data overlay panel includes inline citations with key findings, and clicking "View PDF" opens the full paper in a modal viewer. The AI narrative guide also references these findings when answering questions.

| Paper | Authors | Year | Topics |
|-------|---------|------|--------|
| Neighborhood Isolation and Mortgage Redlining in Milwaukee County | Woojin Chang & Michael Smith | 2016 | Income gaps, home ownership, persistent isolation |
| The Legacy of Structural Racism: Redlining, Lending, and Health | Emily Lynch et al. | 2021 | Health outcomes, lending discrimination, infant mortality |
| Milwaukee's History of Segregation: A Biography of Four Neighborhoods | Jessie Paulson, Meghan Wierschke & Gabe Kim | 2016 | Bronzeville, I-43 highway, suburban exclusion |

PDFs are served from `public/research/` and metadata is structured in `data/research-context.json`.

## AI Chat Protection

The AI Narrative Guide is a public-facing tool with no authentication (intentional for a public educational app). Four layers of protection prevent abuse without requiring login:

| Layer | Where | What |
|-------|-------|------|
| **Rate Limiting** | `convex/rateLimit.ts` | Fixed-window limits per session: 5/min, 30/hour, 100/day. Checked atomically via `internalMutation` before every Claude API call. |
| **Input Validation** | `convex/mutations.ts` + `convex/ai.ts` | User messages capped at 1,000 chars. Conversation history truncated to last 20 messages (bounds token cost). Role validated as enum. |
| **Topic Guardrails** | `convex/ai.ts` + system prompt | Server-side keyword pre-check blocks prompt injection ("ignore previous instructions") and off-topic requests ("write me a", "code a") before hitting Claude. System prompt includes BOUNDARIES section instructing Claude to refuse non-redlining topics. |
| **Bot Protection** | `ChatPanel.tsx` | Honeypot hidden input (bots auto-fill, humans don't see). 3-second minimum interaction time rejects instant submissions. Client-side `maxLength=500` for UX feedback. |

## Roadmap

### Phase 1: MVP — Milwaukee HOLC Explorer (Complete)

3D zone visualization, 148K building extrusions with street addresses, click-to-inspect zones and buildings, AI narrative guide with zone-aware questions, five data overlays (income, health, environment, value, race), 32,219 racial covenants with timeline scrubbing, ghost buildings with dismiss button, time slider, Sanborn map context, research-sourced citations with PDF viewer, plain-English narrative panel for museum audiences with Historic Redlining Scores, interactive Archive gallery (original HOLC map viewer, 20 LOC photographs, historical timeline), About modal, responsive layout.

### Phase 2: Enhanced Narrative

ElevenLabs voice narration, historical MPROP time-series (1975-2024 sparklines), Sanborn fire insurance map overlay, guided Bronzeville narrative tour.

### Phase 3: Multi-City

Expand to Chicago, Detroit, Atlanta using the 10,154-zone national dataset. Embeddable iframe mode. "What If" counterfactual visualization.

## Content Advisory

This application displays the original language used by HOLC appraisers in the 1930s, which includes explicitly racist descriptions of neighborhoods and their residents. This language is presented with content warnings as historical evidence — the words should be uncomfortable because the policy was.

## License

Data sources are subject to their respective licenses:

- Mapping Inequality / American Panorama data: [CC-BY-NC](https://creativecommons.org/licenses/by-nc/2.0/)
- Census data: Public domain
- openICPSR Historic Redlining Scores: [Terms of Use](https://www.openicpsr.org/openicpsr/terms)
- UWM/UMN Racial Covenants: [ODC-By](https://opendatacommons.org/licenses/by/1-0/)
- Application code: [MIT](LICENSE)

## Acknowledgments

- [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/) — University of Richmond Digital Scholarship Lab
- [American Panorama](https://github.com/americanpanorama) — Open-source historical data
- [Library of Congress](https://www.loc.gov/pictures/collection/fsa/) — FSA/OWI photograph collection (Carl Mydans, Milwaukee 1936)
- [UWM Mapping Racism & Resistance](https://sites.uwm.edu/mappingracismresistance/) — 32,219 racial covenant records crowdsourced by ~5,000 volunteers
- [Radio Milwaukee](https://radiomilwaukee.org) / [The Intersection](https://theintersection.substack.com)
