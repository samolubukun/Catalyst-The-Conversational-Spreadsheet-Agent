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

    // If we were in an undone state, discard all future versions (redo stack)
    if (sheet.historyPointer !== undefined && sheet.historyPointer !== null && sheet.historyPointer > 0) {
      const versions = await ctx.db
        .query("versions")
        .withIndex("by_sheet", (q) => q.eq("sheetId", args.id))
        .order("desc")
        .collect();

      for (let i = 0; i < sheet.historyPointer; i++) {
        if (versions[i]) {
          await ctx.db.delete(versions[i]._id);
        }
      }
    }

    // 1. Create a version snapshot of the CURRENT data before updating
    await ctx.db.insert("versions", {
      sheetId: args.id,
      workbookId: sheet.workbookId,
      data: sheet.data,
      timestamp: Date.now(),
      type: args.type || 'manual',
      description: args.description || "Manual edit",
    });

    // 2. Update to new data and clear history pointer
    await ctx.db.patch(args.id, { 
      data: args.data,
      historyPointer: undefined
    });
  },
});

export const undo = mutation({
  args: {
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    const sheet = await ctx.db.get(args.sheetId);
    if (!sheet) throw new Error("Sheet not found");

    const versions = await ctx.db
      .query("versions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.sheetId))
      .order("desc")
      .collect();

    if (versions.length === 0) {
      throw new Error("No history available to undo");
    }

    let pointer = sheet.historyPointer;
    if (pointer === undefined || pointer === null) {
      // 1. Save the current state to versions so we can redo back to it
      await ctx.db.insert("versions", {
        sheetId: args.sheetId,
        workbookId: sheet.workbookId,
        data: sheet.data,
        timestamp: Date.now(),
        type: 'manual',
        description: "Latest state snapshot before undo",
      });

      // 2. Since we just inserted a version, the new list will have the snapshot at index 0.
      // The state we want to restore is the previous index 0, which is now at index 1.
      const targetVersion = versions[0];
      await ctx.db.patch(args.sheetId, {
        data: targetVersion.data,
        historyPointer: 1
      });
    } else {
      if (pointer + 1 >= versions.length) {
        throw new Error("Cannot undo further");
      }

      const targetVersion = versions[pointer + 1];
      await ctx.db.patch(args.sheetId, {
        data: targetVersion.data,
        historyPointer: pointer + 1
      });
    }
    return true;
  },
});

export const redo = mutation({
  args: {
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    const sheet = await ctx.db.get(args.sheetId);
    if (!sheet) throw new Error("Sheet not found");

    const pointer = sheet.historyPointer;
    if (pointer === undefined || pointer === null || pointer === 0) {
      throw new Error("Cannot redo");
    }

    const versions = await ctx.db
      .query("versions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.sheetId))
      .order("desc")
      .collect();

    // The target version is at pointer - 1
    const targetVersion = versions[pointer - 1];
    const nextPointer = pointer - 1 === 0 ? undefined : pointer - 1;

    await ctx.db.patch(args.sheetId, {
      data: targetVersion.data,
      historyPointer: nextPointer
    });
    return true;
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

    await ctx.db.patch(args.sheetId, { 
      data: version.data,
      historyPointer: undefined
    });
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

export const getByWorkbookMetadata = query({
  args: { workbookId: v.id("workbooks") },
  handler: async (ctx, args) => {
    const sheets = await ctx.db
      .query("sheets")
      .withIndex("by_workbook", (q) => q.eq("workbookId", args.workbookId))
      .order("asc")
      .collect();
    
    // Strip the raw data array to keep the payload ultra-lightweight!
    return sheets.map(({ data, ...metadata }) => metadata);
  },
});

export const getById = query({
  args: { id: v.id("sheets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("sheets") },
  handler: async (ctx, args) => {
    // Delete versions first
    const versions = await ctx.db
      .query("versions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.id))
      .collect();
    for (const v of versions) await ctx.db.delete(v._id);

    await ctx.db.delete(args.id);
  },
});
