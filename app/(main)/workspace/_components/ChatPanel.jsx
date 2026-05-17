"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Loader2, Play, Sparkles, MessageSquare, Zap, BarChart3, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ChartRenderer from '@/components/ChartRenderer';

import { UserContext } from '@/app/_context/UserContext';
import { useContext } from 'react';

export default function ChatPanel({ workbookId, activeSheetId, onActiveSheetChange, onPreview, onClearPreview }) {
    const { userData } = useContext(UserContext);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);

    const messages = useQuery(api.messages.list, { workbookId }) || [];
    const activeSheet = useQuery(api.sheets.getById, activeSheetId ? { id: activeSheetId } : "skip");
    const allSheets = useQuery(api.sheets.getByWorkbook, { workbookId }) || [];
    const orchestrate = useAction(api.agents.orchestrate);
    const updateSheetData = useMutation(api.sheets.updateData);
    const createDashboard = useMutation(api.dashboards.create);
    const createSheet = useMutation(api.sheets.create);

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages, isTyping]);

    // Auto-resize chat input height as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    const handleCreateDashboard = async (layout, name, isPublic) => {
        const loadingToast = toast.loading("Publishing dashboard...");
        try {
            const dashboardId = await createDashboard({
                workbookId,
                userId: userData?._id,
                name: name || "AI Generated Report",
                config: layout,
                isPublic: isPublic,
            });

            toast.success("Dashboard live!", { id: loadingToast, duration: 4000 });
            window.open(`/share/${dashboardId}`, '_blank');
        } catch (error) {
            console.error("Dashboard error:", error);
            toast.error("Failed to publish dashboard", { id: loadingToast, duration: 4000 });
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setIsTyping(true);

        try {
            await orchestrate({
                workbookId,
                userMessage: userMsg,
                activeSheetId,
            });
        } catch (error) {
            console.error("Agent error:", error);
            toast.error("Failed to get response from AI");
        } finally {
            setIsTyping(false);
        }
    };

    const handlePreviewTransform = async (code) => {
        if (!activeSheet || !activeSheet.data) return;
        
        const loadingToast = toast.loading("Calculating changes...");
        try {
            const transformFn = new Function("data", code);
            const transformedData = transformFn(activeSheet.data);
            
            if (!Array.isArray(transformedData)) throw new Error("Code must return an array");

            onPreview(transformedData);
            toast.success(`Generated preview of changes`, { id: loadingToast, duration: 4000 });
        } catch (error) {
            console.error("Transform error:", error);
            toast.error(`Analysis failed: ${error.message}`, { id: loadingToast, duration: 4000 });
        }
    };

    const handleApplyTransform = async (code) => {
        if (!activeSheet || !activeSheet.data) return;
        
        const loadingToast = toast.loading("Applying changes...");
        try {
            const transformFn = new Function("data", code);
            const transformedData = transformFn(activeSheet.data);
            
            if (!Array.isArray(transformedData)) throw new Error("Code must return an array");

            await updateSheetData({
                id: activeSheetId,
                data: transformedData,
                type: 'ai',
                description: 'AI Transformation'
            });
            onClearPreview();
            toast.success(`Applied changes: ${transformedData.length} rows updated`, { id: loadingToast, duration: 4000 });
        } catch (error) {
            console.error("Transform error:", error);
            toast.error(`Transformation failed: ${error.message}`, { id: loadingToast, duration: 4000 });
        }
    };

    const handleCreateSheet = async (code, name) => {
        if (!activeSheet) {
            toast.error("Please upload or select a sheet first.");
            return;
        }

        const loadingToast = toast.loading("Generating sheet...");
        try {
            const transformFn = new Function("data", code);
            const newData = transformFn(activeSheet.data || []);
            
            if (!Array.isArray(newData)) throw new Error("Generated code must return an array of row objects");

            const nextOrder = allSheets ? allSheets.length : 1;

            const sheetId = await createSheet({
                fileId: activeSheet.fileId,
                name: name || "New Sheet",
                data: newData,
                order: nextOrder,
            });

            toast.success(`Sheet "${name}" created successfully!`, { id: loadingToast, duration: 4000 });
            
            if (onActiveSheetChange) {
                onActiveSheetChange(sheetId);
            }
        } catch (error) {
            console.error("Create sheet error:", error);
            toast.error(`Failed to create sheet: ${error.message}`, { id: loadingToast, duration: 4000 });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden w-full border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Catalyst AI</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Analytics Ready</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
                <div className="space-y-6 max-w-2xl mx-auto pb-4">
                    {messages.length === 0 && (
                        <div className="py-12 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center">
                                <Database className="w-8 h-8 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-900 dark:text-white">Start your analysis</h3>
                                <p className="text-xs font-medium text-slate-500 max-w-[240px]">
                                    Try asking: "Clean the duplicates in this sheet" or "What's the total revenue by region?"
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => {
                        const isAssistant = msg.role === 'assistant';
                        const messageData = isAssistant && typeof msg.content === 'object' ? msg.content : { content: msg.content };
                        
                        return (
                            <div key={i} className={cn(
                                "flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "max-w-[85%] rounded-[1.8rem] p-4 text-sm shadow-sm border transition-all",
                                    msg.role === 'user' 
                                        ? "bg-emerald-600 text-white border-emerald-500 rounded-tr-none" 
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-700 rounded-tl-none"
                                )}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none font-medium leading-relaxed">
                                        <ReactMarkdown>
                                            {messageData.content}
                                        </ReactMarkdown>
                                    </div>

                                    {isAssistant && msg.type === 'visualize' && messageData.config && (
                                        <ChartRenderer config={messageData.config} />
                                    )}

                                    {isAssistant && msg.type === 'dashboard' && messageData.code && (
                                        <DashboardGenerator 
                                            code={messageData.code} 
                                            activeSheet={activeSheet} 
                                            name={messageData.name}
                                            onCreate={(layout, isPublic) => handleCreateDashboard(layout, messageData.name, isPublic)} 
                                        />
                                    )}

                                    {isAssistant && msg.type === 'analyze' && messageData.code && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                                            <AutoAnalyzer code={messageData.code} activeSheet={activeSheet} />
                                        </div>
                                    )}

                                    {isAssistant && msg.type === 'transform' && messageData.code && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                                            <TransformBlock 
                                                code={messageData.code} 
                                                onPreview={() => handlePreviewTransform(messageData.code)}
                                                onApply={() => handleApplyTransform(messageData.code)}
                                            />
                                        </div>
                                    )}

                                    {isAssistant && msg.type === 'create_sheet' && messageData.code && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                                            <CreateSheetBlock 
                                                code={messageData.code} 
                                                name={messageData.name || "New Sheet"}
                                                activeSheet={activeSheet}
                                                onCreateSheet={handleCreateSheet}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Visual Feedback for Types */}
                                {msg.type === 'transform' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Zap className="w-3 h-3" />
                                        Data Transformation Proposed
                                    </div>
                                )}
                                {msg.type === 'create_sheet' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Zap className="w-3 h-3" />
                                        Conversational Sheet Generation Proposed
                                    </div>
                                )}
                                {msg.type === 'visualize' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <BarChart3 className="w-3 h-3" />
                                        Chart Generated
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none p-4 border border-slate-100 dark:border-slate-700">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="relative flex items-center gap-2 max-w-2xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask Catalyst to clean, analyze or visualize..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-[11px] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 dark:text-white resize-none max-h-[160px] overflow-y-auto no-scrollbar"
                    />
                    <Button 
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl w-10 h-10 p-0 shadow-lg shadow-emerald-500/20"
                    >
                        {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                    Catalyst executes code in a secure sandbox. All changes can be previewed.
                </p>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// AutoAnalyzer Component
// Automatically executes the AI-generated JavaScript analysis code safely 
// on the frontend using the active sheet data and renders the result.
// ----------------------------------------------------------------------
function AutoAnalyzer({ code, activeSheet }) {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activeSheet || !activeSheet.data) return;
        try {
            const analyzeFn = new Function("data", code);
            const res = analyzeFn(activeSheet.data);
            setResult(res);
        } catch (e) {
            setError(e.message);
        }
    }, [code, activeSheet]);

    const [showDev, setShowDev] = useState(false);

    if (error) {
        return (
            <div className="text-red-500 text-[10px] mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl font-mono">
                Error executing analysis: {error}
            </div>
        );
    }

    if (result !== null) {
        // Handle the new narrative + raw format
        const hasNarrative = result && typeof result === 'object' && result.narrative;
        const narrativeText = hasNarrative ? result.narrative : null;
        const rawData = hasNarrative ? result.raw : result;
        const chartConfig = hasNarrative ? result.chartConfig : null;

        return (
            <div className="mt-2 flex flex-col gap-2">
                {narrativeText && (
                    <div className="p-3 bg-emerald-600 text-white rounded-xl text-sm font-medium leading-relaxed shadow-sm">
                        {narrativeText}
                    </div>
                )}

                {chartConfig && (
                    <ChartRenderer config={chartConfig} />
                )}
                
                {!narrativeText && !chartConfig && (
                    <div className="p-3 bg-emerald-600 text-white rounded-xl text-sm font-medium leading-relaxed shadow-sm">
                        Analysis complete. View data below.
                    </div>
                )}
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDev(!showDev)}
                    className="self-start text-[10px] h-6 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 uppercase tracking-widest font-black"
                >
                    {showDev ? "Hide Technical Details" : "View Technical Details"}
                </Button>

                {showDev && (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                        <div className="p-3 bg-slate-900 rounded-xl overflow-x-auto">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                Generated Code
                            </span>
                            <code className="text-[10px] text-emerald-400 font-mono">
                                {code}
                            </code>
                        </div>

                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                                <Zap className="w-3 h-3" />
                                Raw Analysis Data
                            </span>
                            <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-40">
                                {typeof rawData === 'object' ? JSON.stringify(rawData, null, 2) : String(rawData)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 p-2 uppercase tracking-widest font-black">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyzing data...
        </div>
    );
}

// ----------------------------------------------------------------------
// TransformBlock Component
// Handles the UI for data transformations, allowing users to toggle the 
// visibility of the AI's generated code while keeping preview/apply actions accessible.
// ----------------------------------------------------------------------
function TransformBlock({ code, onPreview, onApply }) {
    const [showDev, setShowDev] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDev(!showDev)}
                className="self-start text-[10px] h-6 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 uppercase tracking-widest font-black"
            >
                {showDev ? "Hide Technical Details" : "View Technical Details"}
            </Button>

            {showDev && (
                <div className="p-3 bg-slate-900 rounded-xl overflow-x-auto animate-in slide-in-from-top-1 fade-in duration-200">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Generated Transformation Code
                    </span>
                    <code className="text-[10px] text-emerald-400 font-mono">
                        {code}
                    </code>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
                <Button 
                    onClick={onPreview}
                    variant="outline"
                    className="border-amber-400 text-amber-600 hover:bg-amber-50 font-black uppercase tracking-widest text-[9px] h-9 rounded-xl"
                >
                    Preview Highlights
                </Button>
                <Button 
                    onClick={onApply}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[9px] h-9 rounded-xl"
                >
                    Apply & Save
                </Button>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// DashboardGenerator Component
// Executes code to generate a full dashboard layout with real data.
// ----------------------------------------------------------------------
function DashboardGenerator({ code, activeSheet, onCreate, name }) {
    const [layout, setLayout] = useState(null);
    const [error, setError] = useState(null);
    const [isCreated, setIsCreated] = useState(false);

    useEffect(() => {
        if (!activeSheet || !activeSheet.data) return;
        try {
            let res;
            let currentCode = code;
            let attempts = 0;
            const maxAttempts = 8;

            while (attempts < maxAttempts) {
                try {
                    let generateFn = new Function("data", currentCode);
                    res = generateFn(activeSheet.data);
                    
                    // Aggressive Healing: If res is undefined, the AI likely forgot the 'return' keyword
                    // and just wrote a bare array or object. Let's try to prepend 'return ' and re-run.
                    if (res === undefined && !currentCode.trim().startsWith('return')) {
                        try {
                            const healedFn = new Function("data", `return ${currentCode.trim()}`);
                            res = healedFn(activeSheet.data);
                        } catch (e) {
                            // If healing fails, stick with current res
                        }
                    }
                    break; // Success!
                } catch (err) {
                    const match = err.message.match(/(\w+) is not defined/);
                    if (match && match[1]) {
                        const missingVar = match[1];
                        // Auto-inject missing variable declaration at the top
                        currentCode = `let ${missingVar} = 0;\n` + currentCode;
                        attempts++;
                    } else {
                        throw err; // Re-throw other syntax/runtime errors
                    }
                }
            }

            // If the code returned a function instead of the result (common AI mistake)
            if (typeof res === 'function') {
                res = res(activeSheet.data);
            }
            
            // Self-healing: if AI returns { widgets: [...] } instead of [...]
            if (res && !Array.isArray(res) && Array.isArray(res.widgets)) {
                res = res.widgets;
            }

            if (!Array.isArray(res)) {
                console.error("Invalid Dashboard Result:", res);
                console.log("Failed Code:", code);
                throw new Error(`Dashboard logic must return an array of widgets (received ${typeof res})`);
            }
            setLayout(res);
        } catch (e) {
            console.error("Dashboard Build Error:", e);
            console.log("Raw AI Code:", code);
            setError(e.message);
        }
    }, [code, activeSheet]);

    if (error) {
        return (
            <div className="text-red-500 text-[10px] mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl font-mono">
                Failed to build dashboard: {error}
            </div>
        );
    }

    const handleInitialize = () => {
        if (layout) {
            onCreate(layout, false); // Default to Private
            setIsCreated(true);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">
                            {layout ? (isCreated ? "Report Live & Published" : "Interactive Blueprint Ready") : "Building Blueprint..."}
                        </span>
                        {name && <span className="text-[9px] font-bold text-emerald-600 truncate">{name}</span>}
                    </div>
                </div>
            </div>
            
            <Button 
                onClick={handleInitialize}
                disabled={!layout || isCreated}
                className={cn(
                    "font-black uppercase tracking-widest text-[10px] h-10 rounded-xl w-full border-2 border-black transition-all",
                    isCreated 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none cursor-default" 
                        : "bg-black text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                )}
            >
                {layout ? (isCreated ? "Report Ready in Hub" : "Initialize Interactive Dashboard") : "Processing Data..."}
            </Button>
            {!isCreated && (
                <p className="text-[9px] text-slate-400 text-center italic">
                    All reports are initialized as <span className="font-bold text-slate-600">Private</span>. You can enable public sharing in the Report Hub.
                </p>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// CreateSheetBlock Component
// Handles the UI for creating a new sheet conversationally.
// ----------------------------------------------------------------------
function CreateSheetBlock({ code, name, activeSheet, onCreateSheet }) {
    const [isCreated, setIsCreated] = useState(false);
    const [showDev, setShowDev] = useState(false);

    const handleCreate = async () => {
        setIsCreated(true);
        await onCreateSheet(code, name);
    };

    return (
        <div className="flex flex-col gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDev(!showDev)}
                className="self-start text-[10px] h-6 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 uppercase tracking-widest font-black"
            >
                {showDev ? "Hide Technical Details" : "View Technical Details"}
            </Button>

            {showDev && (
                <div className="p-3 bg-slate-900 rounded-xl overflow-x-auto animate-in slide-in-from-top-1 fade-in duration-200">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Sheet Generation Code
                    </span>
                    <code className="text-[10px] text-emerald-400 font-mono">
                        {code}
                    </code>
                </div>
            )}

            <Button 
                onClick={handleCreate}
                disabled={isCreated || !activeSheet}
                className={cn(
                    "font-black uppercase tracking-widest text-[10px] h-10 rounded-xl w-full border-2 border-black transition-all mt-1",
                    isCreated 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none cursor-default" 
                        : "bg-black text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                )}
            >
                {isCreated ? "Sheet Created Successfully!" : `Create Sheet "${name}"`}
            </Button>
        </div>
    );
}
