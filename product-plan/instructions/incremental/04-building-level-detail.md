# Milestone 4: Building-Level Detail

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-3 complete

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

Implement Building-Level Detail — individual MPROP buildings extruded within HOLC zones, color-coded by construction era, with hover tooltips and click-to-inspect property info panel.

## Overview

When the "Buildings" layer is active, individual properties from Milwaukee's MPROP dataset load and render within the selected HOLC zone. Each building is extruded by number of stories and color-coded by construction era — copper for pre-1938 (pre-redlining), gray for 1938-1970 (urban renewal era), light blue for modern construction. This reveals fine-grained patterns: which neighborhoods were demolished, which survived, and what replaced them.

**Key Functionality:**
- Render MPROP buildings as ExtrudeGeometry parcels within zones
- Height based on NR_STORIES field
- Color by construction era (copper, gray, light blue)
- Per-zone loading for performance (only active zone at full detail)
- Building info panel with MPROP fields (address, year, stories, value, land use)
- Breadcrumb navigation: Zone > Building

## Recommended Approach: Test-Driven Development

See `product-plan/sections/building-level-detail/tests.md` for test-writing instructions.

## What to Implement

### Components
Copy from `product-plan/sections/building-level-detail/components/`:
- `BuildingDetail.tsx` — Main viewport with building rendering
- `BuildingBlock.tsx` — Individual building with era color and hover states
- `BuildingInfoPanel.tsx` — Property info panel with MPROP fields

### Three.js Implementation
Replace CSS perspective preview with Three.js:
- Parse parcel boundary GeoJSON for building footprints
- Create ExtrudeGeometry with depth = NR_STORIES x 3 meters
- Apply MeshStandardMaterial with era colors
- InstancedMesh for distant zones (LOD)
- Only load buildings within active zone's bounding box

### Data Layer
- MPROP CSV joined to parcel shapefile on TAXKEY
- Spatial join to assign HOLC grades
- Era calculation from YEAR_BUILT field
- Per-zone JSON files for progressive loading

### Callbacks
- `onSelectBuilding(id: string)` — Click to inspect building
- `onHoverBuilding(id: string | null)` — Hover tooltip
- `onBackToZone()` — Breadcrumb navigation back
- `onToggleLayer(visible: boolean)` — Buildings layer toggle

## Expected User Flows

### Flow 1: Explore Buildings in a Zone
1. User activates "Buildings" layer
2. Buildings within selected zone load and render
3. User sees buildings extruded by stories, colored by era
4. **Outcome:** User sees the physical fabric of the neighborhood

### Flow 2: Inspect a Building
1. User hovers a building — tooltip shows address and year
2. User clicks the building
3. Info panel shows MPROP data: address, year built, stories, assessed value, land use
4. Era tag shows construction period
5. **Outcome:** User understands individual property conditions

### Flow 3: Navigate Back to Zone
1. User clicks zone breadcrumb in info panel
2. View returns to zone-level detail
3. **Outcome:** Smooth navigation between levels of detail

## Files to Reference
- `product-plan/sections/building-level-detail/README.md`
- `product-plan/sections/building-level-detail/tests.md`
- `product-plan/sections/building-level-detail/components/`
- `product-plan/sections/building-level-detail/types.ts`
- `product-plan/sections/building-level-detail/sample-data.json`
- `product-plan/sections/building-level-detail/screenshot.png`

## Done When
- [ ] Tests written for key user flows
- [ ] Buildings render as extruded parcels within zones
- [ ] Height encoding by stories works
- [ ] Era color coding works (copper, gray, light blue)
- [ ] Per-zone loading for performance
- [ ] Hover tooltip shows address and year
- [ ] Click populates building info panel
- [ ] Breadcrumb navigation works
- [ ] Vacant lots render with hatch pattern
- [ ] Era legend displays in viewport
