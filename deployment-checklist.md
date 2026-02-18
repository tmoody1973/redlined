# Deployment Checklist: Phase 1 MVP -- Milwaukee HOLC Explorer

## 10.1 Configure Vercel Deployment

- [ ] Create a new Vercel project at https://vercel.com/new
- [ ] Link the Vercel project to the Git repository (GitHub import)
- [ ] Configure build settings:
  - Framework Preset: Next.js
  - Build Command: `next build` (default)
  - Output Directory: `.next` (default)
  - Install Command: `npm install` (default)
- [ ] Set environment variables in the Vercel dashboard:
  - `CONVEX_DEPLOYMENT` -- production Convex deployment URL (from `npx convex deploy`)
  - `NEXT_PUBLIC_CONVEX_URL` -- public Convex URL for the client (same as CONVEX_DEPLOYMENT)
- [ ] Configure Convex production deployment:
  - Run `npx convex deploy` to create the production deployment
  - Note the production deployment URL
- [ ] Set Convex environment variables for production:
  - `npx convex env set CLAUDE_API_KEY <your-anthropic-api-key> --prod`
  - `npx convex env set CENSUS_API_KEY <your-census-api-key> --prod`
  - Note: The Convex action references `process.env.ANTHROPIC_API_KEY`, so set that variable name:
    `npx convex env set ANTHROPIC_API_KEY <your-anthropic-api-key> --prod`
- [ ] Trigger a Vercel deployment and verify the build completes without errors
- [ ] Verify the deployed URL loads (even if data is not yet seeded)

## 10.2 Run Data Seed Pipeline on Production Convex

- [ ] Execute the HOLC zone and area description seed script against production:
  ```bash
  CONVEX_DEPLOYMENT=<prod-deployment-url> npx tsx scripts/run-seed.mts
  ```
- [ ] Execute the Census data pipeline against production:
  ```bash
  CONVEX_DEPLOYMENT=<prod-deployment-url> npx tsx scripts/seed-census.mts
  ```
- [ ] Verify data counts in the Convex dashboard (https://dashboard.convex.dev):
  - `holcZones` table: 114 records
  - `areaDescriptions` table: 112 records
  - `censusData` table: Census income data for Milwaukee HOLC zones
- [ ] Spot-check a few records:
  - Zone "6284" (A1, Shorewood) should have grade "A"
  - Zone "6300" (D1) should have grade "D"
  - Census data should have non-null medianIncome values for most zones

## 10.3 Verify Production Deployment End-to-End

Load the deployed URL and verify each of the following:

- [ ] **Landing overlay**: Appears on first load with "REDLINED: The Shape of Inequality" title and "Click a zone to begin" text
- [ ] **Landing overlay dismissal**: Clicking anywhere on the overlay dismisses it
- [ ] **HOLC zones render**: 114 extruded 3D blocks visible in the canvas with correct colors:
  - Green blocks (A-grade)
  - Blue blocks (B-grade)
  - Yellow blocks (C-grade)
  - Red blocks (D-grade, tallest)
  - Gray blocks (2 ungraded, shortest)
- [ ] **Zone click**: Clicking a zone populates the right-side info panel with:
  - Zone name
  - Grade badge (color-coded with text label)
  - Appraiser description fields
- [ ] **Content warning**: D-grade zones show the content warning banner before the appraiser description
- [ ] **Content warning dismissible**: "Show description" button reveals the content; "Hide description" hides it
- [ ] **AI chat**: Type a question in the chat input and click "Ask" or press Enter
  - Verify a streaming response appears from the AI Narrative Guide
  - Response should be flowing prose paragraphs (not bulleted lists)
- [ ] **Suggested questions**: Four pills appear when chat is empty; clicking one submits it
- [ ] **Zone-context divider**: Select a different zone and verify a divider message appears in the chat thread
- [ ] **Income overlay**: Click "Median Income" in the DATA OVERLAY section
  - Zones should recolor with a red-to-green income gradient
  - Income legend appears at the bottom of the canvas
  - Opacity slider appears and adjusts zone transparency
- [ ] **Income statistics**: With overlay active and a zone selected, verify:
  - Median income displayed as a large number
  - Percentile rank shown
  - A-Zone vs D-Zone comparison bars visible
  - Insight callout box shown (e.g., "4.7x higher in A-zones")
- [ ] **Overlay toggle off**: Clicking "Median Income" again restores original HOLC grade colors
- [ ] **Responsive -- Desktop (1280px+)**: 70/30 split layout, full info panel visible
- [ ] **Responsive -- Tablet (768px-1279px)**: 60/40 split layout
- [ ] **Responsive -- Mobile (<768px)**: Full-viewport canvas with slide-up bottom sheet

## 10.4 Performance Verification

Measure the following on a broadband connection (e.g., 50+ Mbps) using Chrome DevTools:

- [ ] **Initial page load**: Under 5 seconds to first meaningful paint
  - Measured value: _____ seconds
  - Tool: Chrome DevTools Performance tab or Lighthouse
- [ ] **3D rendering frame rate**: 60 FPS with all 114 zones visible
  - Measured value: _____ FPS
  - Tool: Chrome DevTools Performance tab (Frames section) or `Stats` from @react-three/drei
- [ ] **LLM streaming response**: First token appears within 3 seconds of submitting a question
  - Measured value: _____ seconds
  - Tool: Manual timing from button click to first visible text in the chat panel
- [ ] **Lighthouse scores** (optional but recommended):
  - Performance: _____ / 100
  - Accessibility: _____ / 100
  - Best Practices: _____ / 100
