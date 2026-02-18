# Application Shell

## Overview

Redlined uses a split-panel layout optimized for 3D data visualization. The 3D map viewport dominates the left side (~70%) while an always-visible info and chat panel occupies the right (~30%). A bottom toolbar provides time controls and layer toggles. The shell is intentionally dark to make HOLC grade colors visually prominent.

## Layout Pattern

- **Top Bar** (48px) — Product logo ("REDLINED"), city selector (Milwaukee 1938), content warning toggle
- **Main Area** — Split panel: 3D viewport (left) + info/chat panel (right)
- **Right Panel** — Stacked: neighborhood info (top 55%) + AI Guide chat (bottom 45%)
- **Bottom Toolbar** (64px) — Time slider with era markers + view mode toggles

## Navigation Structure

- 3D Map Explorer → Main viewport (left panel)
- Neighborhood Info → Right panel, top section
- AI Narrative Guide → Right panel, bottom section
- Time Slider → Bottom toolbar, center
- View Mode Toggles → Bottom toolbar (HOLC Grades, Sanborn, Buildings, Ghost, Income, Health, Displacement)
- City Selector → Top bar

## Components Provided

- `AppShell.tsx` — Main layout wrapper with all panels
- `MainNav.tsx` — Top navigation bar with logo and city selector
- `BottomToolbar.tsx` — Time slider and view mode toggles
- `InfoPanel.tsx` — Right panel neighborhood info display

## Design Notes

- Dark-first: `slate-950` background, no light mode
- HOLC grade colors must remain vivid against dark backgrounds
- Right panel feels like a documentary sidebar
- Time slider is a critical interaction — should feel substantial
- No user authentication — this is a public data journalism tool

## Callback Props

| Callback                 | Description                               |
| ------------------------ | ----------------------------------------- |
| `onCityChange`           | Called when user selects a different city |
| `onYearChange`           | Called when user drags the time slider    |
| `onViewModeToggle`       | Called when user toggles a layer on/off   |
| `onContentWarningToggle` | Called when user toggles content warning  |

## Visual Reference

See `screenshot.png` for the shell visual reference.
