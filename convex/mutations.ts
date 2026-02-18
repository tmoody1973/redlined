import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Creates a new conversation record and returns its ID. */
export const createConversation = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      sessionId: args.sessionId,
      createdAt: Date.now(),
    });
    return conversationId;
  },
});

/** Adds a message to an existing conversation. */
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
    zoneId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      zoneId: args.zoneId,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

/**
 * Inserts a zone-context divider message when the user selects a new zone
 * mid-conversation. This creates a visible marker in the chat thread.
 */
export const addZoneContextDivider = mutation({
  args: {
    conversationId: v.id("conversations"),
    zoneName: v.string(),
    grade: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const gradeLabel = args.grade ? `Grade ${args.grade}` : "Ungraded";
    const content = `Now viewing: ${args.zoneName} -- ${gradeLabel}`;

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "zone-context",
      content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});
