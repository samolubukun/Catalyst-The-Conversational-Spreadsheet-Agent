<div align="center">
  <img src="/logo.png" width="200" alt="Catalyst Logo" />
  <h1>Catalyst — The Conversational Data Agent</h1>
</div>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Convex](https://img.shields.io/badge/Convex-Backend-FF6B6B?style=for-the-badge&logo=convex)
![Gemini](https://img.shields.io/badge/Gemini-3.1%20Flash-blue?style=for-the-badge&logo=google-gemini)
![Tailwind](https://img.shields.io/badge/Tailwind-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)

### Conversational Spreadsheet Intelligence

Catalyst is a comprehensive data analytics platform that allows you to interact with complex spreadsheets using pure natural language. Built for speed, security, and mathematical precision, Catalyst bridges the gap between raw data and actionable insights through an advanced multi-agent architecture.

---

## The Engine: Hybrid Agentic Architecture

Catalyst uses a unique **Schema-First Code Generation** strategy to solve the most common problems in AI data analysis: token limits, privacy, and hallucinations.

### How it Works:
1.  **Context Optimization**: Instead of sending your entire dataset to the LLM, Catalyst only sends the **Table Schema** (columns/types) and a tiny 3-row sample. This reduces token usage by 99% and ensures absolute data privacy.
2.  **Logic Generation**: The AI (Gemini) acts as a Senior Software Engineer, generating high-performance **JavaScript Code** designed to perform the requested transformation or analysis.
3.  **Client-Side Execution Sandbox**: The generated code is executed securely in the **User's Browser**. This allows Catalyst to process millions of rows instantly without the raw data ever leaving your machine.
4.  **Mathematical Precision**: Since the final result is calculated by a deterministic JavaScript engine rather than a probabilistic LLM, Catalyst provides **zero-hallucination accuracy** for all mathematical queries.

---

## Core Features

-   **Natural Language Workspace**: Ask complex questions like *"What is the average revenue by region in Q3?"* and get instant results.
-   **Smart Data Transformations**: Clean, format, and filter massive datasets by simply describing what you want to achieve.
-   **Interactive AG Grid Integration**: View your data in a premium, enterprise-grade grid with real-time sync via Convex.
-   **Automated Dashboards**: Generate "Blueprint Dashboards" instantly. The AI proposes layouts and charts which are then rendered live against your data.
-   **Multi-Agent Research**: Integrated with **Firecrawl** and **LangSearch** to augment your internal spreadsheets with real-world web data.
-   **Universal Versioning**: Track every change and transformation. Preview AI-proposed edits before applying them to your master record.

---

## Security & Privacy
Catalyst is designed with a **privacy-first** architecture:
- **Local Analysis**: All data processing and transformations happen in your browser's secure sandbox. Your raw datasets are never sent to the cloud for analysis.
- **Schema-Only AI**: We only share your table headers and a tiny sample with the AI to generate logic. Your full dataset remains strictly local.
- **Zero Retention**: Your spreadsheets are stored in your private Convex instance, and analysis results are never used for model training.

## Supported Formats
-   **Excel**: `.xlsx`, `.xls` (multi-sheet support)
-   **CSV**: Standard comma-separated values
-   **JSON**: Automatic flattening of structured data objects

---

## Tech Stack

-   **Frontend**: Next.js 15 (Turbopack), Tailwind CSS, Framer Motion.
-   **Backend**: Convex (Real-time DB, File Storage, Serverless Actions).
-   **Authentication**: Stack Auth (Cloud-native identity management).
-   **AI Intelligence**: Google Gemini 1.5 / 2.0 / 3.1 Flash.
-   **Data Grid**: AG Grid (Enterprise-grade UI).
-   **Web Intelligence**: Firecrawl & LangSearch (Web scraping & Search).

---

## Getting Started

### 1. Environment Configuration
Create a `.env.local` file and add your keys:
```env
# Convex (Real-time DB)
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url

# Auth: Stack Auth (Identity Management)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key

# AI Intelligence (Google Gemini)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview

# Research & Web Search (Firecrawl & LangSearch)
LANGSEARCH_API_KEY=your_langsearch_key
FIRECRAWL_API_KEY=your_firecrawl_key
```


### 2. Convex Backend Configuration
For the AI Orchestrator and Research Agents to function, you MUST set the following environment variables in your **Convex Dashboard** (Settings > Environment Variables) or via the **CLI**:

#### Option A: Via Dashboard
- `GEMINI_API_KEY`: Your Google AI Studio key.
- `LANGSEARCH_API_KEY`: Your LangSearch key for web queries.
- `FIRECRAWL_API_KEY`: Your Firecrawl key for web scraping.

#### Option B: Via Terminal (Faster)
```bash
npx convex env set GEMINI_API_KEY your_key
npx convex env set LANGSEARCH_API_KEY your_key
npx convex env set FIRECRAWL_API_KEY your_key
```

### 3. Install & Run
```bash
npm install
npx convex dev
npm run dev
```

---
*Built for reliable agentic data analysis.*
