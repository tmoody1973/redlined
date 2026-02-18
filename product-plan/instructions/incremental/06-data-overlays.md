# Milestone 6: Data Overlays

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-5 complete

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

Implement Data Overlays — choropleth color fills for four metrics (income, health, environment, property value) showing present-day consequences of redlining, with zone-specific stats and A-vs-D comparison.

## Overview

Data Overlays make the lasting consequences of redlining quantifiable. Four overlay layers — Census median income, CDC health outcomes, EPA environmental burden, and assessed property value — render as choropleth color fills over zones. A side panel shows zone-specific stats alongside A-zone vs D-zone averages, revealing the stark differentials that persist 85 years after HOLC grades were assigned.

**Key Functionality:**

- Four choropleth overlay layers with diverging color scales (red to green)
- Layer selector to switch between metrics
- Opacity slider for overlay transparency
- Color scale legend with metric range
- Zone stats panel with percentile, A-zone avg, D-zone avg, differential
- Hover tooltip with zone name and metric value
- Smooth crossfade when switching layers

## Recommended Approach: Test-Driven Development

See `product-plan/sections/data-overlays/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/data-overlays/components/`:

- `DataOverlays.tsx` — Main viewport with choropleth zones and controls
- `OverlayStatsPanel.tsx` — Stats panel with grade comparison and A-vs-D bars

### Three.js Implementation

Replace CSS perspective preview with Three.js:

- Apply choropleth colors to zone materials based on active metric
- Smooth material color transitions when switching layers
- Opacity control for overlay transparency
- Preserve zone extrusion height while changing fill color

### Data Layer

- Census ACS median household income by tract
- CDC PLACES health burden composite index
- EPA EJScreen environmental justice scores
- City of Milwaukee MPROP assessed value aggregates
- Pre-compute grade averages (A, B, C, D) for each metric
- Map metric values to diverging color scales

### Callbacks

- `onLayerChange(layerId: OverlayLayerId | null)` — Switch overlay
- `onOpacityChange(opacity: number)` — Adjust transparency
- `onZoneSelect(zoneId: string)` — Click zone for stats
- `onZoneHover(zoneId: string | null)` — Hover tooltip

## Expected User Flows

### Flow 1: View Income Overlay

1. User selects "Median Income" from layer selector
2. Zones fill with choropleth colors (green=high income, red=low)
3. Color scale legend shows "$18K - $120K"
4. **Outcome:** User sees income disparity mapped to HOLC grades

### Flow 2: Inspect Zone Stats

1. User clicks zone D-7 (Bronzeville)
2. Stats panel shows: $24,800 median income (8th percentile)
3. A-Zone vs D-Zone comparison: $105,600 vs $23,450
4. Differential: "4.5x higher in A-zones"
5. Callout: "85 years after HOLC grades were assigned"
6. **Outcome:** User quantifies the impact of redlining

### Flow 3: Compare Metrics

1. User switches from Income to Health Outcomes
2. Colors transition smoothly to health burden scale
3. D-zones now show high health burden (red), A-zones show low (green)
4. **Outcome:** User sees redlining's impact across multiple dimensions

## Files to Reference

- `product-plan/sections/data-overlays/README.md`
- `product-plan/sections/data-overlays/tests.md`
- `product-plan/sections/data-overlays/components/`
- `product-plan/sections/data-overlays/types.ts`
- `product-plan/sections/data-overlays/sample-data.json`
- `product-plan/sections/data-overlays/screenshot.png`

## Done When

- [ ] Tests written for key user flows
- [ ] Four overlay layers render as choropleth color fills
- [ ] Layer selector switches between metrics
- [ ] Opacity slider controls overlay transparency
- [ ] Color scale legend shows metric range
- [ ] Click populates stats panel with zone data
- [ ] A-vs-D comparison bars display with differential
- [ ] Grade comparison table works
- [ ] Hover tooltip shows metric value
- [ ] Smooth crossfade when switching layers
