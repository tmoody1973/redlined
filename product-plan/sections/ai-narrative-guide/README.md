# AI Narrative Guide

## Overview
A Claude-powered chat panel providing contextual narration about HOLC neighborhoods. Dynamically updates its system prompt when the user selects a zone, incorporating HOLC data, Census statistics, and original appraiser descriptions. Includes ElevenLabs voice narration.

## User Flows
- User selects a zone; chat context updates and HOLC description auto-narrates
- User types a question; streaming AI response appears
- User clicks suggested prompt buttons
- User clicks "Listen" on AI responses for voice narration
- User toggles mute for auto-narration

## Components Provided
- `NarrativeGuide` — Main chat panel with input, messages, suggested prompts
- `ChatMessage` — Individual message bubble with audio controls
- `AudioWaveform` — Animated waveform indicator for audio playback

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSendMessage` | Called when user submits a chat message |
| `onSelectPrompt` | Called when user clicks a suggested prompt |
| `onPlayAudio` | Called when user clicks Listen on a message |
| `onPauseAudio` | Called when user pauses audio playback |
| `onToggleMute` | Called when user toggles auto-narration mute |

## Visual Reference
See `screenshot.png` for the target UI design.
