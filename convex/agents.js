import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { langSearch } from "../lib/langsearch";
import { firecrawlScrape } from "../lib/firecrawl";

const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

export const orchestrate = action({
  args: {
    workbookId: v.id("workbooks"),
    userMessage: v.string(),
    activeSheetId: v.optional(v.id("sheets")),
  },
  handler: async (ctx, args) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const langSearchKey = process.env.LANGSEARCH_API_KEY;
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;

    // 0. Log User Message
    await ctx.runMutation(api.messages.send, {
      workbookId: args.workbookId,
      role: "user",
      content: args.userMessage,
      type: "text",
    });

    // 1. Fetch Global Workbook Context (All Sheets)
    const allSheets = await ctx.runQuery(api.sheets.getByWorkbook, { workbookId: args.workbookId });
    const sheetsSummary = allSheets.map(s => {
        const columns = s.data.length > 0 ? Object.keys(s.data[0]) : [];
        return `- ${s.name} (Columns: [${columns.join(', ')}])`;
    }).join('\n');

    let context = `Available Sheets in Workbook:\n${sheetsSummary}\n\n`;
    
    if (args.activeSheetId) {
      const activeSheet = allSheets.find(s => s._id === args.activeSheetId);
      if (activeSheet && activeSheet.data.length > 0) {
        const sampleData = activeSheet.data.slice(0, 3);
        const schema = Object.keys(activeSheet.data[0]);
        context += `FOCUS: You are currently looking at "${activeSheet.name}". Columns: [${schema.join(', ')}]. Sample Data (first 3 rows): ${JSON.stringify(sampleData)}`;
      }
    }

    // 2. Decision: Research, Scrape, or Analyze?
    let extraContext = "";
    try {
        const decisionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
            parts: [{
                text: `User Request: "${args.userMessage}"
                Context: ${context}
                
                Decide if you need to SEARCH the web or SCRAPE a specific URL.
                Respond ONLY with a JSON object: 
                {"action": "search" | "scrape" | "none", "query": "optimal query", "url": "url if scrape"}`
            }]
            }]
        })
        });
        const decisionData = await decisionResponse.json();
        const decisionResult = JSON.parse(decisionData.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, ''));

        if (decisionResult.action === "search" && langSearchKey) {
            const results = await langSearch(decisionResult.query, langSearchKey);
            extraContext = `Web Search Results: ${JSON.stringify(results.webPages?.value?.slice(0, 3))}`;
        } else if (decisionResult.action === "scrape" && firecrawlKey && decisionResult.url) {
            const result = await firecrawlScrape(decisionResult.url, firecrawlKey);
            extraContext = `Scraped Content from ${decisionResult.url}: ${result.markdown?.slice(0, 5000)}`;
        }
    } catch (e) {
        console.error("Agent Decision failed:", e);
    }

    // 3. Final Orchestration
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the Catalyst AI Orchestrator. 
              User Request: "${args.userMessage}"
              Context: ${context}
              ${extraContext}
              
              Analyze the request and decide the next step.
              
              If the user wants to CLEAN, FORMAT, or TRANSFORM the spreadsheet data:
              - Set "type" to "transform".
              - In "content", explain what you will do.
              - In "code", provide a JavaScript function body that takes an array 'data' and returns the transformed array.
                Example: "return data.filter(row => row.status === 'Active')"
              
              If the user wants to ANALYZE or ASK A QUESTION (including creating CHARTS) about the data:
              - Set "type" to "analyze".
              - In "content", explain the analysis or visualization logic.
              - In "code", provide a JavaScript function body that takes an array 'data' and returns an object:
                { 
                  raw: <any>, 
                  narrative: "Natural language explanation",
                  chartConfig: { type: "bar"|"line"|"pie", xAxis: "columnName", yAxis: "columnName", data: <aggregatedDataArray> } (OPTIONAL)
                }
              
              If the user wants a FULL PERMANENT DASHBOARD or SHAREABLE REPORT:
              - Set "type" to "dashboard".
              - In "content", explain the dashboard plan.
              - In "name", provide a short, catchy, professional name for the dashboard (e.g., "Monthly Sales Audit").
              - In "code", provide ONLY the raw JavaScript logic inside a function.
               - MANDATORY: The code MUST end with a 'return [...]' statement returning a flat array of widgets.
               - DO NOT include Markdown code blocks (\`\`\`) inside the code string.
              - The first widget MUST be a "summary" type.
              - In "summary" notes, ALWAYS start with: "This automated result was generated using Catalyst AI." followed by deep data-driven insights.
              - IMPORTANT: The summary MUST be a holistic narrative that references the specific charts being generated.
              - CRITICAL: Avoid vague generalities like "certain categories" or "shifting patterns". Use ACTUAL category names, EXACT dollar amounts, and SPECIFIC percentage changes found in the data (e.g., "Classic Cars dominates the product mix with $1.2M in sales, representing 45% of total revenue...").
              - Example structure for "code":
                const total = data.reduce((acc, r) => acc + r.Sales, 0);
                return [
                  { "type": "summary", "title": "Executive Summary", "notes": "..." },
                  { "type": "chart", "title": "Sales Performance", "chartConfig": { ... } }
                ];
              
              Response format MUST be a single JSON object with "type", "content", and optional "code", "config", or "layout".`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]) {
        console.error("Gemini API Error Response:", data);
        throw new Error(`Gemini API failed: ${data.error?.message || "Unknown error"}`);
      }
      
      const rawResult = data.candidates[0].content.parts[0].text;
      const result = JSON.parse(rawResult.replace(/```json/g, '').replace(/```/g, ''));

      // 4. Log the AI response
      await ctx.runMutation(api.messages.send, {
        workbookId: args.workbookId,
        role: "assistant",
        content: result,
        type: result.type,
      });

      return result;
    } catch (error) {
      console.error("Orchestration error:", error);
      throw error;
    }
  },
});
