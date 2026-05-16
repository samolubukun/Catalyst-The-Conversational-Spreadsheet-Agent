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
    description: v.optional(v.string()),
    type: v.optional(v.string()), // 'ai' or 'manual'
  },
  handler: async (ctx, args) => {
    const sheet = await ctx.db.get(args.id);
    if (!sheet) throw new Error("Sheet not found");

    // 1. Create a version snapshot of the CURRENT data before updating
    await ctx.db.insert("versions", {
      sheetId: args.id,
      workbookId: sheet.workbookId,
      data: sheet.data,
      timestamp: Date.now(),
      type: args.type || 'manual',
      description: args.description || "Manual edit",
    });

    // 2. Update to new data
    await ctx.db.patch(args.id, { data: args.data });
  },
});

export const restoreVersion = mutation({
  args: {
    sheetId: v.id("sheets"),
    versionId: v.id("versions"),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("Version not found");

    // Snapshot current state before rolling back
    const currentSheet = await ctx.db.get(args.sheetId);
    await ctx.db.insert("versions", {
        sheetId: args.sheetId,
        workbookId: currentSheet.workbookId,
        data: currentSheet.data,
        timestamp: Date.now(),
        type: 'manual',
        description: "Rollback snapshot",
      });

    await ctx.db.patch(args.sheetId, { data: version.data });
    return true;
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

export const getByWorkbook = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sheets")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
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
