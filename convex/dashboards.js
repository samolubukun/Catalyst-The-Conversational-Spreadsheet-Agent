import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    workbookId: v.id("workbooks"),
    userId: v.id("users"),
    name: v.string(),
    config: v.any(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dashboards", {
      workbookId: args.workbookId,
      userId: args.userId,
      name: args.name,
      config: args.config,
      isPublic: args.isPublic,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dashboards"),
    config: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const getByWorkbook = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dashboards")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("dashboards") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id("dashboards") },
  handler: async (ctx, args) => {
    const dashboard = await ctx.db.get(args.id);
    if (!dashboard) return null;
    
    // For now, if it's public we return it. 
    // Secure private access will require JWT setup.
    if (dashboard.isPublic) return dashboard;
    
    return dashboard;
  },
});
