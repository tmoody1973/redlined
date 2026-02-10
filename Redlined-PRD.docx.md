

**REDLINED**  
*The Shape of Inequality*

Product Requirements Document

An interactive 3D visualization of HOLC redlining maps revealing  
how 1930s policy decisions shaped American cities, building by building.

**Tarik Moody**  
Radio Milwaukee | The Intersection

February 2026 | Version 1.0  
Black History Month Project

# **Table of Contents**

*Note: Update this table of contents after opening in Word by right-clicking and selecting "Update Field."*

# **1\. Executive Summary**

Redlined is an interactive 3D web application that visualizes the lasting impact of the Home Owners' Loan Corporation (HOLC) redlining maps on American cities. Using Three.js for 3D rendering and LLM APIs for contextual narration, the application transforms 1930s government grading data into an immersive experience where users can see, explore, and understand how racist housing policy shaped the physical and economic landscape of neighborhoods that exist today.

The initial release focuses on Milwaukee, Wisconsin — one of the most segregated cities in America — where the connection between 1938 HOLC grades and present-day outcomes is stark and well-documented. The application layers multiple historical and contemporary datasets to tell the story building by building: from the dense neighborhoods visible in 1910 Sanborn fire insurance maps, through the redlining that starved them of investment, to the highway construction that demolished them, to the economic craters that remain today.

The project is designed for Black History Month 2026 and serves as both a civic engagement tool and a data journalism piece, connecting Tarik Moody's work in media innovation, architecture, and civic technology.

## **1.1 Core Value Proposition**

Redlined makes the abstract concrete. Policy documents become 3D landscapes. Census tables become neighborhoods rising and falling. The racism embedded in bureaucratic language becomes audible when an AI narrator reads the original HOLC appraiser descriptions aloud. The application answers a simple question with devastating clarity: what happens to a neighborhood when the federal government officially declares it "hazardous" because Black people live there?

# **2\. Problem Statement**

Redlining is widely cited as a root cause of racial inequality in American cities, but the connection between a 1938 policy map and present-day outcomes remains abstract for most people. Existing tools like the University of Richmond's Mapping Inequality project provide the historical maps but present them as flat 2D overlays without building-level detail or present-day outcome data. Academic research papers quantify the correlations but lack emotional impact. News coverage references redlining without showing what it actually looks like on the ground.

Milwaukee presents a particularly compelling case study. The city consistently ranks as one of the most segregated metropolitan areas in the United States. HOLC appraisers in 1938 explicitly cited the presence of "Negroes" as justification for D-grade ("Hazardous") ratings. In the decades that followed, Interstate 43 was routed directly through Bronzeville, Milwaukee's historic Black neighborhood, demolishing hundreds of homes and businesses. The neighborhoods that survived the highway still show dramatically worse outcomes in income, health, home values, and environmental quality compared to the A-grade zones just miles away.

No existing tool tells this story at the building level — showing what was there, what was destroyed, and what remains — in a single interactive 3D experience with AI-powered narration.

# **3\. Target Users**

| User Segment | Needs | How Redlined Serves Them |
| :---- | :---- | :---- |
| Civic-engaged community members | Understand how policy shaped their neighborhood | Building-level visualization with LLM narration explaining local history |
| Journalists and media professionals | Data-driven storytelling tools for covering segregation | Embeddable views, exportable data comparisons, quotable HOLC descriptions |
| Educators and students | Interactive teaching tool for housing policy and racial inequality | Guided experience with time slider, view toggles, and AI Q\&A |
| Urban planners and policy makers | Evidence of redlining's persistent effects for policy arguments | Multi-layer data overlays comparing 1938 grades to current outcomes |
| Milwaukee residents | Personal connection to neighborhood history | Address-level search, building histories, Bronzeville narrative |
| Hackathon judges and tech community | Innovative use of 3D visualization, LLMs, and public data | Novel multi-source data integration with AI-guided storytelling |

# **4\. Product Vision and User Experience**

