# Milestone 5: Ghost Buildings & Time Slider

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-4 complete

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

Implement Ghost Buildings & Time Slider — demolished structures rendered as red wireframes with GSAP-driven era transitions from 1910 through present day.

## Overview

Ghost buildings reveal what was lost. By comparing historical MPROP snapshots (2005 vs. 2025), the system identifies demolished properties and renders them as red wireframes at 30% opacity. A time slider with GSAP animations transitions the scene across four eras, making the chain of destruction visible — from dense 1910 neighborhoods through 1938 HOLC grading, 1960s highway demolition, to the present-day void.

**Key Functionality:**

- Red wireframe rendering of demolished structures at 30% opacity
- Time slider with GSAP crossfade animations between four eras
- Era markers: 1910, 1938, 1960s, Present
- Ghost building info panel: address, year demolished, cause, current site
- Auto-play mode sweeping through eras with 3-second pauses
- Ghost count indicator per zone

## Recommended Approach: Test-Driven Development

See `product-plan/sections/ghost-buildings-time-slider/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/ghost-buildings-time-slider/components/`:

- `GhostBuildingsTimeSlider.tsx` — Main viewport with ghost rendering and time controls
- `GhostBlock.tsx` — Individual ghost wireframe with pulse animation
- `GhostInfoPanel.tsx` — Demolished building info with timeline and cause

### Three.js Implementation

Replace CSS perspective preview with Three.js:

- Wireframe material: red (#F44336) at 30% opacity
- MeshBasicMaterial with wireframe=true for ghost buildings
- GSAP timeline for crossfade transitions between eras
- Visibility driven by time slider: ghost appears after its demolition year
- Pulse animation on wireframes (subtle opacity oscillation)

### Data Layer

- Compare MPROP 2005 vs 2025 snapshots to identify demolished TAXKEYs
- Detect vacant parcels where Sanborn maps show prior buildings
- Categorize demolition cause: highway, urban renewal, disinvestment
- Per-zone ghost building JSON

### Callbacks

- `onSelectGhost(id: string)` — Click to inspect ghost
- `onHoverGhost(id: string | null)` — Hover tooltip
- `onYearChange(year: number)` — Time slider drag
- `onBackToZone()` — Breadcrumb navigation
- `onToggleGhostLayer(visible: boolean)` — Ghost visibility
- `onToggleAutoPlay()` — Auto-play through eras

## Expected User Flows

### Flow 1: Watch History Unfold

1. User clicks auto-play
2. Scene transitions from 1910 (dense neighborhood) through 1938, 1960s, to present
3. Red wireframes fade in as buildings are demolished
4. Era descriptions appear at each marker
5. **Outcome:** User witnesses the destruction over time

### Flow 2: Inspect a Ghost Building

1. User clicks a red wireframe
2. Info panel shows: address, "Built 1905 -> Demolished 1963"
3. Cause shown: "Highway Construction"
4. Detail: "Demolished for Interstate-43 construction"
5. Current site: "I-43 northbound lanes"
6. **Outcome:** User understands what was lost and why

### Flow 3: Explore by Era

1. User drags time slider to 1960s
2. Ghost buildings from highway era fade in
3. Ghost count updates: "6 of 10 structures demolished"
4. **Outcome:** User sees the scale of destruction by era

## Files to Reference

- `product-plan/sections/ghost-buildings-time-slider/README.md`
- `product-plan/sections/ghost-buildings-time-slider/tests.md`
- `product-plan/sections/ghost-buildings-time-slider/components/`
- `product-plan/sections/ghost-buildings-time-slider/types.ts`
- `product-plan/sections/ghost-buildings-time-slider/sample-data.json`
- `product-plan/sections/ghost-buildings-time-slider/screenshot.png`

## Done When

- [ ] Tests written for key user flows
- [ ] Ghost buildings render as red wireframes at 30% opacity
- [ ] Time slider drives ghost visibility (appear after demolition year)
- [ ] GSAP crossfade animations between eras work
- [ ] Auto-play sweeps through eras with pauses
- [ ] Click populates ghost info panel
- [ ] Ghost count indicator updates by era
- [ ] Era descriptions display
- [ ] Breadcrumb navigation works
- [ ] Ghost layer toggle works
