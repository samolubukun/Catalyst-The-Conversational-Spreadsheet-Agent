import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    stackId: v.string(), // ID from Stack Auth
  }).index("by_email", ["email"]).index("by_stackId", ["stackId"]),

  workbooks: defineTable({
    userId: v.id('users'),
    name: v.string(),
    status: v.string(), // active, archived
  }).index("by_user", ["userId"]),

  files: defineTable({
    workbookId: v.id('workbooks'),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(), // xlsx, csv, json
    status: v.string(), // uploading, processing, ready, error
    metadata: v.optional(v.any()), // sheet names, row/col counts, data types
  }).index("by_workbook", ["workbookId"]),

  sheets: defineTable({
    workbookId: v.optional(v.id('workbooks')),
    fileId: v.id('files'),
    name: v.string(),
    data: v.any(), // Array of objects or rows
    schema: v.optional(v.any()), // Column definitions
    order: v.number(),
  }).index("by_file", ["fileId"]).index("by_workbook", ["workbookId"]),

  messages: defineTable({
    workbookId: v.id('workbooks'),
    role: v.string(), // user, assistant, system
    content: v.any(), // Rich message content (text, code blocks, previews)
    type: v.optional(v.string()), // text, preview, chart, table
  }).index("by_workbook", ["workbookId"]),

  versions: defineTable({
    sheetId: v.id('sheets'),
    workbookId: v.id('workbooks'),
    data: v.any(), // Snapshot of the data
    timestamp: v.number(),
    userId: v.optional(v.id('users')), // Who made the change
    type: v.string(), // 'ai' or 'manual'
    description: v.optional(v.string()), // "Cleaned duplicates", "Fixed typo"
    diff: v.optional(v.any()), // Stored diff for highlighting
  }).index("by_sheet", ["sheetId"]).index("by_workbook", ["workbookId"]),

  presence: defineTable({
    workbookId: v.id('workbooks'),
    userId: v.id('users'),
    cursor: v.optional(v.any()), // { row, col, sheetId }
    lastActive: v.number(),
  }).index("by_workbook", ["workbookId"]),

  // Usage tracking
  usage: defineTable({
    userId: v.id('users'),
    type: v.string(), // message, search, processing
    amount: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  dashboards: defineTable({
    workbookId: v.id("workbooks"),
    userId: v.string(),
    name: v.string(),
    config: v.any(), // Array of widgets: { type, title, notes, chartConfig }
    isPublic: v.boolean(),
  }).index("by_workbook", ["workbookId"]),
});