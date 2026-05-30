import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { langSearch } from "../lib/langsearch";
import { firecrawlScrape } from "../lib/firecrawl";
import { searchArxiv } from "../lib/arxiv";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

/**
 * Robust helper that calls the Gemini API with automatic key rotation.
 * Accepts either a single key string or a comma-separated pool of keys.
 * On a 429 / quota exhaustion error it silently rotates to the next key.
 * Only throws after every key in the pool has been tried and failed.
 */
async function callGemini(modelName, geminiKeyOrPool, promptText) {
    // Parse into a clean array of non-empty keys
    const keys = (Array.isArray(geminiKeyOrPool)
        ? geminiKeyOrPool
        : String(geminiKeyOrPool || "").split(",").map(k => k.trim()).filter(Boolean)
    );

    if (keys.length === 0) {
        throw new Error("GEMINI_API_KEY is not configured in the server environment variables.");
    }

    let lastError = null;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const isLastKey = i === keys.length - 1;

        let response;
        try {
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptText }] }]
                    })
                }
            );
        } catch (netErr) {
            // Network-level failure — no point rotating keys, throw immediately
            throw new Error(`Network connection failed: ${netErr.message || "Failed to reach Google Gemini API endpoint"}`);
        }

        if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
                const errBody = await response.json();
                if (errBody?.error?.message) errMsg = errBody.error.message;
            } catch (_) {}

            const isQuotaError = response.status === 429
                || errMsg.toLowerCase().includes("quota")
                || errMsg.toLowerCase().includes("rate limit")
                || errMsg.toLowerCase().includes("exhausted");

            if (isQuotaError && !isLastKey) {
                // Rotate silently to the next key
                console.warn(`Key ${i + 1}/${keys.length} quota exhausted, rotating to next key...`);
                lastError = new Error(`Gemini API Error [Status ${response.status}]: ${errMsg}`);
                continue;
            }

            throw new Error(`Gemini API Error [Status ${response.status}]: ${errMsg}`);
        }

        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]) {
            if (data.error?.message) {
                throw new Error(`Gemini API Error: ${data.error.message}`);
            }
            throw new Error("Invalid or empty response schema returned by Gemini AI.");
        }

        // Success — log which key slot was used (no sensitive data)
        if (i > 0) console.log(`Key rotation: succeeded on key ${i + 1}/${keys.length}`);
        return data.candidates[0].content.parts[0].text;
    }

    // Every key in the pool was exhausted
    throw lastError || new Error("API keys limit reached.");
}

