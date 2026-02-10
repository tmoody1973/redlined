# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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
