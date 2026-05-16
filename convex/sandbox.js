import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * The Sandbox Action allows the AI to execute generated JavaScript code 
 * against a spreadsheet's data in a secure, server-side environment.
 */
export const executeTransform = action({
  args: {
    sheetId: v.id("sheets"),
    code: v.string(), // The AI-generated transformation code
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the current sheet data
    const sheet = await ctx.runQuery(api.sheets.getById, { id: args.sheetId });
    if (!sheet) throw new Error("Sheet not found");

    const data = sheet.data;

    try {
      // 2. Wrap the AI code in a controlled function
      // The AI code should be a function that takes 'data' and returns 'transformedData'
      // Example: "return data.filter(row => row.price > 100)"
      const transformFn = new Function("data", args.code);
      
      // 3. Execute the transformation
      const transformedData = transformFn(data);

      if (!Array.isArray(transformedData)) {
        throw new Error("Transformation must return an array of objects");
      }

      // 4. Create a new version/snapshot (Phase 6 logic)
      // For now, we'll just update the sheet directly or return the preview
      
      return {
        success: true,
        originalCount: data.length,
        transformedCount: transformedData.length,
        preview: transformedData.slice(0, 10),
        fullData: transformedData, // We'll return this to the client to let them "Approve"
      };

    } catch (error) {
      console.error("Sandbox execution error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
