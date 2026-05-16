import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    sheetId: v.id("sheets"),
    workbookId: v.id("workbooks"),
    data: v.any(),
    type: v.string(), // 'ai' or 'manual'
    description: v.optional(v.string()),
    diff: v.optional(v.any()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const versionId = await ctx.db.insert("versions", {
      sheetId: args.sheetId,
      workbookId: args.workbookId,
      data: args.data,
      timestamp: Date.now(),
      userId: args.userId,
      type: args.type,
      description: args.description,
      diff: args.diff,
    });
    return versionId;
  },
});

export const listBySheet = query({
  args: { sheetId: v.id("sheets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("versions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.sheetId))
      .order("desc")
      .collect();
  },
});

export const getLatest = query({
  args: { sheetId: v.id("sheets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("versions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.sheetId))
      .order("desc")
      .first();
  },
});
