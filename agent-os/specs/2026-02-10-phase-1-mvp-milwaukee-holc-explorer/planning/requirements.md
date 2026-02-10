# Spec Requirements: Phase 1 MVP -- Milwaukee HOLC Explorer

## Initial Description

Phase 1 MVP -- Milwaukee HOLC Explorer. This covers all 8 items from the roadmap:

1. **HOLC GeoJSON Loading and Parsing** -- Load Milwaukee HOLC zone data from `geojson (1).json` (114 features with neighborhood names, label coordinates, bounding boxes). Join with appraiser descriptions from `holc_ad_data.json` on `area_id`.
2. **Three.js Scene Setup** -- Initialize React Three Fiber canvas with camera, lighting, orbit controls, dark background (0x1A1A2E).
3. **HOLC Zone Extrusion** -- Extrude zone polygons into 3D geometry with height mapped to grade. HOLC palette: A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336.
4. **Click-to-Inspect Panel** -- Clicking a zone shows grade, neighborhood name, and original appraiser text (clarifying_remarks, detrimental_influences, infiltration_of, negro data).
5. **Claude AI Narrative Guide** -- Chat panel with Claude API, zone-aware system prompts including appraiser descriptions.
6. **Census Income Data Overlay** -- ACS 5-Year income data joined via Census-HOLC crosswalk, toggleable color overlay.
7. **Split Panel Layout and Responsive UI** -- 3D canvas left, info/chat panel right, navigation, legend, layer toggles.
8. **Vercel Deployment** -- Vercel project with Convex backend, environment variables.

**Tech Stack:** Next.js (App Router), Convex, React Three Fiber, Tailwind CSS v4, Claude API (Sonnet 4), GSAP.

## Requirements Discussion

### First Round Questions

**Q1:** The roadmap lists 8 items for Phase 1, and item 6 (Census Income Data Overlay) requires downloading the Census-HOLC crosswalk from GitHub and fetching ACS 5-Year data from the Census API. I'm assuming you want to include this in the MVP, but it introduces external API dependencies (Census API key signup, crosswalk data processing, area-weighted joins). Would you prefer to include the Census income overlay in the MVP as planned, or defer it to Phase 2 and keep the MVP focused on the HOLC data you already have in-hand (GeoJSON + area descriptions)?
**Answer:** Yes, include it in the MVP.

**Q2:** I notice the GeoJSON has 114 features but 2 have `null` grades (not A/B/C/D). I'm assuming we should still render those zones but with a neutral color and label them as "Ungraded" in the UI. Is that correct, or should we exclude them entirely?
**Answer:** Yes, render with neutral color labeled "Ungraded."

**Q3:** The `holc_ad_data.json` file contains 7,930 records across all cities, but only 112 match Milwaukee (city_id=201). The GeoJSON has 114 features. I'm assuming we will filter the area descriptions at build time to only the Milwaukee subset, and that the 2-record mismatch (114 zones vs 112 descriptions) is expected since those are likely the ungraded zones. Should we pre-process and store the filtered Milwaukee data in Convex at build time via a seed script, or load the full JSON client-side and filter at runtime?
**Answer:** Load the full JSON client-side and filter at runtime (not pre-processed into Convex).

**Q4:** For the Claude AI Narrative Guide, the system prompt needs to include zone-specific HOLC data and appraiser descriptions. I'm assuming we would send the currently-selected zone's data as dynamic system prompt context (not all 112 records at once). Should the chat panel maintain conversation history across zone selections (so a user can ask about Zone A1 then Zone D5 in the same thread), or should selecting a new zone start a fresh conversation?
**Answer:** User leans toward persisting conversation across zone selections and asked for a UX recommendation. **Recommendation provided below in Follow-up Questions section.**

**Q5:** The PRD describes the hero experience opening with a guided Bronzeville narrative (Section 4.1), but the roadmap defers this to Phase 3. I'm assuming the MVP landing experience should be the 3D map in free-exploration mode with no guided onboarding -- just the split panel with the map on the left and an empty info/chat panel on the right until the user clicks a zone. Is that correct, or do you want a lightweight landing state?
**Answer:** Lightweight landing state -- brief intro overlay with "click a zone to begin" prompt.

