# Redlined: The Shape of Inequality

Interactive 3D visualization of HOLC redlining maps revealing how 1930s policy decisions shaped American cities, building by building. Starting with Milwaukee, WI.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript (strict)
- **Backend:** Convex (document database, server functions, file storage)
- **3D:** Three.js via React Three Fiber
- **Animation:** GSAP (GreenSock)
- **AI:** Claude API (Sonnet 4) via Convex actions
- **Voice:** ElevenLabs API (Phase 2+)
- **Styling:** Tailwind CSS v4
- **Fonts:** Space Grotesk (headings), Inter (body), IBM Plex Mono (data)
- **Testing:** Vitest
- **Linting:** ESLint + Prettier
- **Deploy:** Vercel (frontend) + Convex Cloud (backend)

## Project Structure

```
redlined/
├── agent-os/                  # Product planning and specs
│   ├── product/               # Mission, roadmap, tech stack
│   ├── specs/                 # Feature specifications and task lists
│   └── standards/             # Coding standards
├── product-plan/              # Design system, section mockups, instructions
├── data/                      # Processed data files (after cleanup)
│   ├── milwaukee-holc-zones.json
│   ├── holc-area-descriptions.json
│   └── ...
├── src/                       # Next.js application (when scaffolded)
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── convex/                # Convex schema, queries, mutations, actions
│   └── lib/                   # Utilities, projections, data processing
└── public/                    # Static assets
```

## Key Data Files (Project Root — Pre-Processing)

- `geojson (1).json` — Milwaukee HOLC zones (114 features, has neighborhood names, label_coords, bounds)
- `holc_ad_data.json` — HOLC area descriptions (7,930 records, 112 Milwaukee, joins on `area_id`)
- `mappinginequality (1).json` — All 300 cities HOLC data (Phase 3)
- `mappinginequality.gpkg` — GeoPackage version of all cities

## Design Decisions

- **Zone extrusion:** D=tallest (redlined areas dominate the scene)
- **HOLC palette:** A=#4CAF50 (green), B=#2196F3 (blue), C=#FFEB3B (yellow), D=#F44336 (red)
- **Dark background:** #1A1A2E
- **Layout:** 70/30 split panel (3D left, info/chat right), mobile uses bottom sheet
- **Chat persistence:** Single conversation thread across zone selections with zone-context dividers
- **Content warning:** Dismissible banner before showing racist appraiser language
- **Ungraded zones:** Neutral gray, labeled "Ungraded"

## Architecture Patterns

- All backend logic through Convex (queries, mutations, actions)
- Claude API proxied through Convex actions (never expose API keys client-side)
- HOLC data loaded client-side from JSON, filtered at runtime
- Census data joined to HOLC zones via area-weighted crosswalk (pct_tract)
- Convex tables: zones, area_descriptions, conversations, messages, census_income

## Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev server
npm run seed         # Seed Convex with HOLC data
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest
```

## Current Phase

**Phase 1 MVP — Milwaukee HOLC Explorer**

- Spec: `agent-os/specs/2026-02-10-phase-1-mvp-milwaukee-holc-explorer/spec.md`
- Tasks: `agent-os/specs/2026-02-10-phase-1-mvp-milwaukee-holc-explorer/tasks.md`

## Important Notes

- Never commit `.env` files or API keys
- The appraiser descriptions contain racist language — this is intentional and historically accurate. Always display with content warnings.
- All data sources are freely available public datasets (CC-BY-NC for some)
- Phase 1 excludes: ElevenLabs voice, Sanborn maps, MPROP buildings, time slider, ghost buildings, multi-city
