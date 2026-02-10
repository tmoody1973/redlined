# Section Implementation Prompt

## Define Section Variables

- **SECTION_NAME** = [Human-readable name, e.g., "3D Map Explorer" or "AI Narrative Guide"]
- **SECTION_ID** = [Folder name in sections/, e.g., "3d-map-explorer" or "ai-narrative-guide"]
- **NN** = [Milestone number, e.g., "02" or "03" — sections start at 02 since 01 is Foundation]

---

I need you to implement the **SECTION_NAME** section of my application.

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary for overall context
2. **@product-plan/instructions/incremental/NN-SECTION_ID.md** — Specific instructions for this section

Also review the section assets:
- **@product-plan/sections/SECTION_ID/README.md** — Feature overview and design intent
- **@product-plan/sections/SECTION_ID/tests.md** — Test-writing instructions (use TDD approach)
- **@product-plan/sections/SECTION_ID/components/** — React components to integrate
- **@product-plan/sections/SECTION_ID/types.ts** — TypeScript interfaces
- **@product-plan/sections/SECTION_ID/sample-data.json** — Test data

## Before You Begin

Please ask me clarifying questions about:

1. **Data Integration**
   - How should this section's data be fetched? (Static JSON, API endpoint, real-time?)
   - Are there any data pipeline steps needed before this section can work?

2. **Three.js Integration** (if applicable)
   - How should the provided CSS perspective preview translate to real Three.js geometry?
   - Camera controls, lighting, and material choices?

3. **Dependencies on Other Sections**
   - Does this section depend on data or state from other sections?
   - How should cross-section communication work? (shared state, events, URL params?)

4. **Performance Considerations**
   - Any specific performance targets for this section?
   - Data volume and loading strategy?

5. **Any Other Clarifications**
   - Questions about specific user flows in this section
   - Edge cases that need clarification

## Implementation Approach

Use test-driven development:
1. Read the `tests.md` file and write failing tests first
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

Lastly, be sure to ask me if I have any other notes to add for this implementation.

Once I answer your questions, proceed with implementation.
