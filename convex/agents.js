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
    
    // 2. Fetch Conversation History (Memory)
    const history = await ctx.runQuery(api.messages.list, { workbookId: args.workbookId });
    const lastMessages = history.slice(-10).map(m => {
        const content = typeof m.content === 'object' ? JSON.stringify(m.content) : m.content;
        return `${m.role.toUpperCase()}: ${content}`;
    }).join('\n');
    
    context += `Recent Conversation History:\n${lastMessages}\n\n`;
    
    if (args.activeSheetId) {
      const activeSheet = allSheets.find(s => s._id === args.activeSheetId);
      if (activeSheet && activeSheet.data.length > 0) {
        const sampleData = activeSheet.data.slice(0, 3);
        const schema = Object.keys(activeSheet.data[0]);
        context += `FOCUS: You are currently looking at "${activeSheet.name}". Columns: [${schema.join(', ')}]. Sample Data (first 3 rows): ${JSON.stringify(sampleData)}`;
      }
    }

    // 3. Decision: Research, Scrape, or Analyze?
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

    // 4. Final Orchestration
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
              
              If the user wants to CLEAN, FORMAT, TRANSFORM, HIGHLIGHT, or COLOR-CODE the spreadsheet data:
              - Set "type" to "transform".
              - In "content", explain what you will do.
              - In "code", provide a JavaScript function body that takes an array 'data' and returns the transformed array.
                - To filter/format: Return the filtered/modified array. Example: "return data.filter(row => row.status === 'Active')"
                - To HIGHLIGHT or COLOR-CODE rows/cells: Return the array where you inject styling metadata into matching rows:
                  * To highlight a whole row: Add 'row._highlight = true' or 'row._bg = "rgba(254, 240, 138, 0.3)"' (or hex/rgb color) to matching row objects.
                  * To style specific cells: Add 'row._cellStyle = { columnName: { backgroundColor: "rgba(254, 240, 138, 0.3)" } }' to matching row objects.
              
              If the user wants to CREATE A NEW SHEET, GENERATE A MOCK SHEET/DATASET, or COMPILE A SUMMARY SHEET into a new sheet tab:
              - Set "type" to "create_sheet".
              - In "content", explain what you will generate.
              - In "name", provide a short, catchy, professional name for the new sheet (e.g., "Q4 Revenue Summary", "Mock Personnel").
              - In "code", provide a JavaScript function body that takes an array 'data' (representing the active sheet's data) and returns a brand new array of row objects representing the new sheet's data.
                - Example: "return [ { Month: 'Jan', Target: 10000 }, { Month: 'Feb', Target: 12000 } ]"
                - Or dynamically using the active 'data': "return data.map(r => ({ Name: r.name, Email: r.email }))"
              
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
               - In "content", explain the dashboard plan, mentioning the layout strategy.
               - In "name", provide a short, catchy, professional name for the dashboard (e.g., "Monthly Sales Audit").
               - In "code", provide ONLY the raw JavaScript logic inside a function.
                - MANDATORY: The code MUST end with a 'return [...]' statement returning a flat array of widgets.
                - DO NOT include Markdown code blocks (\`\`\`) inside the code string.
               - The first widget MUST be a "summary" type.
                - In "summary" notes, ALWAYS start with: "This automated result was generated using Catalyst AI. " followed by an elite, high-level executive data analyst synthesis. The tone MUST be highly analytical, quantitative, and strategic (e.g., highlighting operational outliers, identifying seasonal trend trajectories, detecting cross-dimensional correlations between your charts, and offering data-driven hypotheses). It must read like an advisory brief prepared by a principal data scientist, referencing all specific metrics and charts generated (e.g. tying the KPI cards, line/area trends, category radars, and scatter grids together into a unified strategic narrative). Avoid generic descriptions.
               - IMPORTANT: The summary MUST be a holistic narrative is extremely professional, clear, and action-oriented.
               - STRATEGIC LAYOUT (Power BI / Tableau Inspiration):
                 - Every widget can have a "size": "large" (full width), "medium" (2/3 width), or "small" (1/3 width).
                 - WIDGET TYPES:
                   1. "summary": Global executive narrative summary. Put at the very first element.
                   2. "chart": High-fidelity data visualization charts (bar, line, pie, horizontal-bar, area, composed, radar, scatter).
                   3. "metric": A gorgeous, bold single-metric KPI card. MUST include a calculated "value" string (e.g. "$1,234,567", "98.2%", or "2,450 units") and a descriptive "subtext" string (e.g., "YTD Revenue" or "Total Orders"). Optionally include a "trend" string and a "trendType" string ('positive' | 'negative' | 'neutral') to render dynamic green/red badges like Power BI or Tableau! IMPORTANT: The "trend" string MUST be a professional quantitative BI metric (e.g., "+12.4% vs Target", "+5.3% MoM", "-2.1% YoY", or "+8.5% vs Plan"). NEVER use vague qualitative phrases like "Performance Stable", "Consistent", or "Inventory Active" - always use real growth percentages or target deviations! Size: "small" works best for metric cards so they can sit side-by-side!
                 - Generate a row of 3 or 4 small 'metric' widgets to display key aggregates side-by-side at the very top of the dashboard (e.g. Sales, Margins, Volumes, Active Counts), followed by larger trend and breakdown charts below.
                 - Variety is key: Don't just make a list. Create a visual hierarchy.
               - USER SPECIFICATIONS: Pay extreme attention to the user's specific requests for chart types, layout, and exact chart count. IMPORTANT: When the user requests a specific number of charts (e.g., "6 charts under"), this count refers STRICTLY to "chart" type widgets (visualizations like bar, line, pie, horizontal-bar, area, composed, radar, scatter). The 3 or 4 top-level "metric" (KPI) cards and the "summary" widget are default standard elements and DO NOT count towards this number. You MUST generate exactly the requested number of distinct "chart" type widgets (e.g., 6 separate "chart" widgets) showing different dimensions or aggregations of the spreadsheet data, in addition to the standard KPIs! Never count metric cards as charts.
                 - CRITICAL: Avoid vague generalities. Use ACTUAL category names and EXACT numbers.
                 - CRITICAL VARIABLE NAME EXACTNESS RULE: Ensure every variable referenced in the return array of widgets is defined exactly with the same spelling earlier in your JavaScript code (e.g., do not define 'avgOrderValue' and write 'avgOrder' in a metric card). Variable spelling mismatches will cause fatal execution crashes!
                - CRITICAL JSON ESCAPE SAFETY RULE: Inside the 'code' string, when returning the flat array of widgets, ALWAYS use single quotes (') or backticks (\`) for all keys, object properties, and strings. NEVER use double quotes (") inside the code return array. For example, write: { 'type': 'summary', 'title': 'Executive Summary', 'notes': \`Total: \${formattedTotal}\` }. This is MANDATORY to prevent JSON double-quote syntax parsing crashes!
                - Example structure for "code":
                  const totalSales = data.reduce((acc, r) => acc + (Number(r.Sales) || 0), 0);
                  const formattedTotal = '$' + totalSales.toLocaleString();
                  return [
                    { 'type': 'summary', 'title': 'Executive Summary', 'notes': \`YTD Sales are \${formattedTotal} across \${data.length} transactions.\` },
                    { 'type': 'metric', 'title': 'Total Sales Revenue', 'size': 'small', 'value': formattedTotal, 'subtext': 'YTD Cumulative Gross Revenue', 'trend': '+12.4% vs Target', 'trendType': 'positive' },
                    { 'type': 'chart', 'title': 'Sales Trend Over Time', 'size': 'medium', 'chartConfig': { 'type': 'line', 'xAxis': 'date', 'yAxis': 'sales', 'data': [] } },
                    { 'type': 'chart', 'title': 'Category Breakdown', 'size': 'small', 'chartConfig': { 'type': 'bar', 'xAxis': 'category', 'yAxis': 'sales', 'data': [] } }
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
      
      // Clean up markdown wrapping if present
      let cleanText = rawResult.trim();
      if (cleanText.startsWith("```")) {
        const lines = cleanText.split("\n");
        if (lines[0].startsWith("```")) lines.shift();
        if (lines[lines.length - 1].startsWith("```")) lines.pop();
        cleanText = lines.join("\n").trim();
      }

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (e) {
        console.error("FAILED TO PARSE AI RESPONSE JSON. Raw Response Text:", rawResult);
        throw new Error("AI response was not formatted as valid JSON: " + e.message);
      }

      // 5. Log the AI response
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
