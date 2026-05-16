import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePresence = mutation({
  args: {
    workbookId: v.id("workbooks"),
    userId: v.id("users"),
    cursor: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        cursor: args.cursor,
        lastActive: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        workbookId: args.workbookId,
        userId: args.userId,
        cursor: args.cursor,
        lastActive: Date.now(),
      });
    }
  },
});

export const listByWorkbook = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    // Return users active in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return await ctx.db
      .query("presence")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .filter((q) => q.gt(q.field("lastActive"), tenMinutesAgo))
      .collect();
  },
});
