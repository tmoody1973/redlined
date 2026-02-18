# Product Mission

## Pitch

**Redlined: The Shape of Inequality** is an interactive 3D web application that helps civic-engaged community members, educators, journalists, and policy makers understand how 1930s federal redlining policy physically and economically shaped the neighborhoods that exist today -- by transforming government grading data into an immersive experience where users can see, building by building, the lasting damage of racist housing policy. Starting with Milwaukee, one of America's most segregated cities.

## The Problem

### Redlining's Legacy is Invisible in Plain Sight

In the 1930s, the Home Owners' Loan Corporation (HOLC) graded American neighborhoods A through D. Neighborhoods where Black people lived were marked "D" -- hazardous -- in red. This grading determined who could get a mortgage, where investment flowed, and which communities were systematically starved of resources for generations. The effects persist today in wealth gaps, health disparities, environmental burden, and physical infrastructure, but the connection between a bureaucratic map drawn 90 years ago and a neighborhood's current condition is difficult for most people to see or feel.

Existing resources like the University of Richmond's Mapping Inequality project make the historical maps accessible, but they present the data as flat 2D overlays. The magnitude of the damage -- the missing buildings, the income cliffs at zone boundaries, the health outcomes that track grade lines -- remains abstract. Census tables and policy papers do not convey what it means to live inside a D-graded zone.

**Our Solution:** Transform the data into a 3D landscape where HOLC grades become physical terrain, buildings rise and fall with their assessed values, demolished structures appear as ghost wireframes, and an AI narrator reads the original appraiser descriptions aloud -- making the bureaucratic racism audible and the structural damage visible.

## Users

### Primary Audiences

- **Civic-engaged community members:** People who want to understand how policy shaped the neighborhood they live in or grew up in
- **Journalists and media professionals:** Reporters and editors covering segregation, housing, and urban policy who need data-driven visual storytelling tools
- **Educators and students:** Teachers and learners at the high school and university level exploring housing policy, racial inequality, and urban history
- **Urban planners and policy makers:** Professionals seeking evidence of redlining's persistent effects to inform current decisions
- **Milwaukee residents:** People with a personal connection to the city's neighborhoods and their history
- **Hackathon judges and tech community:** Evaluators assessing innovative use of 3D visualization, LLMs, and public data

### User Personas

**Maria** (35-45)

- **Role:** High school history teacher in Milwaukee
- **Context:** Teaching a unit on the civil rights movement and housing policy
- **Pain Points:** Students disengage from census tables and policy documents; hard to make structural racism tangible
- **Goals:** An interactive tool students can explore that makes the connection between historical policy and present-day neighborhood conditions visceral and undeniable

**James** (28-40)

- **Role:** Investigative journalist at a regional news outlet
- **Context:** Writing a series on Milwaukee's persistent segregation and the racial wealth gap
- **Pain Points:** Needs compelling visual evidence to accompany reporting; existing maps are static and do not show magnitude
- **Goals:** Embeddable, shareable visualizations that let readers explore the data themselves and see the story in the shape of the city

**Denise** (50-65)

- **Role:** Lifelong resident of Milwaukee's Bronzeville neighborhood
- **Context:** Grew up hearing stories about what the neighborhood used to be; watches it continue to change
- **Pain Points:** The history of her community is not well documented in accessible formats; official narratives ignore the policy decisions that caused decline
- **Goals:** See her neighborhood's history acknowledged, understand why things are the way they are, and share that understanding with younger family members

## Differentiators

### 3D Physicality, Not Flat Maps

Unlike Mapping Inequality and other 2D map overlays, Redlined extrudes HOLC zones and individual buildings into a 3D landscape. Users do not just see that a neighborhood was graded "D" -- they see the physical depression in property values, the gap in building density, and the missing structures. The dimensionality makes magnitude legible at a glance.

### AI-Narrated Primary Sources

