# Redlined: The Shape of Inequality — Product Overview

## Summary

Redlined is an interactive 3D web application that visualizes the lasting impact of HOLC redlining maps on American cities. Using Three.js for immersive 3D rendering and AI-powered narration, it transforms 1930s government grading data into an experience where users can see — building by building — how racist housing policy shaped the physical and economic landscape of neighborhoods that exist today. Starting with Milwaukee, one of America's most segregated cities.

## Planned Sections

1. **3D Map Explorer** — Interactive Three.js scene with HOLC zones extruded by grade, orbit controls, and click-to-inspect neighborhood details.
2. **AI Narrative Guide** — Chat panel powered by Claude with neighborhood-aware context, suggested prompts, and ElevenLabs voice narration.
3. **Building-Level Detail** — MPROP property data and parcel boundaries extruded as individual buildings within HOLC zones, color-coded by era.
4. **Ghost Buildings & Time Slider** — Historical comparison revealing demolished structures as red wireframes, with animated time transitions from 1910 through present day.
5. **Data Overlays** — Census income, CDC health outcomes, environmental burden, and assessed value layers showing the present-day consequences of redlining.

## Data Model

Core entities and their relationships:

- **City** — Top-level container (Milwaukee first, 200+ cities with HOLC data)
- **HOLCZone** — Graded neighborhood polygon from 1938 HOLC maps (A through D)
- **Building** — Current property from Milwaukee MPROP (address, year built, stories, assessed value)
- **GhostBuilding** — Demolished structure identified via historical MPROP comparison
- **CensusTract** — Demographic and health data from ACS, CDC PLACES, EPA EJScreen
- **SanbornMap** — Georeferenced historical fire insurance map tiles (1894, 1910, 1927)
- **Conversation** — AI Guide chat session with zone-aware context

**Relationships:**

- City has many HOLCZones
- HOLCZone contains many Buildings and GhostBuildings
- HOLCZone overlaps with many CensusTracts
- HOLCZone is covered by many SanbornMaps
- Conversation is contextual to one HOLCZone or Building

## Design System

**Colors:**

- Primary: `red` — HOLC D-grade zones, ghost buildings, action elements
- Secondary: `amber` — Callouts, warnings, differential highlights
- Neutral: `slate` — Backgrounds, borders, body text

**Typography:**

- Heading: Space Grotesk — Bold, geometric, data-visualization feel
- Body: Inter — Clean, highly legible body text
- Mono: IBM Plex Mono — Data readouts, coordinates, property records

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **3D Map Explorer** — Core Three.js viewport with HOLC zone extrusion, orbit controls, click-to-inspect
3. **AI Narrative Guide** — Claude-powered chat panel with zone-aware context and ElevenLabs voice
4. **Building-Level Detail** — MPROP building extrusion within zones, era color coding, property info panel
5. **Ghost Buildings & Time Slider** — Demolished structure wireframes with GSAP-driven era transitions
6. **Data Overlays** — Choropleth color fills for income, health, environment, and property value

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
