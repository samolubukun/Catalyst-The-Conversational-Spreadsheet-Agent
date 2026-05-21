# 📘 Catalyst AI Ultimate Prompt Playbook

This playbook compiles the absolute master list of **Catalyst AI's core capabilities**. 

Use these prompts to immediately demonstrate, test, or showcase the full extent of Catalyst's analytical engine.

---

# 💎 Section 1: One-by-One Capability Guide (1-2 Prompts Each)

### 📊 1. Advanced Statistical Analysis
*Analyze, summarize, and perform deep mathematical audits on your active sheets (means, standard deviations, distributions, and correlation coefficients).*
*   **Prompt A (Key Metrics & Standard Deviation)**:
    > *"Perform a statistical audit of the 'SALES' column: calculate the total sum, the mean average sales, the median, and the standard deviation to help us understand our sales consistency across transactions."*
*   **Prompt B (Revenue Pattern Deep-Dive)**:
    > *"Perform a deep-dive audit of our revenue patterns. Don't just show me a chart; write a 3-paragraph executive narrative explaining the anomalies and where we are losing money."*

### 👥 2. Customer Cohort Analysis
*Group users or buyers by temporal cohorts (signup month, first purchase quarter) to track customer behavior, retention, and lifetime value over time.*
*   **Prompt A (Retention Cohort Table)**:
    > *"Generate a cohort analysis sheet grouping our customers by their first order year (e.g. 2003, 2004, 2005) and track their total sales contribution and transaction frequency over the subsequent quarters."*
*   **Prompt B (Category Cohorts)**:
    > *"Build a cohort matrix sheet comparing different product lines (Motorcycles, Classic Cars) against deal sizes to show which product cohorts generate the highest percentage of recurring medium deals."*

### 📈 3. Predictive Trend Forecasting
*Compile historical data points and project future growth trajectories (linear projections, exponential smoothing, or rolling averages).*
*   **Prompt A (Linear Sales Projection)**:
    > *"Generate a 3-quarter predictive sales forecast for each of our territories (EMEA, APAC, NA) based on the rolling average of our historical sales trend. Return the projected values in a clean new sheet called 'Q3-Q4 Projections'."*
*   **Prompt B (Complex Financial Modeling)**:
    > *"Generate a fully projected 5-year Discounted Cash Flow (DCF) valuation model based on our active sheet's sales. The sheet should project future sales growth of 8% annually, calculating EBIT, free cash flows, a WACC discount factor of 10%, present value sums, and a final terminal value calculation."*

### 🚨 4. Anomaly & Outlier Detection
*Scan the active sheet to identify operational anomalies, transaction spikes, outliers, or suspicious data points.*
*   **Prompt A (Z-Score Outlier Finder)**:
    > *"Scan the sales dataset and perform an anomaly detection audit: find any transaction where the order value lies more than 2 standard deviations away from the product line's average price, and output a clean list of these outliers."*
*   **Prompt B (Fulfillment / Transaction Volatility)**:
    > *"Search the active sheet for fulfillment anomalies: list all orders that are flagged as 'Disputed' or 'Cancelled' and correlate them with customer names that have the highest average cancellation rate."*

### 🖥️ 5. Tableau-Style Executive Dashboards (`dashboard` action)
*Generate horizontal responsive dashboard grids featuring global executive narratives, rows of side-by-side metric cards with target indicators, and dynamic sizing.*
*   **Prompt A (Standard Dashboard - 3 Charts)**:
    > *"Generate a full dashboard for this sheet with a summary and three charts showing annual sales trends, product line breakdowns, and deal sizes."*
*   **Prompt B (High-Fidelity Power BI Dashboard - 6 Charts & KPIs)**:
    > *"Generate an executive Tableau-style dashboard named 'Q2 Performance Audit'. Include 3 small metric KPI cards at the top showing Total Sales, Unique Orders (+4.2% MoM, trendType positive), and Average Ticket Size (-1.5% YoY, trendType negative). Below the cards, render a medium-sized line chart of sales over time, a medium bar chart of product performance, and a small pie chart showing territory breakdowns."*

