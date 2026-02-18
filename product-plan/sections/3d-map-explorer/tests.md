# Test Instructions: 3D Map Explorer

These test-writing instructions are **framework-agnostic**. Adapt to your testing setup.

## Overview

Test the core 3D viewport interactions: zone rendering, hover highlights, click selection, and info panel population.

---

## User Flow Tests

### Flow 1: Zone Rendering

**Scenario:** All HOLC zones render correctly in the scene

**Setup:**

- Load sample HOLC zones (8 zones: 2 A-grade, 2 B-grade, 2 C-grade, 2 D-grade)

**Expected Results:**

- [ ] All 8 zones render as visible blocks
- [ ] A-grade zones are green (#4CAF50)
- [ ] B-grade zones are blue (#2196F3)
- [ ] C-grade zones are yellow (#FFEB3B)
- [ ] D-grade zones are red (#F44336)
- [ ] A-grade zones appear tallest, D-grade zones shortest
- [ ] Scene has dark background

### Flow 2: Zone Hover

**Scenario:** Hovering a zone shows a highlight and tooltip

**Steps:**

1. User hovers over zone "D-7"
2. Zone brightens/glows

**Expected Results:**

- [ ] Zone material brightens on hover
- [ ] Tooltip appears with zone name "Bronzeville / Walnut St Area"
- [ ] Tooltip shows HOLC ID "D-7" and median income
- [ ] `onZoneHover` callback fires with zone ID

### Flow 3: Zone Selection

**Scenario:** Clicking a zone populates the info panel

**Steps:**

1. User clicks zone "D-7"
2. Info panel updates

**Expected Results:**

- [ ] Zone shows selection ring/highlight
- [ ] Info panel shows zone name "Bronzeville / Walnut St Area"
- [ ] Info panel shows HOLC grade badge "D" with "Hazardous" label
- [ ] Info panel shows original appraiser description in italicized blockquote
- [ ] `onZoneSelect` callback fires with zone ID

---

## Empty State Tests

### No Zone Selected

**Setup:** No zone has been clicked

**Expected Results:**

- [ ] Info panel shows "Select a neighborhood"
- [ ] Info panel shows cursor icon and help text
- [ ] All zones render at default opacity

---

## Edge Cases

- [ ] Zones with very long names truncate properly
- [ ] Scene renders correctly with 1 zone and 50+ zones
- [ ] Orbit controls work on touch devices
- [ ] Multiple rapid clicks don't break selection state
