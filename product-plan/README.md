# Redlined: The Shape of Inequality — Product Plan

This is the complete design and implementation package for **Redlined**, an interactive 3D web application that visualizes the lasting impact of HOLC redlining maps on American cities.

## Quick Start

### Option A: Full Implementation (One Session)

1. Copy `prompts/one-shot-prompt.md` into your coding agent
2. Provide `product-overview.md` for context
3. Provide `instructions/one-shot-instructions.md` as the implementation guide
4. The agent will build all 6 milestones sequentially

### Option B: Incremental Implementation (Section by Section)

1. Copy `prompts/section-prompt.md` into your coding agent
2. Always provide `product-overview.md` for context
3. Start with `instructions/incremental/01-foundation.md`
4. After each milestone, move to the next numbered file
5. Each milestone builds on the previous one

## Package Contents

```
product-plan/
├── README.md                          ← You are here
├── product-overview.md                ← Product summary (always provide this)
│
├── prompts/                           ← Ready-to-paste prompts
│   ├── one-shot-prompt.md             ← For full implementation
│   └── section-prompt.md              ← For incremental builds
│
├── instructions/                      ← Implementation guides
│   ├── one-shot-instructions.md       ← All milestones combined
│   └── incremental/                   ← Milestone-by-milestone
│       ├── 01-foundation.md
│       ├── 02-3d-map-explorer.md
│       ├── 03-ai-narrative-guide.md
│       ├── 04-building-level-detail.md
│       ├── 05-ghost-buildings-time-slider.md
│       └── 06-data-overlays.md
│
├── design-system/                     ← Visual design tokens
│   ├── tokens.css                     ← CSS custom properties
│   ├── tailwind-colors.md             ← Tailwind color guide
│   └── fonts.md                       ← Google Fonts setup
│
├── data-model/                        ← Core data structures
│   ├── README.md                      ← Entity descriptions
│   ├── types.ts                       ← TypeScript interfaces
│   └── sample-data.json               ← Representative data
│
├── shell/                             ← Application shell
│   ├── README.md                      ← Shell documentation
│   └── components/                    ← Shell React components
│       ├── AppShell.tsx
│       ├── MainNav.tsx
│       ├── BottomToolbar.tsx
│       ├── InfoPanel.tsx
│       └── index.ts
│
└── sections/                          ← Feature sections
    ├── 3d-map-explorer/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   ├── map-explorer.png
    │   └── components/
    │       ├── MapExplorer.tsx
    │       ├── ZoneBlock.tsx
    │       └── index.ts
    │
    ├── ai-narrative-guide/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   ├── narrative-guide.png
    │   └── components/
    │       ├── NarrativeGuide.tsx
    │       ├── ChatMessage.tsx
    │       ├── AudioWaveform.tsx
    │       └── index.ts
    │
    ├── building-level-detail/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   ├── building-detail.png
    │   └── components/
    │       ├── BuildingDetail.tsx
    │       ├── BuildingBlock.tsx
    │       ├── BuildingInfoPanel.tsx
    │       └── index.ts
    │
    ├── ghost-buildings-time-slider/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   ├── ghost-buildings.png
    │   └── components/
    │       ├── GhostBuildingsTimeSlider.tsx
    │       ├── GhostBlock.tsx
    │       ├── GhostInfoPanel.tsx
    │       └── index.ts
    │
    └── data-overlays/
        ├── README.md
        ├── tests.md
        ├── types.ts
        ├── sample-data.json
        ├── data-overlays.png
        └── components/
            ├── DataOverlays.tsx
            ├── OverlayStatsPanel.tsx
            └── index.ts
```

## Design System

| Token        | Value         | Usage                                  |
| ------------ | ------------- | -------------------------------------- |
| Primary      | `red`         | HOLC D-grade, ghost buildings, actions |
| Secondary    | `amber`       | Callouts, warnings, differentials      |
| Neutral      | `slate`       | Backgrounds, borders, text             |
| Heading font | Space Grotesk | Bold geometric display                 |
| Body font    | Inter         | Clean legible body text                |
| Mono font    | IBM Plex Mono | Data, coordinates, records             |

## HOLC Grade Colors

| Grade | Color  | Hex       | Label             |
| ----- | ------ | --------- | ----------------- |
| A     | Green  | `#4CAF50` | "Best"            |
| B     | Blue   | `#2196F3` | "Still Desirable" |
| C     | Yellow | `#FFEB3B` | "Declining"       |
| D     | Red    | `#F44336` | "Hazardous"       |

## Key Data Sources

| Source               | URL                                        | Format       |
| -------------------- | ------------------------------------------ | ------------ |
| HOLC Maps            | University of Richmond Mapping Inequality  | GeoJSON      |
| Milwaukee Properties | City of Milwaukee Open Data Portal (MPROP) | CSV          |
| Census Income        | U.S. Census ACS 5-Year Estimates           | API          |
| Health Outcomes      | CDC PLACES                                 | CSV          |
| Environmental Burden | EPA EJScreen                               | API          |
| Historical Maps      | UWM Libraries ArcGIS                       | Tile service |

## Tech Stack (Recommended)

- **3D Rendering:** Three.js with React Three Fiber
- **Animation:** GSAP for era transitions
- **AI:** Claude Sonnet 4 API (streaming)
- **Voice:** ElevenLabs TTS API
- **Styling:** Tailwind CSS v4
- **Framework:** Next.js or Vite + React
