"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion";
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
    Download,
    Code2,
    Globe,
    Users
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BackgroundElements = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div 
                animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -top-40 -right-40 w-[600px] h-[600px] border-4 border-emerald-500/10 rounded-full" 
            />
            <motion.div 
                animate={{ 
                    x: [0, 50, 0], 
                    y: [0, -50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-0 w-[400px] h-[400px] border-4 border-emerald-400/10 rounded-none rotate-45" 
            />
            <div className="absolute inset-0 opacity-[0.05]"
                style={{ 
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    );
};

export default function LandingPage() {
    const router = useRouter();
    
    const handleGetStarted = () => router.push('/dashboard');

    const features = [
        { 
            icon: Database, 
            title: "Smart Ingestion", 
            desc: "Upload Excel, CSV, or JSON. Catalyst automatically maps your data types and identifies key relationships." 
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
            title: "Instant Visuals", 
            desc: "Turn spreadsheets into dashboards. Catalyst generates interactive charts and reports based on your conversational queries." 
        },
        { 
            icon: Table, 
            title: "Interactive Workspace", 
            desc: "A high-performance grid experience. Edit data manually or let the AI handle bulk transformations in real-time." 
        },
        { 
            icon: Filter, 
            title: "Precision Filtering", 
            desc: "Slice and dice your data with natural language. No more complex pivot tables or hidden Excel menus." 
        },
        { 
            icon: Search, 
            title: "Universal Data Hub", 
            desc: "Upload multiple CSV, Excel, and JSON files simultaneously. Catalyst unifies them into a single intelligent workspace." 
        },
        { 
            icon: History, 
            title: "Master Version Control", 
            desc: "Snapshot every transformation. Catalyst maintains a full audit log, allowing you to undo any AI or manual change instantly." 
        },
        { 
            icon: Zap, 
            title: "Data Sandbox Security", 
            desc: "Your raw data never leaves your machine during analysis. Catalyst generates code that executes locally in a secure browser sandbox." 
        }
    ];
    
    const agentProtocols = [
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
            id: "research",
            title: "Multi-Agent Research",
            icon: Globe,
            desc: "Catalyst isn't restricted to your spreadsheet. It has a Research Agent powered by Firecrawl that can leave the app and bring back real-world intelligence.",
            mechanic: "Web-to-Sheet Augmentation",
            query: "Find the current stock prices and CEOs for the company names in Column A, then show me a comparison table.",
            outcome: "The agent searches the web, scrapes official sites, and merges the findings into your workspace automatically."
        },
        {
            id: "reporting",
            title: "Strategic Dashboarding",
            icon: BarChart3,
            desc: "Turn private analysis into a SaaS-grade dashboard with Tableau-inspired layouts. Catalyst automatically creates visual hierarchies: putting master trends in large 'Hero' slots and details in secondary cards.",
            mechanic: "Strategic Grid Architecture",
            query: "Generate an executive report with a massive revenue trend at the top and small category breakdowns below.",
            outcome: "The agent assigns dynamic 'size' properties to widgets (Large/Medium/Small), creating a professional report layout instantly."
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
                                 <Sparkles className="w-4 h-4" />
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
                                        "Upload Excel, CSV, or raw JSON data",
                                        "Ask questions in plain English",
                                        "Review and approve AI-generated changes",
                                        "Export clean, structured data instantly"
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

                {/* Features */}
                <section className="py-24 md:py-40 px-6 bg-slate-50 border-b-8 border-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-baseline gap-4 mb-16 border-b-4 border-black pb-8">
                            <h2 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter">The Catalyst <span className="text-emerald-600 italic">Infrastructure.</span></h2>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">03 / Core Features</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {features.map((f, i) => (
                                <div key={i} className="p-10 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group">
                                    <div className="w-16 h-16 border-4 border-black bg-emerald-400 flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <f.icon className="w-8 h-8 text-black" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-slate-900 uppercase tracking-tighter">{f.title}</h3>
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
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">The Master Protocol</h2>
                                <h3 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                                    Agent <br /><span className="text-emerald-500 italic underline decoration-white">Capabilities.</span>
                                </h3>
                            </div>
                            <p className="text-slate-400 font-bold max-w-sm uppercase text-xs leading-relaxed tracking-wider">
                                This document outlines the full scope of your data assistant's capabilities. Use these queries as templates for your own data.
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
                                            <h4 className="text-4xl font-black text-black uppercase tracking-tighter leading-tight">{protocol.title}</h4>
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
                                    title: "Master Version Control", 
                                    desc: "Snapshots every change. Revert AI or manual edits instantly with the Undo system.",
                                    action: "Use the History/Undo button in the toolbar." 
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
                <section className="py-20 md:py-40 px-6 bg-white border-t-8 border-black">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-black p-12 md:p-24 text-center border-8 border-black shadow-[20px_20px_0px_0px_rgba(16,185,129,1)]">
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9]">
                                Ready to <span className="text-emerald-500 italic">Catalyze</span> your data?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-bold uppercase tracking-tight leading-tight">
                                Join hundreds of analysts who have swapped formulas for natural language.
                            </p>
                            <Button
                                onClick={handleGetStarted}
                                className="w-full sm:w-auto px-16 py-8 text-2xl rounded-none bg-emerald-600 text-white border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all font-black uppercase tracking-widest h-auto"
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
