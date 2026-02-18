# Test Instructions: Building-Level Detail

These test-writing instructions are **framework-agnostic**. Adapt to your testing setup.

## Overview

Test building rendering, era color coding, hover tooltips, click-to-inspect, and breadcrumb navigation.

---

## User Flow Tests

### Flow 1: View Buildings

**Scenario:** Buildings load when layer is activated

**Setup:**

- Zone D-7 selected with 6 buildings loaded

**Expected Results:**

- [ ] All 6 buildings render in the viewport
- [ ] Pre-1938 buildings are copper (#B87333)
- [ ] 1938-1970 buildings are gray (#808080)
- [ ] Post-1970 buildings are light blue (#4FC3F7)
- [ ] Taller buildings (more stories) appear taller
- [ ] Era legend shows three color categories

### Flow 2: Inspect a Building

**Scenario:** User clicks a building to see details

**Steps:**

1. User hovers building at "2438 N 6th St"
2. Tooltip shows address and "Built 1922"
3. User clicks the building

**Expected Results:**

- [ ] Building shows selection highlight
- [ ] Info panel shows breadcrumb: "D-7 > 2438 N 6th St"
- [ ] Shows era tag "Pre-Redlining" with copper color
- [ ] Shows MPROP fields: Stories (2), Assessed ($68,000), Land Use (Residential), Owner-Occ (No)
- [ ] Shows TAXKEY identifier

### Flow 3: Navigate Back

**Scenario:** User returns to zone view

**Steps:**

1. User has building selected
2. User clicks zone badge in breadcrumb

**Expected Results:**

- [ ] Building deselects
- [ ] Info panel returns to zone-level view
- [ ] `onBackToZone` callback fires

### Flow 4: Toggle Layer

**Scenario:** User turns buildings on and off

**Steps:**

1. User clicks "Buildings OFF"
2. Buildings disappear
3. User clicks "Buildings ON"
4. Buildings reappear

**Expected Results:**

- [ ] Buildings visibility toggles
- [ ] Toggle button label updates
- [ ] `onToggleLayer` fires with visibility state

---

## Empty State Tests

### No Building Selected

**Setup:** Buildings loaded but none clicked

**Expected Results:**

- [ ] Info panel shows zone header with grade badge
- [ ] Shows "Select a building" message with building icon
- [ ] Shows "Click any structure to see property details"

---

## Edge Cases

- [ ] Vacant lots render with hatch pattern
- [ ] Buildings with 0 stories have minimum height
- [ ] Very high assessed values format correctly ($625,000)
- [ ] Very low assessed values format correctly ($1,000)