## **4.1 The Hero Narrative: Milwaukee Bronzeville**

The application opens with a guided narrative that demonstrates its full capability through the story of Bronzeville, Milwaukee's historic Black neighborhood. This serves as both an onboarding experience and the emotional core of the product.

1. **1910 View:** Georeferenced Sanborn fire insurance map renders as ground-plane texture, showing a dense neighborhood around 6th and Walnut Streets. Every building is visible — homes, churches, businesses, all drawn in precise detail by Sanborn surveyors. The HOLC zone boundary appears as a translucent overlay.

2. **1938 View:** The HOLC appraiser's actual language appears on screen: "Negro and lower class mixed." Grade D. Hazardous. The zone extrudes downward while surrounding A-grade neighborhoods rise, visualizing the investment differential. The AI narrator reads the assessment aloud.

3. **1960s View:** Ghost buildings appear as red wireframes. The I-43 corridor cuts through the scene. Buildings that existed in 1910 but are now gone pulse with a slow fade, marking each structure demolished for highway construction. The narrator explains urban renewal's targeted destruction.

4. **Current View:** The freeway sits where the neighborhood was. Current MPROP data shows remaining buildings color-coded by assessed value and year built. Census data overlays reveal the economic crater. The user can click any building, any empty lot, and ask the AI guide: "What was here before?"

## **4.2 View Modes**

| View Mode | Data Displayed | Height Encoding | Color Encoding |
| :---- | :---- | :---- | :---- |
| 1938 HOLC Grades | HOLC zone polygons with original descriptions | Grade (A=tallest, D=lowest) | Green/Blue/Yellow/Red by grade |
| Sanborn Historical | 1910 georeferenced map as ground texture with HOLC overlay | Flat ground plane | Original Sanborn color codes |
| Current Buildings | MPROP parcels extruded by stories | Number of stories (NR\_STORIES) | Year built (copper=pre-1938, gray=urban renewal, blue=modern) |
| Ghost Buildings | Missing structures shown as wireframes over Sanborn base | Estimated 2 stories | Red wireframe at 30% opacity |
| Income Disparity | Census median household income by tract | Income (scaled) | Red-to-green gradient |
| Health Outcomes | CDC PLACES / SVI scores by tract | Vulnerability score | Red-to-green gradient |
| Displacement | Assessed value differential between A and D zones | Value gap magnitude | Heat map gradient |

## **4.3 Interactive Features**

* **Click any building or zone** to open an info panel showing address, year built, assessed value, HOLC grade, and original appraiser notes. The LLM provides contextual narrative.

* **Time slider** animates transitions between eras, showing buildings appear and disappear as the cityscape transforms from 1910 through present day.

* **AI Guide chat panel** allows natural language questions: "What happened to Bronzeville?" "Why was this neighborhood graded D?" "What's the income difference between A and D zones today?"

* **Voice narration** using ElevenLabs reads HOLC descriptions and AI guide responses aloud, creating an NPR-style audio experience.

* **City selector** enables comparison across 200+ cities with HOLC data (Phase 2).

# **5\. Technical Architecture**

## **5.1 Technology Stack**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| 3D Rendering | Three.js (r128+) | Extruded 3D map, neighborhood polygons, building geometry, ghost buildings |
| Map Tiles (optional) | Mapbox GL JS or OpenStreetMap | Base map layer for geographic context |
| Animation | GSAP (GreenSock) | Smooth transitions between view modes and time periods |
| LLM Backend | Claude API (Sonnet 4\) | AI narrative guide with contextual system prompts |
| Voice Synthesis | ElevenLabs API | NPR-style audio narration of HOLC descriptions and guide responses |
| Frontend Framework | React \+ Vite | UI components, chat panel, info overlays, controls |
| Data Processing | Node.js scripts / Python | GeoJSON parsing, MPROP CSV joining, coordinate transformation |
| Hosting | Vercel or Netlify | Static deployment with serverless API routes for LLM proxy |

