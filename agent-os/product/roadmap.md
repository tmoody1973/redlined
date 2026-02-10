# Product Roadmap

## Phase 1: MVP -- Milwaukee HOLC Explorer

Target: Weeks 1-2. A functional 3D map of Milwaukee's HOLC zones with click-to-inspect and AI narration. Deployable to Vercel.

1. [ ] HOLC GeoJSON Loading and Parsing -- Load Milwaukee HOLC zone data from `geojson (1).json` (114 features with neighborhood names, label coordinates, and bounding boxes). Parse zone boundaries and normalize grade metadata (A/B/C/D) for the 3D scene. Reserve `mappinginequality (1).json` (10,154 features, 300 cities) for Phase 3 multi-city support. `S`
2. [ ] Three.js Scene Setup -- Initialize React Three Fiber canvas with camera, lighting, orbit controls, and dark background (0x1A1A2E). Scene renders an empty stage ready to receive geometry. `S`
3. [ ] HOLC Zone Extrusion -- Extrude HOLC zone polygons into 3D geometry with height mapped to grade (A=tallest, D=shortest or inverted based on design intent). Color zones using HOLC palette (A=#4CAF50, B=#2196F3, C=#FFEB3B, D=#F44336). `M`
4. [ ] Click-to-Inspect Panel -- Clicking a HOLC zone opens a side panel displaying the zone's grade, neighborhood name, and original HOLC appraiser description text from `holc_ad_data.json` (joined on `area_id`). Fields to display: `clarifying_remarks`, `detrimental_influences`, `infiltration_of`, `negro_yes_or_no/percent`, `estimated_annual_family_income`, `occupation_or_type`. Raycasting identifies the clicked zone. `S`
5. [ ] Claude AI Narrative Guide -- Chat panel integrated with Claude API (Sonnet 4). System prompt includes HOLC zone data, appraiser descriptions from `holc_ad_data.json` (the original racist language), and neighborhood context. User can ask questions about what they are seeing and receive historically grounded responses. `M`
6. [ ] Census Income Data Overlay -- Load ACS 5-Year income data by tract, join to HOLC zones using the Census-HOLC crosswalk (`americanpanorama/mapping-inequality-census-crosswalk` -- 2020 tract boundaries, `pct_tract` for area-weighted joins). Optionally use the Historic Redlining Scores (openICPSR 141121 V3) for a continuous redlining severity metric per tract. Render as a toggleable color overlay. `S`
7. [ ] Split Panel Layout and Responsive UI -- Implement the main application layout: 3D canvas on the left, info/chat panel on the right. Responsive breakpoints for desktop and tablet. Navigation controls, legend, and layer toggles. `M`
8. [ ] Vercel Deployment -- Configure Vercel project with serverless API route proxying Claude API calls (protecting API key). Environment variables for all secrets. Production build and deploy. `S`

> Notes
> - Items 1-3 are sequential: data must be loaded before the scene can render geometry
> - Items 4-6 can proceed in parallel once the scene with zones is rendering
> - Item 7 can begin as soon as the canvas and panel components exist
> - Item 8 depends on all other items being functional

## Phase 2: Building-Level Detail

Target: Weeks 3-4. Individual buildings rendered from MPROP data, ghost buildings for demolished structures, time slider, and voice narration.

9. [ ] MPROP Property Data Pipeline -- Process Milwaukee MPROP CSV (160K+ properties, 90+ fields). Extract parcel coordinates, assessed values, construction year, number of stories, and demolition status. Output optimized JSON grouped by HOLC zone. `M`
10. [ ] Parcel Boundary Integration -- Load Milwaukee parcel boundary shapefiles, convert to GeoJSON, and match parcels to MPROP records. These polygons define the footprint for individual building extrusion. `M`
11. [ ] Individual Building Extrusion -- Render individual buildings within HOLC zones by extruding parcel polygons to heights based on number of stories. Color or shade by assessed value. Implement LOD (level of detail) to maintain performance with thousands of geometries. `L`
12. [ ] Ghost Building Detection and Rendering -- Compare current MPROP records against historical MPROP snapshots (2005-2022 archives from data.milwaukee.gov) to identify demolished structures by missing TAXKEYs. Render missing buildings as red wireframe geometry at their original parcel location, making absence visible. `M`
13. [ ] Time Slider with Animated Transitions -- GSAP-powered slider allowing users to scrub through decades (1930s, 1950s, 1970s, 1990s, 2010s, present). Buildings appear and disappear, ghost wireframes fade in, zone overlays shift to match era-appropriate data. `L`
14. [ ] Sanborn Map Ground Plane -- Load georeferenced Sanborn fire insurance maps from MCLIO/UWM ArcGIS as textured ground planes beneath the 3D buildings, providing historical street-level context. `S`
15. [ ] ElevenLabs Voice Narration -- Integrate ElevenLabs API to generate NPR-style audio narration. When a user clicks a zone, the original appraiser text from `holc_ad_data.json` (`clarifying_remarks`, `detrimental_influences`) is read aloud. Audio playback controls in the UI. `M`

> Notes
> - Items 9-10 are data pipeline work that must complete before item 11
> - Item 12 depends on item 11 (building rendering must work before ghost buildings layer on top)
> - Item 13 depends on items 11-12 (time slider animates between states that must exist)
> - Items 14-15 are independent of each other and can proceed in parallel once the scene has buildings

## Phase 3: Full Narrative Experience

Target: Weeks 5-6. Guided storytelling, additional data layers, historical photographs, counterfactual mode, and multi-city support.

16. [ ] Guided Bronzeville Narrative -- Auto-camera animation walking users through the story of Milwaukee's Bronzeville neighborhood. Scripted waypoints with narration, data callouts, and timed transitions. Users can pause, skip, or exit to free exploration. `L`
17. [ ] Health Outcomes Data Overlay -- Load CDC PLACES data and render as a toggleable layer showing health outcome disparities (asthma, diabetes, life expectancy) mapped against HOLC zone boundaries. `S`
18. [ ] Environmental Burden Data Overlay -- Load EPA EJScreen data and render as a toggleable layer showing pollution exposure, proximity to hazardous sites, and environmental justice indices by area. `S`
19. [ ] Tree Canopy Data Overlay -- Load tree canopy coverage data and render as a toggleable layer, visualizing the correlation between HOLC grades and urban greenery. `S`
20. [ ] Historical Photograph Integration -- Pull photographs from the Library of Congress HABS/HAER and FSA/OWI collections. Display geolocated historical images as clickable markers in the 3D scene or within the info panel when viewing a specific zone or building. `M`
21. [ ] "What If" Counterfactual Mode -- LLM-powered exploration mode where users can ask Claude to project what a D-graded neighborhood might look like today if it had received the same investment as an A-graded zone. Visual and narrative response. `M`
22. [ ] Multi-City Support -- Generalize the data pipeline and scene rendering to support Chicago, Detroit, and Atlanta. City selector in the UI. Each city loads its own HOLC GeoJSON and available data layers. `L`
23. [ ] Embeddable iframe Mode -- Create a lightweight embed mode (via query parameter or dedicated route) that news organizations can iframe into articles. Reduced UI, autoplay narrative option, and responsive sizing. `M`

> Notes
> - Items 17-19 are independent data overlay features and can proceed in parallel
> - Item 16 depends on voice narration (item 15) and the full building scene (items 11-12)
> - Item 20 is independent of other Phase 3 items
> - Item 22 requires the data pipeline (items 9-10) to be generalized
> - Item 23 can begin once the core UI is stable

## Future Extensions

These are directions beyond the initial 6-week build, to be prioritized based on reception and resources.

- **Racial Covenants Layer** -- Integrate digitized racial covenant data from deed records, showing the legal mechanisms that reinforced redlining at the property level
- **Community Memory** -- Allow Milwaukee residents to submit oral histories, photographs, and annotations tied to specific locations on the map
- **VR/AR Mode** -- WebXR integration allowing users to walk through the 3D landscape in VR headsets or view it in AR overlaid on the real world
- **Radio Milwaukee Audio Integration** -- Curated audio segments from Radio Milwaukee programming providing local context and contemporary voices
- **Redlining Impact Score** -- A computed index per zone combining all data layers (including the openICPSR Historic Redlining Scores as a baseline) into a single "cumulative impact" metric showing the total measurable effect of the original HOLC grade
- **Comparative City Analysis** -- Side-by-side views of multiple cities to show how redlining played out differently (or identically) across different urban contexts