**Q6:** The PRD specifies a 70/30 split (3D canvas left, info/chat panel right) on desktop. For the responsive breakpoints, I'm assuming that on tablet the layout stays side-by-side but shifts to roughly 60/40, and on mobile the 3D canvas takes full width with the info/chat panel accessible as a bottom sheet or slide-up drawer. Is that the behavior you want, or do you have a different mobile interaction model in mind?
**Answer:** Whatever is best for UX using best practices and accessibility standards. User defers to recommendation. **Recommendation provided below in Follow-up Questions section.**

**Q7:** For the HOLC zone extrusion heights, the roadmap says "height mapped to grade" with a note "(A=tallest, D=shortest or inverted based on design intent)." This is a significant design decision. Which direction do you want -- A=tallest (the privileged zones tower over redlined areas) or D=tallest (the damage dominates the landscape), or should D literally extrude below the baseline (into the ground)?
**Answer:** D=tallest. Redlined areas dominate the scene; the damage stands out.

**Q8:** The raw data files in the project root have spaces and parentheses in their names (`geojson (1).json`, `mappinginequality (1).json`). I'm assuming we should rename these to clean names during processing and store the processed/cleaned data in Convex rather than serving the raw files. Is that correct?
**Answer:** Yes, rename to clean names during processing and store in Convex.

**Q9:** The tech stack calls for Convex as the backend. For Phase 1, the main backend needs are: (a) serving HOLC zone and description data, (b) proxying Claude API calls to protect the API key, and (c) optionally storing conversation history. I'm assuming we should store the processed HOLC data in Convex tables (zones, area_descriptions) and use Convex actions for the Claude proxy, rather than using Next.js API routes. Is that your intent?
**Answer:** Convex for everything -- zone data in Convex tables, Claude proxy via Convex actions. Confirmed.

**Q10:** Is there anything you explicitly want excluded from this Phase 1 MVP spec that might be tempting to scope-creep into? For example: ElevenLabs voice narration, Sanborn map ground plane, building-level MPROP data, the time slider, or any other Phase 2/3 features?
**Answer:** None -- no hard boundaries specified beyond what Phase 1 already defines. The 8 roadmap items define the scope.

### Existing Code to Reference

No similar existing features identified for reference. This is a greenfield project with no existing codebase, no prior Next.js + Convex projects, and no React Three Fiber setups to model after.

**Pre-existing product planning artifacts to reference:**
- Design system tokens: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tokens.css`
- Tailwind color config: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tailwind-colors.md`
- Font configuration: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/fonts.md`
- TypeScript data model types: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/data-model/types.ts`
- Product overview: `/Users/tarikmoody/Documents/Projects/redlined/product-plan/product-overview.md`
- Full PRD: `/Users/tarikmoody/Documents/Projects/redlined/Redlined-PRD.docx.md`

### Follow-up Questions

No follow-up questions were needed. Two items required UX recommendations in lieu of follow-ups, which are documented here.

**Recommendation 1: Chat History Across Zone Selections (Q4)**

Recommended approach: **Persist a single conversation thread across zone selections, with automatic zone-context messages.**

When a user clicks a new zone while an existing conversation is active, the system should:
1. Insert a visible divider/system message in the thread (e.g., "Now viewing: Bronzeville / 6th & Walnut -- Grade D") so the user can see context switched.
2. Update the Claude system prompt to include the newly-selected zone's data (grade, appraiser text, Census data if available) so subsequent AI responses are grounded in the current zone.
3. Retain all prior messages in the visible thread so users can scroll back and compare what the AI said about different zones.

This approach is better than resetting conversation because:
- Users exploring redlining data naturally want to compare zones ("You just told me A1 had these conditions -- now why is D7 different?"). Cross-zone context makes the AI guide dramatically more useful.
- Losing conversation history feels punishing and discourages exploration.
- The system message divider makes it clear which zone was active at any point in the conversation, preventing confusion.

The system prompt should include both the currently-selected zone's full data AND a brief summary of recently-discussed zones (last 2-3) to give Claude cross-zone context for comparison questions.

**Recommendation 2: Responsive Layout Strategy (Q6)**

Recommended approach: **Mobile-first progressive enhancement with three breakpoints.**

- **Mobile (default, < 768px):** 3D canvas takes full viewport width and height. The info/chat panel is a slide-up bottom sheet (draggable handle) that starts minimized with just the zone name and grade badge visible. User can drag up to reveal full details and chat. This follows the standard mobile map-app pattern (Google Maps, Apple Maps) that users already understand. Touch targets minimum 44x44px per accessibility standards.

