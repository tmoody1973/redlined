# Building-Level Detail

## Overview
Adds individual property rendering using Milwaukee's MPROP data. Each building is extruded by number of stories and color-coded by construction era — copper for pre-1938, gray for 1938-1970, light blue for post-1970. Buildings load dynamically within the visible HOLC zone.

## User Flows
- User toggles "Buildings" layer; buildings load within selected zone
- User hovers a building; tooltip shows address and year
- User clicks a building; info panel shows MPROP property data
- User clicks breadcrumb to return to zone view

## Components Provided
- `BuildingDetail` — Main viewport with building rendering and controls
- `BuildingBlock` — Individual building with era coloring and hover states
- `BuildingInfoPanel` — Property info panel with MPROP fields and breadcrumb

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSelectBuilding` | Called when user clicks a building |
| `onHoverBuilding` | Called when user hovers/unhovers a building |
| `onBackToZone` | Called when user clicks breadcrumb to return |
| `onToggleLayer` | Called when user toggles buildings layer |

## Visual Reference
See `screenshot.png` for the target UI design.
