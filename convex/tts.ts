import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const VOICE_ID = "6aDn1KB0hjpdcocrUkmq";
const MODEL_ID = "eleven_multilingual_v2";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

/** Voice settings tuned per tier for distinct emotional registers. */
const VOICE_SETTINGS = {
  narrator: { stability: 0.75, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
  appraiser: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: false },
  chat: { stability: 0.65, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
} as const;

/** TTS rate limits — separate from Claude API limits. */
const TTS_LIMITS = {
  minute: { maxRequests: 10, windowMs: 60_000 },
  hour: { maxRequests: 50, windowMs: 3_600_000 },
} as const;

type TtsWindow = keyof typeof TTS_LIMITS;

/** Max text length ElevenLabs accepts per request. */
const MAX_TEXT_LENGTH = 5000;
const SAFE_TRUNCATE_AT = 4500;

// ── Internal helpers ──

export const getAudioByKey = internalQuery({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("audioCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
  },
});

export const insertAudioCache = internalMutation({
  args: {
    cacheKey: v.string(),
    storageId: v.id("_storage"),
    voiceId: v.string(),
    modelId: v.string(),
    durationSeconds: v.optional(v.number()),
    sizeBytes: v.number(),
    tier: v.union(
      v.literal("narrator"),
      v.literal("appraiser"),
      v.literal("chat"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audioCache", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const checkTtsRateLimit = internalMutation({
  args: { key: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ allowed: boolean; retryAfterMs: number }> => {
    const now = Date.now();

    for (const [window, config] of Object.entries(TTS_LIMITS) as [
      TtsWindow,
      (typeof TTS_LIMITS)[TtsWindow],
    ][]) {
      const existing = await ctx.db
        .query("ttsRateLimits")
        .withIndex("by_key_window", (q) =>
          q.eq("key", args.key).eq("window", window),
        )
        .first();

      if (!existing) {
        await ctx.db.insert("ttsRateLimits", {
          key: args.key,
          window,
          count: 1,
          windowStart: now,
        });
        continue;
      }

      const windowAge = now - existing.windowStart;

      if (windowAge >= config.windowMs) {
        await ctx.db.patch(existing._id, { count: 1, windowStart: now });
        continue;
      }

      if (existing.count >= config.maxRequests) {
        return { allowed: false, retryAfterMs: config.windowMs - windowAge };
      }

      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    }

    return { allowed: true, retryAfterMs: 0 };
  },
});

// ── Shared TTS fetch ──

function truncateText(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  const truncated = text.slice(0, SAFE_TRUNCATE_AT);
  const lastSentence = truncated.lastIndexOf(".");
  return lastSentence > 0 ? truncated.slice(0, lastSentence + 1) : truncated;
}

async function callElevenLabs(
  apiKey: string,
  text: string,
  tier: "narrator" | "appraiser" | "chat",
): Promise<ArrayBuffer | null> {
  const settings = VOICE_SETTINGS[tier];
  const url = `${ELEVENLABS_BASE}/text-to-speech/${VOICE_ID}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: truncateText(text),
      model_id: MODEL_ID,
      voice_settings: settings,
    }),
  });

  if (!response.ok) {
    console.error(`ElevenLabs API error (${response.status}):`, await response.text());
    return null;
  }

  return response.arrayBuffer();
}

// ── Public query ──

export const getAudioUrl = query({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("audioCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();

    if (!cached) return null;
    return ctx.storage.getUrl(cached.storageId);
  },
});

// ── Tier 1: Narrator (pre-generated, cached) ──

export const generateNarratorAudio = action({
  args: {
    cacheKey: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    // Check cache first
    const existing = await ctx.runQuery(internal.tts.getAudioByKey, {
      cacheKey: args.cacheKey,
    });
    if (existing) {
      return ctx.storage.getUrl(existing.storageId);
    }

    const audioBuffer = await callElevenLabs(apiKey, args.text, "narrator");
    if (!audioBuffer) return null;

    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.tts.insertAudioCache, {
      cacheKey: args.cacheKey,
      storageId,
      voiceId: VOICE_ID,
      modelId: MODEL_ID,
      sizeBytes: audioBuffer.byteLength,
      tier: "narrator",
    });

    return ctx.storage.getUrl(storageId);
  },
});

// ── Tier 2: Appraiser (on-demand, cached) ──

export const generateAppraiserAudio = action({
  args: {
    cacheKey: v.string(),
    text: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    // Check cache
    const existing = await ctx.runQuery(internal.tts.getAudioByKey, {
      cacheKey: args.cacheKey,
    });
    if (existing) {
      return ctx.storage.getUrl(existing.storageId);
    }

    // Rate limit
    const rateLimitKey = `tts:${args.sessionId ?? "anonymous"}`;
    const { allowed } = await ctx.runMutation(
      internal.tts.checkTtsRateLimit,
      { key: rateLimitKey },
    );
    if (!allowed) return null;

    const audioBuffer = await callElevenLabs(apiKey, args.text, "appraiser");
    if (!audioBuffer) return null;

    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.tts.insertAudioCache, {
      cacheKey: args.cacheKey,
      storageId,
      voiceId: VOICE_ID,
      modelId: MODEL_ID,
      sizeBytes: audioBuffer.byteLength,
      tier: "appraiser",
    });

    return ctx.storage.getUrl(storageId);
  },
});

// ── Tier 3: Chat (streaming, cached by messageId) ──

export const generateChatAudio = action({
  args: {
    cacheKey: v.string(),
    text: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    // Check cache
    const existing = await ctx.runQuery(internal.tts.getAudioByKey, {
      cacheKey: args.cacheKey,
    });
    if (existing) {
      return ctx.storage.getUrl(existing.storageId);
    }

    // Rate limit
    const rateLimitKey = `tts:${args.sessionId ?? "anonymous"}`;
    const { allowed } = await ctx.runMutation(
      internal.tts.checkTtsRateLimit,
      { key: rateLimitKey },
    );
    if (!allowed) return null;

    // Use streaming endpoint for lower latency
    const settings = VOICE_SETTINGS.chat;
    const url = `${ELEVENLABS_BASE}/text-to-speech/${VOICE_ID}/stream`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: truncateText(args.text),
        model_id: MODEL_ID,
        voice_settings: settings,
        optimize_streaming_latency: 3,
      }),
    });

    if (!response.ok) {
      console.error(`ElevenLabs stream error (${response.status}):`, await response.text());
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.tts.insertAudioCache, {
      cacheKey: args.cacheKey,
      storageId,
      voiceId: VOICE_ID,
      modelId: MODEL_ID,
      sizeBytes: audioBuffer.byteLength,
      tier: "chat",
    });

    return ctx.storage.getUrl(storageId);
  },
});