export const orchestrate = action({
  args: {
    workbookId: v.id("workbooks"),
    userMessage: v.string(),
    activeSheetId: v.optional(v.id("sheets")),
  },
  handler: async (ctx, args) => {
    let userId = null;
    
    try {
        // Parse GEMINI_API_KEY as a comma-separated pool — supports 1 or many keys
        const geminiKey = (process.env.GEMINI_API_KEY || "")
            .split(",").map(k => k.trim()).filter(Boolean);
        const langSearchKey = process.env.LANGSEARCH_API_KEY;
        const firecrawlKey = process.env.FIRECRAWL_API_KEY;

        // 0. Log User Message
        await ctx.runMutation(api.messages.send, {
          workbookId: args.workbookId,
          role: "user",
          content: args.userMessage,
          type: "text",
        });

        // 0.1 Check and deduct User Credits
        const workbook = await ctx.runQuery(api.workbooks.getById, { id: args.workbookId });
        if (!workbook) throw new Error("Workbook not found");
        userId = workbook.userId;

        const user = await ctx.runQuery(api.users.getUserById, { id: userId });
        if (!user || user.credits < 1) {
            const errorContent = {
                type: "text",
                content: `⚠️ **Insufficient Credits**: You have run out of credits! (Remaining: ${user ? user.credits : 0}). Please top up your credits to continue asking the AI.`,
                isError: true,
                errorType: "insufficient_credits",
                errorMessage: "Insufficient credits"
            };
            await ctx.runMutation(api.messages.send, {
                workbookId: args.workbookId,
                role: "assistant",
                content: errorContent.content,
                type: "text",
            });
            return errorContent;
        }

        // 0.2 Deterministic Undo/Redo short-circuit — never trust the AI to classify these
        // This runs BEFORE any AI call so hallucinated text responses are impossible.
        const normalizedMsg = args.userMessage.toLowerCase().trim();
        const isUndoIntent = /\bundo\b|\brevert\b|\brollback\b|\bgo back\b|\bundo that\b|\bundo last\b/.test(normalizedMsg);
        const isRedoIntent = /\bredo\b|\bre-apply\b|\bredo that\b|\bredo last\b|\bbring back\b/.test(normalizedMsg);

        if (isUndoIntent || isRedoIntent) {
            let responseContent;
            if (isUndoIntent) {
                if (args.activeSheetId) {
                    try {
                        await ctx.runMutation(api.sheets.undo, { sheetId: args.activeSheetId });
                        responseContent = "🔄 **Undo Successful!** I've rolled back your spreadsheet to the previous state. You can undo further or type **redo** to re-apply the change.";
                    } catch (err) {
                        responseContent = `⚠️ **Undo Failed**: ${err.message || "There is no history available to undo. This is already the earliest state."}`;
                    }
                } else {
                    responseContent = "⚠️ **Undo Failed**: No active sheet is currently selected. Please click a sheet tab first.";
                }
            } else {
                if (args.activeSheetId) {
                    try {
                        await ctx.runMutation(api.sheets.redo, { sheetId: args.activeSheetId });
                        responseContent = "🔄 **Redo Successful!** I've re-applied the next change in your history. You can redo further or type **undo** to roll back again.";
                    } catch (err) {
                        responseContent = `⚠️ **Redo Failed**: ${err.message || "There is nothing to redo. You are already at the most recent state."}`;
                    }
                } else {
                    responseContent = "⚠️ **Redo Failed**: No active sheet is currently selected. Please click a sheet tab first.";
                }
            }

            // Log the result as an assistant message into the chat
            await ctx.runMutation(api.messages.send, {
                workbookId: args.workbookId,
                role: "assistant",
                content: responseContent,
                type: "text",
            });

            // No credit deduction for undo/redo — it's a free housekeeping action
            return { type: "text", content: responseContent };
        }

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
            const decisionPrompt = `User Request: "${args.userMessage}"
            Context: ${context}
            
            Decide if you need to:
            1. SEARCH the web once (single global query) -> "search"
            2. SCRAPE a specific URL once -> "scrape"
            3. BATCH SEARCH: Search for each row's value in a column (e.g. enriching/updating a sheet row-by-row with web research) -> "batch_search"
            4. BATCH SCRAPE: Scrape a URL for each row in a column -> "batch_scrape"
            5. SEARCH ARXIV: Fetch academic research papers from arXiv -> "arxiv"
            6. Do nothing -> "none"
            
            Respond ONLY with a JSON object: 
            {
              "action": "search" | "scrape" | "batch_search" | "batch_scrape" | "arxiv" | "none", 
              "query": "optimal query for single search or arXiv query (e.g. 'all:electron' or 'cat:cs.AI' or specific keywords)", 
              "url": "url if single scrape",
              "queryTemplate": "template query for batch search (use '{ColumnName}' to represent the placeholder for row value, e.g. 'CEO of {Company}'), replacing ColumnName with the exact column header name",
              "urlTemplate": "template URL for batch scrape (use '{ColumnName}' to represent the placeholder, e.g. '{Website}'), replacing ColumnName with the exact column header name",
              "columnName": "the exact column header name to read values from"
            }`;
            
            const decisionRaw = await callGemini(model, geminiKey, decisionPrompt);
            let cleanDecisionText = decisionRaw.trim();
            if (cleanDecisionText.startsWith("```")) {
                const lines = cleanDecisionText.split("\n");
                if (lines[0].startsWith("```")) lines.shift();
                if (lines[lines.length - 1].startsWith("```")) lines.pop();
                cleanDecisionText = lines.join("\n").trim();
            }
            const decisionResult = JSON.parse(cleanDecisionText);

            if (decisionResult.action === "search" && langSearchKey) {
                try {
                    const results = await langSearch(decisionResult.query, langSearchKey);
                    extraContext = `Web Search Results: ${JSON.stringify(results.webPages?.value?.slice(0, 3))}`;
                } catch (err) {
                    console.error("langSearch tool failed:", err);
                    extraContext = `Web Search tool failed: ${err.message || "Unknown error"}. Continuing execution without search context.`;
                }
            } else if (decisionResult.action === "scrape" && firecrawlKey && decisionResult.url) {
                try {
                    const result = await firecrawlScrape(decisionResult.url, firecrawlKey);
                    extraContext = `Scraped Content from ${decisionResult.url}: ${result.markdown?.slice(0, 5000)}`;
                } catch (err) {
                    console.error("firecrawlScrape tool failed:", err);
                    extraContext = `Web Scraping tool failed: ${err.message || "Unknown error"}. Continuing execution without scrape context.`;
                }
            } else if (decisionResult.action === "arxiv") {
                try {
                    const results = await searchArxiv(decisionResult.query, 10);
                    extraContext = `arXiv Academic Research Papers for query "${decisionResult.query}":\n${JSON.stringify(results)}\n\nIMPORTANT: For arXiv research, ALWAYS set type to "create_sheet". Provide a short, catchy, professional name for the new sheet (e.g. "arXiv: cs.AI Papers"). In your JavaScript code, return a brand new array of row objects representing these papers. Each paper object must have the following columns:\n- 'title': Academic title\n- 'authors': Contributing researchers\n- 'publishedDate': Submission date\n- 'pdfLink': PDF URL\n- 'infoLink': Alternative landing page URL\n- 'category': Primary subject category\n- 'summary': The COMPLETE, FULL-LENGTH, UNTRUNCATED abstract copied exactly word-for-word from the JSON above. DO NOT shorten, edit, or truncate this field under any circumstances.\n- 'Catalyst Summary': A custom, quick, concise yet elaborate Catalyst-style executive overview of the paper (1-2 sentences highlighting the key innovation, core breakthrough, and real-world strategic impact based on the abstract).\n\nKeep the raw 'summary' abstracts fully intact, but synthesize a highly professional 'Catalyst Summary' for each paper. Example structure in code:\nreturn ${JSON.stringify(results)}.map(p => ({ ...p, 'Catalyst Summary': 'AI generated concise overview...' }));`;
                } catch (err) {
                    console.error("searchArxiv tool failed:", err);
                    extraContext = `arXiv Research tool failed: ${err.message || "Unknown error"}. Continuing execution without academic papers context.`;
                }
            } else if (decisionResult.action === "batch_search" && langSearchKey && args.activeSheetId) {
                const activeSheet = allSheets.find(s => s._id === args.activeSheetId);
                if (activeSheet && activeSheet.data.length > 0) {
                    const colName = decisionResult.columnName;
                    const template = decisionResult.queryTemplate || "search for {value}";
                    // Cap batch to 10 rows to keep it fast and stay within API rate limits/timeouts
                    const targetRows = activeSheet.data.slice(0, 10);
                    const batchResults = [];
                    for (let i = 0; i < targetRows.length; i++) {
                        const row = targetRows[i];
                        // Fallback to first property if column is missing
                        const val = row[colName] || Object.values(row)[0] || "";
                        if (val) {
                            const query = template.replace(new RegExp(`{${colName}}`, 'g'), val).replace(/{value}/g, val);
                            try {
                                const res = await langSearch(query, langSearchKey);
                                const snippet = res.webPages?.value?.[0]?.snippet || "No result found";
                                batchResults.push({ rowIndex: i, rowValue: val, resultSnippet: snippet });
                            } catch (err) {
                                console.error(`Batch search failed for row ${i} (${val}):`, err);
                                batchResults.push({ rowIndex: i, rowValue: val, resultSnippet: `Error: ${err.message}` });
                            }
                        }
                    }
                    extraContext = `BATCH ENRICHMENT SEARCH RESULTS PER ROW:\n${JSON.stringify(batchResults)}\n\nIMPORTANT: For batch search requests, ALWAYS set type to "transform" (or "create_sheet" if adding to a new sheet). In your JavaScript code, write a function that takes 'data' and maps these row-by-row pre-fetched search results back into a new or updated column. Do not call fetch or search in your JS code, use the batchResults dataset pre-fetched here! Example in code:\nconst batchResults = ${JSON.stringify(batchResults)};\nreturn data.map((row, idx) => { ... });`;
                }
            } else if (decisionResult.action === "batch_scrape" && firecrawlKey && args.activeSheetId) {
                const activeSheet = allSheets.find(s => s._id === args.activeSheetId);
                if (activeSheet && activeSheet.data.length > 0) {
                    const colName = decisionResult.columnName;
                    const template = decisionResult.urlTemplate || "{value}";
                    // Cap batch to 5 rows for scrapers as scraping is slower
                    const targetRows = activeSheet.data.slice(0, 5);
                    const batchResults = [];
                    for (let i = 0; i < targetRows.length; i++) {
                        const row = targetRows[i];
                        let val = row[colName] || Object.values(row)[0] || "";
                        if (val) {
                            let url = template.replace(new RegExp(`{${colName}}`, 'g'), val).replace(/{value}/g, val);
                            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                                url = "https://" + url;
                            }
                            try {
                                const res = await firecrawlScrape(url, firecrawlKey);
                                const summary = res.markdown?.slice(0, 1000) || "Empty content";
                                batchResults.push({ rowIndex: i, rowValue: val, resultSnippet: summary });
                            } catch (err) {
                                console.error(`Batch scrape failed for row ${i} (${url}):`, err);
                                batchResults.push({ rowIndex: i, rowValue: val, resultSnippet: `Error: ${err.message}` });
                            }
                        }
                    }
                    extraContext = `BATCH ENRICHMENT SCRAPE RESULTS PER ROW:\n${JSON.stringify(batchResults)}\n\nIMPORTANT: For batch scrape requests, ALWAYS set type to "transform" (or "create_sheet" if adding to a new sheet). In your JavaScript code, write a function that takes 'data' and maps these row-by-row pre-fetched scrape results back into a new or updated column. Do not call fetch or scrape in your JS code, use the batchResults dataset pre-fetched here! Example in code:\nconst batchResults = ${JSON.stringify(batchResults)};\nreturn data.map((row, idx) => { ... });`;
                }
            }
        } catch (e) {
            console.error("Agent Decision failed, falling back to standard prompt execution:", e);
            // If the error is an API Key or Rate Limit error, bubble it up so the user gets notified rather than ignoring
            if (e.message?.includes("API Key") || e.message?.includes("Status 429") || e.message?.includes("Status 403") || e.message?.includes("Network connection")) {
                throw e;
            }
        }

        // 4. Final Orchestration
        const finalPrompt = `You are the Catalyst AI Orchestrator. 
        User Request: "${args.userMessage}"
        Context: ${context}
        ${extraContext}
        
        Analyze the request and decide the next step.
        
        FORMATTING INSTRUCTIONS:
        - Always format your text response ("content") with beautiful, rich, professional markdown structure.
        - When listing multiple items, companies, suggestions, or insights, ALWAYS use bulleted lists (e.g. "* **Item Title**: Description") and place each item on its own separate line.
        - ALWAYS insert double newlines ("\n\n") between paragraphs, bullet points, or key sections to ensure they render with clean spacing in the UI.
        - NEVER write run-on sentences or clump separate summaries, companies, or distinct entities into a single continuous block/paragraph of text.
        - Format links elegantly with descriptive custom text (e.g. [Benchling Website](http://www.benchling.com) instead of [Visit Website](http://www.benchling.com)).
        - When generating Markdown Tables (such as financial models or WACC/growth sensitivity matrices), ALWAYS place a single newline ("\n") at the end of every table row (including the header row, separator row, and all data rows) so they parse and render as highly professional HTML tables. NEVER compress a table onto a single line.
        - Use rich styles like bold headers, bold inline keywords, and spacing to make complex information digestible at a glance.
        
        If the user wants to CLEAN, FORMAT, TRANSFORM, HIGHLIGHT, or COLOR-CODE the spreadsheet data:
        - Set "type" to "transform".
        - In "content", explain what you will do.
        - In "code", provide a JavaScript function body that takes an array 'data' and returns the transformed array.
          - To filter/format: Return the filtered/modified array. Example: "return data.filter(row => row.status === 'Active')"
          - To HIGHLIGHT or COLOR-CODE rows/cells: Return the array where you inject styling metadata into matching rows:
            * To highlight a whole row: Add 'row._highlight = true' or 'row._bg = "rgba(254, 240, 138, 0.3)"' (or hex/rgb color) to matching row objects.
            * To style specific cells: Add 'row._cellStyle = { columnName: { backgroundColor: "rgba(254, 240, 138, 0.3)" } }' to matching row objects.
        
        If the user wants to CREATE A NEW SHEET, GENERATE A MOCK SHEET/DATASET, COMPILE A SUMMARY SHEET, or BUILD A FINANCIAL MODEL (e.g., DCF model, three-statement forecast, or scenario analysis) into a new sheet tab:
        - Set "type" to "create_sheet".
        - In "content", explain what you will generate. If building a financial model (like a DCF model), provide a complete step-by-step financial report outlining key assumptions, projected free cash flows, discounting logic, implied valuation, and sensitivity analysis.
        - In "name", provide a short, catchy, professional name for the new sheet (e.g., "Microsoft DCF Model", "Three-Statement Forecast").
        - In "code", provide a JavaScript function body that returns a brand new array of row objects representing the new sheet's data.
          - Note: The function body is passed two arguments: "data" (an array representing the active sheet's data) and "allSheets" (an array representing all sheets currently in the workbook: [ { name: string, data: any[] } ]).
          - When MERGING MESSY SPREADSHEETS: You can write logic that finds other sheets in the "allSheets" array by name (e.g. "const other = allSheets.find(s => s.name === '...')") and combines/merges their data rows with "data" into a single clean master array of objects!
          - When building a FINANCIAL MODEL (like a DCF model or three-statement forecast), the code should return a structured sheet where each row is a line item (e.g. "Revenue", "EBIT", "Free Cash Flow", "Discount Factor", "Present Value of FCF", or "WACC / Terminal Growth Sensitivity"). The columns should represent historical/projected years (e.g., "Year_0_Base", "Year_1", "Year_2", "Year_3", "Year_4", "Year_5") or key metrics.
          - Example for a DCF or financial model: Calculate and build the full forecast dynamically inside the JS function body, populating all projections, discounting factors, valuation outputs, and a sensitivity grid, and returning them as a unified array of sheet rows.
        
        If the user wants to ANALYZE or ASK A QUESTION (including creating CHARTS) about the data:
        - Set "type" to "analyze".
        - In "content", explain the analysis or visualization logic.
        - In "code", provide a JavaScript function body that takes an array 'data' and returns an object:
          { 
            raw: <any>, 
            narrative: \`Natural language explanation using BACKTICKS (template literals) for all dynamic variables (e.g. \\\`Mean: \\\${mean.toFixed(2)}\\\`). CRITICAL: Always wrap the narrative string in backticks (not single/double quotes) if you are interpolating computed numbers using \\\${}, otherwise they render as literal code blocks! To output bullet lists in this narrative, you MUST insert a double newline (e.g. \\\`\\n\\n* \\\` or \\\`\\n\\n- \\\`) before each list item so they render as clean, distinct bullets instead of collapsing onto a single line with literal asterisks!\`,
            chartConfig: { type: "bar"|"line"|"pie", xAxis: "columnName", yAxis: "columnName", data: <aggregatedDataArray> } (OPTIONAL)
          }
        
                If the user wants to UNDO, REVERT, or ROLLBACK their last action/change:
        - Set "type" to "undo".
        - In "content", explain that you are rolling back the last action (e.g., "🔄 **Undoing Last Action**: Reverting your spreadsheet to the previous state...").

        If the user wants to REDO or RE-APPLY their next undone action/change:
        - Set "type" to "redo".
        - In "content", explain that you are redoing the next action (e.g., "🔄 **Redoing Action**: Re-applying the next change in your history...").
        
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
           - CRITICAL APOSTROPHE & STRING ESCAPE SAFETY RULE FOR ALL GENERATED CODE (Transforms & Sheet Creation):
              * NEVER use single quotes (') to wrap string literals that might contain apostrophes (e.g. 'Microsoft's', 'industry's').
              * To be 100% safe, ALWAYS wrap all text string values, summaries, and descriptions in backticks (\`) inside your JavaScript code.
              * If you must use single quotes, you MUST escape any apostrophes inside the string as (\\').
              * For example, write: { 'company': \`Microsoft's Quantum\`, 'Catalyst Summary': \`This company's technology focuses on topological qubits.\` } instead of using single quotes.
           - Example structure for "code":
            const totalSales = data.reduce((acc, r) => acc + (Number(r.Sales) || 0), 0);
            const formattedTotal = '$' + totalSales.toLocaleString();
            return [
              { 'type': 'summary', 'title': 'Executive Summary', 'notes': \`YTD Sales are \${formattedTotal} across \${data.length} transactions.\` },
              { 'type': 'metric', 'title': 'Total Sales Revenue', 'size': 'small', 'value': formattedTotal, 'subtext': 'YTD Cumulative Gross Revenue', 'trend': '+12.4% vs Target', 'trendType': 'positive' },
              { 'type': 'chart', 'title': 'Sales Trend Over Time', 'size': 'medium', 'chartConfig': { 'type': 'line', 'xAxis': 'date', 'yAxis': 'sales', 'data': [] } },
              { 'type': 'chart', 'title': 'Category Breakdown', 'size': 'small', 'chartConfig': { 'type': 'bar', 'xAxis': 'category', 'yAxis': 'sales', 'data': [] } }
            ];
        
        Response format MUST be a single JSON object with "type", "content", and optional "code", "config", or "layout".`;

        const finalRaw = await callGemini(model, geminiKey, finalPrompt);
        
        // Clean up markdown wrapping if present
        let cleanText = finalRaw.trim();
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
          console.error("FAILED TO PARSE AI RESPONSE JSON. Raw Response Text:", finalRaw);
          throw new Error("AI response was not formatted as valid JSON: " + e.message);
        }

        // Handle native Undo and Redo operations directly on the database
        if (result.type === "undo") {
          if (args.activeSheetId) {
            try {
              await ctx.runMutation(api.sheets.undo, { sheetId: args.activeSheetId });
              result.content = "🔄 **Undo Successful**: I have successfully undone the last action for you!";
            } catch (err) {
              console.error("Undo mutation failed:", err);
              result.content = `⚠️ **Undo Failed**: ${err.message || "No history available to undo."}`;
            }
          } else {
            result.content = "⚠️ **Undo Failed**: You are currently not focusing on any active sheet. Please select a sheet first.";
          }
        } else if (result.type === "redo") {
          if (args.activeSheetId) {
            try {
              await ctx.runMutation(api.sheets.redo, { sheetId: args.activeSheetId });
              result.content = "🔄 **Redo Successful**: I have successfully redone the action for you!";
            } catch (err) {
              console.error("Redo mutation failed:", err);
              result.content = `⚠️ **Redo Failed**: ${err.message || "Nothing to redo."}`;
            }
          } else {
            result.content = "⚠️ **Redo Failed**: You are currently not focusing on any active sheet. Please select a sheet first.";
          }
        }

        // 5. Log the AI response
        await ctx.runMutation(api.messages.send, {
          workbookId: args.workbookId,
          role: "assistant",
          content: result,
          type: result.type,
        });

        // Deduct 1 credit only after successful response
        await ctx.runMutation(api.users.deductCredit, { userId, amount: 1 });

        return result;

    } catch (error) {
      console.error("Orchestration error caught gracefully:", error);
      
      // Determine error details
      let title = "⚠️ Catalyst AI Orchestration Error";
      let content = "An unexpected error occurred while executing the AI orchestration pipeline.";
      let errorType = "unknown";

      const msg = error.message || "";
      
      if (msg.includes("GEMINI_API_KEY") || msg.includes("API_KEY") || msg.includes("API key") || msg.includes("key is not configured")) {
        errorType = "api_key_missing";
        title = "🔑 Gemini API Key Missing or Invalid";
        content = "The Catalyst AI Orchestrator cannot communicate with the AI engine because the API key is either missing or misconfigured in the server environment.\n\n" +
                  "**How to fix this:**\n" +
                  "* **Local Server**: Add \`GEMINI_API_KEY=your_key_here\` to your \`.env.local\` file.\n" +
                  "* **Production Server**: Configure the \`GEMINI_API_KEY\` environment variable in your Convex Dashboard settings.\n" +
                  "* **Get a Key**: If you don't have one, visit the [Google AI Studio](https://aistudio.google.com/) to obtain a free or pay-as-you-go Gemini API key.";
      } else if (msg.includes("429") || msg.includes("quota") || msg.includes("Rate limit") || msg.includes("rate limit") || msg.includes("exhausted")) {
        errorType = "rate_limit";
        title = "⏱️ Gemini AI Rate Limit / Quota Reached";
        content = "You have reached the request capacity limit for the Gemini AI engine. This is a common limit on free-tier API keys to prevent abuse.\n\n" +
                  "**What this means:**\n" +
                  "* **Requests Per Minute (RPM)**: The model is processing too many requests concurrently.\n" +
                  "* **Requests Per Day (RPD)**: The total daily allocation for your API key has been fully utilized.\n\n" +
                  "**How to resolve this:**\n" +
                  "* **Wait a moment**: If it is a per-minute limit (RPM), wait **30-60 seconds** and try your request again.\n" +
                  "* **Upgrade Key**: If it is a daily quota limit (RPD), you can upgrade your Gemini key to a pay-as-you-go tier in Google AI Studio to unlock higher limits.\n" +
                  "* **Simplify Prompt**: Avoid highly complex requests that trigger deep batch-processing until your quota resets.";
      } else if (msg.includes("500") || msg.includes("503") || msg.includes("Unavailable") || msg.includes("overloaded")) {
        errorType = "service_unavailable";
        title = "☁️ Gemini AI Service Unavailable";
        content = "The Gemini AI service is temporarily experiencing server overload or internal technical issues.\n\n" +
                  "**How to proceed:**\n" +
                  "* Wait **1-2 minutes** before trying again.\n" +
                  "* Check the [Google Cloud Status Dashboard](https://status.cloud.google.com/) to see if there is an active outage.\n" +
                  "* If the issue persists, the server might be performing scheduled maintenance.";
      } else if (msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("NetworkError") || msg.includes("getaddrinfo")) {
        errorType = "network_error";
        title = "🌐 Network Connection Error";
        content = "The Catalyst server could not establish a connection to the external Gemini AI endpoint. This usually indicates a network connectivity issue on the host machine or a DNS resolution failure.\n\n" +
                  "**Troubleshooting steps:**\n" +
                  "* Ensure your server has active internet access.\n" +
                  "* Verify that your network firewall is not blocking outgoing requests to \`generativelanguage.googleapis.com\`.\n" +
                  "* Check if your DNS settings are properly configured.";
      } else if (msg.includes("JSON") || msg.includes("parse") || msg.includes("format")) {
        errorType = "parsing_error";
        title = "🧩 AI Output Formatting Issue";
        content = "The Gemini AI engine successfully responded, but the output did not comply with the strictly structured format (JSON) required to update your spreadsheet safely.\n\n" +
                  "**Why this happens:**\n" +
                  "* The request might have been too complex, leading the model to hallucinate syntax or return conversational text instead of raw structured code.\n" +
                  "* The model output was truncated mid-response due to token length limitations.\n\n" +
                  "**How to get around it:**\n" +
                  "* Try **rephrasing** your prompt to be more specific and concise.\n" +
                  "* Avoid asking the AI to perform extremely large multi-step operations all in a single query.";
      } else {
        errorType = "unknown";
        content = `An unexpected error occurred while executing the AI orchestration pipeline.\n\n**Technical Details:**\n\`\`\`\n${msg}\n\`\`\`\n\nPlease rephrase your prompt, refresh the workbook, or try again in a few moments.`;
      }

      // Format markdown string beautifully
      const formattedError = `### ${title}\n\n${content}`;
      
      // Attempt to save error message to the workbook chat database so the user sees it in their chat history
      try {
        await ctx.runMutation(api.messages.send, {
          workbookId: args.workbookId,
          role: "assistant",
          content: formattedError,
          type: "text",
        });
      } catch (dbErr) {
        console.error("Failed to save error message to Convex database:", dbErr);
      }

      // Return a graceful error object for the frontend to receive
      return {
        type: "text",
        content: formattedError,
        isError: true,
        errorType: errorType,
        errorMessage: msg
      };
    }
  },
});
