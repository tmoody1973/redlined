# Redlined: The Shape of Inequality

> An interactive 3D visualization of HOLC redlining maps revealing how 1930s policy decisions shaped American cities, building by building.

![Milwaukee HOLC Map](product-plan/sections/3d-map-explorer/map-explorer.png)

## Overview

Redlined transforms the Home Owners' Loan Corporation's 1938 neighborhood grading data into an immersive 3D experience. Users can explore Milwaukee's 114 HOLC zones as extruded geometry, read the original racist appraiser descriptions, ask an AI guide questions about what they're seeing, and toggle Census income data to see how 1930s policy maps onto present-day inequality.

The project starts with Milwaukee, Wisconsin — one of the most segregated cities in America — where the connection between 1938 HOLC grades and today's outcomes is stark and well-documented.

**Created by [Tarik Moody](https://github.com/tmoody1973)** | Radio Milwaukee / The Intersection | Black History Month 2026

## Features

- **3D HOLC Zone Explorer** — 114 Milwaukee zones extruded by grade (D-grade tallest, making redlined damage dominate the scene), color-coded with the original HOLC palette
- **Click-to-Inspect** — Select any zone to read the original 1938 appraiser language, including the explicitly racist descriptions that determined each neighborhood's fate
- **AI Narrative Guide** — Ask Claude questions about what you're seeing. The AI guide is grounded in actual HOLC data and appraiser text, providing historically accurate context
- **Census Income Overlay** — Toggle present-day median household income data onto the 1938 zones, revealing the 85-year throughline from policy to poverty
- **Responsive Design** — Desktop split-panel layout, tablet adaptation, mobile bottom-sheet pattern

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) + TypeScript |
| Backend | Convex (database, server functions, file storage) |
| 3D Rendering | Three.js via React Three Fiber |
| Animation | GSAP (GreenSock) |
| AI | Claude API (Sonnet 4) via Convex actions |
| Styling | Tailwind CSS v4 |
| Testing | Vitest |
| Deployment | Vercel + Convex Cloud |

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- [Convex account](https://convex.dev) (free tier)
- [Anthropic API key](https://console.anthropic.com) (for AI guide)
- [Census API key](https://api.census.gov/data/key_signup.html) (free, for income overlay)

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
```

Set these in your Convex dashboard (Settings > Environment Variables):

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for AI narrative guide | Yes |
| `CENSUS_API_KEY` | US Census API key for income data | Yes |

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
```

## Project Structure

```
redlined/
├── CLAUDE.md                    # Project context for AI assistants
├── Redlined-PRD.docx.md         # Full product requirements document
│
├── agent-os/                    # Product planning
│   ├── product/                 # Mission, roadmap, tech stack
│   ├── specs/                   # Feature specifications
│   │   └── 2026-02-10-phase-1-mvp-milwaukee-holc-explorer/
│   │       ├── spec.md          # Detailed specification
│   │       └── tasks.md         # Implementation task list
│   └── standards/               # Coding standards
│
├── product-plan/                # Design system and mockups
│   ├── design-system/           # Tokens, colors, fonts
│   ├── sections/                # Feature mockups and reference components
│   └── instructions/            # Build guides
│
├── src/                         # Application source (Next.js)
│   ├── app/                     # App Router pages
│   ├── components/              # React components
│   ├── convex/                  # Convex schema, queries, actions
│   └── lib/                     # Utilities, projections
│
└── data/                        # Processed data files
```

## Data Sources

All data is freely available and publicly accessible.

| Dataset | Source | Use |
|---------|--------|-----|
| HOLC Zones (Milwaukee) | [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/) | 114 zone polygons with grades A-D |
| HOLC Area Descriptions | [americanpanorama/HOLC_Area_Description_Data](https://github.com/americanpanorama/HOLC_Area_Description_Data) | Original appraiser text (112 Milwaukee records) |
| Census-HOLC Crosswalk | [americanpanorama/mapping-inequality-census-crosswalk](https://github.com/americanpanorama/mapping-inequality-census-crosswalk) | Links HOLC zones to Census tracts |
| Census ACS 5-Year | [api.census.gov](https://api.census.gov) | Median household income by tract |
| HOLC Zones (All Cities) | [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/) | 10,154 zones across 300 cities (Phase 3) |

## Roadmap

### Phase 1: MVP — Milwaukee HOLC Explorer (Current)
3D zone visualization, click-to-inspect with appraiser text, AI narrative guide, Census income overlay, responsive layout, Vercel deployment.

### Phase 2: Building-Level Detail
Individual building extrusion from MPROP data (160K properties), ghost buildings for demolished structures, time slider, Sanborn historical map overlay, ElevenLabs voice narration.

### Phase 3: Full Narrative Experience
Guided Bronzeville narrative, health/environment data overlays, historical photographs, "What If" counterfactual mode, multi-city support (Chicago, Detroit, Atlanta), embeddable iframe mode.

## Content Advisory

This application displays the original language used by HOLC appraisers in the 1930s, which includes explicitly racist descriptions of neighborhoods and their residents. This language is presented with content warnings as historical evidence — the words should be uncomfortable because the policy was.

## License

Data sources are subject to their respective licenses:
- Mapping Inequality / American Panorama data: [CC-BY-NC](https://creativecommons.org/licenses/by-nc/2.0/)
- Census data: Public domain
- Application code: [MIT](LICENSE)

## Acknowledgments

- [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/) — University of Richmond Digital Scholarship Lab
- [American Panorama](https://github.com/americanpanorama) — Open-source historical data
- [Radio Milwaukee](https://radiomilwaukee.org) / [The Intersection](https://theintersection.substack.com)