### 📈 6. High-Fidelity In-Chat Visualizations (`analyze` action)
*Commands the Recharts rendering pipeline to build responsive, interactive charts directly inside the chatbot bubble.*
*   **Prompt A (Geographic Share - Pie)**:
    > *"give me a pie chart of the country distributions"*
*   **Prompt B (Filtered Contributors - Bar)**:
    > *"give me a bar chart of the top 5 country distributions"*

### 🧹 7. Advanced Data Transformation & Formatting (`transform` action)
*Instructs the JS Sandbox to parse columns, perform cell cleanups, handle missing values, and re-sort grids.*
*   **Prompt A (Casing & Missing Values)**:
    > *"Clean this data: Capitalize all names in the 'Customer' column, and for any row where 'Price' is missing, set it to the average price of its category."*
*   **Prompt B (Capitalization & Column Injector)**:
    > *"Clean the active sheet: capitalise all column headers, add a new column called 'AuditStatus' filled with the text 'Reviewed', and sort the table by the first column."*

### 🎨 8. Real-Time Grid Highlight Styling
*Add visual indicators or color-coding onto rows and cells matching specific conditional criteria.*
*   **Prompt A (Row Color Highlight)**:
    > *"Audit the active sheet and highlight in a soft red background all rows where the order status is 'Cancelled' or 'Disputed'."*
*   **Prompt B (Targeted Cell Highlighting)**:
    > *"Scan the spreadsheet and apply a soft green background to the cells in the 'SALES' column for any transaction that exceeds $7,000."*

### 🎓 9. Academic arXiv Integration (`arxiv` action)
*Imports databases of academic publications complete with abstracts and custom AI summaries.*
*   **Prompt A (Deep Learning Papers)**:
    > *"Research and pull the top 10 latest academic research papers on 'Generative AI reasoning and latent attractors' from arXiv. Create a new sheet named 'arXiv: Latent Reasoners' containing their title, authors, published date, PDF link, and a custom 2-sentence Catalyst Summary outlining their breakthrough impact."*

### 🔍 10. Live Web Search & Scraping (`search` & `scrape` actions)
*Enrich spreadsheet rows or pull real-time benchmarks from the internet using single searches or row-by-row batch enrichment.*
*   **Prompt A (Single Web Search & Narrative)**:
    > *"Search the web for the official average market MSRP of a classic 1952 Alpine Renault A110. Write an executive summary comparing this actual market price with the average price in our active spreadsheet."*
*   **Prompt B (Batch Search Enrichment)**:
    > *"Perform a batch search on the active sheet: for the first 10 rows, search for the 'Current CEO of {CUSTOMERNAME}' using the customer column values. Write a script to map these CEO names into a new column called 'Company_CEO'."*
*   **Prompt C (Batch Web Scraping)**:
    > *"Perform a batch scrape on our active sheet: for the first 5 rows, scrape the website URLs listed in the 'WEBSITE' column. Map a concise 1-sentence scraped description of their homepage into a new column called 'Corporate_Bio'."*

### 💬 11. Conversational NLP Data Q&A & Narrative Synthesis
*Engage in open-ended natural language conversations about your data. Ask conversational 'Why' and 'What does it mean' questions to receive clean, paragraph-style business insights and executive summaries.*
*   **Prompt A (Conversational Trend Explanation)**:
    > *"Looking at our active sheet, sales in APAC seem lower than other regions. What is going on here, what does it mean for our annual performance, and what is your natural language summary of this bottleneck?"*
*   **Prompt B (Executive Paragraph Synthesis)**:
    > *"Give me a professional, high-level one-paragraph synthesis explaining the key revenue drivers of our Classic Cars segment and what we should prioritize next quarter."*

---

# 🔗 Section 2: Workbook-Wide Cross-Sheet Merging

These prompts demonstrate the AI's ability to orchestrate cross-tab intelligence, joining hidden datasets together.

*   **Prompt A (Key-Based Lookup)**:
    > *"Locate the 'Products' tab and merge its pricing columns with our active 'Sales' sheet using the product SKU as a key."*
*   **Prompt B (Master consolidator)**:
    > *"Merge the active sheet with all other sheets in this workbook that contain a matching order ID, and output the joined rows."*
