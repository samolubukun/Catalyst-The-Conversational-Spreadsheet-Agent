import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    workbookId: v.id("workbooks"),
    role: v.string(),
    content: v.any(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      workbookId: args.workbookId,
      role: args.role,
      content: args.content,
      type: args.type || "text",
    });
    return messageId;
  },
});

export const list = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .collect();
  },
});

export const clear = mutation({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .collect();
    
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