- **Tablet (768px - 1279px):** Side-by-side layout at approximately 60/40 split. The right panel becomes a fixed sidebar. The 3D canvas still gets the majority of space since the visualization is the primary content. Orbit controls work with touch gestures.

- **Desktop (1280px+):** The 70/30 split shown in the mockups. Full info panel with zone details, AI chat, suggested questions, and data overlay controls all visible without scrolling. Orbit controls via mouse.

Key accessibility considerations:
- The 3D canvas must have keyboard-navigable zone selection (Tab through zones, Enter to select) in addition to click/tap, since orbit controls alone are not accessible.
- The info panel should use semantic HTML with proper heading hierarchy (h2 for zone name, h3 for subsections like "Appraiser Description", "AI Narrative Guide").
- HOLC grade colors should be accompanied by text labels (A/B/C/D + "Best"/"Still Desirable"/"Declining"/"Hazardous") since color alone does not meet WCAG requirements.
- The content warning about racist language in HOLC descriptions should be dismissible and not block keyboard navigation.

## Visual Assets

### Files Provided:
- `map-explorer-mockup.png`: The primary application view showing the full split-panel layout. Left side: dark background (matches 0x1A1A2E spec) with extruded 3D HOLC zone blocks color-coded green (A), blue (B), yellow (C), red (D). Zones appear as solid rectangular blocks at varying heights on a dark gray ground plane. Top-left shows "REDLINED - THE SHAPE OF INEQUALITY" branding with "Milwaukee 1938" pill badge, coordinates displayed below. Top-right has the HOLC grade legend (A=Best, B=Still Desirable, C=Declining, D=Hazardous). Right panel shows "Select a neighborhood" prompt with instructional text, "AI Narrative Guide" section with four suggested question pills, and a text input with "Ask" button. Bottom has a timeline slider spanning 1910-Now with markers at 1938 and 1960s, plus "Drag to orbit" and "Scroll to zoom" hints. Bottom-left shows "1938" as a large year label.
- `narrative-guide-mockup.png`: The AI chat panel in an active state. Shows a conversation about Bronzeville with a detailed multi-paragraph AI response covering the neighborhood's history (1910s-40s jazz clubs, the I-43 highway construction, present-day property values of $52,000 vs city median of $135,000). The response is rendered in a threaded chat format with clear visual hierarchy. A follow-up question "What was here before the highway?" is shown, along with a "Select a neighborhood" section in the upper-right. The chat input is at the bottom.
- `data-overlays-mockup.png`: The Census income data overlay view. Left side shows extruded zones with income-based coloring (green-to-red gradient replacing the HOLC grade colors). Zone labels (A-1, A-5, C-4, C-8, D-7, D-8) are visible on the blocks. Top-left has "DATA OVERLAY" section with four toggleable layer buttons: Median Income (active/selected), Health Outcomes, Environmental Burden, Assessed Value. An opacity slider control is visible. Right panel shows zone detail for "Bronzeville / 6th & Walnut" with Grade D badge, median income of $24,800 (8th percentile), and an A-Zone vs D-Zone comparison bar chart (A-Zone Avg: $105,600, This Zone: $24,800, D-Zone Avg: $23,450) with "4.5x higher in A-zones / 85 years after HOLC grades were assigned" callout. Bottom has a "MEDIAN INCOME" color gradient legend from $2K (red) to $120K (green).

