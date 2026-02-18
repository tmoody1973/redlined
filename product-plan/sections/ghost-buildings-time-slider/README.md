# Ghost Buildings & Time Slider

## Overview

Reveals demolished structures as red wireframes at 30% opacity alongside current buildings. A GSAP-powered time slider transitions across four eras (1910, 1938, 1960s, present), making the chain of destruction visible — particularly in Bronzeville where Interstate-43 and urban renewal erased an entire neighborhood.

## User Flows

- User drags time slider; ghost buildings fade in after their demolition year
- User clicks a ghost building; info panel shows what was demolished and why
- User clicks auto-play; scene sweeps through all four eras
- User toggles ghost layer visibility

## Components Provided

- `GhostBuildingsTimeSlider` — Main viewport with ghost rendering and time controls
- `GhostBlock` — Individual ghost wireframe with pulse animation
- `GhostInfoPanel` — Demolished building info with timeline and demolition cause

## Callback Props

| Callback             | Description                               |
| -------------------- | ----------------------------------------- |
| `onSelectGhost`      | Called when user clicks a ghost building  |
| `onHoverGhost`       | Called when user hovers/unhovers a ghost  |
| `onYearChange`       | Called when user drags time slider        |
| `onBackToZone`       | Called when user clicks breadcrumb        |
| `onToggleGhostLayer` | Called when user toggles ghost visibility |
| `onToggleAutoPlay`   | Called when user starts/stops auto-play   |

## Visual Reference

See `screenshot.png` for the target UI design.
