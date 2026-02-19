import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Rate limit windows and their thresholds per session.
 * These protect the Claude API from abuse without blocking normal usage.
 */
const LIMITS = {
  minute: { maxRequests: 5, windowMs: 60_000 },
  hour: { maxRequests: 30, windowMs: 3_600_000 },
  day: { maxRequests: 100, windowMs: 86_400_000 },
} as const;

type Window = keyof typeof LIMITS;

/**
 * Checks and increments rate limits for a given session key.
 * Uses a fixed-window algorithm: each window starts fresh when the
 * previous one expires.
 *
 * Returns { allowed, retryAfterMs } — the action should check `allowed`
 * before calling the Claude API.
 */
export const checkRateLimit = internalMutation({
  args: {
    key: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ allowed: boolean; retryAfterMs: number }> => {
    const now = Date.now();

    for (const [window, config] of Object.entries(LIMITS) as [
      Window,
      (typeof LIMITS)[Window],
    ][]) {
      const existing = await ctx.db
        .query("rateLimits")
        .withIndex("by_key_window", (q) =>
          q.eq("key", args.key).eq("window", window),
        )
        .first();

      if (!existing) {
        // First request in this window — create the record
        await ctx.db.insert("rateLimits", {
          key: args.key,
          window,
          count: 1,
          windowStart: now,
        });
        continue;
      }

      const windowAge = now - existing.windowStart;

      if (windowAge >= config.windowMs) {
        // Window expired — reset
        await ctx.db.patch(existing._id, {
          count: 1,
          windowStart: now,
        });
        continue;
      }

      if (existing.count >= config.maxRequests) {
        // Over limit — reject
        const retryAfterMs = config.windowMs - windowAge;
        return { allowed: false, retryAfterMs };
      }

      // Under limit — increment
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    }

    return { allowed: true, retryAfterMs: 0 };
  },
});