### Visual Insights:
- **Layout pattern:** Consistent 70/30 split-panel layout across all three mockups. 3D canvas dominates left side, info/chat panel occupies right side. This is the definitive layout for desktop.
- **Navigation elements:** Top header bar with "REDLINED" branding (red text), "THE SHAPE OF INEQUALITY" subtitle (muted), city selector pill ("Milwaukee 1938"). Coordinates shown below. HOLC grade legend in upper-right of canvas area.
- **Zone rendering style:** Zones appear as solid extruded rectangular/polygonal blocks on a flat dark ground plane. Not wireframe -- solid geometry with slight 3D shading. Heights clearly vary by grade.
- **Interaction hints:** "Drag to orbit" and "Scroll to zoom" text hints at bottom of canvas. "Select a neighborhood" prompt with "Click any zone or building on the map to see its details" instruction.
- **AI Guide design:** Chat-style interface with suggested question pills (rounded, outlined buttons). Input field at bottom with red "Ask" button. Responses render as flowing prose paragraphs, not bulleted lists.
- **Data overlay design:** Layer toggles as stacked buttons in top-left of canvas. Active layer highlighted. Opacity slider for overlay intensity. Zone detail panel shows: metric value in large text, percentile, A-zone vs D-zone comparison bars, and an insight callout. Color gradient legend at bottom of canvas.
- **Typography in mockups:** Large numbers use a bold geometric font (Space Grotesk). Body text uses a clean sans-serif (Inter). Data values and percentiles use a monospace font (IBM Plex Mono). Consistent with the design system tokens.
- **Color scheme:** Dark-first design confirmed. Backgrounds are deep slate/navy. HOLC grade colors are vivid against the dark background. Red (#F44336) is used for D-grade zones, action buttons (Ask), and accent elements. Amber used for callout highlights.
- **Fidelity level:** High-fidelity mockups. These appear to be detailed UI designs (not wireframes) with specific colors, typography, spacing, and component styling. They should be treated as close-to-final design targets, not just layout guides.
- **Time slider (mockup 1):** Shows a horizontal timeline at the bottom spanning 1910 to "Now" with dot markers. A red line/fill indicates the current position (2025). Note: while this appears in the mockup, the time slider with animated transitions is a Phase 2 feature. For Phase 1, this element should either be omitted or rendered as a static "1938" label to set context without implying interactive time scrubbing.
- **Data overlay toggles (mockup 3):** Shows four overlay options (Median Income, Health Outcomes, Environmental Burden, Assessed Value). For Phase 1, only Median Income is in scope. The other three are Phase 3 features. The toggle UI should be built to accommodate future layers, but only Median Income should be functional in the MVP.

## Requirements Summary

### Functional Requirements

**3D Map Explorer:**
- Load and parse Milwaukee HOLC GeoJSON (114 features) with grade metadata (A/B/C/D + 2 ungraded)
- Join zone polygons with area descriptions from `holc_ad_data.json` on `area_id` (112 Milwaukee records, city_id=201)
- Initialize React Three Fiber canvas with orbit controls (rotate, zoom, pan), dark background (#1A1A2E), appropriate camera positioning and lighting
- Extrude HOLC zone polygons as 3D geometry with height inversely mapped to grade: D=tallest, C=next, B=next, A=shortest -- so redlined damage dominates the visual landscape
- Color zones using HOLC palette: A=#4CAF50 (green), B=#2196F3 (blue), C=#FFEB3B (yellow), D=#F44336 (red), Ungraded=neutral gray
- Display zone labels (A-1, B-2, etc.) on or near zones
- 2 ungraded zones rendered with neutral color and labeled "Ungraded"
- Raycasting for click detection on zones
- "Drag to orbit" and "Scroll to zoom" interaction hints on the canvas
- HOLC grade legend in upper-right of canvas (A=Best, B=Still Desirable, C=Declining, D=Hazardous with color swatches)

**Click-to-Inspect Panel:**
- Clicking a zone opens the right-side info panel with: zone grade (badge with color), neighborhood name, and original HOLC appraiser description
- Appraiser fields to display: `clarifying_remarks`, `detrimental_influences`, `favorable_influences`, `infiltration_of`, `negro_yes_or_no`, `negro_percent`, `estimated_annual_family_income`, `occupation_or_type`
- Content warning for zones containing racist language in appraiser descriptions (most D-grade zones)

**AI Narrative Guide:**
- Chat panel integrated with Claude API (Sonnet 4) via Convex actions
- System prompt dynamically constructed with: currently-selected zone's full HOLC data, appraiser descriptions (original racist language included for historical accuracy), and summary of recently-discussed zones (last 2-3) for cross-zone comparison context
- Conversation persists across zone selections as a single thread. When user selects a new zone, a visible divider/system message appears (e.g., "Now viewing: [Zone Name] -- Grade [X]") and the system prompt updates to the new zone's context
- Four suggested question pills shown when chat is empty or after zone selection: "What happened to Bronzeville?", "Why was this area graded D?", "What's the income gap between A and D zones?", "What was here before the highway?"
- Chat input field with "Ask" button (red, #F44336)
- Streaming responses from Claude for perceived responsiveness
- AI responses render as flowing prose paragraphs (matching the narrative-guide-mockup style)

**Census Income Data Overlay:**
- Download and process Census-HOLC crosswalk from `americanpanorama/mapping-inequality-census-crosswalk` (2020 tract boundaries)
- Fetch ACS 5-Year median household income data by Census tract from Census API
- Join Census tracts to HOLC zones using area-weighted percentages (`pct_tract` field)
- Toggleable overlay that recolors zones from a red-to-green income gradient (replacing HOLC grade colors when active)
- Opacity slider for overlay intensity
- When overlay is active and a zone is selected, the info panel shows: median income (large number), percentile rank, A-zone average vs this zone vs D-zone average comparison, and an insight callout (e.g., "4.5x higher in A-zones / 85 years after HOLC grades were assigned")
- Color gradient legend at bottom of canvas showing income range ($2K to $120K based on mockup)
- Data overlay toggle UI built as a vertical stack of layer buttons (matching mockup) with only "Median Income" functional for Phase 1; the other three (Health Outcomes, Environmental Burden, Assessed Value) should appear as disabled/coming-soon or be omitted

**Landing Experience:**
- Lightweight intro overlay on first load with application title ("REDLINED: The Shape of Inequality"), brief description, and a "click a zone to begin" call-to-action
- Overlay dismisses on click/tap or when user interacts with the 3D canvas
- After dismissal, the "Select a neighborhood" prompt appears in the right panel (matching mockup)

**Header and Branding:**
- Top header bar: "REDLINED" in red, "THE SHAPE OF INEQUALITY" in muted text, city selector showing "Milwaukee 1938"
- Coordinates (43.0389 N, 87.9065 W) displayed below the header on the left

**Data Loading Strategy:**
- Load full `holc_ad_data.json` and `geojson (1).json` client-side and filter Milwaukee data at runtime
- Raw files renamed to clean names (no spaces/parentheses) and stored in Convex
- HOLC zone and description data stored in Convex tables
- Claude API proxied through Convex actions (protecting API key)
- Conversation history stored in Convex

### Reusability Opportunities

No existing code to reuse (greenfield project). However, the following product-plan artifacts contain design decisions and type definitions that should be used as the foundation:
- **Design tokens** (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tokens.css`): CSS custom properties for colors, HOLC grades, era colors, typography, scene background
- **Tailwind color config** (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/tailwind-colors.md`): Tailwind utility class mappings for primary (red), secondary (amber), neutral (slate), and HOLC grade colors
- **Font config** (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/design-system/fonts.md`): Google Fonts import for Space Grotesk, Inter, IBM Plex Mono with usage guidelines
- **TypeScript types** (`/Users/tarikmoody/Documents/Projects/redlined/product-plan/data-model/types.ts`): Interfaces for HOLCZone, Building, GhostBuilding, CensusTract, Conversation, Message, OverlayLayer, and related types. These should be adapted for Convex schema definitions.

### Scope Boundaries

**In Scope:**
- HOLC GeoJSON loading and parsing (114 Milwaukee features)
- Three.js / React Three Fiber scene with camera, lighting, orbit controls, dark background
- HOLC zone extrusion with D=tallest height mapping and HOLC color palette
- Click-to-inspect with raycasting, zone details, and appraiser descriptions
- Claude AI Narrative Guide with zone-aware system prompts, persistent conversation, streaming responses, and suggested question pills
- Census Income Data Overlay with crosswalk join, choropleth coloring, opacity slider, zone statistics, and gradient legend
- Split-panel responsive layout (70/30 desktop, 60/40 tablet, full-canvas + bottom-sheet mobile)
- HOLC grade legend, interaction hints, header with branding
- Lightweight intro/landing overlay
- Convex backend (data tables, Claude proxy actions, conversation storage)
- Vercel deployment with environment variable configuration
- Content warning for racist language in HOLC descriptions
- Keyboard-accessible zone navigation
- 2 ungraded zones rendered with neutral color

**Out of Scope (Phase 2):**
- ElevenLabs voice narration
- MPROP building-level data and individual building extrusion
- Ghost building detection and wireframe rendering
- Sanborn map ground-plane texture
- Time slider with animated era transitions (GSAP)
- Parcel boundary integration

**Out of Scope (Phase 3):**
- Guided Bronzeville narrative with auto-camera
- Health Outcomes data overlay (CDC PLACES)
- Environmental Burden data overlay (EPA EJScreen)
- Assessed Value data overlay
- Tree Canopy data overlay
- Historical photograph integration (LOC)
- "What If" counterfactual mode
- Multi-city support (Chicago, Detroit, Atlanta)
- Embeddable iframe mode

**Out of Scope (Future):**
- Racial covenants layer
- Community memory / oral histories
- VR/AR mode (WebXR)
- Radio Milwaukee audio integration
- Redlining Impact Score composite index

### Technical Considerations

**Tech Stack:**
- Next.js (App Router) -- application framework
- Convex -- backend (document database, server functions, file storage)
- React Three Fiber -- 3D rendering (Three.js via React)
- Tailwind CSS v4 -- styling (dark-first, no light mode)
- Claude API (Sonnet 4) -- AI narrative guide, called via Convex actions
- GSAP -- available in the stack but not heavily used in Phase 1 (reserved for Phase 2 time slider); may be used for subtle UI transitions
- TypeScript (strict mode) -- language
- Vitest -- testing
- ESLint + Prettier -- linting and formatting
- Vercel -- hosting and deployment
- GitHub Actions -- CI/CD

**Architecture:**
- Convex tables for HOLC zones, area descriptions, Census data, and conversation history
- Convex actions for Claude API proxy (protects API key from client exposure)
- Convex queries for data retrieval (reactive subscriptions where appropriate)
- Client-side data loading: full JSON files loaded and filtered at runtime for HOLC data
- Processed/cleaned data files stored in Convex (renamed from originals with spaces)
- Environment variables for API keys managed via Convex environment variables and Vercel environment variables

**Data Files:**
- `geojson (1).json` (project root) -- 114 Milwaukee HOLC zone polygons. Fields: `area_id`, `city_id`, `grade`, `fill`, `label`, `name`, `category_id`, `sheets`, `area`, `bounds`, `label_coords`, `residential`, `commercial`, `industrial`. Grade distribution: 10 A, 29 B, 49 C, 24 D, 2 null. Rename to `milwaukee-holc-zones.json`.
- `holc_ad_data.json` (project root) -- 7,930 HOLC area descriptions across all cities. 112 Milwaukee records (city_id=201). Key fields: `area_id` (join key), `grade`, `clarifying_remarks`, `detrimental_influences`, `favorable_influences`, `infiltration_of`, `negro_yes_or_no`, `negro_percent`, `estimated_annual_family_income`, `occupation_or_type`, `description_of_terrain`, `trend_of_desirability`. Rename to `holc-area-descriptions.json`.
- Census-HOLC crosswalk (needs download from GitHub: `americanpanorama/mapping-inequality-census-crosswalk`) -- GeoJSON with `area_id`, `GEOID`, `pct_tract` for area-weighted joins
- Census ACS 5-Year data (needs API call with free API key) -- median household income by tract

**External Dependencies:**
- Census API key required (free signup at api.census.gov)
- Census-HOLC crosswalk dataset (free download from GitHub)
- Claude API key (Anthropic console, $5 credit on signup)
- No other paid services required for Phase 1

**Performance Targets (from PRD):**
- Initial load under 5 seconds on broadband
- 60 FPS rendering for HOLC zone view (~114 extruded polygons -- well within capability)
- LLM streaming response starts within 3 seconds

**Coordinate System:**
- HOLC GeoJSON is in WGS84 (EPSG:4326)
- Three.js scene coordinates computed using Mercator-adjusted projection centered on Milwaukee (43.0389 N, 87.9065 W)

**Design System:**
- Fonts: Space Grotesk (headings, zone names, big numbers), Inter (body text, descriptions, chat), IBM Plex Mono (data values, coordinates, percentiles)
- HOLC palette: A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336
- Backgrounds: #1A1A2E (3D scene), #0c0a1a (app background / slate-950), #0f172a (panel background / slate-900)
- Dark-first design, no light mode
- Primary accent: red (D-grade, action elements)
- Secondary accent: amber (callouts, highlights)
- Neutral: slate (backgrounds, text, borders)

**Accessibility Requirements (per standards):**
- Semantic HTML with proper heading hierarchy
- Keyboard-navigable zone selection (Tab/Enter) alongside mouse/touch
- HOLC grade colors always accompanied by text labels (not color-only)
- Minimum 44x44px touch targets on mobile
- Sufficient color contrast (4.5:1 for text)
- ARIA attributes for the 3D canvas and interactive elements
- Screen reader considerations for the 3D visualization (provide text alternative/summary)
- Content warning for racist language is dismissible and does not trap keyboard focus

**Responsive Breakpoints:**
- Mobile (default, < 768px): Full-viewport 3D canvas with slide-up bottom sheet for info/chat panel
- Tablet (768px - 1279px): Side-by-side 60/40 split
- Desktop (1280px+): Side-by-side 70/30 split (matching mockups)
