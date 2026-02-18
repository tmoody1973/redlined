# Test Instructions: Ghost Buildings & Time Slider

These test-writing instructions are **framework-agnostic**. Adapt to your testing setup.

## Overview

Test ghost building visibility driven by time slider, GSAP transitions, ghost inspection, and auto-play.

---

## User Flow Tests

### Flow 1: Time-Driven Visibility

**Scenario:** Ghost buildings appear after their demolition year

**Setup:**

- 10 ghost buildings: 4 demolished in 1963-65, 3 in 1968-72, 3 in 1988-2010

**Steps:**

1. Set time slider to 1938
2. Set time slider to 1965
3. Set time slider to 2025

**Expected Results:**

- [ ] At 1938: 0 ghosts visible (none demolished yet)
- [ ] At 1965: 4 ghosts visible (highway demolitions)
- [ ] At 2025: 10 ghosts visible (all demolished)
- [ ] Ghost count updates: "4 of 10 structures demolished" at 1965
- [ ] Ghosts fade in with 700ms crossfade transition

### Flow 2: Inspect a Ghost

**Scenario:** User clicks a ghost building

**Steps:**

1. User clicks ghost at "623 W Walnut St"

**Expected Results:**

- [ ] Info panel shows breadcrumb: "D-7 > 623 W Walnut St"
- [ ] Shows "Demolished Structure" label
- [ ] Shows timeline: "Built 1905 → Demolished 1963"
- [ ] Shows "Stood 58 years / Gone 62 years"
- [ ] Shows cause tag: "Highway Construction" (red)
- [ ] Shows "What it was": original building use
- [ ] Shows "What happened": demolition narrative
- [ ] Shows "What's there now": current site description

### Flow 3: Auto-Play

**Scenario:** User clicks auto-play to sweep through eras

**Steps:**

1. User clicks "Auto-play" button

**Expected Results:**

- [ ] Button changes to "Pause"
- [ ] Scene transitions through 1910 → 1938 → 1960s → Now
- [ ] 3-second pause at each era marker
- [ ] Era description displays at each stop
- [ ] Ghost buildings fade in at appropriate eras
- [ ] `onToggleAutoPlay` callback fires

---

## Empty State Tests

### No Ghost Selected

**Setup:** Ghost layer visible, none clicked

**Expected Results:**

- [ ] Shows zone header with grade badge
- [ ] Shows "Structures Lost" count (10)
- [ ] Shows "Select a ghost building" message
- [ ] Ghost wireframe icon shown

---

## Edge Cases

- [ ] Ghost blocks have dashed red borders (not solid)
- [ ] Ghost interiors show cross-hatch pattern
- [ ] Pulse animation visible at 30% opacity
- [ ] Selected ghost shows solid border (not dashed)
- [ ] Era markers snap correctly on time slider
- [ ] Auto-play stops when user manually drags slider
