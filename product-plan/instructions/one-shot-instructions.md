# Redlined: The Shape of Inequality — Full Implementation Instructions

> **Provide alongside:** `product-overview.md`

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

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, Three.js scene, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup
- This is a **dark-first** application — `slate-950` background, no light mode

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for all interface definitions
- See `product-plan/data-model/README.md` for entity relationships
- Key entities: City, HOLCZone, Building, GhostBuilding, CensusTract, SanbornMap, Conversation

### 3. Data Pipeline Setup

Prepare the data ingestion layer:

- **HOLC GeoJSON** (~2MB) — Pre-bundle as static JSON from University of Richmond's Mapping Inequality project
- **MPROP CSV** — Download from City of Milwaukee Open Data Portal, process into per-zone JSON files
- **Census ACS** — Fetch via Census API, cache as static JSON
- **CDC PLACES** — Health outcomes data, cache as static JSON
- **EPA EJScreen** — Environmental burden scores, cache as static JSON
- **Sanborn Maps** — Tile URLs from UWM's ArcGIS endpoint

### 4. Three.js Scene Setup

Initialize the core 3D rendering:

- Create a Three.js scene with dark background (`#1A1A2E`)
- Set up PerspectiveCamera centered on Milwaukee (43.0389°N, 87.9065°W)
- Add OrbitControls for rotate, zoom, pan
- Configure ambient + directional lighting for depth
- Set up raycasting for hover/click detection on zone meshes

### 5. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper (split-panel: 70% viewport / 30% info+chat)
- `MainNav.tsx` — Top bar with logo, city selector, content warning
- `BottomToolbar.tsx` — Time slider with era markers + view mode toggles
- `InfoPanel.tsx` — Right panel neighborhood info display

**Wire Up Navigation:**

Connect shell controls to your state management:

- City selector → load different city's HOLC data
- Time slider → animate Three.js scene between eras (1910, 1938, 1960s, present)
- View mode toggles → show/hide data layers (Buildings, Ghost, Income, Health, etc.)
- Info panel → display selected zone/building details

### 6. Routing

This is a single-page application. State is managed via:

- URL hash or query params for shareable zone selection (e.g., `#zone=D-7`)
- Internal state for time slider position, active view modes, selected zone

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, fonts loaded)
- [ ] Data model types are defined in TypeScript
- [ ] Three.js scene initializes with dark background and orbit controls
- [ ] Shell renders with top bar, split-panel layout, and bottom toolbar
- [ ] Time slider controls are functional
- [ ] View mode toggles are wired up
- [ ] City selector displays Milwaukee
- [ ] Info panel shows empty state ("Select a neighborhood")
- [ ] Responsive on tablet (right panel becomes slide-over)

---

# Milestone 2: 3D Map Explorer

## Goal

Implement the 3D Map Explorer — the core Three.js viewport rendering Milwaukee's HOLC zones as extruded 3D polygons with orbit controls and click-to-inspect interaction.

## Overview

The 3D Map Explorer is the primary interface. Users see Milwaukee's HOLC redlining zones rendered as 3D blocks — A-grade zones (green) tower highest, D-grade zones (red) sit lowest, making inequality visible as topography.

**Key Functionality:**

- Render HOLC GeoJSON polygons as ExtrudeGeometry blocks in Three.js
- Height-encode by grade: A tallest, D lowest
- Color-encode by grade: A=green, B=blue, C=yellow, D=red at 75% opacity
- OrbitControls for rotate, zoom, pan
- Hover highlight with glow effect
- Click selection that populates the info panel

## What to Implement

### Components

Copy from `product-plan/sections/3d-map-explorer/components/`:

- `MapExplorer.tsx` — Main viewport with zone rendering and interactions
- `ZoneBlock.tsx` — Individual zone block with hover/selection states

### Three.js Implementation

- Parse HOLC GeoJSON polygon coordinates
- Create ExtrudeGeometry for each zone polygon
- Apply MeshStandardMaterial with grade colors
- Raycaster for hover detection
- Click handler to emit selected zone to info panel

