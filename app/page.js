"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Sparkles,
    Zap,
    Table,
    PieChart,
    Database,
    FileText,
    Bot,
    ChevronRight,
    Search,
    Filter,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    History,
    Paintbrush,
    Download,
    Code2,
    Globe,
    Users,
    MessageSquare,
    TrendingUp,
    Undo2,
    Redo2,
    ChevronLeft,
    ChevronDown,
    Trash2,
    Settings2,
    FileSpreadsheet,
    FileJson,
    FileBox,
    Plus,
    Play,
    X
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

const BackgroundElements = () => {
    // Elegant background logos of various sizes and positions
    const logos = [
        { size: 24, top: "12%", left: "6%", delay: 0, duration: 24, xRange: [0, 15, -10, 0], yRange: [0, -25, 15, 0], opacity: 0.08 },
        { size: 24, top: "22%", right: "8%", delay: 2, duration: 28, xRange: [0, -20, 15, 0], yRange: [0, 20, -15, 0], opacity: 0.12 },
        { size: 32, top: "58%", left: "10%", delay: 1, duration: 20, xRange: [0, 10, -15, 0], yRange: [0, -15, 10, 0], opacity: 0.09 },
        { size: 32, top: "72%", right: "5%", delay: 4, duration: 32, xRange: [0, -15, 20, 0], yRange: [0, 25, -20, 0], opacity: 0.10 },
        { size: 24, top: "8%", right: "28%", delay: 3, duration: 26, xRange: [0, 20, -15, 0], yRange: [0, 15, -25, 0], opacity: 0.07 },
        { size: 36, top: "45%", left: "26%", delay: 1.5, duration: 25, xRange: [0, -15, 10, 0], yRange: [0, -20, 20, 0], opacity: 0.06 },
        { size: 40, top: "78%", left: "38%", delay: 5, duration: 30, xRange: [0, 25, -10, 0], yRange: [0, 20, -15, 0], opacity: 0.11 },
        { size: 28, top: "38%", right: "22%", delay: 2.5, duration: 22, xRange: [0, -10, 15, 0], yRange: [0, -15, 15, 0], opacity: 0.08 }
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Elegant glowing background orbs to elevate the premium visual feel */}
            <div className="absolute top-1/10 left-1/5 w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[100px]" />
            <div className="absolute bottom-1/10 right-1/5 w-[600px] h-[600px] rounded-full bg-teal-200/15 blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-slate-200/5 blur-[150px]" />

            {/* Neo-brutalist tech grid overlay */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{ 
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                }}
            />

            {/* Sizable, floating, interactive Catalyst logo elements */}
            {logos.map((logo, index) => (
                <motion.div
                    key={index}
                    style={{
                        position: "absolute",
                        top: logo.top,
                        left: logo.left,
                        right: logo.right,
                        width: logo.size,
                        height: logo.size,
                        opacity: logo.opacity,
                    }}
                    animate={{
                        x: logo.xRange,
                        y: logo.yRange,
                    }}
                    whileHover={{
                        scale: 1.25,
                        opacity: 0.35,
                        filter: "drop-shadow(0px 8px 20px rgba(16, 185, 129, 0.5))",
                    }}
                    transition={{
                        x: {
                            duration: logo.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: logo.delay,
                        },
                        y: {
                            duration: logo.duration * 0.85,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: logo.delay + 0.5,
                        },
                        scale: { duration: 0.3, ease: "easeOut" },
                        opacity: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="pointer-events-auto cursor-pointer"
                >
                    <img 
                        src="/logo.png" 
                        alt="Catalyst background logo hint" 
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all" 
                    />
                </motion.div>
            ))}
        </div>
    );
};


export default function LandingPage() {
    const router = useRouter();
    
    const handleGetStarted = () => router.push('/dashboard');

    const [activeMockTab, setActiveMockTab] = useState('sales');
    const [mobileTabMockup, setMobileTabMockup] = useState('sheet');
    const [hasCreatedSummary, setHasCreatedSummary] = useState(true);
    const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);

    const rechartsData = [
        { name: 'Medium', revenue: 580000 },
        { name: 'Large', revenue: 1220000 },
        { name: 'Small', revenue: 160000 }
    ];

    const formatYAxis = (tickItem) => {
        if (tickItem >= 1000000) {
            return `${(tickItem / 1000000).toFixed(1)}M`;
        }
        if (tickItem >= 1000) {
            return `${(tickItem / 1000).toFixed(0)}K`;
        }
        return tickItem;
    };

    const mockSalesData = [
        { address: "1024 Grand Ave", status: "Approved", city: "Los Angeles", first: "James", last: "Carter", country: "United States" },
        { address: "420 Kingsway Rd", status: "Pending", city: "London", first: "Sarah", last: "Jenkins", country: "United Kingdom" },
        { address: "12 Rue de Rivoli", status: "Approved", city: "Paris", first: "Pierre", last: "Dubois", country: "France" },
        { address: "88 Queen Street", status: "Approved", city: "Melbourne", first: "Chloe", last: "Smith", country: "Australia" },
        { address: "55 Chiba Blvd", status: "Pending", city: "Chiba", first: "Kenji", last: "Tanaka", country: "Japan" },
        { address: "Akergatan 24", status: "Reviewed", city: "Boras", first: "Maria", last: "Larsson", country: "Sweden" },
        { address: "786 Bay Street", status: "Approved", city: "Toronto", first: "David", last: "Miller", country: "Canada" },
        { address: "99 Kurfürstendamm", status: "Approved", city: "Berlin", first: "Lukas", last: "Schneider", country: "Germany" },
        { address: "14 Orchard Road", status: "Pending", city: "Singapore", first: "Mei", last: "Wong", country: "Singapore" },
        { address: "35 Piazza Duomo", status: "Approved", city: "Milan", first: "Giovanni", last: "Rossi", country: "Italy" },
        { address: "205 Avenida Paulista", status: "Approved", city: "Sao Paulo", first: "Camila", last: "Silva", country: "Brazil" },
        { address: "12 Cape Road", status: "Pending", city: "Cape Town", first: "John", last: "Ndlovu", country: "South Africa" }
    ];

    const mockCohortData = [
        { cohort: "Q1 Cohort", size: "1,250", retention: "78.4%", ltv: "$142.50", health: "Excellent" },
        { cohort: "Q2 Cohort", size: "1,980", retention: "81.2%", ltv: "$158.00", health: "Strong" },
        { cohort: "Q3 Cohort", size: "2,400", retention: "68.9%", ltv: "$112.20", health: "Fair" },
        { cohort: "Q4 Cohort", size: "3,100", retention: "84.5%", ltv: "$172.90", health: "Outstanding" },
        { cohort: "Q1 Cohort (Prev)", size: "980", retention: "72.1%", ltv: "$130.40", health: "Strong" },
        { cohort: "Q2 Cohort (Prev)", size: "1,150", retention: "74.8%", ltv: "$135.00", health: "Strong" },
        { cohort: "Q3 Cohort (Prev)", size: "1,420", retention: "65.2%", ltv: "$105.10", health: "Fair" },
        { cohort: "Q4 Cohort (Prev)", size: "1,850", retention: "79.0%", ltv: "$150.20", health: "Excellent" },
        { cohort: "Enterprise Cohort", size: "450", retention: "92.4%", ltv: "$840.00", health: "Exceptional" },
        { cohort: "SME Cohort", size: "2,100", retention: "70.5%", ltv: "$120.00", health: "Fair" },
        { cohort: "Self-Serve Cohort", size: "5,800", retention: "55.0%", ltv: "$45.00", health: "At Risk" },
        { cohort: "Partner Cohort", size: "150", retention: "88.0%", ltv: "$1,250.00", health: "Outstanding" }
    ];

    const mockArxivData = [
        { title: "Equilibrium Reasoners: Learning Attractors Enables Scalable Reasoning", authors: "Google DeepMind team", category: "cs.AI (Artificial Intelligence)", summary: "Discovers that training language models to seek stable latent attractors scales reasoning capacity without massive overhead." },
        { title: "Solve the Loop: Attractor Models for Language and Reasoning", authors: "Stanford AI Lab", category: "cs.LG (Machine Learning)", summary: "Introduces recurring attractor loops in transformer blocks to solve complex multi-step reasoning pathways." },
        { title: "Latent Attractor Alignment in Multi-Agent Systems", authors: "MIT CSAIL", category: "cs.MA (Multi-Agent Systems)", summary: "Aligns latent spaces between distinct agent nodes to allow continuous joint optimization in decentralized tasks." },
        { title: "Foundations of Large Agentic Systems: Communication Protocols", authors: "Berkeley AI Research", category: "cs.MA (Multi-Agent Systems)", summary: "Defines asynchronous consensus constraints for heterogeneous LLM-based agent systems." },
        { title: "Attractor Alignment via Reinforcement Learning", authors: "OpenAI Safety Team", category: "cs.AI (Artificial Intelligence)", summary: "Uses direct preference optimization to lock reasoning chains onto human-aligned stable attractors." },
        { title: "Dynamic Depth Reasoning in Large Language Models", authors: "UW Madison", category: "cs.CL (Computation and Language)", summary: "Allows adaptive compute allocation per token using dynamical systems framework." },
        { title: "Scaling Laws for Search-Based LLM Inference", authors: "Meta GenAI Research", category: "cs.LG (Machine Learning)", summary: "Establishes scaling frontiers for test-time compute allocation." },
        { title: "Continuous-Time Latent Dynamics in Transformers", authors: "Harvard SEAS", category: "cs.NE (Neural and Evolutionary)", summary: "Formulates self-attention layers as discretized ordinary differential equations." },
        { title: "Agentic Tools for Relational Spreadsheet Inferences", authors: "Catalyst Research", category: "cs.DB (Databases)", summary: "Applies agentic recursive planning to complex multi-sheet lookup and joins." },
        { title: "Robustness of Latent Attractors in Out-of-Distribution Tasks", authors: "Oxford Robotics", category: "cs.RO (Robotics)", summary: "Tests attractor-based neural reasoning against noisy feedback loops." },
        { title: "Interactive Visual Analytics for Agentic Computations", authors: "Georgia Tech", category: "cs.HC (Human-Computer)", summary: "Evaluates conversational sheet interfaces for direct execution representation." },
        { title: "Recursive Search over Tabular Graphs", authors: "Carnegie Mellon", category: "cs.IR (Information Retrieval)", summary: "Uses graph neural networks to optimize spreadsheet lookup indices." }
    ];

    const mockQuantumData = [
        { company: "IBM Quantum", headquarters: "Armonk, NY", product: "IBM Quantum System Two (Heron)", summary: "Dominates superconducting architectures with the highest cloud-accessible qubit density." },
        { company: "Microsoft", headquarters: "Redmond, WA", product: "Azure Quantum (Topological)", summary: "Pioneering topological qubits that are immune to noise, enabling super-stable operations." },
        { company: "Google Quantum AI", headquarters: "Santa Barbara, CA", product: "Sycamore Processor (Superconducting)", summary: "Achieved quantum supremacy and leading error-correction scaling frameworks." },
        { company: "Quantinuum", headquarters: "Broomfield, CO", product: "H-Series Trapped-Ion Processor", summary: "Leads trapped-ion architectures with record-breaking quantum volumes." },
        { company: "IonQ", headquarters: "College Park, MD", product: "IonQ Forte (Trapped-Ion)", summary: "Provides commercial trapped-ion computing access via major cloud service brokers." },
        { company: "Rigetti Computing", headquarters: "Berkeley, CA", product: "Ankaa-Series QPU", summary: "Focuses on hybrid classical-quantum cloud architectures and low-latency scaling." },
        { company: "PsiQuantum", headquarters: "Palo Alto, CA", product: "Photonic Quantum Computer", summary: "Building utility-scale silicon photonic quantum computers with built-in error correction." },
        { company: "Xanadu", headquarters: "Toronto, Canada", product: "Borealis (Photonic)", summary: "Pioneered cloud-accessible photonic quantum processors and creator of PennyLane framework." },
        { company: "D-Wave Systems", headquarters: "Burnaby, Canada", product: "Advantage2 (Quantum Annealer)", summary: "Specializes in quantum annealing processors tailored for heavy optimization tasks." },
        { company: "Atom Computing", headquarters: "Berkeley, CA", product: "Neutral-Atom Processor", summary: "First to demonstrate holding over 1,000 qubits in neutral-atom arrays." },
        { company: "QuEra Computing", headquarters: "Boston, MA", product: "Aquila (Neutral-Atom)", summary: "Focuses on analog Hamiltonian simulation and reconfigurable arrays." },
        { company: "IQM Quantum Computers", headquarters: "Espoo, Finland", product: "IQM Spark (Superconducting)", summary: "Europe's leading developer of superconducting hardware for research and industry." }
    ];

    const features = [
        { 
            icon: Database, 
            title: "Unified Data Sources", 
            desc: "Upload multiple Excel, CSV, or raw JSON sheets. Catalyst automatically flattens nested JSON structures into clean 2D relational grids, unifying all files under a single interactive workspace." 
        },
        { 
            icon: Bot, 
            title: "Natural Language SQL", 
            desc: "Talk to your data. Ask complex questions like 'What is the month-over-month growth by region?' and get instant answers." 
        },
        { 
            icon: Zap, 
            title: "Automated Cleaning", 
            desc: "Clean thousands of rows in seconds. Identify duplicates, fix formatting, and fill missing values with one click." 
        },
        { 
            icon: BarChart3, 
            title: "8 Interactive Visuals", 
            desc: "Instantly render Line, Area, Composed, Horizontal Bar, Radar, Scatter, Bar, and Pie charts with dynamic tick-interval spacing to prevent categorical overlap." 
        },
        { 
            icon: Globe, 
            title: "One-Click Report Publishing", 
            desc: "Compile your custom AI dashboards, metric cards, and strategic summaries into a secure, responsive public sharing portal with a single click." 
        },
        { 
            icon: Filter, 
            title: "Precision Filtering", 
            desc: "Slice and dice your data with natural language. No more complex pivot tables or hidden Excel menus." 
        },
        { 
            icon: Globe, 
            title: "Web-to-Sheet Scraper", 
            desc: "Enrich spreadsheets with live real-world knowledge. Catalyst's integrated search agent queries the web to pull fresh stock prices, addresses, or CEO names directly into your workbook." 
        },
        { 
            icon: History, 
            title: "Master Version Control", 
            desc: "Snapshot every transformation. Catalyst maintains a full audit log, allowing you to undo and redo any AI or manual change instantly." 
        },
        { 
            icon: Code2, 
            title: "Self-Healing AI Sandbox", 
            desc: "Secure client-side compiler. Catalyst runs code executions securely in your browser's local sandbox, intercepting and auto-correcting AI variable spelling typos to prevent crashes." 
        }
    ];
    
    const agentProtocols = [
        {
            id: "conversational",
            title: "Conversational Analytics",
            icon: MessageSquare,
            desc: "Everything in Catalyst operates on zero-formula, zero-code natural language. Ask direct business questions in everyday English, and watch the AI process raw columns, calculate exact aggregates, and answer instantly.",
            mechanic: "Instant Conversational Q&A",
            query: "What is the total sales? Which country has the highest volume? What is the product with the highest sales?",
            outcome: "The agent instantly compiles a narrative breakdown, calculates precise mathematical sums and maximums, and returns immediate high-fidelity answers."
        },
        {
            id: "in-chat-visuals",
            title: "In-Chat Visualizations",
            icon: TrendingUp,
            desc: "You don't need to compile a full dashboard to visualize your data. Catalyst generates and embeds live, interactive Recharts (Line, Area, Composed, Horizontal Bar, Radar, Scatter, Bar, Pie) directly inside your ongoing conversational chat feed.",
            mechanic: "Inline Thread Visuals",
            query: "Show me a quick scatter plot comparing order volume against shipping costs directly in the thread.",
            outcome: "The AI agent calculates the correct dimensions, configures the chart renderer, and displays the interactive graphic right inside the chat window."
        },
        {
            id: "transform",
            title: "The Transformation Engine",
            icon: Code2,
            desc: "Most users only ask Catalyst to look at data. But Catalyst can actually rewrite your master record. When you ask for a transformation, the grid enters a special Amber Preview Mode.",
            mechanic: "Amber Preview Highlights",
            query: "Clean this data: Capitalize all names in the 'Customer' column, and for any row where 'Price' is missing, set it to the average.",
            outcome: "Catalyst generates a 'Transform Block'. Click 'Preview Highlights' to see changes in amber, then 'Apply' to save permanently."
        },
        {
            id: "reporting",
            title: "Strategic Dashboarding",
            icon: BarChart3,
            desc: "Turn spreadsheets into high-fidelity executive dashboards with custom multi-grid layouts. Catalyst unifies all visuals with a custom Catalyst AI Intelligence Summary, offering strategic narratives from the perspective of an elite Advisory Lead.",
            mechanic: "Strategic Grid Architecture",
            query: "Generate an executive report with a massive revenue trend at the top and small category breakdowns below.",
            outcome: "Instantly renders exactly the requested count of Area, Composed, Horizontal Bar, Radar, Scatter, Line, Bar, or Pie charts, complete with a professional corporate advisory summary."
        },
        {
            id: "research",
            title: "Multi-Agent Research",
            icon: Globe,
            desc: "Catalyst isn't restricted to your spreadsheet. It has a Research Agent powered by Firecrawl that can leave the app and bring back real-world intelligence.",
            mechanic: "Web-to-Sheet Augmentation",
            query: "Find the current stock prices and CEOs for the company names in Column A, then show me a comparison table.",
            outcome: "The agent searches the web, scrapes official sites, and merges the findings into your workspace automatically."
        },
        {
            id: "self-healing",
            title: "Self-Healing Execution Sandbox",
            icon: Code2,
            desc: "AI engines occasionally output code with minor variable spelling mismatches. Catalyst prevents page-shattering crashes by deploying a dynamic self-healing compiler loop that catches and auto-corrects typos on the fly.",
            mechanic: "Auto-Correcting Sandbox",
            query: "Filter out refunds and calculate average order value [AI spells variable as 'avgOrder' instead of 'avgOrderValue']",
            outcome: "The sandbox compiler intercepts the ReferenceError, dynamically declares the missing variable as 0 on the fly, recovers execution, and builds the dashboard safely with zero downtime."
        },
        {
            id: "cross-sheet",
            title: "Cross-Sheet Intelligence",
            icon: Database,
            desc: "If you upload multiple files, Catalyst performs Relational Joins and logic across them - something standard AI chats usually fail at.",
            mechanic: "Multi-Tab Relational Logic",
            query: "Look at the 'Inventory' sheet and compare it with the 'Orders' sheet. Which products have the highest demand?",
            outcome: "The AI maps all available sheets and performs cross-reference lookups to find complex intersections."
        },
        {
            id: "memory",
            title: "Persistent Analytical Memory",
            icon: Zap,
            desc: "Catalyst doesn't treat every question as a new one. It remembers the last 10 interactions, allowing for complex, multi-step data explorations.",
            mechanic: "Contextual Threading",
            query: "Filter these rows for Q4. [Follow-up]: Now take those results and show me the top 5 customers.",
            outcome: "The agent maintains a 'Rearview Mirror' of your session, understanding words like 'those', 'them', or 'that' based on previous context."
        },
        {
            id: "sheet-generation",
            title: "Dynamic Sheet Compilation",
            icon: Sparkles,
            desc: "Generate entirely new sheets or compile dynamic summaries on the fly conversationally. Catalyst executes the generation in a secure sandbox, appends the tab, and redirects your focus instantly.",
            mechanic: "Conversational Compilation",
            query: "Create a new sheet called 'Q4 Targets' with mock target revenues for each month of Q4.",
            outcome: "Instantly compiles the mock data array, appends the tab to the workbook, and focuses the grid view on the new dataset."
        },
        {
            id: "highlighting",
            title: "Aesthetic Highlight Conditioning",
            icon: Paintbrush,
            desc: "Add instant visual structure with natural language highlighting. Catalyst evaluates custom conditional statements in real-time, applying custom background colors and styles directly to rows or cells inside the grid canvas.",
            mechanic: "Interactive Visual Conditioning",
            query: "Highlight all rows where COUNTRY is 'USA' in yellow, and style any STATUS that is 'Shipped' in light green.",
            outcome: "The AI agent generates precise layout metadata and colors the spreadsheet cells instantly on your screen."
        },
        {
            id: "version-control",
            title: "State-Snapshot Version Control",
            icon: History,
            desc: "Protect against data corruption and incorrect AI decisions. Catalyst takes a complete state snapshot before every single manual edit or AI transformation, allowing you to roll back (Undo) or step forward (Redo) with zero database fragmentation.",
            mechanic: "Multi-Turn Rollback Engine",
            query: "Undo that change. [Follow-up]: Actually, redo it.",
            outcome: "Reverts or re-applies the full spreadsheet cell matrix state immediately with a single click, keeping your data pristine."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-emerald-500/10 overflow-x-hidden">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative pt-32 md:pt-48 pb-20 md:pb-40 px-6 bg-slate-50 border-b-8 border-black">
                    <BackgroundElements />
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-emerald-400 text-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                 <FileSpreadsheet className="w-4 h-4" />
                                 <span className="text-xs font-black uppercase tracking-[0.2em]">The AI-First Spreadsheet Engine</span>
                            </div>

                            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-slate-900 uppercase">
                                Talk to your <br />
                                <span className="bg-black text-white px-6 py-2 inline-block -rotate-1 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] mt-4">Data.</span>
                            </h1>

                            <p className="text-xl md:text-3xl text-slate-700 max-w-3xl mx-auto mb-12 font-black leading-tight uppercase tracking-tight px-4">
                                The era of manual Excel formulas is over. Upload any spreadsheet, ask questions, and let Catalyst handle the heavy lifting.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center px-4">
                                <Button
                                    onClick={handleGetStarted}
                                    className="w-full sm:w-auto px-12 py-8 text-xl md:text-2xl rounded-none bg-emerald-600 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-black uppercase tracking-widest h-auto"
                                >
                                    Get Started Free
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Proof Section */}
                <section className="py-12 bg-black border-b-8 border-black overflow-hidden whitespace-nowrap">
                    <motion.div 
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-12"
                    >
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center gap-8 text-white font-black uppercase tracking-[0.3em] text-xl md:text-3xl">
                                <span>No Hallucinations</span>
                                <div className="w-3 h-3 bg-emerald-500 rotate-45" />
                                <span>100% Accuracy</span>
                                <div className="w-3 h-3 bg-emerald-500 rotate-45" />
                                <span>Real-time Sync</span>
                                <div className="w-3 h-3 bg-emerald-500 rotate-45" />
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* Workflow */}
                <section className="py-24 md:py-40 px-6 bg-white border-b-8 border-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-emerald-600">The Catalyst Loop</h2>
                                <h3 className="text-4xl md:text-7xl font-black text-slate-900 leading-[0.9] uppercase tracking-tighter italic">
                                    From Static Rows to <span className="text-emerald-600 underline">Actionable Insights.</span>
                                </h3>
                                <div className="space-y-6 pt-6">
                                    {[
                                         "Upload Excel, CSV, or raw JSON files",
                                         "Catalyst flattens JSON objects to relational 2D grids",
                                         "Interact, query, and transform with natural language",
                                         "Export instantly in Excel, CSV, or structured JSON formats"
                                     ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-6 h-6 border-2 border-black bg-emerald-400 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-black" />
                                            </div>
                                            <p className="text-xl font-bold text-slate-800 uppercase tracking-tight">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-full aspect-square border-8 border-black bg-emerald-100 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative flex items-center justify-center overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Table className="w-48 h-48 text-black opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-4 border-4 border-dashed border-black/20 flex flex-col items-center justify-center">
                                        <div className="w-64 h-32 bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] mb-4">
                                            <div className="w-full h-2 bg-slate-100 mb-2" />
                                            <div className="w-3/4 h-2 bg-slate-100 mb-2" />
                                            <div className="w-1/2 h-2 bg-emerald-500" />
                                        </div>
                                        <p className="font-black text-black uppercase tracking-widest text-xs">Processing Workbook...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* High-Fidelity Mockup Section */}
                <section className="py-24 md:py-40 px-6 bg-slate-900 border-b-8 border-black text-white relative overflow-hidden">
                    {/* Background glow effects to make it feel vibrant and premium */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] -ml-48 -mb-48 pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* Section Header */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-8">
                            <div className="max-w-2xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-emerald-500 bg-emerald-950 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                    <span>02 / A Glimpse of Your Workspace</span>
                                </div>
                                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
                                    The <br />
                                    <span className="text-emerald-500 italic underline decoration-white">Workspace Preview.</span>
                                </h2>
                            </div>
                            <p className="text-slate-400 font-bold max-w-sm uppercase text-[10px] leading-relaxed tracking-wider">
                                A pixel-perfect, interactive preview of the actual Catalyst workbook workspace. Explore real sheets, relational tables, and the AI analytics pilot.
                            </p>
                        </div>

                        {/* Simulator Sandbox */}
                        <div className="-mx-2 px-2">
                        <div className="w-full border-4 md:border-8 border-black bg-white rounded-none shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] md:shadow-[20px_20px_0px_0px_rgba(16,185,129,1)] text-slate-900 overflow-hidden">
                            {/* Top Toolbar */}
                            <header className="h-14 border-b border-slate-200 flex items-center justify-between px-2 md:px-4 bg-white z-10 shrink-0">
                                <div className="flex items-center gap-1 md:gap-4 min-w-0">
                                    <button className="h-8 w-8 rounded-lg shrink-0 hover:bg-slate-100 flex items-center justify-center p-0 border-none bg-transparent text-slate-900">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <h1 className="text-xs md:text-sm font-black text-slate-900 leading-tight break-words whitespace-normal max-w-[90px] xs:max-w-[120px] sm:max-w-none">Catalyst Workspace</h1>
                                            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-md border border-emerald-100 shrink-0">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Live Sync</span>
                                            </div>
                                            <button className="h-8 w-8 md:h-6 md:w-auto md:px-2 rounded-lg text-slate-500 flex items-center justify-center gap-1 hover:bg-slate-100 transition-all bg-transparent md:bg-slate-50 shrink-0 border-0 md:border md:border-slate-300">
                                                <Settings2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-700" />
                                                <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest text-slate-700">Sources</span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                                            3 Files Unified in Workspace
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                    <div className="flex items-center bg-slate-100 p-0.5 md:p-1 rounded-xl gap-0.5 md:gap-1 shrink-0">
                                        <button className="rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-2.5 p-0 md:p-auto hover:bg-white flex items-center justify-center text-slate-400 opacity-50 cursor-not-allowed">
                                            <Undo2 className="w-4 h-4 md:mr-1.5" />
                                            <span className="hidden md:inline">Undo</span>
                                        </button>
                                        <button className="rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-2.5 p-0 md:p-auto hover:bg-white flex items-center justify-center text-slate-400 opacity-50 cursor-not-allowed">
                                            <Redo2 className="w-4 h-4 md:mr-1.5" />
                                            <span className="hidden md:inline">Redo</span>
                                        </button>

                                        <div className="relative">
                                            <button className="rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-3 p-0 md:p-auto hover:bg-white flex items-center justify-center transition-all">
                                                <Download className="w-4 h-4 md:mr-1.5" />
                                                <span className="hidden md:inline">Export</span>
                                                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60 hidden md:inline" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button className="bg-black text-white hover:bg-slate-800 rounded-lg md:rounded-xl font-bold text-xs h-8 w-auto px-2 border border-black md:border-2 md:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] shrink-0 flex items-center justify-center gap-1">
                                        <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span className="hidden md:inline">Reports</span> <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5 font-black leading-none">2</span>
                                    </button>
                                </div>
                            </header>

                            {/* Main Content Pane Split */}
                            <div className="flex flex-col lg:flex-row flex-1 min-h-[500px]">
                                {/* Left: Spreadsheet Grid View */}
                                <div className={`flex-1 flex-col bg-slate-50 border-r border-slate-200 min-w-0 ${mobileTabMockup === 'sheet' ? 'flex' : 'hidden lg:flex'}`}>
                                    
                                    {/* Sheet Tabs */}
                                    <div className="h-12 border-b border-slate-200 flex items-center px-4 bg-white gap-2 overflow-x-auto no-scrollbar shadow-inner shrink-0">
                                        {/* Tab 1 */}
                                        <div className={`px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 cursor-pointer select-none ${activeMockTab === 'sales' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500"}`} onClick={() => setActiveMockTab('sales')}>
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    SALES_DATA
                                                </div>
                                                <span className={`text-[7px] font-bold truncate max-w-[80px] ${activeMockTab === 'sales' ? "text-emerald-200" : "text-slate-400"}`}>sales_data.csv</span>
                                            </div>
                                        </div>
                                        {/* Tab 2 */}
                                        <div className={`px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 cursor-pointer select-none ${activeMockTab === 'cohort' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500"}`} onClick={() => setActiveMockTab('cohort')}>
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    CUSTOMER COHORT ANALYSIS
                                                </div>
                                                <span className={`text-[7px] font-bold truncate max-w-[80px] ${activeMockTab === 'cohort' ? "text-emerald-200" : "text-slate-400"}`}>sales_data.csv</span>
                                            </div>
                                        </div>
                                        {/* Tab 3 */}
                                        <div className={`px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 cursor-pointer select-none ${activeMockTab === 'arxiv' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500"}`} onClick={() => setActiveMockTab('arxiv')}>
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    ARXIV: LATENT REASONERS
                                                </div>
                                                <span className={`text-[7px] font-bold truncate max-w-[80px] ${activeMockTab === 'arxiv' ? "text-emerald-200" : "text-slate-400"}`}>arxiv: latent reasoners...</span>
                                            </div>
                                        </div>
                                        {/* Tab 4 */}
                                        <div className={`px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 cursor-pointer select-none ${activeMockTab === 'quantum' ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500"}`} onClick={() => setActiveMockTab('quantum')}>
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    MARKET LEADERS: QUANTUM
                                                </div>
                                                <span className={`text-[7px] font-bold truncate max-w-[80px] ${activeMockTab === 'quantum' ? "text-emerald-200" : "text-slate-400"}`}>market leaders quan...</span>
                                            </div>
                                        </div>
                                        <button className="w-8 h-8 rounded-xl shrink-0 opacity-50 hover:opacity-100 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Data Table */}
                                    <div className="flex-1 p-4 relative overflow-x-auto min-w-0">
                                        <AnimatePresence mode="wait">
                                            {activeMockTab === 'sales' && (
                                                <motion.div 
                                                    key="sales-table"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="inline-block min-w-full bg-white text-[11px]"
                                                >
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 font-bold tracking-wider text-left text-slate-700 select-none">
                                                                <th className="p-3 border-r border-slate-200 w-1/6">ADDRESSLINE1 ≡</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/6">AUDITSTATUS ≡</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/6">CITY ≡</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/6">CONTACTFIRST... ≡</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/6">CONTACTLAST... ≡</th>
                                                                <th className="p-3 w-1/6">COUNTRY ≡</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mockSalesData.map((row, idx) => (
                                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                    <td className="p-3 border-r border-slate-100 text-slate-900 font-medium">{row.address}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-700 font-semibold">{row.status}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-900">{row.city}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-600">{row.first}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-600">{row.last}</td>
                                                                    <td className="p-3 text-slate-900">{row.country}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}

                                            {activeMockTab === 'cohort' && (
                                                <motion.div 
                                                    key="cohort-table"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="inline-block min-w-full bg-white text-[11px]"
                                                >
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 font-bold tracking-wider text-left text-slate-700">
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Cohort ID</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Cohort Size</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Active Retention</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Target LTV</th>
                                                                <th className="p-3 w-1/5">Cohort Health</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mockCohortData.map((row, idx) => (
                                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                    <td className="p-3 border-r border-slate-100 text-slate-900 font-black">{row.cohort}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-600">{row.size} users</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-900 font-bold">{row.retention}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-800 font-semibold">{row.ltv}</td>
                                                                    <td className="p-3 text-slate-900">{row.health}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}

                                            {activeMockTab === 'arxiv' && (
                                                <motion.div 
                                                    key="arxiv-table"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="inline-block min-w-full bg-white text-[11px]"
                                                >
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 font-bold tracking-wider text-left text-slate-700">
                                                                <th className="p-3 border-r border-slate-200 w-2/5">Title</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Authors</th>
                                                                <th className="p-3 border-r border-slate-200 w-1/5">Category</th>
                                                                <th className="p-3">Catalyst Summary</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mockArxivData.map((row, idx) => (
                                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                    <td className="p-3 border-r border-slate-100 font-bold text-slate-900">{row.title}</td>
                                                                    <td className="p-3 border-r border-slate-100 text-slate-500 font-semibold">{row.authors}</td>
                                                                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-700 uppercase tracking-tight">{row.category}</td>
                                                                    <td className="p-3 text-slate-600 leading-snug">{row.summary}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}

                                            {activeMockTab === 'quantum' && (
                                                <motion.div 
                                                    key="quantum-table"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="inline-block min-w-full bg-white text-[11px]"
                                                >
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200 font-bold tracking-wider text-left text-slate-700">
                                                                <th className="p-3 border-r-2 border-slate-200 w-1/4">Company</th>
                                                                <th className="p-3 border-r-2 border-slate-200 w-1/4">Headquarters</th>
                                                                <th className="p-3 border-r-2 border-slate-200 w-1/4">Core Architecture</th>
                                                                <th className="p-3 w-1/4">Catalyst Summary</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mockQuantumData.map((row, idx) => (
                                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                    <td className="p-3 border-r-2 border-slate-100 font-bold text-slate-900">{row.company}</td>
                                                                    <td className="p-3 border-r-2 border-slate-100 text-slate-500 font-semibold">{row.headquarters}</td>
                                                                    <td className="p-3 border-r-2 border-slate-100 font-semibold text-slate-800 uppercase tracking-tight">{row.product}</td>
                                                                    <td className="p-3 text-slate-600 leading-snug">{row.summary}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Grid Footer Bar (Matching screenshot exactly) */}
                                    <div className="bg-white border-t-2 border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-black text-slate-600 select-none gap-4">
                                        <div className="flex flex-wrap items-center gap-6 self-end sm:self-center justify-end w-full">
                                            <div className="flex items-center gap-2">
                                                <span>Page Size:</span>
                                                <div className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">50 ▼</div>
                                            </div>
                                            
                                            <span>1 to 50 of 1,000</span>

                                            <div className="flex items-center gap-3">
                                                <span className="cursor-pointer hover:text-black">|&lt;</span>
                                                <span className="cursor-pointer hover:text-black">&lt;</span>
                                                <span>Page 1 of 20</span>
                                                <span className="cursor-pointer hover:text-black">&gt;</span>
                                                <span className="cursor-pointer hover:text-black">&gt;|</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Active AI Pilot Chat Panel */}
                                <div className={`w-full lg:w-[380px] bg-white text-slate-900 flex-col border-l border-slate-200 shrink-0 relative ${mobileTabMockup === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
                                    {/* Chat Panel Header (Matching exactly) */}
                                    <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between shrink-0 select-none">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block leading-none">Catalyst AI</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 block mt-1">● READY</span>
                                            </div>
                                        </div>
                                        
                                        <button className="md:hidden text-slate-400 hover:text-slate-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Chat Feed */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
                                        <div className="space-y-4">
                                            {/* Green bubble matching exact text */}
                                            <div className="bg-emerald-600 border border-emerald-500 rounded-2xl text-white p-4 font-semibold text-xs leading-relaxed shadow-lg">
                                                the Medium category. We are seeing a healthy balance of deal sizes, but there is clear potential to upsell current 'Medium' customers into 'Large' status to maximize our quarterly throughput.
                                            </div>

                                            {/* Vertical Bar Chart visualization using real Recharts */}
                                            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-inner space-y-4">
                                                <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">Q4 Revenue Distribution</span>
                                                    <span className="text-[8px] font-bold text-slate-400">YTD Aggregate</span>
                                                </div>
                                                
                                                <div className="h-44 w-full relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={rechartsData}
                                                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis 
                                                                dataKey="name" 
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                tick={{ fill: '#94a3b8', fontSize: 7, fontWeight: 'bold' }} 
                                                            />
                                                            <YAxis 
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                domain={[0, 1400000]}
                                                                ticks={[350000, 700000, 1100000, 1400000]}
                                                                tickFormatter={formatYAxis}
                                                                tick={{ fill: '#94a3b8', fontSize: 7, fontWeight: 'bold' }} 
                                                            />
                                                            <Bar 
                                                                dataKey="revenue" 
                                                                fill="#10b981" 
                                                                radius={[6, 6, 0, 0]}
                                                                barSize={24}
                                                            >
                                                                {rechartsData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill="#10b981" className="hover:opacity-90 transition-opacity cursor-pointer" />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chat Input Bar area */}
                                    <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
                                        <div className="relative flex items-center">
                                            <input 
                                                type="text" 
                                                disabled 
                                                placeholder="Ask Catalyst to clean, analyze or visualize..." 
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-full pl-4 pr-12 py-2.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none font-bold uppercase select-none"
                                            />
                                            <button className="absolute right-1 w-9 h-9 bg-emerald-400 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                                                <Play className="w-3.5 h-3.5 text-black fill-black" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 select-none">
                                            <span>Catalyst executes code in a secure sandbox. All changes can be previewed.</span>
                                            <span className="text-emerald-600 font-black">21 Credits Left</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Tab switcher (Sticky bottom navigation bar) */}
                            <div className="lg:hidden h-16 border-t border-slate-200 bg-white flex items-center justify-around px-4 shrink-0">
                                <button
                                    onClick={() => setMobileTabMockup('sheet')}
                                    className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                                        mobileTabMockup === 'sheet'
                                            ? "text-emerald-600 font-black"
                                            : "text-slate-400 font-bold"
                                    }`}
                                >
                                    <Table className="w-5 h-5" />
                                    <span className="text-[9px] uppercase tracking-wider">Sheet Grid</span>
                                </button>
                                
                                <button
                                    onClick={() => setMobileTabMockup('chat')}
                                    className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative ${
                                        mobileTabMockup === 'chat'
                                            ? "text-emerald-600 font-black"
                                            : "text-slate-400 font-bold"
                                    }`}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="text-[9px] uppercase tracking-wider">Catalyst AI</span>
                                    <span className="absolute top-2 right-1/3 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24 md:py-40 px-6 bg-slate-50 border-b-8 border-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-baseline gap-4 mb-16 border-b-4 border-black pb-8">
                            <h2 className="text-3xl md:text-6xl font-black text-black uppercase tracking-tighter">The Catalyst <span className="text-emerald-600 italic">Infrastructure.</span></h2>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">03 / Core Features</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {features.map((f, i) => (
                                <div key={i} className="p-6 md:p-10 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group">
                                    <div className="w-14 h-14 md:w-16 md:h-16 border-4 border-black bg-emerald-400 flex items-center justify-center mb-6 md:mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <f.icon className="w-7 h-7 md:w-8 md:h-8 text-black" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black mb-4 text-slate-900 uppercase tracking-tighter">{f.title}</h3>
                                    <p className="text-slate-700 font-bold leading-relaxed text-sm">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Agent Protocol Section */}
                <section className="py-24 md:py-40 px-6 bg-slate-900 border-y-8 border-black overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">The Catalyst Protocol</h2>
                                <h3 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                                    Agent <br /><span className="text-emerald-500 italic underline decoration-white">Capabilities.</span>
                                </h3>
                            </div>
                            <p className="text-slate-400 font-bold max-w-sm uppercase text-xs leading-relaxed tracking-wider">
                                Discover the full operational scope of your AI analytical partner. Deploy these optimized query templates to clean, structure, and visualize your spreadsheets.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {agentProtocols.map((protocol, i) => (
                                <div key={i} className="group relative">
                                    <div className="absolute inset-0 bg-emerald-500 translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300" />
                                    <div className="relative bg-white border-4 border-black p-8 md:p-16 flex flex-col lg:flex-row gap-12 lg:items-center">
                                        <div className="lg:w-1/3 space-y-6">
                                            <div className="w-20 h-20 bg-black flex items-center justify-center border-4 border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                                                <protocol.icon className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <h4 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tighter leading-tight">{protocol.title}</h4>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border-2 border-emerald-600 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                                                <Zap className="w-3 h-3" />
                                                {protocol.mechanic}
                                            </div>
                                            <p className="text-slate-600 font-bold leading-relaxed">{protocol.desc}</p>
                                        </div>

                                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-slate-50 border-4 border-black p-6 space-y-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Example Command</span>
                                                <div className="bg-white border-2 border-slate-200 p-4 rounded-lg shadow-inner italic font-bold text-slate-800 text-sm">
                                                    "{protocol.query}"
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 border-4 border-emerald-600 p-6 space-y-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Expected Outcome</span>
                                                <p className="text-sm font-bold text-emerald-900 leading-snug">
                                                    {protocol.outcome}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Extra Features Grid */}
                        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { 
                                    title: "Manual Grid Interaction", 
                                    desc: "Double-click any cell to manually edit. Catalyst uses AG Grid Enterprise for real-time cloud sync.",
                                    action: "Try double-clicking a cell to edit." 
                                },
                                { 
                                    title: "Narrative-Driven Analysis", 
                                    desc: "Get an executive story instead of a raw chart. AI explains the anomalies in plain English.",
                                    action: "'Perform a deep-dive audit of our revenue.'" 
                                },
                                { 
                                    title: "Byte-Safe Volume Protection", 
                                    desc: "Automatically analyzes dataset byte sizes and scales down massive rows on the fly, preventing database overloads and keeping cloud sandbox operations sub-second.",
                                    action: "Upload massive 10,000+ row sheets without latency or crashes." 
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-800 border-4 border-black p-8 hover:bg-slate-700 transition-colors">
                                    <h5 className="text-emerald-500 font-black uppercase tracking-widest text-lg mb-4">{item.title}</h5>
                                    <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">{item.desc}</p>
                                    <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-black/40 p-2 border border-white/10">
                                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                                        {item.action}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 md:py-40 px-4 sm:px-6 bg-white border-t-8 border-black">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-black p-8 sm:p-12 md:p-24 text-center border-8 border-black shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] md:shadow-[20px_20px_0px_0px_rgba(16,185,129,1)]">
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 md:mb-8 uppercase tracking-tighter leading-[0.9]">
                                Ready to <span className="text-emerald-500 italic">Catalyze</span> your data?
                            </h2>
                            <p className="text-base sm:text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-12 font-bold uppercase tracking-tight leading-tight">
                                Join hundreds of analysts who have swapped formulas for natural language.
                            </p>
                            <Button
                                onClick={handleGetStarted}
                                className="w-full sm:w-auto px-8 sm:px-16 py-5 sm:py-8 text-lg sm:text-2xl rounded-none bg-emerald-600 text-white border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all font-black uppercase tracking-widest h-auto"
                            >
                                Start Analysis
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
