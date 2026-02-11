import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Placeholder schema for Phase 1 MVP. Full table definitions will be added in
// Task Group 2 (Convex Schema and Data Seed Pipeline).
export default defineSchema({
  holcZones: defineTable({
    areaId: v.string(),
    cityId: v.number(),
    grade: v.union(v.string(), v.null()),
    label: v.string(),
    name: v.string(),
    polygon: v.array(v.array(v.array(v.number()))),
    labelCoords: v.array(v.number()),
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    }),
    fill: v.string(),
    residential: v.boolean(),
    commercial: v.boolean(),
    industrial: v.boolean(),
    createdAt: v.number(),
  }).index("by_area_id", ["areaId"]),

  areaDescriptions: defineTable({
    areaId: v.string(),
    cityId: v.number(),
    grade: v.union(v.string(), v.null()),
    clarifyingRemarks: v.string(),
    detrimentalInfluences: v.string(),
    favorableInfluences: v.string(),
    infiltrationOf: v.string(),
    negroYesOrNo: v.string(),
    negroPercent: v.string(),
    estimatedAnnualFamilyIncome: v.string(),
    occupationType: v.string(),
    descriptionOfTerrain: v.string(),
    trendOfDesirability: v.string(),
    createdAt: v.number(),
  }).index("by_area_id", ["areaId"]),

  censusData: defineTable({
    areaId: v.string(),
    geoid: v.string(),
    pctTract: v.number(),
    medianIncome: v.union(v.number(), v.null()),
    createdAt: v.number(),
  }).index("by_area_id", ["areaId"]),

  conversations: defineTable({
    sessionId: v.string(),
    createdAt: v.number(),
  }).index("by_session_id", ["sessionId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.string(),
    content: v.string(),
    zoneId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_conversation_id", ["conversationId"]),
});
