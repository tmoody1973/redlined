# Milestone 3: AI Narrative Guide

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-2 complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Three.js scene setup and rendering pipeline
- Data ingestion pipeline (HOLC GeoJSON, MPROP CSV, Census API, CDC, EPA)
- AI integration (Claude API for narrative guide, ElevenLabs for voice)
- State management for zone selection, time slider, view modes
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your state management and data layer
- **DO** replace sample data with real data from your data pipeline
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no zone/building is selected
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the 3D rendering and data layer

---

## Goal

Implement the AI Narrative Guide — a Claude-powered chat panel with neighborhood-aware context, suggested prompts, streaming responses, and ElevenLabs voice narration.

## Overview

The AI Narrative Guide occupies the bottom portion of the right panel. When a user selects a zone, the guide's system prompt dynamically updates with that zone's HOLC data, Census statistics, and original appraiser description. Users ask questions in natural language and receive streaming AI responses that connect historical redlining to present-day outcomes. Voice narration reads both the original HOLC descriptions and AI responses aloud.

**Key Functionality:**
- Claude API integration with zone-aware system prompts
- Streaming text display for AI responses
- Suggested prompt buttons for common questions
- ElevenLabs voice narration with play/pause controls
- Auto-narration of HOLC appraiser descriptions when zone is selected
- Volume/mute toggle

## Recommended Approach: Test-Driven Development

See `product-plan/sections/ai-narrative-guide/tests.md` for test-writing instructions.

## What to Implement

### Components
Copy from `product-plan/sections/ai-narrative-guide/components/`:
- `NarrativeGuide.tsx` — Main chat panel with input, messages, and prompts
- `ChatMessage.tsx` — Individual message bubble with audio controls
- `AudioWaveform.tsx` — Animated waveform for audio playback indicator

### AI Integration
- Claude Sonnet 4 API with streaming responses
- Dynamic system prompt construction per zone:
  - HOLC grade, ID, and original appraiser description
  - Current Census data (median income, home values)
  - Computed statistics (A-vs-D differentials)
  - Instruction to be direct about racism, not sanitize language
- Conversation state management (messages persist within session)

### Voice Integration
- ElevenLabs TTS API for narration
- Auto-narrate HOLC descriptions when zone is selected (unless muted)
- "Listen" button on AI responses for on-demand narration
- Audio playback state management (idle, playing, paused, finished)

### Callbacks
- `onSendMessage(content: string)` — User sends a chat message
- `onSelectPrompt(promptId: string)` — User clicks suggested prompt
- `onPlayAudio(messageId: string)` — Play narration
- `onPauseAudio(messageId: string)` — Pause narration
- `onToggleMute()` — Toggle auto-narration

## Expected User Flows

### Flow 1: Ask About a Neighborhood
1. User selects zone D-7 on the map
2. Chat panel shows "Discussing: D-7 Bronzeville"
3. HOLC description auto-narrates aloud
4. Suggested prompts appear
5. User types "What happened to this neighborhood?"
6. Streaming AI response appears, connecting HOLC grade to present outcomes
7. **Outcome:** User understands the historical chain of causation

### Flow 2: Use Suggested Prompts
1. User clicks "Why was this area graded D?"
2. AI responds with the original appraiser's language and historical context
3. **Outcome:** User hears the racist justification in context

### Flow 3: Listen to Narration
1. User clicks "Listen" on an AI response
2. ElevenLabs narration plays, waveform animates
3. User clicks pause to stop
4. **Outcome:** NPR-style audio experience

## Files to Reference
- `product-plan/sections/ai-narrative-guide/README.md`
- `product-plan/sections/ai-narrative-guide/tests.md`
- `product-plan/sections/ai-narrative-guide/components/`
- `product-plan/sections/ai-narrative-guide/types.ts`
- `product-plan/sections/ai-narrative-guide/sample-data.json`
- `product-plan/sections/ai-narrative-guide/screenshot.png`

## Done When
- [ ] Tests written for key user flows
- [ ] Claude API integration with streaming responses
- [ ] System prompt updates dynamically per zone
- [ ] Suggested prompts display and trigger AI responses
- [ ] Chat messages render with correct styling
- [ ] ElevenLabs narration plays on demand
- [ ] Auto-narration of HOLC descriptions works
- [ ] Mute toggle works
- [ ] Audio waveform animates during playback
