# Tailwind Color Configuration

## Color Choices

- **Primary:** `red` — Used for HOLC D-grade zones, ghost building wireframes, action buttons, recording indicators
- **Secondary:** `amber` — Used for differential callouts, content warnings, secondary highlights
- **Neutral:** `slate` — Used for backgrounds, text, borders, panels (dark-first application)

## Usage Examples

Primary button: `bg-red-600 hover:bg-red-500 text-white`
Ghost wireframe: `border-red-500/30` with `opacity-30`
Secondary callout: `bg-amber-500/5 border-amber-500/15 text-amber-400/80`
Neutral background: `bg-slate-950` (app), `bg-slate-900` (panels)
Neutral text: `text-slate-200` (headings), `text-slate-400` (body), `text-slate-600` (muted)
Neutral border: `border-slate-800`

## HOLC Grade Colors

These are specific hex colors used throughout the application for HOLC grades:

- **Grade A (Best):** `#4CAF50` — `bg-green-500/10 text-green-400 border-green-500/30`
- **Grade B (Still Desirable):** `#2196F3` — `bg-blue-500/10 text-blue-400 border-blue-500/30`
- **Grade C (Declining):** `#FFEB3B` — `bg-yellow-500/10 text-yellow-400 border-yellow-500/30`
- **Grade D (Hazardous):** `#F44336` — `bg-red-500/10 text-red-400 border-red-500/30`

## Construction Era Colors

- **Pre-1938 (Pre-Redlining):** `#B87333` (copper)
- **1938-1970 (Urban Renewal):** `#808080` (gray)
- **Post-1970 (Modern):** `#4FC3F7` (light blue)

## Dark-First Design

This is a dark-first application. The dark background (`slate-950`) ensures HOLC grade colors and data visualizations remain vivid and visually prominent. There is no light mode.
