# Task Breakdown: Phase 1 MVP -- Milwaukee HOLC Explorer

## Overview

Total Tasks: 10 Task Groups, 78 sub-tasks

**Tech Stack:** Next.js (App Router), Convex, React Three Fiber, Tailwind CSS v4, Claude API (Sonnet 4), GSAP, TypeScript (strict), Vitest, Vercel

**Key References:**

- Spec: `/Users/tarikmoody/Documents/Projects/redlined/agent-os/specs/2026-02-10-phase-1-mvp-milwaukee-holc-explorer/spec.md`
- Requirements: `/Users/tarikmoody/Documents/Projects/redlined/agent-os/specs/2026-02-10-phase-1-mvp-milwaukee-holc-explorer/planning/requirements.md`
- Mockups: `/Users/tarikmoody/Documents/Projects/redlined/agent-os/specs/2026-02-10-phase-1-mvp-milwaukee-holc-explorer/planning/visuals/`
- Design Tokens: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tokens.css`
- Tailwind Colors: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tailwind-colors.md`
- Font Config: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/fonts.md`
- TypeScript Types: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/data-model/types.ts`

---

## Task List

### Project Foundation

#### Task Group 1: Project Scaffolding and Configuration

**Dependencies:** None

- [x] 1.0 Complete project scaffolding and configuration
  - [x] 1.1 Initialize Next.js project with App Router and TypeScript strict mode
    - Use `create-next-app` with TypeScript, ESLint, Tailwind CSS v4, App Router
    - Configure `tsconfig.json` with strict mode enabled
    - Set up project directory structure: `app/`, `components/`, `lib/`, `convex/`, `data/`, `types/`
  - [x] 1.2 Install and configure Convex
    - Run `npx convex dev --once` to initialize the `convex/` directory
    - Create `convex/schema.ts` placeholder
    - Configure Convex client provider in the Next.js app layout (`ConvexClientProvider` wrapper)
    - Verify Convex dashboard is accessible and project is linked
  - [x] 1.3 Install and configure React Three Fiber and Three.js dependencies
    - Install `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`
    - Verify a minimal Canvas renders without errors in a test page
  - [x] 1.4 Install GSAP
    - Install `gsap` package
    - Confirm import works (GSAP is reserved for subtle UI transitions in Phase 1; heavy use is Phase 2)
  - [x] 1.5 Configure Tailwind CSS v4 with design system tokens
    - Integrate design tokens from `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tokens.css` into global CSS
    - Configure Tailwind theme to use HOLC grade colors (A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336), primary (red), secondary (amber), neutral (slate)
    - Follow Tailwind color config from `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tailwind-colors.md`
    - Set dark-first design: no light mode, backgrounds use slate-950 (#0c0a1a) and slate-900 (#0f172a)
  - [x] 1.6 Configure fonts via next/font
    - Load Space Grotesk (headings, zone names, large numbers), Inter (body text, chat), IBM Plex Mono (data values, coordinates, percentiles) using `next/font/google`
    - Follow font config from `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/fonts.md`
    - Apply font CSS variables globally so components reference variables, not hardcoded font names
  - [x] 1.7 Configure ESLint, Prettier, and Vitest
    - Set up ESLint with Next.js and TypeScript rules
    - Configure Prettier for consistent formatting
    - Install and configure Vitest as the test runner
    - Add npm scripts: `lint`, `format`, `test`
  - [x] 1.8 Set up environment variable structure
    - Create `.env.local` (gitignored) with placeholders for `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
    - Document that `CLAUDE_API_KEY` and `CENSUS_API_KEY` are stored in Convex environment config (never in client code or `.env`)
    - Add `.env.example` with placeholder keys
  - [x] 1.9 Verify scaffolding with a smoke test
    - Run `npm run dev` and confirm Next.js app loads
    - Confirm Tailwind classes apply correctly with dark theme
    - Confirm fonts render correctly (Space Grotesk, Inter, IBM Plex Mono)
    - Confirm a basic React Three Fiber Canvas renders

**Acceptance Criteria:**

- Next.js app runs locally with no errors
- Convex is initialized and connected
- Tailwind v4 applies design tokens correctly (HOLC colors, dark backgrounds, font families)
- React Three Fiber renders a basic canvas
- All three font families load and display correctly
- ESLint, Prettier, and Vitest are configured and runnable
- Environment variable structure is documented and gitignored

---

### Data Layer

#### Task Group 2: Convex Schema and Data Seed Pipeline

**Dependencies:** Task Group 1

- [ ] 2.0 Complete Convex schema and data pipeline
  - [ ] 2.1 Write 4-6 focused tests for data layer
    - Test: Convex schema validators accept valid HOLC zone data
    - Test: Convex schema validators accept valid area description data
    - Test: GeoJSON coordinate-to-scene-coordinate projection function produces correct output for known Milwaukee coordinates
    - Test: Area description filtering correctly returns only city_id=201 records
    - Test: Zone-to-description join on area_id produces correct matches (112 of 114 zones have descriptions)
    - Test: Ungraded zones (null grade) are handled without errors
  - [ ] 2.2 Define Convex schema tables
    - **holcZones** table: areaId (string, indexed), cityId (number), grade (string, nullable for 2 ungraded zones), label (string), name (string), polygon (array of coordinate arrays), labelCoords (array of 2 numbers), bounds (object with north/south/east/west), fill (string), residential (boolean), commercial (boolean), industrial (boolean), createdAt (number)
    - **areaDescriptions** table: areaId (string, indexed), cityId (number), grade (string), clarifyingRemarks (string), detrimentalInfluences (string), favorableInfluences (string), infiltrationOf (string), negroYesOrNo (string), negroPercent (string), estimatedAnnualFamilyIncome (string), occupationType (string), descriptionOfTerrain (string), trendOfDesirability (string), createdAt (number)
    - **censusData** table: areaId (string, indexed), geoid (string), pctTract (number), medianIncome (number, nullable), createdAt (number)
    - **conversations** table: sessionId (string, indexed), createdAt (number)
    - **messages** table: conversationId (id reference, indexed), role (string: "user" | "assistant" | "zone-context"), content (string), zoneId (string, optional), createdAt (number)
    - Adapt types from `/Users/tarikmoody/Documents/Projects/redlined/product-plan/data-model/types.ts` -- omit Phase 2 fields (audioState, isAutoNarrated, narrationMuted)
    - Include createdAt timestamps on all records per model standards
  - [ ] 2.3 Rename raw data files to clean names
    - Copy `geojson (1).json` to `data/milwaukee-holc-zones.json`
    - Keep `holc_ad_data.json` as-is (already clean) or copy to `data/holc-area-descriptions.json`
    - Ensure both files are in the `data/` directory for the seed script
  - [ ] 2.4 Create Convex seed script for HOLC zones and area descriptions
    - Convex action (or Node script callable via `npx convex run`) that:
      - Loads `milwaukee-holc-zones.json` (114 features)
      - Filters `holc-area-descriptions.json` to city_id=201 (112 Milwaukee records)
      - Joins on area_id
      - Inserts HOLC zone records into the `holcZones` table
      - Inserts area description records into the `areaDescriptions` table
    - Handle the 2 ungraded zones (null grade) gracefully -- insert with grade as null
    - Log count of inserted records for verification
  - [ ] 2.5 Create Convex queries for data retrieval
    - `getAllMilwaukeeZones`: returns all holcZones records (client loads all 114 at once)
    - `getAreaDescription`: accepts areaId, returns the matching area description record
    - `getCensusDataByZone`: accepts areaId, returns census data records for that zone
    - `getAllCensusData`: returns all census data for computing grade averages
    - `getConversationMessages`: accepts conversationId, returns messages ordered by createdAt
  - [ ] 2.6 Create Convex mutations for conversation management
    - `createConversation`: creates a new conversation record with sessionId, returns the conversation ID
    - `addMessage`: accepts conversationId, role, content, optional zoneId; inserts a message record with createdAt timestamp
    - `addZoneContextDivider`: accepts conversationId, zone name, grade; inserts a "zone-context" role message (e.g., "Now viewing: Bronzeville / 6th & Walnut -- Grade D")
  - [ ] 2.7 Build coordinate projection utility
    - Create `lib/projection.ts` with a Mercator-adjusted projection function
    - Convert WGS84 (EPSG:4326) longitude/latitude to Three.js scene X/Z coordinates
    - Center projection on Milwaukee (43.0389 N, 87.9065 W)
    - Scale to produce reasonable scene-space dimensions for the 114 zones
    - Export function: `projectCoordinate(lng: number, lat: number): [number, number]`
    - Export function: `projectPolygon(coordinates: [number, number][]): [number, number][]`
  - [ ] 2.8 Ensure data layer tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify seed script runs successfully and inserts expected record counts
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4-6 tests written in 2.1 pass
- Convex schema is defined with all 5 tables and proper indexes
- Seed script inserts 114 zone records and 112 area description records
- All Convex queries return expected data
- Mutations create conversation and message records correctly
- Projection utility converts Milwaukee WGS84 coordinates to scene-space values
- 2 ungraded zones are stored with null grades without errors

---

### Census Data Pipeline

#### Task Group 3: Census Income Data Acquisition and Processing

**Dependencies:** Task Group 2

- [ ] 3.0 Complete Census income data pipeline
  - [ ] 3.1 Write 3-4 focused tests for Census pipeline
    - Test: Crosswalk data correctly maps area_id to Census tract GEOID with pct_tract weights
    - Test: Area-weighted income calculation produces correct result for a known zone with multiple tracts
    - Test: Zones with no matching Census tracts receive null income values
    - Test: Grade-level averages (A-zone avg, D-zone avg) are computed correctly from zone-level data
  - [ ] 3.2 Download Census-HOLC crosswalk dataset
    - Download from `americanpanorama/mapping-inequality-census-crosswalk` (2020 tract boundaries)
    - Save to `data/census-holc-crosswalk.json`
    - Fields needed: area_id, GEOID, pct_tract
  - [ ] 3.3 Create Census API data fetcher
    - Convex action (or Node script) that fetches ACS 5-Year median household income (table B19013_001E) by Census tract for Milwaukee County, WI (county FIPS 079, state FIPS 55)
    - Use Census API key stored in Convex environment variables
    - Parse response and produce a map of GEOID to median income value
    - Handle API errors and missing data gracefully (some tracts may lack income data)
  - [ ] 3.4 Compute area-weighted median income per HOLC zone
    - Join crosswalk data (area_id + GEOID + pct_tract) with Census tract income data
    - For each HOLC zone: compute weighted average income = SUM(tract_income \* pct_tract) / SUM(pct_tract)
    - Insert results into Convex `censusData` table
    - Compute and store grade-level averages (A-zone avg, B-zone avg, C-zone avg, D-zone avg) for the comparison bars
  - [ ] 3.5 Compute zone-level percentile ranks
    - Rank all zones by median income
    - Store percentile value (e.g., "8th percentile") alongside income for each zone
    - Compute the insight callout values: ratio of A-zone avg to D-zone avg (e.g., "4.5x higher in A-zones")
  - [ ] 3.6 Ensure Census pipeline tests pass
    - Run ONLY the 3-4 tests written in 3.1
    - Verify Census data records are inserted into Convex
    - Spot-check a few zones against expected income ranges

**Acceptance Criteria:**

- The 3-4 tests written in 3.1 pass
- Crosswalk data is downloaded and parsed
- Census API returns income data for Milwaukee County tracts
- Area-weighted income values are computed and stored for HOLC zones
- Grade-level averages and percentile ranks are computed
- Insight callout values (e.g., "4.5x higher in A-zones / 85 years after HOLC grades were assigned") are derivable from the stored data

---

### 3D Scene

#### Task Group 4: React Three Fiber Scene and HOLC Zone Rendering

**Dependencies:** Task Groups 1, 2

- [ ] 4.0 Complete 3D scene and zone rendering
  - [ ] 4.1 Write 4-6 focused tests for 3D scene
    - Test: Scene component renders a Canvas element without crashing
    - Test: Zone extrusion height mapping returns correct values (D=tallest, C=next, B=next, A=shortest)
    - Test: HOLC color mapping returns correct hex for each grade (A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336, null=gray)
    - Test: Raycasting callback fires with correct zone ID when a zone mesh is clicked
    - Test: Zone label text matches expected format (e.g., "A-1", "D-7")
    - Test: Projection of 114 zone polygons produces non-overlapping, non-degenerate geometry
  - [ ] 4.2 Create the base Canvas and scene setup
    - Create `components/scene/MapCanvas.tsx` with React Three Fiber `<Canvas>`
    - Dark background color (#1A1A2E)
    - Ambient light (soft, ~0.4 intensity) + directional light (position above and to the side, ~0.8 intensity) for 3D shading on extruded blocks
    - OrbitControls from `@react-three/drei` with rotate, zoom, pan enabled
    - OrbitControls configured for both mouse and touch gesture support
    - Camera positioned to frame all 114 Milwaukee zones on initial load (compute bounding box from projected coordinates, set camera FOV and position accordingly)
    - Camera centered over Milwaukee projected coordinates
  - [ ] 4.3 Build HOLC zone extrusion geometry
    - Create `components/scene/HOLCZone.tsx` for individual zone mesh rendering
    - Convert each zone's WGS84 polygon coordinates to scene coordinates using the projection utility from Task 2.7
    - Create `THREE.Shape` from projected 2D polygon coordinates
    - Use `ExtrudeGeometry` with height mapped inversely to grade:
      - D = tallest (e.g., 4.0 units)
      - C = next (e.g., 3.0 units)
      - B = next (e.g., 2.0 units)
      - A = shortest (e.g., 1.0 units)
      - Ungraded = minimal height (e.g., 0.5 units)
    - Tune exact height values so the visual hierarchy matches the mockup style (D blocks dominate)
  - [ ] 4.4 Apply HOLC grade materials and colors
    - `MeshStandardMaterial` for each zone with:
      - Color from HOLC palette: A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336
      - Ungraded zones: neutral gray (#9E9E9E)
      - Opacity: ~0.75 (transparent: true) for visual layering
      - Slight metalness/roughness for the solid block appearance in the mockups (not wireframe)
    - Emissive material change on hover (brighter version of the grade color) for hover feedback
  - [ ] 4.5 Implement raycasting for zone click and hover detection
    - Use React Three Fiber's `onPointerOver`, `onPointerOut`, `onClick` events on zone meshes
    - On hover: apply emissive highlight to the hovered zone mesh; change cursor to pointer
    - On click: dispatch the selected zone's areaId to the application state (triggers info panel population)
    - On pointer out: remove emissive highlight, restore default cursor
  - [ ] 4.6 Add zone ID labels
    - Display zone labels (A-1, B-2, D-7, etc.) as floating text near each zone
    - Use `@react-three/drei` `Html` component or `Text` (troika-three-text) positioned at each zone's `label_coords`
    - Labels should be legible at default zoom but not clutter the scene at zoomed-out views
    - Font: Space Grotesk or a clear sans-serif
  - [ ] 4.7 Add dark gray ground plane
    - Flat plane mesh positioned at y=0 beneath all zone extrusions
    - Color: dark gray (#2A2A3E or similar) to anchor the scene visually
    - Size: large enough to extend beyond the outermost zone boundaries
  - [ ] 4.8 Render all 114 zones from Convex data
    - Create `components/scene/ZoneCollection.tsx` that fetches all zones via the Convex `getAllMilwaukeeZones` query
    - Map over zones and render an `<HOLCZone>` for each
    - Pass grade, polygon coordinates, areaId, label, name to each zone component
    - Handle loading state while Convex query resolves (show nothing or a subtle loading indicator in the canvas)
  - [ ] 4.9 Ensure 3D scene tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Visual verification: 114 zones render as colored extruded blocks with D-grade zones tallest
    - Verify hover and click interactions work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4-6 tests written in 4.1 pass
- Canvas renders with dark background, proper lighting, and orbit controls
- All 114 zones render as extruded 3D blocks with correct HOLC grade colors
- D-grade zones are visually tallest; A-grade zones are shortest
- 2 ungraded zones render in neutral gray with minimal height
- Hovering a zone highlights it; clicking a zone dispatches the selected zone ID
- Zone labels (A-1, B-2, etc.) are visible
- Ground plane anchors the scene
- Orbit controls work with mouse and touch
- Performance target: 60 FPS with 114 extruded polygons

---

### Application Layout

#### Task Group 5: Split-Panel Layout, Header, and Landing Experience

**Dependencies:** Task Groups 1, 4

- [ ] 5.0 Complete application layout and landing experience
  - [ ] 5.1 Write 3-5 focused tests for layout components
    - Test: Header renders "REDLINED" title, subtitle, and "Milwaukee 1938" pill
    - Test: Split-panel layout renders canvas and info panel side-by-side at desktop width
    - Test: Landing overlay renders on first load and dismisses on click
    - Test: Empty state shows "Select a neighborhood" when no zone is selected
    - Test: Coordinates display shows "43.0389 N, 87.9065 W" in IBM Plex Mono
  - [ ] 5.2 Create the main application layout shell
    - Create `app/layout.tsx` with ConvexClientProvider, font loading, global CSS imports
    - Create `app/page.tsx` as the single-page application entry point
    - Dark background (#0c0a1a / slate-950) applied to the body
  - [ ] 5.3 Build the header bar component
    - Create `components/layout/Header.tsx`
    - "REDLINED" in red (#F44336) using Space Grotesk bold
    - "THE SHAPE OF INEQUALITY" in muted slate text (slate-400) to the right
    - "Milwaukee 1938" pill badge (rounded, subtle border, slate-700 background)
    - City selector is static for Phase 1 (no dropdown functionality)
    - Coordinates "43.0389 N, 87.9065 W" displayed below the header on the left in IBM Plex Mono (slate-500)
    - Semantic HTML: `<header>` element, `<h1>` for app title
  - [ ] 5.4 Build the responsive split-panel layout
    - Create `components/layout/SplitPanel.tsx`
    - **Desktop (1280px+):** 70/30 split -- 3D canvas takes 70% width, info/chat panel takes 30%
    - **Tablet (768px-1279px):** 60/40 split -- side-by-side layout
    - **Mobile (<768px):** Canvas takes full viewport; info panel is a slide-up bottom sheet
    - Use Tailwind v4 responsive utilities (mobile-first: default styles are mobile, `md:` for tablet, `xl:` for desktop)
    - Canvas area is the left panel; info panel is the right panel
  - [ ] 5.5 Build the mobile bottom sheet component
    - Create `components/layout/BottomSheet.tsx`
    - Draggable handle at the top for pull-up/pull-down gesture
    - Starts minimized: shows only zone name and grade badge
    - Drag up to reveal full info panel content (zone details, AI chat, etc.)
    - Minimum 44x44px touch targets on all interactive elements
    - Smooth slide animation (GSAP or CSS transition)
  - [ ] 5.6 Build the landing intro overlay
    - Create `components/ui/IntroOverlay.tsx`
    - Displays on first load over the canvas area
    - Content: application title "REDLINED: The Shape of Inequality", brief project description (1-2 sentences about what the tool shows), "Click a zone to begin" call-to-action
    - Dismisses on click/tap anywhere on the overlay or on any canvas interaction
    - Store dismissed state in component state (reappears on page refresh, which is fine for MVP)
    - Typography: Space Grotesk for title, Inter for description
    - Ensure the overlay does not trap keyboard focus
  - [ ] 5.7 Build the info panel empty state
    - Create `components/panel/EmptyState.tsx`
    - Displays when no zone is selected (after intro overlay is dismissed)
    - Content: "Select a neighborhood" heading (h2, Space Grotesk), "Click any zone or building on the map to see its details" instruction text (Inter, slate-400)
    - Icon or subtle visual indicator matching the mockup
  - [ ] 5.8 Add canvas overlay UI elements
    - **HOLC grade legend** (upper-right of canvas): A=Best (green swatch + text), B=Still Desirable (blue), C=Declining (yellow), D=Hazardous (red)
    - **Interaction hints** (bottom of canvas): "Drag to orbit" and "Scroll to zoom" in muted text
    - **Static "1938" year label** (bottom-left of canvas): large text, Space Grotesk, semi-transparent
    - Use `position: absolute` overlays on top of the Canvas container (not inside the Three.js scene) for crisp text rendering
  - [ ] 5.9 Ensure layout tests pass
    - Run ONLY the 3-5 tests written in 5.1
    - Visual verification at all three breakpoints (mobile, tablet, desktop)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3-5 tests written in 5.1 pass
- Header renders with correct branding, typography, pill badge, and coordinates
- Desktop layout shows 70/30 split; tablet shows 60/40; mobile shows full canvas with bottom sheet
- Landing overlay appears on first load and dismisses on interaction
- Empty state shows "Select a neighborhood" when no zone is active
- HOLC legend, interaction hints, and "1938" label render in correct positions on the canvas
- All text meets 4.5:1 contrast ratio against the dark background
- Mobile bottom sheet has draggable handle and 44x44px touch targets
- Proper heading hierarchy: h1 for app title, h2 for zone name, h3 for subsections

---

### Info Panel

#### Task Group 6: Click-to-Inspect Zone Detail Panel

**Dependencies:** Task Groups 4, 5

- [ ] 6.0 Complete click-to-inspect zone detail panel
  - [ ] 6.1 Write 4-6 focused tests for the zone detail panel
    - Test: Panel populates with correct zone name, grade badge color, and grade text when a zone is selected
    - Test: Appraiser description fields render for a D-grade zone with all expected fields present
    - Test: Content warning banner renders for zones containing racist language
    - Test: Content warning is dismissible and does not trap keyboard focus
    - Test: Ungraded zone displays "Ungraded" badge in gray
    - Test: Selecting a different zone updates the panel content
  - [ ] 6.2 Build the zone detail header
    - Create `components/panel/ZoneDetail.tsx`
    - Zone name displayed as h2 (Space Grotesk, white/slate-100)
    - Grade badge: color-coded pill (A=green, B=blue, C=yellow, D=red, Ungraded=gray) with letter + descriptor ("A - Best", "D - Hazardous", "Ungraded")
    - Badge uses the Tailwind HOLC grade utilities (e.g., `bg-green-500/10 text-green-400 border-green-500/30`)
    - HOLC grade text label always accompanies the color (not color-only) per WCAG
  - [ ] 6.3 Build the appraiser description section
    - Create `components/panel/AppraiserDescription.tsx`
    - Section heading: h3 "Appraiser Description" (Space Grotesk)
    - Display fields in labeled subsections:
      - "Clarifying Remarks" -- `clarifying_remarks`
      - "Detrimental Influences" -- `detrimental_influences`
      - "Favorable Influences" -- `favorable_influences`
      - "Infiltration" -- `infiltration_of`
      - "Negro Population" -- `negro_yes_or_no` and `negro_percent`
      - "Estimated Annual Family Income" -- `estimated_annual_family_income`
      - "Occupation / Type" -- `occupation_or_type`
    - Body text in Inter; data values in IBM Plex Mono
    - Only show fields that have non-empty content
    - Fetch data via Convex `getAreaDescription` query using the selected zone's areaId
  - [ ] 6.4 Build the content warning banner
    - Create `components/panel/ContentWarning.tsx`
    - Rendered above appraiser description for zones likely to contain racist language (D-grade zones, or zones where specific fields like `infiltration_of` or `negro_yes_or_no` contain content)
    - Warning text: "The following contains original 1938 language from HOLC appraisers, including racist terminology and discriminatory assessments."
    - Amber/secondary color scheme (amber border, amber-tinted background)
    - "Show description" / "Hide description" toggle button
    - Dismissible: clicking the button reveals the description content
    - Must NOT trap keyboard focus -- Tab key should move past the warning to other interactive elements
    - Visible focus indicator on the toggle button
  - [ ] 6.5 Wire zone selection to panel population
    - Create shared state (React context or Zustand) for selected zone ID
    - When a zone is clicked in the 3D scene (Task 4.5), update the selected zone state
    - ZoneDetail component reads the selected zone state and fetches + displays the corresponding data
    - Transition: panel switches from empty state to populated zone detail
    - On mobile: bottom sheet auto-expands slightly to show zone name and grade when a zone is tapped
  - [ ] 6.6 Ensure info panel tests pass
    - Run ONLY the 4-6 tests written in 6.1
    - Visual verification: click a zone, see full detail panel populate with correct data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4-6 tests written in 6.1 pass
- Clicking a zone populates the info panel with zone name, grade badge, and appraiser fields
- Content warning appears before racist language is shown; it is dismissible
- Content warning does not trap keyboard focus
- Grade badges display both color and text labels
- Ungraded zones show "Ungraded" badge in gray
- Appraiser fields with empty content are hidden
- Data loads from Convex queries
- Panel updates when a different zone is selected

---

### AI Narrative Guide

#### Task Group 7: Claude AI Chat Integration

**Dependencies:** Task Groups 2, 6

- [ ] 7.0 Complete Claude AI Narrative Guide
  - [ ] 7.1 Write 4-6 focused tests for AI chat
    - Test: Convex action for Claude proxy accepts messages array and zone context, returns a response
    - Test: System prompt includes the currently-selected zone's grade, name, and appraiser description fields
    - Test: Zone-context divider message is inserted into conversation when zone selection changes
    - Test: Suggested question pills render when chat is empty or after a new zone selection
    - Test: User message is added to conversation history when submitted
    - Test: Conversation persists across zone selections (messages from prior zone still visible)
  - [ ] 7.2 Create Claude API proxy Convex action
    - Create `convex/ai.ts` with an action `askNarrativeGuide`
    - Accepts: messages array (role + content), zone context object (zone name, grade, appraiser descriptions, Census data if available), recently discussed zones summary (last 2-3 zone names + grades)
    - Constructs the system prompt dynamically:
      - Role: "You are an AI narrative guide for REDLINED, an interactive visualization of Milwaukee's 1938 HOLC redlining zones..."
      - Include currently-selected zone's full data (grade, name, all appraiser fields)
      - Include summary of recently discussed zones for cross-zone comparison context
      - Tone guidance: direct about racism, avoid sanitizing history, connect historical data to present-day outcomes, note Milwaukee's segregation status (from PRD Section 8.1)
      - Output format: flowing prose paragraphs, NOT bulleted lists
    - Calls Claude Sonnet 4 API using the API key from Convex environment variables
    - Returns streaming response for perceived responsiveness
    - Error handling: return user-friendly error message if Claude API fails; implement retry with backoff for transient failures
  - [ ] 7.3 Build the chat panel component
    - Create `components/panel/ChatPanel.tsx`
    - Section heading: h3 "AI Narrative Guide" (Space Grotesk) with a red accent indicator
    - Subtitle: "Ask about any neighborhood, building, or zone" (Inter, slate-400)
    - Messages rendered in a scrollable container
    - User messages: right-aligned or distinct style
    - AI responses: left-aligned, rendered as flowing prose paragraphs (Inter font, slate-200 text)
    - Zone-context divider messages: centered, muted, distinctive style (e.g., "Now viewing: Bronzeville / 6th & Walnut -- Grade D")
    - Auto-scroll to latest message on new content
  - [ ] 7.4 Build the chat input and submit
    - Chat input field at the bottom of the panel
    - Text input with placeholder "Ask about this neighborhood..."
    - Red (#F44336) "Ask" button to the right of the input
    - Submit on Enter key or button click
    - Disable input and button while waiting for AI response
    - On submit: add user message to Convex conversation, then call the Claude proxy action
    - Stream AI response into the chat panel as it arrives
  - [ ] 7.5 Implement suggested question pills
    - Create `components/panel/SuggestedQuestions.tsx`
    - Display four pills when chat is empty or after a new zone selection:
      1. "What happened to Bronzeville?"
      2. "Why was this area graded D?"
      3. "What's the income gap between A and D zones?"
      4. "What was here before the highway?"
    - Styled as rounded outlined buttons (border, no fill, slate/muted text)
    - Clicking a pill submits that question as if the user typed it
    - Pills disappear after a question is asked; reappear when a new zone is selected
  - [ ] 7.6 Implement conversation persistence and zone-context switching
    - Single conversation thread persists across zone selections
    - When user selects a new zone mid-conversation:
      1. Insert a visible zone-context divider message via `addZoneContextDivider` mutation
      2. Update the system prompt for subsequent Claude calls to include the new zone's data
      3. Retain all prior messages in the visible thread
    - System prompt includes the current zone's full data PLUS summary of last 2-3 discussed zones (zone name + grade) for cross-zone comparison context
    - Conversation stored in Convex `conversations` and `messages` tables
  - [ ] 7.7 Handle streaming responses
    - Use Convex actions with streaming support (or implement a pattern where the action streams tokens)
    - Render AI response text incrementally as tokens arrive
    - Performance target: streaming starts within 3 seconds of submission
    - Show a typing/loading indicator while waiting for first token
  - [ ] 7.8 Ensure AI chat tests pass
    - Run ONLY the 4-6 tests written in 7.1
    - Manual verification: ask a question about a selected zone, receive a multi-paragraph prose response
    - Verify zone-context divider appears when switching zones mid-conversation
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4-6 tests written in 7.1 pass
- Claude API calls are proxied through Convex (API key never exposed to client)
- System prompt dynamically includes the selected zone's full HOLC data and appraiser descriptions
- AI responses render as flowing prose paragraphs (not bulleted lists)
- Conversation persists across zone selections with visible zone-context dividers
- Suggested question pills appear when appropriate and function as expected
- Streaming responses start within 3 seconds
- Chat input has proper submit handling (Enter key, button click, disabled while loading)
- Conversation history is stored in Convex

---

### Data Overlay

#### Task Group 8: Census Income Data Overlay Visualization

**Dependencies:** Task Groups 3, 4, 6

- [ ] 8.0 Complete Census income data overlay
  - [ ] 8.1 Write 3-5 focused tests for the data overlay
    - Test: Income-to-color gradient mapping produces red for low income ($2K) and green for high income ($120K)
    - Test: Toggling overlay on replaces HOLC grade colors with income gradient colors on zone meshes
    - Test: Toggling overlay off restores original HOLC grade colors
    - Test: Info panel shows income statistics (median income, percentile, comparison bars) when overlay is active and a zone is selected
    - Test: Opacity slider value changes the zone mesh opacity
  - [ ] 8.2 Build the data overlay toggle UI
    - Create `components/ui/DataOverlayControls.tsx`
    - Positioned upper-left of the canvas as an absolute overlay
    - "DATA OVERLAY" label (IBM Plex Mono, small caps, muted)
    - Four vertically stacked layer buttons:
      1. "Median Income" -- functional, toggleable, highlighted when active
      2. "Health Outcomes" -- disabled/coming-soon (grayed out, no click handler, "Coming Soon" tooltip)
      3. "Environmental Burden" -- disabled/coming-soon
      4. "Assessed Value" -- disabled/coming-soon
    - Active button has a highlighted/selected state (matching mockup: brighter text, accent border)
    - Opacity slider control: range input from 0% to 100%, positioned near the toggle buttons
    - Keyboard accessible: Tab to buttons, Enter to toggle, arrow keys for slider
  - [ ] 8.3 Implement income-to-color gradient mapping
    - Create `lib/colorScale.ts`
    - Red-to-green gradient: $2K (red) to $120K (green) -- matching the mockup legend
    - Linear interpolation across the income range
    - Export function: `incomeToColor(income: number): string` returns hex color
    - Handle null income values (zones without Census data) with a neutral gray
  - [ ] 8.4 Apply overlay colors to zone meshes
    - When "Median Income" overlay is toggled on:
      - Fetch Census data for all zones
      - Replace each zone mesh's material color with the income gradient color
      - Apply the opacity slider value to all zone mesh materials
    - When overlay is toggled off:
      - Restore original HOLC grade colors
      - Restore default opacity (~75%)
    - Transition smoothly (subtle color transition, not jarring swap)
  - [ ] 8.5 Build the income statistics section in the info panel
    - Create `components/panel/IncomeStatistics.tsx`
    - Rendered inside ZoneDetail when the income overlay is active AND a zone is selected
    - Content (matching data-overlays-mockup.png):
      - "MEDIAN INCOME" label (IBM Plex Mono, small, slate-400)
      - Large income number: "$24,800" (Space Grotesk, bold, large, white)
      - Percentile: "8th percentile" (IBM Plex Mono, amber/secondary color)
      - Source note: "A.C.S. Census ACS 5-Year Estimates" (Inter, small, slate-500)
    - "A-ZONE VS D-ZONE" comparison section (h3):
      - Three horizontal bars:
        - A-Zone Avg: green bar + "$105,600" (IBM Plex Mono)
        - This Zone: red bar + "$24,800"
        - D-Zone Avg: red bar + "$23,450"
      - Bar widths proportional to the income values
    - Amber-highlighted insight callout box:
      - "4.5x higher in A-zones" (Space Grotesk, amber text)
      - "85 years after HOLC grades were assigned" (Inter, amber-muted)
      - Values computed dynamically from actual data
  - [ ] 8.6 Build the income gradient legend
    - Create `components/ui/IncomeLegend.tsx`
    - Positioned at the bottom of the canvas
    - "MEDIAN INCOME" label (IBM Plex Mono)
    - Horizontal color gradient bar from red ($2K) to green ($120K)
    - "$2K" label on the left, "$120K" label on the right
    - Only visible when the income overlay is active
  - [ ] 8.7 Ensure data overlay tests pass
    - Run ONLY the 3-5 tests written in 8.1
    - Visual verification: toggle overlay, see zones recolor; select a zone, see income statistics
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3-5 tests written in 8.1 pass
- "Median Income" toggle activates the income overlay; other three buttons are disabled/coming-soon
- Zones recolor with red-to-green income gradient when overlay is active
- Opacity slider controls zone transparency
- Income statistics panel shows median income, percentile, comparison bars, and insight callout
- Income gradient legend appears at canvas bottom when overlay is active
- Toggling overlay off restores HOLC grade colors
- All controls are keyboard accessible

---

### Accessibility

#### Task Group 9: Accessibility and Keyboard Navigation

**Dependencies:** Task Groups 4, 5, 6, 7, 8

- [ ] 9.0 Complete accessibility implementation
  - [ ] 9.1 Write 4-6 focused tests for accessibility
    - Test: Canvas container has role and aria-label attributes
    - Test: All interactive elements (zone meshes, buttons, input fields) have visible focus indicators
    - Test: Tab key navigates through zone selection, panel controls, chat input, and overlay buttons in a logical order
    - Test: Grade badges include text labels in addition to color
    - Test: Content warning does not trap focus (Tab moves past it)
    - Test: Heading hierarchy is correct (h1 > h2 > h3, no skipped levels)
  - [ ] 9.2 Add ARIA attributes to the 3D canvas
    - `role="img"` and `aria-label="3D visualization of 114 Milwaukee HOLC redlining zones from 1938. Zones are extruded as colored blocks: green for A-grade (Best), blue for B-grade (Still Desirable), yellow for C-grade (Declining), red for D-grade (Hazardous). D-grade zones are tallest, representing the lasting damage of redlining."` on the canvas container
    - Hidden screen reader summary paragraph (`sr-only` class) describing the visualization for users who cannot see it
  - [ ] 9.3 Implement keyboard-navigable zone selection
    - Tab through HOLC zones in the 3D scene (logical order: A zones, then B, C, D, or by geographic position)
    - Enter key selects the focused zone (triggers same action as click)
    - Visible focus indicator on the currently-focused zone (distinct from hover highlight -- e.g., a bright outline or pulsing effect)
    - Implementation approach: overlay an invisible HTML element grid or use `tabIndex` on hidden zone-proxy elements that fire click events on the corresponding zone meshes
  - [ ] 9.4 Verify and fix color contrast ratios
    - Check all text against backgrounds for 4.5:1 minimum contrast ratio:
      - White/slate-100 text on slate-900/950 backgrounds
      - Slate-400 text on slate-900/950 backgrounds
      - Red, amber, green text on dark backgrounds
      - HOLC legend text on canvas overlay
    - Fix any failures by adjusting text color brightness
  - [ ] 9.5 Verify heading hierarchy and semantic HTML
    - h1: "REDLINED: The Shape of Inequality" (header)
    - h2: Zone name (when selected) -- "Bronzeville / 6th & Walnut"
    - h3: Subsections -- "Appraiser Description", "AI Narrative Guide", "Income Statistics", etc.
    - All interactive elements use appropriate HTML elements (`<button>`, `<input>`, `<a>`)
    - Navigation uses `<nav>` where applicable
    - Main content area uses `<main>`
    - Info panel sections use `<section>` with aria-labels
  - [ ] 9.6 Add visible focus indicators to all interactive elements
    - Buttons, inputs, links, toggle controls, slider, suggested question pills
    - Use a consistent focus ring style (e.g., `ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900`)
    - Ensure focus indicators are visible against all backgrounds
  - [ ] 9.7 Ensure accessibility tests pass
    - Run ONLY the 4-6 tests written in 9.1
    - Manual keyboard-only navigation test: Tab through the entire application flow
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4-6 tests written in 9.1 pass
- Canvas has ARIA attributes and a screen reader text summary
- Zones are keyboard-navigable with Tab/Enter
- All text meets 4.5:1 contrast ratio against dark backgrounds
- Heading hierarchy is correct with no skipped levels
- All interactive elements have visible focus indicators
- Content warning does not trap keyboard focus
- Grade badges always include text labels alongside colors
- Touch targets on mobile are minimum 44x44px

---

### Deployment and Integration Testing

#### Task Group 10: Deployment and Test Review

**Dependencies:** Task Groups 1-9

- [ ] 10.0 Complete deployment and final testing
  - [ ] 10.1 Configure Vercel deployment
    - Create Vercel project linked to the Git repository
    - Configure build settings for Next.js App Router
    - Set environment variables in Vercel dashboard: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
    - Ensure Convex environment variables are set for production: `CLAUDE_API_KEY`, `CENSUS_API_KEY`
    - Configure Convex production deployment
    - Verify build completes without errors
  - [ ] 10.2 Run data seed pipeline on production Convex
    - Execute the HOLC zone + area description seed script against the production Convex deployment
    - Execute the Census data pipeline against production
    - Verify data counts: 114 zones, 112 descriptions, Census income data for Milwaukee zones
  - [ ] 10.3 Verify production deployment end-to-end
    - Load the deployed URL and verify:
      - Landing overlay appears and dismisses
      - 114 HOLC zones render with correct colors and heights
      - Clicking a zone shows detail panel with appraiser descriptions
      - AI chat sends a question and receives a streaming response
      - Income overlay toggles on/off with correct visualization
      - All three breakpoints render correctly
  - [ ] 10.4 Performance verification
    - Initial page load under 5 seconds on broadband connection
    - 60 FPS rendering in the 3D scene with all 114 zones
    - LLM streaming response starts within 3 seconds of submission
    - Measure and note actual values
  - [ ] 10.5 Review existing tests and fill critical gaps (maximum 10 additional tests)
    - Review all tests from Task Groups 2-9 (approximately 26-40 tests total)
    - Identify critical gaps in end-to-end user workflows:
      - Full flow: load page -> dismiss overlay -> click zone -> read description -> ask AI question -> receive response
      - Full flow: toggle income overlay -> click zone -> see income statistics
      - Cross-zone flow: select zone A -> ask question -> select zone D -> see divider -> ask comparison question
    - Write up to 10 additional strategic tests to fill identified gaps
    - Focus on integration points and end-to-end workflows, NOT exhaustive unit coverage
    - Do NOT test edge cases, performance, or accessibility edge cases unless business-critical
  - [ ] 10.6 Run all feature-specific tests
    - Run ALL tests related to this feature (tests from 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, and 10.5)
    - Expected total: approximately 36-50 tests maximum
    - Verify all pass
    - Fix any failures before marking complete
  - [ ] 10.7 Final cleanup
    - Remove any placeholder or debug code
    - Remove dead code and unused imports (per coding style standards)
    - Verify `.env.example` is up to date
    - Verify no API keys or secrets are committed to version control
    - Ensure all comments are evergreen and informational (per commenting standards)

**Acceptance Criteria:**

- Application is deployed and publicly accessible on Vercel
- Production Convex has all data seeded (114 zones, 112 descriptions, Census income data)
- All three core user flows work end-to-end on production
- Performance targets met: <5s load, 60 FPS, <3s LLM streaming start
- All feature-specific tests pass (approximately 36-50 tests)
- No API keys or secrets in version control
- No dead code, debug artifacts, or temporary comments remain

---

## Execution Order

Recommended implementation sequence with parallel opportunities noted:

```
Phase A: Foundation (sequential)
  1. Task Group 1: Project Scaffolding and Configuration

Phase B: Data Layer (sequential, depends on Phase A)
  2. Task Group 2: Convex Schema and Data Seed Pipeline

Phase C: Core Features (can run in parallel after Phase B)
  3. Task Group 4: React Three Fiber Scene and HOLC Zone Rendering
  4. Task Group 3: Census Income Data Acquisition and Processing
     (3 and 4 can run in parallel -- 3D scene does not depend on Census data)

Phase D: Layout and Panels (depends on Task Group 4)
  5. Task Group 5: Split-Panel Layout, Header, and Landing Experience
  6. Task Group 6: Click-to-Inspect Zone Detail Panel
     (5 and 6 can partially overlap -- 6 depends on the panel container from 5)

Phase E: Feature Integration (depends on Task Groups 2, 6)
  7. Task Group 7: Claude AI Chat Integration
  8. Task Group 8: Census Income Data Overlay Visualization
     (7 and 8 can run in parallel -- they are independent features)

Phase F: Polish and Ship (depends on all above)
  9. Task Group 9: Accessibility and Keyboard Navigation
  10. Task Group 10: Deployment and Test Review
```

### Dependency Graph

```
TG1 (Scaffolding)
  |
  v
TG2 (Schema + Seed)
  |         \
  v          v
TG4 (3D)   TG3 (Census)
  |              |
  v              |
TG5 (Layout)     |
  |              |
  v              |
TG6 (Info Panel) |
  |    \         |
  v     v        v
TG7    TG8 <-----+
(AI)   (Overlay)
  \     /
   v   v
TG9 (Accessibility)
     |
     v
TG10 (Deploy + Test)
```