## **5.2 Multi-Layer Data Architecture**

The application composites five distinct data layers into a single 3D scene. Each layer has its own data source, rendering strategy, and interaction model.

| Layer | Data Source | Format | Rendering |
| :---- | :---- | :---- | :---- |
| 1: HOLC Zones (base) | Mapping Inequality — U. of Richmond | GeoJSON (WGS84) | ExtrudeGeometry polygons, colored by grade |
| 2: Historical Buildings | MCLIO georeferenced Sanborn maps via UWM | ArcGIS tile service (PNG) | Ground-plane texture via TextureLoader |
| 3: Current Buildings | Milwaukee MPROP \+ Parcel shapefile | CSV \+ Shapefile → GeoJSON | ExtrudeGeometry parcels by NR\_STORIES |
| 4: Ghost Buildings | Historical MPROP comparison (2005 vs 2025\) | Derived dataset | Wireframe ExtrudeGeometry at 30% opacity |
| 5: Census Demographics | US Census API (ACS 5-Year) | JSON API | Color overlay on zones/tracts |

## **5.3 Coordinate System Strategy**

All data must be transformed to a consistent coordinate system for Three.js rendering. The HOLC GeoJSON and MCLIO Sanborn maps are already in WGS84 (EPSG:4326). Milwaukee parcel shapefiles use State Plane South NAD27 and require reprojection to WGS84 before use. Three.js scene coordinates are computed using a Mercator-adjusted projection centered on Milwaukee (43.0389°N, 87.9065°W).

# **6\. Data Sources — Complete Inventory**

Every dataset required for Redlined is freely available and publicly accessible. No paid APIs or restricted datasets are needed for the core experience.

## **6.1 HOLC Redlining Maps (Primary)**

**Source:** Mapping Inequality Project, University of Richmond

**URL:** https://dsl.richmond.edu/panorama/redlining/

**Milwaukee GeoJSON:** https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/WIMilwaukee1938.geojson

**Format:** GeoJSON with polygon geometries, HOLC grades (A/B/C/D), and transcribed appraiser descriptions

**Coverage:** 200+ cities nationwide, including Milwaukee (1938)

**Key fields:** holc\_grade, holc\_id, area\_description\_data (contains original assessor language including racial descriptions)

**Pre-joined research dataset:** github.com/americanpanorama/Census\_HOLC\_Research — HOLC grades already joined with 2020 Census tract boundaries

## **6.2 Milwaukee Master Property Record (MPROP)**

**Source:** City of Milwaukee Open Data Portal (data.milwaukee.gov)

**Download:** Direct CSV download, updated daily, approximately 160,000 properties with 90+ fields

**Documentation:** city.milwaukee.gov/ImageLibrary/Public/GIS/MMDocumentation/MPROP\_Documentation.pdf

Critical fields for Redlined:

| Field | Type | Use in Redlined |
| :---- | :---- | :---- |
| TAXKEY | String | Primary key, joins to parcel shapefile |
| YR\_BUILT | Integer | Building age classification (pre-1938, urban renewal, modern) |
| NR\_STORIES | Integer | Extrusion height for 3D building representation |
| BLDG\_AREA | Integer | Building footprint size |
| LAND\_USE / LAND\_USE\_GP | String | Property type (residential, commercial, vacant, industrial) |
| OWN\_OCPD | Boolean | Owner-occupancy rate analysis |
| C\_A\_TOTAL | Currency | Current assessed value for disparity visualization |
| C\_A\_LAND | Currency | Land-only value (indicates demolished buildings when no improvement value) |
| HOUSE\_NR, SDIR, STREET | String | Address construction for display |

**Historical Snapshots:** MPROP archives from 2005 through 2022 are available at data.milwaukee.gov/dataset/historical-master-property-file, enabling year-over-year demolition tracking by comparing TAXKEYs across snapshot years.

## **6.3 Milwaukee Parcel Boundaries**

