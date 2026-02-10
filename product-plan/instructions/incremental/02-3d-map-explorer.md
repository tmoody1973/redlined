# Milestone 2: 3D Map Explorer

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Three.js scene setup and rendering pipeline
- Data ingestion pipeline (HOLC GeoJSON, MPROP CSV, Census API, CDC, EPA)
- AI integration (Claude API for narrative guide, ElevenLabs for voice)
- State management for zone selection, time slider, view modes
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your state management and data layer
- **DO** replace sample data with real data from your data pipeline
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no zone/building is selected
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the 3D rendering and data layer

---

## Goal

Implement the 3D Map Explorer — the core Three.js viewport rendering Milwaukee's HOLC zones as extruded 3D polygons with orbit controls and click-to-inspect interaction.

## Overview

The 3D Map Explorer is the primary interface. Users see Milwaukee's HOLC redlining zones rendered as 3D blocks — A-grade zones (green) tower highest, D-grade zones (red) sit lowest, making inequality visible as topography. Users orbit, zoom, and pan the scene, then click zones to reveal original appraiser descriptions in the info panel.

**Key Functionality:**
- Render HOLC GeoJSON polygons as ExtrudeGeometry blocks in Three.js
- Height-encode by grade: A tallest, D lowest
- Color-encode by grade: A=green, B=blue, C=yellow, D=red at 75% opacity
- OrbitControls for rotate, zoom, pan
- Hover highlight with glow effect
- Click selection that populates the info panel

## Recommended Approach: Test-Driven Development

See `product-plan/sections/3d-map-explorer/tests.md` for test-writing instructions.

## What to Implement

### Components
Copy from `product-plan/sections/3d-map-explorer/components/`:
- `MapExplorer.tsx` — Main viewport with zone rendering and interactions
- `ZoneBlock.tsx` — Individual zone block with hover/selection states

### Three.js Implementation
The provided components use CSS perspective as a design preview. Replace with actual Three.js:
- Parse HOLC GeoJSON polygon coordinates
- Create ExtrudeGeometry for each zone polygon
- Apply MeshStandardMaterial with grade colors
- Raycaster for hover detection (brighten material on mouseover)
- Click handler to emit selected zone to info panel
- Dark scene background (#1A1A2E)

### Data Layer
- Load HOLC GeoJSON (static import or fetch)
- Parse polygon coordinates for Three.js geometry
- Provide zone metadata (grade, name, description, stats) to info panel

### Callbacks
- `onZoneHover(zoneId: string | null)` — Hover highlight
- `onZoneSelect(zoneId: string)` — Click to inspect
- `onViewModeToggle(modeId: string)` — Layer toggles
- `onYearChange(year: number)` — Time slider

## Expected User Flows

### Flow 1: Explore the Map
1. User lands on zoomed-out overview of all Milwaukee HOLC zones
2. User drags to orbit, scrolls to zoom
3. User sees zones extruded by grade — A-zones visibly taller than D-zones
4. **Outcome:** User understands the spatial relationship between zones

### Flow 2: Inspect a Zone
1. User hovers a zone — it glows/brightens
2. User clicks the zone
3. Right info panel populates with zone name, HOLC ID, grade badge, and original appraiser description
4. **Outcome:** User reads the 1938 assessment language

### Flow 3: Switch View Modes
1. User clicks a view mode toggle in the bottom toolbar
2. Scene transitions to show the selected layer
3. **Outcome:** Different data layers become visible

## Files to Reference
- `product-plan/sections/3d-map-explorer/README.md`
- `product-plan/sections/3d-map-explorer/tests.md`
- `product-plan/sections/3d-map-explorer/components/`
- `product-plan/sections/3d-map-explorer/types.ts`
- `product-plan/sections/3d-map-explorer/sample-data.json`
- `product-plan/sections/3d-map-explorer/screenshot.png`

## Done When
- [ ] Tests written for key user flows
- [ ] HOLC zones render as 3D extruded blocks in Three.js
- [ ] Height encoding works (A tallest, D lowest)
- [ ] Color encoding works (green, blue, yellow, red)
- [ ] OrbitControls work (orbit, zoom, pan)
- [ ] Hover highlight shows glow effect
- [ ] Click populates info panel with zone details
- [ ] Scene has dark background with proper lighting
- [ ] Responsive on tablet