### Callbacks

- `onZoneHover(zoneId: string | null)` — Hover highlight
- `onZoneSelect(zoneId: string)` — Click to inspect
- `onViewModeToggle(modeId: string)` — Layer toggles
- `onYearChange(year: number)` — Time slider

## Files to Reference

- `product-plan/sections/3d-map-explorer/` — README, tests, components, types, sample data, screenshot

## Done When

- [ ] Tests written for key user flows
- [ ] HOLC zones render as 3D extruded blocks in Three.js
- [ ] Height encoding works (A tallest, D lowest)
- [ ] Color encoding works (green, blue, yellow, red)
- [ ] OrbitControls work (orbit, zoom, pan)
- [ ] Hover highlight shows glow effect
- [ ] Click populates info panel with zone details

---

# Milestone 3: AI Narrative Guide

## Goal

Implement the AI Narrative Guide — a Claude-powered chat panel with neighborhood-aware context, suggested prompts, streaming responses, and ElevenLabs voice narration.

## Overview

The AI Narrative Guide occupies the bottom portion of the right panel. When a user selects a zone, the guide's system prompt dynamically updates with that zone's HOLC data, Census statistics, and original appraiser description.

**Key Functionality:**

- Claude API integration with zone-aware system prompts
- Streaming text display for AI responses
- Suggested prompt buttons for common questions
- ElevenLabs voice narration with play/pause controls
- Auto-narration of HOLC appraiser descriptions when zone is selected

## What to Implement

### Components

Copy from `product-plan/sections/ai-narrative-guide/components/`:

- `NarrativeGuide.tsx` — Main chat panel with input, messages, and prompts
- `ChatMessage.tsx` — Individual message bubble with audio controls
- `AudioWaveform.tsx` — Animated waveform for audio playback indicator

### AI Integration

- Claude Sonnet 4 API with streaming responses
- Dynamic system prompt construction per zone
- Instruction to be direct about racism, not sanitize language

### Voice Integration

- ElevenLabs TTS API for narration
- Auto-narrate HOLC descriptions when zone is selected

## Files to Reference

- `product-plan/sections/ai-narrative-guide/` — README, tests, components, types, sample data, screenshot

## Done When

- [ ] Tests written for key user flows
- [ ] Claude API integration with streaming responses
- [ ] System prompt updates dynamically per zone
- [ ] Suggested prompts display and trigger AI responses
- [ ] ElevenLabs narration plays on demand
- [ ] Mute toggle works

---

# Milestone 4: Building-Level Detail

## Goal

Implement Building-Level Detail — individual MPROP buildings extruded within HOLC zones, color-coded by construction era.

## Overview

When the "Buildings" layer is active, individual properties from Milwaukee's MPROP dataset load and render within the selected HOLC zone. Each building is extruded by number of stories and color-coded by construction era — copper for pre-1938, gray for 1938-1970, light blue for modern.

**Key Functionality:**

- Render MPROP buildings as ExtrudeGeometry parcels within zones
- Height based on NR_STORIES field
- Color by construction era (copper, gray, light blue)
- Per-zone loading for performance
- Building info panel with MPROP fields
- Breadcrumb navigation: Zone > Building

## What to Implement

### Components

Copy from `product-plan/sections/building-level-detail/components/`:

- `BuildingDetail.tsx` — Main viewport with building rendering
- `BuildingBlock.tsx` — Individual building with era color and hover states
- `BuildingInfoPanel.tsx` — Property info panel with MPROP fields

### Three.js Implementation

- Parse parcel boundary GeoJSON for building footprints
- Create ExtrudeGeometry with depth = NR_STORIES x 3 meters
- Apply MeshStandardMaterial with era colors
- InstancedMesh for distant zones (LOD)

## Files to Reference

- `product-plan/sections/building-level-detail/` — README, tests, components, types, sample data, screenshot

## Done When

- [ ] Tests written for key user flows
- [ ] Buildings render as extruded parcels within zones
- [ ] Height encoding by stories works
- [ ] Era color coding works (copper, gray, light blue)
- [ ] Per-zone loading for performance
- [ ] Click populates building info panel
- [ ] Breadcrumb navigation works

