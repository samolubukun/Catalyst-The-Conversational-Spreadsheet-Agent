import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    workbookId: v.id("workbooks"),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      workbookId: args.workbookId,
      storageId: args.storageId,
      name: args.name,
      type: args.type,
      status: "processing",
    });
    return fileId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("files"),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      metadata: args.metadata,
    });
  },
});

export const getByWorkbook = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .collect();
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) return;

    // 1. Delete all sheets associated with this file
    const sheets = await ctx.db
      .query("sheets")
      .withIndex("by_file", (q) => q.eq("fileId", args.id))
      .collect();
    
    for (const sheet of sheets) {
      // Delete sheet versions
      const versions = await ctx.db
        .query("versions")
        .withIndex("by_sheet", (q) => q.eq("sheetId", sheet._id))
        .collect();
      for (const v of versions) await ctx.db.delete(v._id);
      
      await ctx.db.delete(sheet._id);
    }

    // 2. Delete storage
    await ctx.storage.delete(file.storageId);

    // 3. Delete file record
    await ctx.db.delete(args.id);
  },
});
