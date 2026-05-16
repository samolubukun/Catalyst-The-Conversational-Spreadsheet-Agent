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
    CheckCircle2
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
                <section className="py-24 md:py-40 px-6 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
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
