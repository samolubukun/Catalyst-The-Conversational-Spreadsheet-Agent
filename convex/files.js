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
