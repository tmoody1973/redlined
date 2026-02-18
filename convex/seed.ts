import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Clear all data from seed tables. Used before re-seeding.
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "holcZones",
      "areaDescriptions",
      "censusData",
      "healthData",
      "environmentData",
    ] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});

/**
 * Clear only health and environment data tables. Used when re-seeding overlays
 * without touching zones, descriptions, or census data.
 */
export const clearOverlayData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["healthData", "environmentData"] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});

/**
 * Batch insert HOLC zone records during database seeding.
 * Called by the Node seed script (scripts/run-seed.mts).
 */
export const insertZoneBatch = mutation({
  args: {
    zones: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const zone of args.zones) {
      await ctx.db.insert("holcZones", zone);
    }
    return args.zones.length;
  },
});

/**
 * Batch insert area description records during database seeding.
 * Called by the Node seed script (scripts/run-seed.mts).
 */
export const insertDescriptionBatch = mutation({
  args: {
    descriptions: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const desc of args.descriptions) {
      await ctx.db.insert("areaDescriptions", desc);
    }
    return args.descriptions.length;
  },
});

/**
 * Batch insert census data records during database seeding.
 * Each record links a HOLC zone (areaId) to a Census tract (geoid)
 * with its area weight (pctTract) and median income.
 */
export const insertCensusDataBatch = mutation({
  args: {
    records: v.array(
      v.object({
        areaId: v.string(),
        geoid: v.string(),
        pctTract: v.number(),
        medianIncome: v.union(v.number(), v.null()),
        createdAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const record of args.records) {
      await ctx.db.insert("censusData", record);
    }
    return args.records.length;
  },
});

/**
 * Batch insert health data records during database seeding.
 * Each record links a HOLC zone (areaId) to a Census tract (geoid)
 * with CDC PLACES health outcome measures.
 */
export const insertHealthDataBatch = mutation({
  args: {
    records: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const record of args.records) {
      await ctx.db.insert("healthData", record);
    }
    return args.records.length;
  },
});

/**
 * Batch insert environment data records during database seeding.
 * Each record links a HOLC zone (areaId) to a Census tract (geoid)
 * with EPA EJScreen environmental burden measures.
 */
export const insertEnvironmentDataBatch = mutation({
  args: {
    records: v.array(
      v.object({
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
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const record of args.records) {
      await ctx.db.insert("environmentData", record);
    }
    return args.records.length;
  },
});