---

# Milestone 5: Ghost Buildings & Time Slider

## Goal

Implement Ghost Buildings & Time Slider — demolished structures rendered as red wireframes with GSAP-driven era transitions from 1910 through present day.

## Overview

Ghost buildings reveal what was lost. By comparing historical MPROP snapshots (2005 vs. 2025), the system identifies demolished properties and renders them as red wireframes at 30% opacity. A time slider with GSAP animations transitions the scene across four eras.

**Key Functionality:**

- Red wireframe rendering of demolished structures at 30% opacity
- Time slider with GSAP crossfade animations between four eras
- Era markers: 1910, 1938, 1960s, Present
- Ghost building info panel: address, year demolished, cause, current site
- Auto-play mode sweeping through eras

## What to Implement

### Components

Copy from `product-plan/sections/ghost-buildings-time-slider/components/`:

- `GhostBuildingsTimeSlider.tsx` — Main viewport with ghost rendering and time controls
- `GhostBlock.tsx` — Individual ghost wireframe with pulse animation
- `GhostInfoPanel.tsx` — Demolished building info with timeline and cause

### Three.js Implementation

- Wireframe material: red (#F44336) at 30% opacity
- MeshBasicMaterial with wireframe=true for ghost buildings
- GSAP timeline for crossfade transitions between eras
- Visibility driven by time slider: ghost appears after its demolition year

### Data Layer

- Compare MPROP 2005 vs 2025 snapshots to identify demolished TAXKEYs
- Categorize demolition cause: highway, urban renewal, disinvestment

## Files to Reference

- `product-plan/sections/ghost-buildings-time-slider/` — README, tests, components, types, sample data, screenshot

## Done When

- [ ] Tests written for key user flows
- [ ] Ghost buildings render as red wireframes at 30% opacity
- [ ] Time slider drives ghost visibility
- [ ] GSAP crossfade animations between eras work
- [ ] Auto-play sweeps through eras with pauses
- [ ] Click populates ghost info panel
- [ ] Ghost count indicator updates by era

---

# Milestone 6: Data Overlays

## Goal

Implement Data Overlays — choropleth color fills for four metrics showing present-day consequences of redlining, with zone-specific stats and A-vs-D comparison.

## Overview

Data Overlays make the lasting consequences of redlining quantifiable. Four overlay layers — Census median income, CDC health outcomes, EPA environmental burden, and assessed property value — render as choropleth color fills over zones.

**Key Functionality:**

- Four choropleth overlay layers with diverging color scales (red to green)
- Layer selector to switch between metrics
- Opacity slider for overlay transparency
- Color scale legend with metric range
- Zone stats panel with percentile, A-zone avg, D-zone avg, differential
- Smooth crossfade when switching layers

## What to Implement

### Components

Copy from `product-plan/sections/data-overlays/components/`:

- `DataOverlays.tsx` — Main viewport with choropleth zones and controls
- `OverlayStatsPanel.tsx` — Stats panel with grade comparison and A-vs-D bars

### Three.js Implementation

- Apply choropleth colors to zone materials based on active metric
- Smooth material color transitions when switching layers
- Opacity control for overlay transparency

### Data Layer

- Census ACS median household income by tract
- CDC PLACES health burden composite index
- EPA EJScreen environmental justice scores
- City of Milwaukee MPROP assessed value aggregates
- Pre-compute grade averages (A, B, C, D) for each metric

## Files to Reference

- `product-plan/sections/data-overlays/` — README, tests, components, types, sample data, screenshot

## Done When

- [ ] Tests written for key user flows
- [ ] Four overlay layers render as choropleth color fills
- [ ] Layer selector switches between metrics
- [ ] Opacity slider controls overlay transparency
- [ ] Color scale legend shows metric range
- [ ] Click populates stats panel with zone data
- [ ] A-vs-D comparison bars display with differential
- [ ] Smooth crossfade when switching layers
