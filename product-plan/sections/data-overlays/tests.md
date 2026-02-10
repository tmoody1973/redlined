# Test Instructions: Data Overlays

These test-writing instructions are **framework-agnostic**. Adapt to your testing setup.

## Overview
Test choropleth rendering, layer switching, opacity control, zone stats, and A-vs-D comparison.

---

## User Flow Tests

### Flow 1: Activate Overlay
**Scenario:** User selects the Median Income layer

**Steps:**
1. User clicks "Median Income" in the layer selector

**Expected Results:**
- [ ] Zones fill with choropleth colors based on income values
- [ ] A-zones appear green (high income), D-zones appear red (low income)
- [ ] Layer button shows active state (highlighted)
- [ ] Color scale legend appears: "$18K — $120K"
- [ ] Opacity slider appears
- [ ] `onLayerChange` fires with "income"

### Flow 2: View Zone Stats
**Scenario:** User clicks a zone to see detailed stats

**Steps:**
1. Income overlay is active
2. User clicks zone D-7 (Bronzeville)

**Expected Results:**
- [ ] Stats panel shows zone name "Bronzeville / 6th & Walnut" with D grade badge
- [ ] Shows big number: "$24,800" with "8th percentile"
- [ ] Shows source: "U.S. Census ACS 5-Year Estimates"
- [ ] Shows A-Zone vs D-Zone comparison:
  - A-Zone Avg: $105,600 (green bar)
  - This Zone: $24,800 (red bar)
  - D-Zone Avg: $23,450 (red bar)
- [ ] Shows differential: "4.5x higher in A-zones"
- [ ] Shows callout: "85 years after HOLC grades were assigned"

### Flow 3: Switch Layers
**Scenario:** User switches from Income to Health Outcomes

**Steps:**
1. Income overlay active
2. User clicks "Health Outcomes"

**Expected Results:**
- [ ] Zone colors transition to health burden scale
- [ ] Legend updates to "0 (Healthy) — 100 (Severe)"
- [ ] Income button deactivates, Health button activates
- [ ] Stats panel updates if zone is selected
- [ ] `onLayerChange` fires with "health"

### Flow 4: Adjust Opacity
**Scenario:** User adjusts overlay transparency

**Steps:**
1. User drags opacity slider from 70% to 40%

**Expected Results:**
- [ ] Zone fill opacity decreases visually
- [ ] Percentage label updates to "40%"
- [ ] `onOpacityChange` fires with 0.4

---

## Empty State Tests

### No Layer Active
**Setup:** No overlay layer selected

**Expected Results:**
- [ ] Stats panel shows "Select an overlay" message
- [ ] Shows chart icon and help text: "Choose Income, Health, Environment, or Value to see data"
- [ ] Zones show HOLC grade colors (not choropleth)
- [ ] No opacity slider visible
- [ ] No color scale legend visible

### Layer Active, No Zone Selected
**Setup:** Income layer active, no zone clicked

**Expected Results:**
- [ ] Shows "Active Overlay: Median Income" header
- [ ] Shows layer description and source
- [ ] Shows grade comparison table (A: $105,600, B: $62,800, C: $40,050, D: $23,450)
- [ ] Shows "Click a zone on the map to see detailed stats"

---

## Edge Cases
- [ ] Deselecting active layer returns to HOLC grade colors
- [ ] Hover tooltip shows formatted metric value
- [ ] Currency values format correctly ($24,800 not 24800)
- [ ] Percentile values format correctly ("8th pctile")
- [ ] Index values format correctly ("82/100")
- [ ] Switching layers preserves selected zone
