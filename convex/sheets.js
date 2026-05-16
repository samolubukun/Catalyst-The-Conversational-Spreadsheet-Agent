import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    fileId: v.id("files"),
    name: v.string(),
    data: v.any(),
    schema: v.optional(v.any()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    const sheetId = await ctx.db.insert("sheets", {
      workbookId: file.workbookId,
      fileId: args.fileId,
      name: args.name,
      data: args.data,
      schema: args.schema,
      order: args.order,
    });
    return sheetId;
  },
});

export const updateData = mutation({
  args: {
    id: v.id("sheets"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { data: args.data });
  },
});

export const getByFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sheets")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("sheets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
