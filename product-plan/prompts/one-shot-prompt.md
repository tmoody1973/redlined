# One-Shot Implementation Prompt

I need you to implement a complete web application based on detailed design specifications and UI components I'm providing.

## Instructions

Please carefully read and analyze the following files:

1. **@product-plan/product-overview.md** — Product summary with sections and data model overview
2. **@product-plan/instructions/one-shot-instructions.md** — Complete implementation instructions for all milestones

After reading these, also review:

- **@product-plan/design-system/** — Color and typography tokens
- **@product-plan/data-model/** — Entity types and relationships
- **@product-plan/shell/** — Application shell components
- **@product-plan/sections/** — All section components, types, sample data, and test instructions

## Before You Begin

Please ask me clarifying questions about:

1. **Authentication & Authorization**
   - This is a public data journalism tool — there are no user accounts or login
   - However, do we want optional admin access for content management?

2. **Data Pipeline & Sources**
   - HOLC GeoJSON comes from University of Richmond's Mapping Inequality project
   - Milwaukee MPROP CSV from the City of Milwaukee Open Data Portal
   - Census data via the free Census API
   - CDC PLACES for health outcomes
   - EPA EJScreen for environmental burden
   - Sanborn maps via UWM's ArcGIS endpoint
   - How should these be ingested? Static build-time JSON, or runtime API calls?

3. **Tech Stack Preferences**
   - What frontend framework should I use? (Next.js recommended for SSR + static data)
   - Three.js is required for 3D rendering
   - GSAP for time slider animations
   - Claude API for AI Narrative Guide
   - ElevenLabs API for voice narration
   - Any specific hosting/deployment requirements? (Vercel recommended)

4. **AI Integration**
   - Claude Sonnet 4 for the AI Narrative Guide — streaming responses
   - System prompt dynamically constructed per-zone with HOLC data + Census data
   - ElevenLabs for text-to-speech narration of AI responses and HOLC descriptions
   - API keys management approach?

5. **Performance & Data Loading**
   - HOLC GeoJSON is ~2MB — pre-bundle as static JSON?
   - 160K MPROP buildings — LOD culling strategy? Load per-zone bounding box?
   - Sanborn tiles — progressive loading? Low-res overview → high-res on zoom?
   - Target: 60 FPS rendering, <5 second initial load

6. **Any Other Clarifications**
   - Questions about specific features or user flows
   - Edge cases that need clarification
   - Integration requirements

Lastly, be sure to ask me if I have any other notes to add for this implementation.

Once I answer your questions, create a comprehensive implementation plan before coding.
