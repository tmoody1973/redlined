import { query } from "./_generated/server";
import { v } from "convex/values";

/** Returns all HOLC zone records for Milwaukee. */
export const getAllMilwaukeeZones = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("holcZones").collect();
  },
});

/** Returns the area description matching the given areaId. */
export const getAreaDescription = query({
  args: { areaId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("areaDescriptions")
      .withIndex("by_area_id", (q) => q.eq("areaId", args.areaId))
      .first();
  },
});

/** Returns all census data records for a specific HOLC zone. */
export const getCensusDataByZone = query({
  args: { areaId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("censusData")
      .withIndex("by_area_id", (q) => q.eq("areaId", args.areaId))
      .collect();
  },
});

/** Returns all census data records for computing grade-level averages. */
export const getAllCensusData = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("censusData").collect();
  },
});

/** Returns all health data records for the health overlay. */
export const getAllHealthData = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("healthData").collect();
  },
});

/** Returns all environment data records for the environmental burden overlay. */
export const getAllEnvironmentData = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("environmentData").collect();
  },
});

/**
 * Returns all messages for a conversation, ordered by creation time.
 * The Convex index on conversationId filters efficiently, then we sort
 * client-side by createdAt for correct ordering.
 */
export const getConversationMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});
