import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workbookId = await ctx.db.insert("workbooks", {
      userId: args.userId,
      name: args.name,
      status: "active",
    });

    return workbookId;
  },
});

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const workbooks = await ctx.db
      .query("workbooks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const workbooksWithStats = await Promise.all(
      workbooks.map(async (workbook) => {
        const sheets = await ctx.db
          .query("sheets")
          .withIndex("by_workbook", (q) => q.eq("workbookId", workbook._id))
          .collect();

        const sheetCount = sheets.length;
        const recordCount = sheets.reduce((acc, sheet) => acc + (sheet.data?.length || 0), 0);

        return {
          ...workbook,
          sheetCount,
          recordCount,
        };
      })
    );

    return workbooksWithStats;
  },
});

export const getById = query({
  args: { id: v.id("workbooks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("workbooks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
