# Data Overlays

## Overview

Stacks present-day outcome data on HOLC zone geography. Four overlay layers — Census income, CDC health, EPA environment, and assessed value — render as choropleth color fills. A stats panel shows zone-specific data alongside A-zone vs D-zone averages, revealing that 85 years after HOLC grades were assigned, the differentials persist.

## User Flows

- User selects an overlay layer; zones fill with choropleth colors
- User adjusts opacity slider
- User clicks a zone; stats panel shows metric value, percentile, and A-vs-D comparison
- User switches layers; colors crossfade smoothly
- User hovers a zone; tooltip shows metric value

## Components Provided

- `DataOverlays` — Main viewport with choropleth zones, layer selector, opacity slider, legend
- `OverlayStatsPanel` — Stats panel with grade comparison, zone detail, and differential callout

## Callback Props

| Callback          | Description                                         |
| ----------------- | --------------------------------------------------- |
| `onLayerChange`   | Called when user selects/deselects an overlay layer |
| `onOpacityChange` | Called when user adjusts overlay opacity            |
| `onZoneSelect`    | Called when user clicks a zone                      |
| `onZoneHover`     | Called when user hovers/unhovers a zone             |

## Visual Reference

See `screenshot.png` for the target UI design.
