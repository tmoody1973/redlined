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

/** Maximum allowed message length (characters). */
const MAX_MESSAGE_LENGTH = 1000;

/** Adds a message to an existing conversation. */
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("zone-context"),
    ),
    content: v.string(),
    zoneId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Enforce content length limit for user messages
    if (args.role === "user" && args.content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message too long (${args.content.length} chars). Maximum is ${MAX_MESSAGE_LENGTH}.`,
      );
    }

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
