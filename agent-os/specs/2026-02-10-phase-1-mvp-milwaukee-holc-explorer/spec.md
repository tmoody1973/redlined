# Specification: Phase 1 MVP -- Milwaukee HOLC Explorer

## Goal

Build a deployable interactive 3D web application that visualizes Milwaukee's 114 HOLC redlining zones as extruded geometry (D-grade tallest), provides click-to-inspect panels with original racist appraiser descriptions, an AI narrative guide powered by Claude, a Census income data overlay, and a responsive split-panel layout -- all backed by Convex and deployed to Vercel.

## User Stories

- As a civic-engaged community member, I want to click on a 3D HOLC zone and read the original 1938 appraiser description so that I can see the explicit racist language that determined my neighborhood's fate.
- As an educator, I want to ask the AI guide questions about what I am seeing so that I can understand the connection between historical redlining grades and present-day income disparities.
- As a journalist, I want to toggle a Census income overlay onto the HOLC zones so that I can visually compare 1938 grades against current median household income and use the data in reporting.

## Specific Requirements

**React Three Fiber 3D Scene**

- Initialize a Canvas with orbit controls (rotate, zoom, pan), dark background (#1A1A2E), and ambient + directional lighting
- Camera positioned to frame all 114 Milwaukee HOLC zones on initial load, centered on Milwaukee coordinates (43.0389 N, 87.9065 W)
- Convert WGS84 GeoJSON polygon coordinates to Three.js scene coordinates using a Mercator-adjusted projection centered on Milwaukee
- Raycasting on pointer events for zone click detection; highlight hovered zone with emissive material change
- Display "Drag to orbit" and "Scroll to zoom" hint text overlaid on the canvas bottom
- HOLC grade legend overlay in upper-right of canvas: A=Best (green), B=Still Desirable (blue), C=Declining (yellow), D=Hazardous (red) with color swatches and text labels

**HOLC Zone Extrusion and Rendering**

- Extrude each of the 114 zone polygons using ExtrudeGeometry with height inversely mapped to grade: D=tallest, C=next, B=next, A=shortest -- so redlined damage dominates the scene visually
- Color zones with HOLC palette: A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336; 2 ungraded zones rendered with neutral gray and labeled "Ungraded"
- MeshStandardMaterial with approximately 75% opacity for visual layering and slight 3D shading (matching the solid block style in mockups, not wireframe)
- Display zone ID labels (A-1, B-2, D-7, etc.) as floating text or HTML overlays near each zone using label_coords from GeoJSON
- Dark gray ground plane beneath the zones to anchor the scene

**Click-to-Inspect Info Panel**

- Clicking a zone populates the right-side info panel with: zone grade (color-coded badge), neighborhood name, and HOLC area description fields
- Appraiser fields displayed: clarifying_remarks, detrimental_influences, favorable_influences, infiltration_of, negro_yes_or_no, negro_percent, estimated_annual_family_income, occupation_or_type
- Display a dismissible content warning banner before showing zones that contain racist language (most D-grade zones); the warning must not trap keyboard focus
- Use semantic HTML: h2 for zone name, h3 for subsections ("Appraiser Description", "Demographics"), proper heading hierarchy

**Claude AI Narrative Guide**

- Chat panel in the right sidebar below the zone info, integrated with Claude Sonnet 4 via Convex actions (protecting API key server-side)
- System prompt dynamically constructed per request: currently-selected zone's full HOLC data + appraiser descriptions + summary of last 2-3 discussed zones for cross-zone comparison context
- Conversation persists as a single thread across zone selections; when user selects a new zone, insert a visible zone-context divider message (e.g., "Now viewing: Bronzeville / 6th & Walnut -- Grade D") and update the system prompt
- Four suggested question pills displayed when chat is empty or after a new zone selection: "What happened to Bronzeville?", "Why was this area graded D?", "What's the income gap between A and D zones?", "What was here before the highway?"
- Streaming responses from Claude for perceived responsiveness; AI responses render as flowing prose paragraphs, not bulleted lists
- Chat input field at panel bottom with red (#F44336) "Ask" button
- Conversation history stored in Convex

**Census Income Data Overlay**

- Download and process the Census-HOLC crosswalk from americanpanorama/mapping-inequality-census-crosswalk (2020 tract boundaries with area_id, GEOID, pct_tract)
- Fetch ACS 5-Year median household income by Census tract from the Census API and join to HOLC zones using area-weighted percentages (pct_tract field)
- Toggleable overlay that recolors zone geometry from a red-to-green income gradient (replacing HOLC grade colors when active)
- Opacity slider for overlay intensity control
- When overlay is active and a zone is selected, the info panel shows: median income (large number in Space Grotesk), percentile rank (IBM Plex Mono), A-zone avg vs this zone vs D-zone avg comparison bars, and an insight callout with amber highlight (e.g., "4.5x higher in A-zones / 85 years after HOLC grades were assigned")
- Color gradient legend at canvas bottom showing income range ($2K to $120K)
- Data overlay toggle UI built as vertical stack of layer buttons in the upper-left of the canvas; only "Median Income" is functional; the other three (Health Outcomes, Environmental Burden, Assessed Value) should render as disabled/coming-soon

**Landing Experience and Header**

- Lightweight intro overlay on first load: application title "REDLINED: The Shape of Inequality", brief description of the project, and a "Click a zone to begin" call-to-action that dismisses on click/tap or any canvas interaction
- After dismissal, the right panel shows the "Select a neighborhood" empty state with instructional text matching the mockup
- Top header bar: "REDLINED" in red (Space Grotesk bold), "THE SHAPE OF INEQUALITY" in muted slate text, city selector pill showing "Milwaukee 1938"
- Coordinates (43.0389 N, 87.9065 W) displayed below the header on the left in IBM Plex Mono
- Static "1938" year label at bottom-left of canvas (the time slider shown in the mockup is a Phase 2 feature; render only the static year for context)

**Responsive Layout**

- Mobile-first progressive enhancement with three breakpoints using Tailwind CSS v4
- Mobile (default, < 768px): 3D canvas takes full viewport; info/chat panel is a slide-up bottom sheet with draggable handle, starting minimized showing zone name and grade badge; minimum 44x44px touch targets
- Tablet (768px - 1279px): Side-by-side layout at approximately 60/40 split
- Desktop (1280px+): Side-by-side 70/30 split matching the mockups; full info panel with zone details, AI chat, suggested questions, and overlay controls all visible
- Orbit controls must work with both mouse and touch gestures

**Convex Backend Architecture**

- Convex schema defining tables for: holcZones (zone polygons, grades, metadata), areaDescriptions (appraiser text fields, joined on areaId), censusData (tract-level income data with HOLC zone crosswalk), conversations (message history with zone context)
- Convex queries for: fetching all Milwaukee zones, fetching area description by areaId, fetching census data by zone, fetching conversation messages
- Convex mutations for: creating/appending conversation messages, inserting zone-context divider messages
- Convex actions for: Claude API proxy (accepts messages array + zone context, returns streaming response), Census data fetching/processing (one-time seed)
- All timestamps on records (createdAt) per model standards
- Environment variables for Claude API key and Census API key stored in Convex environment config, never in client code

**Data Pipeline and Seed Process**

- Rename raw files: `geojson (1).json` to `milwaukee-holc-zones.json`, `holc_ad_data.json` stays as-is (already clean)
- Seed script (Convex action or Node script) that: loads milwaukee-holc-zones.json, filters holc_ad_data.json to city_id=201 (112 Milwaukee records), joins on area_id, and inserts into Convex tables
- Census pipeline: download crosswalk GeoJSON, fetch ACS 5-Year income data, compute area-weighted median income per HOLC zone, insert into Convex censusData table
- Client loads zone geometry and descriptions from Convex queries; full JSON client-side filtering at runtime as user specified

**Accessibility**

- Keyboard-navigable zone selection: Tab through zones, Enter to select, in addition to mouse/click/tap
- HOLC grade colors always accompanied by text labels (A/B/C/D + "Best"/"Still Desirable"/"Declining"/"Hazardous") since color alone does not meet WCAG
- ARIA attributes on the 3D canvas (role, aria-label) and all interactive elements
- Screen reader text alternative/summary for the 3D visualization (hidden descriptive text summarizing what the scene shows)
- 4.5:1 minimum contrast ratio for all text; verified against the dark background palette
- Visible focus indicators on all interactive elements
- Proper heading hierarchy throughout (h1 for app title, h2 for zone name, h3 for subsections)

## Visual Design

**`planning/visuals/map-explorer-mockup.png`**

- 70/30 split-panel layout: dark 3D canvas left, slate info/chat panel right
- Extruded HOLC zones rendered as solid color-coded blocks (green/blue/yellow/red) at varying heights on a dark gray ground plane -- not wireframe
- Top-left: "REDLINED" red branding, "THE SHAPE OF INEQUALITY" muted subtitle, "Milwaukee 1938" pill badge, coordinates below
- Upper-right of canvas: HOLC grade legend with color swatches (A=Best, B=Still Desirable, C=Declining, D=Hazardous)
- Right panel empty state: "Select a neighborhood" heading with "Click any zone or building on the map to see its details" instruction
- "AI Narrative Guide" section with four suggested question pills (rounded outlined buttons)
- Text input at bottom with red "Ask" button
- Bottom of canvas: "Drag to orbit" and "Scroll to zoom" hints; "1938" large year label bottom-left
- Time slider at very bottom spans 1910-Now -- this is a Phase 2 feature; omit or render as static "1938" label only

**`planning/visuals/narrative-guide-mockup.png`**

- Active AI conversation about Bronzeville with multi-paragraph flowing prose response covering neighborhood history (1910s-40s jazz clubs, I-43 highway, present-day $52,000 property values vs $135,000 city median)
- Chat rendered in threaded format with clear visual hierarchy; AI responses are paragraphs, not bullet lists
- Follow-up question from user shown inline: "What was here before the highway?"
- "Select a neighborhood" section visible in upper-right of the panel
- Chat input at bottom of panel
- The overall tone and depth of AI responses shown here should be the target for the Claude system prompt design

**`planning/visuals/data-overlays-mockup.png`**

- Census income overlay active: zones recolored with green-to-red income gradient replacing HOLC grade colors
- Zone labels (A-1, A-5, C-4, C-8, D-7, D-8) visible on blocks
- Upper-left "DATA OVERLAY" section with four vertically stacked layer buttons: Median Income (active/highlighted), Health Outcomes, Environmental Burden, Assessed Value; only Median Income functional for Phase 1
- Opacity slider control next to the layer buttons
- Right panel shows zone detail for "Bronzeville / 6th & Walnut": Grade D badge, median income $24,800 (8th percentile), A-Zone vs D-Zone comparison horizontal bars (A-Zone Avg: $105,600, This Zone: $24,800, D-Zone Avg: $23,450)
- Amber-highlighted insight callout: "4.5x higher in A-zones / 85 years after HOLC grades were assigned"
- Bottom of canvas: "MEDIAN INCOME" color gradient legend from $2K (red) to $120K (green)

## Existing Code to Leverage

**Design System Tokens (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tokens.css`)**

- CSS custom properties for HOLC grade colors (A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336), era colors, font families, and scene/app background colors
- Use these as the single source of truth for the Tailwind theme configuration and Three.js material colors
- Integrate into the global CSS layer so all components reference tokens rather than hardcoded hex values

**Tailwind Color Config (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tailwind-colors.md`)**

- Maps design tokens to Tailwind utility classes: primary=red, secondary=amber, neutral=slate
- Provides specific utility patterns for buttons (bg-red-600), panels (bg-slate-900/950), text hierarchy (slate-200/400/600), HOLC grade badges (bg-green-500/10 text-green-400 border-green-500/30)
- Dark-first design confirmed; no light mode; use these patterns directly in component markup

**Font Configuration (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/fonts.md`)**

- Google Fonts import for Space Grotesk (headings, zone names, big numbers), Inter (body text, chat), IBM Plex Mono (data values, coordinates, percentiles)
- Load via next/font for performance optimization rather than the raw Google Fonts link tag
- Follow the inline style pattern documented for font-family application on components

**TypeScript Data Model Types (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/data-model/types.ts`)**

- Pre-defined interfaces for HOLCZone, CensusTract, Conversation, Message, OverlayLayer, MetricValue, GradeAverages, and related enums (HOLCGrade, MessageRole, OverlayLayerId)
- Adapt these interfaces as the basis for Convex schema definitions (converting to Convex's v.object/v.string/v.number validators)
- The Message type includes audioState and isAutoNarrated fields which are Phase 2 (ElevenLabs); omit those fields from the Phase 1 Convex schema
- The Conversation type has a single zoneId; for Phase 1 the conversation spans multiple zones, so adapt to store an array of discussed zone IDs or omit this field

**Product PRD (`/Users/tarikmoody/Documents/Projects/redlined/Redlined-PRD.docx.md`)**

- Contains the full AI Narrative Guide system prompt design philosophy (Section 8.1): direct about racism, avoid sanitizing history, connect historical data to present-day outcomes, note Milwaukee's segregation status
- Use the suggested interaction prompts from Section 8.3 as the basis for the four suggested question pills
- Performance targets from Section 13 (5s load, 60 FPS, 3s LLM streaming) are the benchmarks for this spec

## Out of Scope

- ElevenLabs voice narration and audio playback of appraiser descriptions (Phase 2)
- MPROP building-level data, individual building extrusion, and parcel boundary integration (Phase 2)
- Ghost building detection and wireframe rendering of demolished structures (Phase 2)
- Sanborn fire insurance map ground-plane texture (Phase 2)
- Time slider with animated era transitions using GSAP (Phase 2; render only static "1938" label)
- Guided Bronzeville narrative with auto-camera waypoints (Phase 3)
- Health Outcomes, Environmental Burden, Assessed Value, and Tree Canopy data overlays (Phase 3; buttons render as disabled/coming-soon only)
- Historical photograph integration from Library of Congress (Phase 3)
- "What If" counterfactual mode using LLM (Phase 3)
- Multi-city support for Chicago, Detroit, Atlanta and the city selector dropdown (Phase 3; show "Milwaukee 1938" as static pill)
- Embeddable iframe mode for news organizations (Phase 3)
- Original 1938 HOLC map scan as toggleable overlay (stretch goal; not required for MVP)
- VR/AR mode, racial covenants layer, community memory/oral histories, Radio Milwaukee audio integration (future phases)
