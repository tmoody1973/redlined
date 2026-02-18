import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex schema for the Phase 1 MVP: HOLC zones, area descriptions,
// Census income data, and AI conversation history.
export default defineSchema({
  holcZones: defineTable({
    areaId: v.string(),
    cityId: v.number(),
    grade: v.union(v.string(), v.null()),
    label: v.string(),
    name: v.string(),
    polygon: v.array(v.array(v.array(v.array(v.number())))),
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

  healthData: defineTable({
    areaId: v.string(),
    geoid: v.string(),
    pctTract: v.number(),
    asthma: v.union(v.number(), v.null()),
    diabetes: v.union(v.number(), v.null()),
    mentalHealth: v.union(v.number(), v.null()),
    physicalHealth: v.union(v.number(), v.null()),
    lifeExpectancy: v.union(v.number(), v.null()),
    healthRiskIndex: v.union(v.number(), v.null()),
    createdAt: v.number(),
  }).index("by_area_id", ["areaId"]),

  environmentData: defineTable({
    areaId: v.string(),
    geoid: v.string(),
    pctTract: v.number(),
    ejPercentile: v.union(v.number(), v.null()),
    pm25: v.union(v.number(), v.null()),
    ozone: v.union(v.number(), v.null()),
    dieselPM: v.union(v.number(), v.null()),
    toxicReleases: v.union(v.number(), v.null()),
    superfundProximity: v.union(v.number(), v.null()),
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