**Source:** City of Milwaukee GIS (city.milwaukee.gov/mapmilwaukee/DownloadMapData3497)

**Format:** Shapefile (State Plane South NAD27 — requires reprojection to WGS84/EPSG:4326)

**Join:** TAXKEY field links parcels to MPROP data, enabling building-level 3D extrusion from polygon footprints

**Alternative:** UWM Libraries provides pre-joined MPROP/parcel shapefiles on request (gisdata@uwm.edu)

## **6.4 Sanborn Fire Insurance Maps**

Sanborn maps provide building-by-building documentation of Milwaukee's neighborhoods at the exact period when HOLC grades were being assigned. Coverage includes 1894 (4 volumes, approximately 450 sheets), 1910 through 1937 (14+ volumes, 830+ sheets), and scattered updates through 1951\.

Each map shows building footprints, construction materials (color-coded: pink for brick, yellow for wood frame), building use, number of stories, street widths, property boundaries, and detailed annotations — the most granular historical record of what neighborhoods looked like before and during redlining.

**Raw Maps:** Library of Congress (loc.gov/collections/sanborn-maps), accessible via JSON API, IIIF Image API, or AWS S3 bulk download (s3://loc-sanborn-maps/)

**Georeferenced Maps (Critical):** Milwaukee County Land Information Office (MCLIO) has georeferenced the 1894, 1910, and 1927 Sanborn atlases. These are served via UWM's ArcGIS Map Service at webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer, enabling direct tile integration as ground-plane textures in Three.js.

## **6.5 Census and Demographic Data**

| Dataset | Source | Access | Key Variables |
| :---- | :---- | :---- | :---- |
| American Community Survey (5-Year) | api.census.gov | Free API key | Median income, home values, race, education, health insurance |
| CDC PLACES | cdc.gov/places | Free download | Health outcomes by census tract (asthma, diabetes, life expectancy) |
| CDC Social Vulnerability Index | atsdr.cdc.gov/placeandhealth/svi | Free download | Composite vulnerability scores by tract |
| EPA EJScreen | ejscreen.epa.gov | Free API | Environmental burden scores, contaminated sites proximity |

## **6.6 Additional Historical Sources**

| Source | Content | Access |
| :---- | :---- | :---- |
| HABS/HAER (Library of Congress) | Measured architectural drawings and photographs of documented Milwaukee buildings | loc.gov/pictures/collection/hh/ — JSON API, no restrictions |
| FSA/OWI Photographs (LOC) | 1939–1944 documentary photographs, some in color, documenting the exact redlining era | loc.gov/pictures/search/?co=fsa — public domain |
| Milwaukee Public Library Archives | 1+ million historical photographs of Milwaukee neighborhoods and buildings | mpl.org/special\_collections/historic\_photo\_\_archives/ |
| Microsoft Building Footprints | ML-generated building polygons from satellite imagery for current footprint comparison | github.com/microsoft/USBuildingFootprints — free GeoJSON |

# **7\. Rendering Pipeline**

## **7.1 HOLC Zone Rendering**

HOLC GeoJSON polygons are converted to Three.js Shape objects using a Mercator-adjusted lat/lng-to-XY projection. Each zone is extruded using ExtrudeGeometry with height encoding the HOLC grade (A-zones tallest, D-zones lowest) or a data variable such as median income. Materials are MeshStandardMaterial with grade-specific colors: A (green, 0x4CAF50), B (blue, 0x2196F3), C (yellow, 0xFFEB3B), D (red, 0xF44336). Opacity is set to 75% for visual layering.

## **7.2 Sanborn Ground Plane**

The MCLIO ArcGIS export endpoint is called with a bounding box matching the current HOLC zone view extent. The returned PNG image is loaded as a Three.js texture and applied to a PlaneGeometry positioned at y=0 beneath the extruded zones. Opacity is adjustable (default 70%) and the texture updates dynamically as the camera moves to load higher-resolution tiles for the visible area.

## **7.3 Current Building Extrusion**

MPROP CSV data is joined to parcel boundary GeoJSON on TAXKEY. Each parcel polygon becomes an ExtrudeGeometry with depth equal to NR\_STORIES multiplied by 3 (meters per story). Buildings are color-coded by era: copper (0xB87333) for pre-1938 structures, gray (0x808080) for urban renewal era (1938–1970), and light blue (0x4FC3F7) for modern construction. Each mesh stores userData containing address, year built, stories, land use, assessed value, and computed HOLC grade from spatial join.

## **7.4 Ghost Building Detection**

Ghost buildings are identified through three complementary methods. First, MPROP year-built analysis identifies properties where YR\_BUILT is 0 or empty with LAND\_USE\_GP set to "Vacant" within D-grade zones, indicating demolished structures. Second, comparison of historical MPROP snapshots (2005 vs. 2025\) identifies TAXKEYs that exist in the earlier dataset but not the later one, marking properties demolished within that window. Third, visual comparison identifies areas where Sanborn maps show dense buildings but current parcels show parking lots or highway right-of-way. Ghost buildings render as red wireframe ExtrudeGeometry at 30% opacity with an estimated 2-story height.

# **8\. LLM Integration**

## **8.1 AI Narrative Guide**

The AI Guide uses Claude Sonnet 4 via the Anthropic Messages API. The system prompt is dynamically constructed based on the currently selected neighborhood, including the HOLC grade, original appraiser descriptions, current Census data for the corresponding tract, and computed statistics like assessed value differential and demographic composition. The guide is instructed to be direct about the racism embedded in HOLC policies, avoid sanitizing history, connect historical data to present-day outcomes, and note Milwaukee's status as one of America's most segregated cities.

## **8.2 Voice Narration**

ElevenLabs text-to-speech converts both the original HOLC appraiser descriptions and the AI guide's responses into audio. This creates an NPR-style experience aligned with the developer's expertise at Radio Milwaukee and existing ElevenLabs integration from the Hakivo project. The voice model uses the eleven\_multilingual\_v2 model with stability set to 0.5 and similarity\_boost at 0.75.

## **8.3 Suggested Interaction Prompts**

The chat panel pre-populates suggested questions to help users engage: "What happened to this neighborhood?" "Why was this area graded D?" "What's the income difference between A and D zones today?" "What was Bronzeville like before the highway?" "What if this neighborhood had received a B grade instead?"

# **9\. Data Processing Pipeline**

| Step | Input | Process | Output |
| :---- | :---- | :---- | :---- |
| 1 | WIMilwaukee1938.geojson | Parse GeoJSON, extract polygon coordinates | Three.js Shape objects with HOLC metadata |
| 2 | MPROP CSV \+ Parcel shapefile | Join on TAXKEY, reproject from State Plane to WGS84 | Merged GeoJSON with property attributes |
| 3 | Merged parcel GeoJSON \+ HOLC zones | Spatial join (point-in-polygon) to assign HOLC grade to each parcel | Parcels with holc\_grade field |
| 4 | Historical MPROP (2005) \+ Current MPROP | Compare TAXKEYs, identify missing properties | Ghost building dataset with estimated footprints |
| 5 | MCLIO ArcGIS endpoint \+ HOLC bounding boxes | Export georeferenced Sanborn tiles for each zone | PNG textures for ground plane |
| 6 | Census API \+ HOLC tract crosswalk | Fetch ACS data for tracts overlapping HOLC zones | Joined demographic dataset keyed to holc\_id |

# **10\. UI/UX Design**

## **10.1 Layout**

The interface uses a split-panel layout. The left panel (approximately 70% width) contains the 3D viewport with orbit camera controls for rotation, zoom, and pan. The right panel (approximately 30% width) houses the neighborhood info panel (showing HOLC grade, description, current data), the AI Guide chat interface, and view mode toggles. A bottom toolbar provides the time slider, city selector, and layer visibility controls.

## **10.2 Visual Design Principles**

* **Dark background (0x1A1A2E)** to make HOLC grade colors visually prominent and evoke the gravity of the subject

* **Original HOLC colors preserved** (green, blue, yellow, red) for immediate recognition by anyone familiar with redlining maps

* **Ghost buildings in red wireframe** to create a haunting visual of what was lost, distinct from solid current buildings

* **Typography uses the original HOLC assessment language** prominently, including racist terminology, with contextual framing — the words should be uncomfortable because the policy was

# **11\. Phased Delivery Plan**

## **Phase 1: MVP — Milwaukee HOLC Explorer (Weeks 1–2)**

* Three.js scene with Milwaukee HOLC zones extruded by grade

* Click-to-inspect: HOLC grade, original appraiser description displayed in info panel

* Claude API integration for AI Guide with neighborhood-aware system prompt

* View toggle between HOLC grades and Census income data

* Basic UI: split panel layout, orbit controls, responsive design

* Deploy to Vercel

## **Phase 2: Building-Level Detail (Weeks 3–4)**

* Integrate MPROP \+ parcel data: individual buildings extruded by stories within HOLC zones

* MCLIO Sanborn map integration as ground-plane texture

* Ghost building detection via MPROP historical comparison

* Time slider with animated transitions (GSAP)

* ElevenLabs voice narration of HOLC descriptions and AI guide responses

## **Phase 3: Full Narrative Experience (Weeks 5–6)**

* Guided Bronzeville narrative with auto-camera animation

* Additional data overlays: health outcomes (CDC PLACES), environmental burden (EJScreen), tree canopy

* Historical photograph integration from LOC HABS/HAER and FSA collections

* "What If" counterfactual mode using LLM

* Multi-city support (Chicago, Detroit, Atlanta comparisons)

* Embeddable iframe mode for news organizations

# **12\. API and Service Requirements**

| Service | Purpose | Free Tier | Sign Up |
| :---- | :---- | :---- | :---- |
| Claude API (Anthropic) | AI narrative guide | $5 credit on signup | console.anthropic.com |
| ElevenLabs | Voice narration | 10K chars/month | elevenlabs.io |
| US Census API | Demographic data | Unlimited (free key) | api.census.gov/data/key\_signup.html |
| Mapbox (optional) | Base map tiles | 50K loads/month | mapbox.com |
| MCLIO ArcGIS (UWM) | Georeferenced Sanborn tiles | Free public endpoint | No signup required |
| Mapping Inequality | HOLC GeoJSON data | Free direct download | No signup required |
| Milwaukee Open Data | MPROP, parcels, vacant buildings | Free direct download | No signup required |

# **13\. Performance Requirements**

* **Initial load under 5 seconds** on broadband connection. HOLC GeoJSON for Milwaukee is approximately 2MB. Pre-process and bundle as static JSON.

* **60 FPS rendering** for the HOLC zone view (approximately 50 extruded polygons). Building-level view may require LOD (level of detail) culling for the full 160,000 MPROP dataset — filter to parcels within visible HOLC zones only.

* **LLM response under 3 seconds** using streaming responses from Claude API.

* **Sanborn tile loading** should use progressive resolution: load low-res overview first, then fetch higher-resolution tiles as user zooms into specific zones.

# **14\. Risks and Mitigations**

| Risk | Severity | Mitigation |
| :---- | :---- | :---- |
| MCLIO ArcGIS endpoint rate limiting or downtime | Medium | Pre-cache Sanborn tiles for key HOLC zones; store as static assets |
| MPROP parcel shapefile coordinate system mismatch | High | Use ogr2ogr for batch reprojection from State Plane to WGS84 in data pipeline; UWM may provide pre-projected files |
| Three.js performance with 160K building polygons | High | Filter to parcels within active HOLC zone bounding box; implement LOD; use InstancedMesh for uniform buildings |
| Sensitive content in HOLC descriptions | Medium | Provide clear historical context framing; content warning on entry; educator guide |
| Census tract boundaries not aligning with HOLC zones | Medium | Use pre-joined Census\_HOLC\_Research dataset from americanpanorama GitHub; area-weighted interpolation for split tracts |
| LLM generating inaccurate historical claims | Medium | Ground system prompts with actual HOLC data; use retrieval-augmented context; display source data alongside AI narrative |

# **15\. Success Metrics**

* **User engagement:** Average session duration over 3 minutes (indicating users are exploring, not bouncing)

* **AI Guide usage:** At least 30% of sessions include at least one question to the AI guide

* **Community impact:** Featured in at least one Milwaukee media outlet during Black History Month 2026

* **Technical achievement:** Viable hackathon submission with all five data layers rendering in a single 3D scene

* **Data journalism:** Publishable as a Substack Intersection piece with embedded interactive views

# **16\. Future Extensions**

* **Multi-city comparison mode:** Load Milwaukee alongside Chicago, Detroit, and Atlanta to show the pattern repeating across cities. HOLC GeoJSON is available for 200+ cities.

* **Racial covenant overlay:** Integrate restrictive covenant data from the Mapping Prejudice project (University of Minnesota) showing individual deed restrictions.

* **Community memory layer:** Allow residents to attach oral histories, photos, and memories to specific buildings or locations, crowdsourcing the narrative.

* **VR/AR mode:** WebXR integration for immersive walkthroughs of historical neighborhoods using Sanborn map data for spatial reconstruction.

* **Radio Milwaukee integration:** Produce companion audio segments for 88Nine/HYFIN using Redlined data and AI-generated narration, connecting the web experience to broadcast.

# **Appendix A: Key URLs and Endpoints**

| Resource | URL |
| :---- | :---- |
| HOLC GeoJSON (Milwaukee) | dsl.richmond.edu/panorama/redlining/static/downloads/geojson/WIMilwaukee1938.geojson |
| Census HOLC Research (GitHub) | github.com/americanpanorama/Census\_HOLC\_Research |
| MCLIO Sanborn ArcGIS Service | webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer |
| UWM Sanborn Interactive Map | webgis.uwm.edu/agsl/sanborn/ |
| Milwaukee Open Data Portal | data.milwaukee.gov |
| MPROP Documentation | city.milwaukee.gov/ImageLibrary/Public/GIS/MMDocumentation/MPROP\_Documentation.pdf |
| LOC Sanborn Collection | loc.gov/collections/sanborn-maps/?fa=location:milwaukee |
| LOC IIIF Image API | tile.loc.gov/image-services/iiif/ |
| AWS Sanborn Bulk Download | s3://loc-sanborn-maps/ |
| Census API | api.census.gov/data.html |
| CDC PLACES | cdc.gov/places/ |
| EPA EJScreen | ejscreen.epa.gov/mapper/ |
| LOC HABS/HAER | loc.gov/pictures/collection/hh/ |
| LOC FSA/OWI Photos | loc.gov/pictures/search/?co=fsa |
| Claude API Console | console.anthropic.com |
| ElevenLabs | elevenlabs.io |

# **Appendix B: HOLC Grade Definitions**

| Grade | Label | Color | Typical Description | Present-Day Correlation |
| :---- | :---- | :---- | :---- | :---- |
| A | Best | Green | New, homogeneous, in-demand areas. "American business and professional men." | Highest median income, home values, tree canopy, life expectancy |
| B | Still Desirable | Blue | Established, stable areas. "Still good" but past peak. | Above-average outcomes, trending toward gentrification |
| C | Declining | Yellow | Areas with "infiltration" of "lower grade population." Often cited aging housing stock. | Mixed outcomes, transitional zones |
| D | Hazardous | Red | Explicitly cited presence of Black, immigrant, or Jewish residents. "Redlined." Denied mortgages and investment. | Lowest income, worst health outcomes, highest environmental burden, most segregated |

*— End of Document —*