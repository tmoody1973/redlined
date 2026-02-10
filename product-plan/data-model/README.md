# Data Model

## Entities

### City
A metropolitan area with HOLC redlining data. Milwaukee is the initial city, with support for 200+ cities that have HOLC maps from the 1930s. Serves as the top-level container for all geographic data.

### HOLCZone
A graded neighborhood polygon from the 1938 HOLC maps. Each zone has a grade (A through D), a unique HOLC ID, polygon boundaries, and the original appraiser description — including the racist language used to justify the grades. Zones are the primary unit of interaction in the 3D scene.

### Building
A current property from the Milwaukee Master Property Record (MPROP). Contains address, year built, number of stories, assessed value, land use type, and owner-occupancy status. Each building is spatially joined to the HOLC zone it falls within, enabling grade-level analysis of present-day conditions.

### GhostBuilding
A demolished structure identified through historical MPROP comparison (2005 vs. 2025) or by detecting vacant parcels where Sanborn maps show buildings once stood. Represents what was lost to highway construction, urban renewal, and disinvestment. Rendered as a wireframe to visually haunt the scene.

### CensusTract
A geographic area carrying demographic and outcome data from the American Community Survey, CDC PLACES health data, CDC Social Vulnerability Index, and EPA EJScreen environmental scores. Tracts overlap with HOLC zones, enabling direct comparison between 1938 grades and present-day outcomes in income, health, and environmental burden.

### SanbornMap
A georeferenced historical fire insurance map tile from the 1894, 1910, or 1927 Sanborn atlases. Shows building-by-building documentation of neighborhoods — footprints, construction materials, building use, and number of stories — at the exact period when HOLC grades were being assigned. Served as ground-plane texture imagery.

### Conversation
An AI Guide chat session between the user and the Claude-powered narrative guide. Contains messages, the current neighborhood context (which zone or building the user is inspecting), suggested prompts, and voice narration state for ElevenLabs audio playback.

## Relationships

- City has many HOLCZones
- HOLCZone contains many Buildings
- HOLCZone contains many GhostBuildings
- HOLCZone overlaps with many CensusTracts (and vice versa)
- HOLCZone is covered by many SanbornMaps
- Building belongs to one HOLCZone
- GhostBuilding belongs to one HOLCZone
- Conversation is contextual to one HOLCZone or one Building
