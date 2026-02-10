# Raw Idea: Phase 1 MVP — Milwaukee HOLC Explorer

## Overview

Phase 1 MVP — Milwaukee HOLC Explorer. This covers all 8 items from the roadmap:

## Features

1. **HOLC GeoJSON Loading and Parsing** — Load Milwaukee HOLC zone data from `geojson (1).json` (114 features with neighborhood names, label coordinates, bounding boxes). Join with appraiser descriptions from `holc_ad_data.json` on `area_id`.

2. **Three.js Scene Setup** — Initialize React Three Fiber canvas with camera, lighting, orbit controls, dark background (0x1A1A2E).

3. **HOLC Zone Extrusion** — Extrude zone polygons into 3D geometry with height mapped to grade. HOLC palette: A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336.

4. **Click-to-Inspect Panel** — Clicking a zone shows grade, neighborhood name, and original appraiser text (clarifying_remarks, detrimental_influences, infiltration_of, negro data).

5. **Claude AI Narrative Guide** — Chat panel with Claude API, zone-aware system prompts including appraiser descriptions.

6. **Census Income Data Overlay** — ACS 5-Year income data joined via Census-HOLC crosswalk, toggleable color overlay.

7. **Split Panel Layout and Responsive UI** — 3D canvas left, info/chat panel right, navigation, legend, layer toggles.

8. **Vercel Deployment** — Vercel project with Convex backend, environment variables.

## Tech Stack

- Next.js (App Router)
- Convex
- React Three Fiber
- Tailwind CSS v4
- Claude API
- GSAP
