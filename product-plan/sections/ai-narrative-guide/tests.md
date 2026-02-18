# Test Instructions: AI Narrative Guide

These test-writing instructions are **framework-agnostic**. Adapt to your testing setup.

## Overview

Test the AI chat panel: message display, suggested prompts, streaming responses, and audio narration.

---

## User Flow Tests

### Flow 1: Send a Message

**Scenario:** User types and submits a question

**Steps:**

1. User has zone D-7 selected (context indicator shows "Discussing: D-7 Bronzeville")
2. User types "What happened to this neighborhood?" in the input
3. User clicks "Ask" button

**Expected Results:**

- [ ] User message appears right-aligned in chat
- [ ] Streaming indicator appears (three bouncing dots)
- [ ] AI response streams in, appearing word by word
- [ ] `onSendMessage` callback fires with message content
- [ ] Input field clears after submission

### Flow 2: Use Suggested Prompt

**Scenario:** User clicks a suggested prompt button

**Steps:**

1. User clicks "What happened to Bronzeville?"

**Expected Results:**

- [ ] `onSelectPrompt` callback fires with prompt ID
- [ ] Prompt appears as user message
- [ ] AI responds with contextual answer

### Flow 3: Audio Narration

**Scenario:** User plays and pauses narration

**Steps:**

1. User clicks "Listen" on an AI response
2. Audio starts playing
3. User clicks "Pause"

**Expected Results:**

- [ ] "Listen" button visible on hover over AI messages
- [ ] Waveform animation appears during playback
- [ ] "Playing" label shown during playback
- [ ] `onPlayAudio` fires with message ID
- [ ] `onPauseAudio` fires when paused

### Flow 4: Zone Context Change

**Scenario:** User switches to a different zone

**Steps:**

1. User has conversation about zone D-7
2. User clicks zone A-1 on the map

**Expected Results:**

- [ ] Context indicator updates to "Discussing: A-1"
- [ ] Previous messages remain visible
- [ ] New suggested prompts appear
- [ ] HOLC description for A-1 auto-narrates (if not muted)

---

## Empty State Tests

### No Zone Selected

**Setup:** No zone has been selected

**Expected Results:**

- [ ] Shows "Select a neighborhood" message
- [ ] Chat input is disabled
- [ ] No suggested prompts shown

### Zone Selected, No Messages

**Setup:** Zone D-7 selected, no messages sent yet

**Expected Results:**

- [ ] Shows 4 suggested prompt buttons
- [ ] Context indicator shows zone
- [ ] Chat input is enabled

---

## Edge Cases

- [ ] Submitting empty input does nothing
- [ ] Input disabled while streaming
- [ ] Very long AI responses scroll properly
- [ ] Mute toggle persists across zone changes
- [ ] Multiple audio playbacks don't overlap
