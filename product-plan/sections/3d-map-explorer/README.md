# 3D Map Explorer

## Overview

The 3D Map Explorer is the core viewport — an interactive Three.js scene rendering Milwaukee's 1938 HOLC redlining zones as extruded 3D polygons. Zones are height-encoded by grade (A=tallest, D=lowest) and color-coded using the original HOLC palette. Clicking a zone reveals the original appraiser description.

## User Flows

- User orbits, zooms, and pans the 3D scene
- Hovering a zone highlights it with a glow effect
- Clicking a zone populates the info panel with grade, name, and appraiser description
- User switches view modes via bottom toolbar toggles
- User drags time slider to animate between eras

## Components Provided

- `MapExplorer` — Main viewport with zone rendering, legend, tooltip, and controls
- `ZoneBlock` — Individual zone block with hover/selection states and depth illusion

## Callback Props

| Callback           | Description                                  |
| ------------------ | -------------------------------------------- |
| `onZoneHover`      | Called when user hovers/unhovers a zone      |
| `onZoneSelect`     | Called when user clicks a zone to inspect it |
| `onViewModeToggle` | Called when user toggles a view mode layer   |
| `onYearChange`     | Called when user changes the time slider     |

## Visual Reference

See `screenshot.png` for the target UI design.