Unlike static archives, Redlined uses Claude as a contextual AI guide and ElevenLabs for voice synthesis to read the original HOLC appraiser descriptions aloud. Users hear the racist language of the original documents spoken in a calm, NPR-style voice -- making the bureaucratic tone of institutional racism impossible to ignore.

### Building-Level Granularity

Unlike city-wide or tract-level visualizations, Redlined renders individual buildings using Milwaukee's MPROP dataset (160,000+ properties). Users can see specific parcels, their assessed values, their construction dates, and whether structures that once stood have been demolished. The ghost building wireframes make absence visible.

### Layered Modern Data

Unlike purely historical projects, Redlined overlays present-day Census income, CDC health outcomes, EPA environmental burden, and assessed value data on top of the historical HOLC grades -- making the causal throughline from 1930s policy to 2020s outcomes undeniable.

### Embeddable for Journalism

Unlike academic tools, Redlined is designed to be embedded in news articles via iframe. The application is built for the storytelling needs of journalists and educators, not just researchers.

## Key Features

### Core Features

- **3D Map Explorer:** Interactive Three.js scene with HOLC zones extruded by grade, orbit controls, and click-to-inspect panels showing grade, appraiser description, and neighborhood data
- **AI Narrative Guide:** Chat panel powered by Claude with zone-aware context, providing historically grounded explanations and answering user questions about what they are seeing
- **Data Overlays:** Toggle layers showing Census income, CDC health outcomes, EPA environmental burden, and assessed property values mapped against HOLC boundaries

### Building-Level Features

- **Individual Building Rendering:** MPROP property data and parcel boundaries extruded as individual 3D structures within HOLC zones, colored and scaled by assessed value and construction era
- **Ghost Buildings:** Historical comparison revealing demolished structures as red wireframes, making absence and loss visible in the landscape
- **Time Slider:** Animated era transitions (GSAP) letting users scrub through decades and watch neighborhoods change

### Narrative Features

- **Voice Narration:** ElevenLabs-powered NPR-style audio narration reading original HOLC appraiser descriptions and contextual commentary
- **Guided Bronzeville Tour:** Auto-camera narrative walking users through the story of Milwaukee's historic Black neighborhood
- **"What If" Counterfactual Mode:** LLM-powered exploration of what neighborhoods might look like today without redlining

## Success Metrics

- Average session duration exceeds 3 minutes
- 30% or more of sessions include interaction with the AI guide
- Featured in Milwaukee media during Black History Month 2026
- All 5 data layers rendering as a viable hackathon submission
- Publishable as a Substack piece on The Intersection

## Data Foundation

The project builds on three key public datasets already acquired or identified:

- **Milwaukee HOLC GeoJSON** (in project) -- 114 zone polygons for Milwaukee County with grades, neighborhood names, label coordinates, and bounding boxes. A separate all-cities file (10,154 features, 300 cities) is available for Phase 3 multi-city expansion.
- **HOLC Area Descriptions** (in project) -- 112 Milwaukee records with original appraiser text including racist language (`clarifying_remarks`, `infiltration_of`, `negro_yes_or_no`, `detrimental_influences`). This is the emotional core of the app -- what the AI narrator reads aloud and what appears in click-to-inspect panels. Joins to GeoJSON on `area_id`.
- **Census-HOLC Crosswalk** (GitHub: americanpanorama/mapping-inequality-census-crosswalk) -- Pre-computed spatial join linking HOLC zones to 2010/2020 Census tracts with area-weighted percentages, enabling direct demographic data joins without manual GIS work.
- **Historic Redlining Scores** (openICPSR 141121 V3) -- Continuous redlining severity scores per Census tract for 2000/2010/2020, providing a ready-made quantitative measure of redlining impact for 142 cities.

These are supplemented by freely available datasets from Milwaukee Open Data (MPROP properties, parcel boundaries), the US Census API, CDC PLACES, EPA EJScreen, and the Library of Congress.

## Creator

Tarik Moody, Radio Milwaukee / The Intersection
