"use client"

import { use, useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toPng } from 'html-to-image';
import { 
    Download, 
    Share2, 
    BarChart3, 
    ExternalLink, 
    FileText, 
    Zap,
    Lock,
    Sun,
    Moon,
    Monitor,
    Layout,
    Palette,
    TrendingUp,
    Sliders,
    Type,
    Eye,
    EyeOff,
    RotateCcw,
    Check,
    User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChartRenderer from '@/components/ChartRenderer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStackApp } from "@stackframe/stack";
import Loader from '@/components/Loader';

const SPACING_MAP = {
    compact: {
        container: "space-y-4",
        grid: "gap-4",
        padding: "p-4"
    },
    cozy: {
        container: "space-y-6",
        grid: "gap-6",
        padding: "p-6"
    },
    roomy: {
        container: "space-y-10",
        grid: "gap-10",
        padding: "p-10"
    }
};

const getThemeCardBase = (theme) => {
    switch (theme) {
        case 'catalyst':
            return "bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
        case 'executive':
            return "bg-white text-slate-900";
        case 'midnight':
            return "bg-slate-900 text-white";
        case 'emerald':
            return "bg-[#06281e] text-emerald-50";
        case 'cyberpunk':
            return "bg-[#110924] text-white";
        case 'aurora':
            return "bg-white/5 backdrop-blur-xl text-white";
        case 'corporate':
            return "bg-white text-slate-900";
        case 'minimalist':
            return "bg-white text-stone-900";
        default:
            return "bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
    }
};

const getThemeHeroBase = (theme) => {
    switch (theme) {
        case 'catalyst':
            return "bg-black text-white";
        case 'executive':
            return "bg-white text-slate-900";
        case 'midnight':
            return "bg-slate-900 text-white";
        case 'emerald':
            return "bg-emerald-900 text-emerald-50";
        case 'cyberpunk':
            return "bg-[#110924] text-white";
        case 'aurora':
            return "bg-white/5 backdrop-blur-xl text-white";
        case 'corporate':
            return "bg-[#0b1329] text-white";
        case 'minimalist':
            return "bg-[#1c1917] text-stone-100";
        default:
            return "bg-black text-white";
    }
};

const getCardShapeClasses = (theme, shape) => {
    if (shape === 'theme') {
        return cn(
            theme === 'catalyst' && "bg-white dark:bg-slate-900 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-slate-900 dark:text-white",
            theme === 'executive' && "bg-white border-2 border-slate-100 shadow-lg rounded-[2rem] text-slate-900",
            theme === 'midnight' && "bg-slate-900 border-2 border-indigo-500/30 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.35)] rounded-[2rem] text-white",
            theme === 'emerald' && "bg-[#06281e] border-2 border-emerald-500/30 shadow-[4px_4px_0px_0px_rgba(234,179,8,0.15)] rounded-[2rem] text-emerald-50",
            theme === 'cyberpunk' && "bg-[#110924] border-2 border-fuchsia-500/40 shadow-[0_0_20px_-5px_rgba(217,70,239,0.25)] rounded-[2rem] text-white",
            theme === 'aurora' && "bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl rounded-[2rem] text-white",
            theme === 'corporate' && "bg-white border border-slate-200 rounded-none shadow-[2px_2px_4px_rgba(0,0,0,0.02)] text-slate-900",
            theme === 'minimalist' && "bg-white border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(120,110,90,0.06)] rounded-[2rem] text-stone-900"
        );
    }
    
    const baseClass = getThemeCardBase(theme);
    const isDark = ['midnight', 'emerald', 'cyberpunk', 'aurora'].includes(theme);

    switch (shape) {
        case 'sharp':
            return cn(baseClass, "border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]");
        case 'rounded':
            return cn(baseClass, "shadow-xl rounded-[2.5rem]", 
                      isDark ? "border border-white/10" : "border border-slate-100");
        case 'dashed':
            return cn(baseClass, "border-2 border-dashed rounded-xl shadow-md",
                      isDark ? "border-white/20" : "border-slate-300");
        case 'double':
            return cn(baseClass, "border-4 border-double rounded-xl shadow-lg",
                      isDark ? "border-white/30" : "border-slate-700");
        case 'floating':
            return cn(baseClass, "rounded-2xl border border-black/5 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]");
        default:
            return baseClass;
    }
};

const getHeroShapeClasses = (theme, shape) => {
    if (shape === 'theme') {
        return cn(
            theme === 'catalyst' && "bg-black text-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(16,185,129,1)]",
            theme === 'executive' && "bg-white text-slate-900 border-4 border-slate-100 shadow-xl rounded-[2.5rem]",
            theme === 'midnight' && "bg-slate-900 text-white border-4 border-indigo-500 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] rounded-[2.5rem]",
            theme === 'emerald' && "bg-emerald-900 text-emerald-50 border-4 border-emerald-500/30 shadow-[12px_12px_0px_0px_rgba(234,179,8,0.2)] rounded-[2.5rem]",
            theme === 'cyberpunk' && "bg-[#110924] text-white border-4 border-fuchsia-500 shadow-[0_0_40px_-5px_rgba(217,70,239,0.3)] rounded-[2.5rem]",
            theme === 'aurora' && "bg-white/5 text-white border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl rounded-[2.5rem]",
            theme === 'corporate' && "bg-[#0b1329] text-white rounded-none border border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
            theme === 'minimalist' && "bg-[#1c1917] text-stone-100 rounded-[2.5rem] border border-stone-700 shadow-[0_4px_24px_rgba(28,25,23,0.1)]"
        );
    }
    
    const baseClass = getThemeHeroBase(theme);
    const isDark = ['midnight', 'emerald', 'cyberpunk', 'aurora'].includes(theme);
    
    switch (shape) {
        case 'sharp':
            return cn(baseClass, "border-4 border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]");
        case 'rounded':
            return cn(baseClass, "shadow-2xl rounded-[3rem]",
                      isDark ? "border border-white/10" : "border border-slate-100");
        case 'dashed':
            return cn(baseClass, "border-4 border-dashed rounded-3xl shadow-lg",
                      isDark ? "border-white/30" : "border-slate-800");
        case 'double':
            return cn(baseClass, "border-8 border-double rounded-3xl shadow-xl",
                      isDark ? "border-white/40" : "border-slate-900");
        case 'floating':
            return cn(baseClass, "rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.45)]");
        default:
            return baseClass;
    }
};

export default function SharedDashboard({ params }) {
    const stack = useStackApp();
    const user = stack.useUser();
    const resolvedParams = use(params);
    const dashboardId = resolvedParams.dashboardId;
    const dashboardRef = useRef(null);
    const [theme, setTheme] = useState('catalyst'); // catalyst, executive, midnight

    // Custom Design States
    const [showDesigner, setShowDesigner] = useState(false);
    const [font, setFont] = useState('sans');
    const [spacing, setSpacing] = useState('cozy');
    const [cardShape, setCardShape] = useState('theme');
    const [showHero, setShowHero] = useState(true);
    const [showSummary, setShowSummary] = useState(true);
    const [hiddenWidgets, setHiddenWidgets] = useState(new Set());
    const [customColor, setCustomColor] = useState('#10b981');
    const [applyCustomColor, setApplyCustomColor] = useState(false);
    const [ownerName, setOwnerName] = useState('');

    const dashboard = useQuery(api.dashboards.getById, { id: dashboardId });
    const convexUser = useQuery(api.users.getUserByStackId, user ? { stackId: user.id } : "skip");
    const dashboardOwner = useQuery(api.users.getUserById, dashboard ? { id: dashboard.userId } : "skip");
    const updateDashboard = useMutation(api.dashboards.update);

    const isLoadedRef = useRef(false);

    // Load Design Studio Settings from DB or LocalStorage
    useEffect(() => {
        if (dashboard && !isLoadedRef.current) {
            isLoadedRef.current = true;
            if (dashboard.designSettings) {
                const ds = dashboard.designSettings;
                if (ds.theme) setTheme(ds.theme);
                if (ds.font) setFont(ds.font);
                if (ds.spacing) setSpacing(ds.spacing);
                if (ds.cardShape) setCardShape(ds.cardShape);
                if (ds.showHero !== undefined) setShowHero(ds.showHero);
                if (ds.showSummary !== undefined) setShowSummary(ds.showSummary);
                if (ds.hiddenWidgets) setHiddenWidgets(new Set(ds.hiddenWidgets));
                if (ds.customColor) setCustomColor(ds.customColor);
                if (ds.applyCustomColor !== undefined) setApplyCustomColor(ds.applyCustomColor);
                if (ds.ownerName) setOwnerName(ds.ownerName);
            } else {
                // Fallback to localStorage if no DB settings exist
                try {
                    const saved = localStorage.getItem(`catalyst-style-${dashboardId}`);
                    if (saved) {
                        const ds = JSON.parse(saved);
                        if (ds.theme) setTheme(ds.theme);
                        if (ds.font) setFont(ds.font);
                        if (ds.spacing) setSpacing(ds.spacing);
                        if (ds.cardShape) setCardShape(ds.cardShape);
                        if (ds.showHero !== undefined) setShowHero(ds.showHero);
                        if (ds.showSummary !== undefined) setShowSummary(ds.showSummary);
                        if (ds.hiddenWidgets) setHiddenWidgets(new Set(ds.hiddenWidgets));
                        if (ds.customColor) setCustomColor(ds.customColor);
                        if (ds.applyCustomColor !== undefined) setApplyCustomColor(ds.applyCustomColor);
                        if (ds.ownerName) setOwnerName(ds.ownerName);
                    }
                } catch (e) {
                    console.error("Failed to load local styles", e);
                }
            }
        }
    }, [dashboard, dashboardId]);

    // Auto-save choices to localStorage for instant local feedback
    useEffect(() => {
        try {
            localStorage.setItem(`catalyst-style-${dashboardId}`, JSON.stringify({
                theme,
                font,
                spacing,
                cardShape,
                showHero,
                showSummary,
                hiddenWidgets: Array.from(hiddenWidgets),
                customColor,
                applyCustomColor,
                ownerName
            }));
        } catch (e) {
            // fail silent
        }
    }, [theme, font, spacing, cardShape, showHero, showSummary, hiddenWidgets, customColor, applyCustomColor, ownerName, dashboardId]);

    const hasUnsavedChanges = (() => {
        if (!dashboard) return false;
        const ds = dashboard.designSettings || {};
        
        const hiddenWidgetsArray = Array.from(hiddenWidgets);
        const savedHiddenWidgets = ds.hiddenWidgets || [];
        const isHiddenWidgetsEqual = 
            hiddenWidgetsArray.length === savedHiddenWidgets.length &&
            hiddenWidgetsArray.every(val => savedHiddenWidgets.includes(val));

        return (
            theme !== (ds.theme || 'catalyst') ||
            font !== (ds.font || 'sans') ||
            spacing !== (ds.spacing || 'cozy') ||
            cardShape !== (ds.cardShape || 'theme') ||
            showHero !== (ds.showHero !== false ? (ds.showHero ?? true) : false) ||
            showSummary !== (ds.showSummary !== false ? (ds.showSummary ?? true) : false) ||
            customColor !== (ds.customColor || '#10b981') ||
            applyCustomColor !== (ds.applyCustomColor || false) ||
            ownerName !== (ds.ownerName || '') ||
            !isHiddenWidgetsEqual
        );
    })();

    const toggleWidgetVisibility = (id) => {
        setHiddenWidgets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSaveDefaultDesign = async () => {
        try {
            await updateDashboard({
                id: dashboardId,
                designSettings: {
                    theme,
                    font,
                    spacing,
                    cardShape,
                    showHero,
                    showSummary,
                    hiddenWidgets: Array.from(hiddenWidgets),
                    customColor,
                    applyCustomColor,
                    ownerName
                }
            });
            toast.success("Design settings successfully saved as public default!");
        } catch (err) {
            console.error("Failed to save design defaults", err);
            toast.error("Failed to save design settings. Make sure you are logged in.");
        }
    };


    const handleDownloadImage = async () => {
        if (dashboardRef.current === null) return;
        
        const bgColor = {
            catalyst: '#f8fafc',
            executive: '#ffffff',
            midnight: '#020617',
            emerald: '#022c22',
            cyberpunk: '#07020d',
            aurora: '#090d16',
            corporate: '#f1f5f9',
            minimalist: '#fcfbf9'
        }[theme];

        // Temporarily hide designer controls from the export
        const wasDesignerOpen = showDesigner;
        setShowDesigner(false);

        // Allow state to resolve in DOM
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            // Fixed styling options to prevent auto-centering cutoffs on export
            const dataUrl = await toPng(dashboardRef.current, { 
                cacheBust: true, 
                backgroundColor: bgColor,
                style: {
                    borderRadius: '0px',
                    width: '1280px', // Standard clean desktop width
                    maxWidth: '1280px',
                    margin: '0',
                    padding: '24px',
                    transform: 'none'
                }
            });
            const link = document.createElement('a');
            link.download = `${dashboard?.name || 'catalyst-dashboard'}-${theme}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to capture dashboard', err);
            toast.error("Failed to capture image");
        } finally {
            if (wasDesignerOpen) {
                setShowDesigner(true);
            }
        }
    };

    if (dashboard === undefined) return <Loader />;
    
    // Privacy Check: Compare Convex User ID with Dashboard Owner ID
    const isOwner = convexUser && dashboard && convexUser._id === dashboard.userId;
    const isPrivate = dashboard && !dashboard.isPublic;
    const accessDenied = isPrivate && !isOwner;

    if (dashboard === null || accessDenied) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8">
                    <Lock className="w-10 h-10 text-slate-400" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    {accessDenied ? "Access Denied" : "Private Dashboard"}
                </h1>
                <p className="text-slate-500 max-w-sm font-bold uppercase tracking-tight text-xs"> 
                    {accessDenied 
                        ? "This dashboard is private. Only the owner can view it." 
                        : "This dashboard does not exist or has been removed."}
                </p>
                <Button onClick={() => window.location.href = '/'} className="mt-8 bg-black text-white rounded-none border-4 border-black font-black uppercase tracking-widest px-8">Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 selection:bg-emerald-500/10">
            {/* Dynamic Font Styling Injections */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Lora:ital,wght@0,400;1,400&family=Space+Grotesk:wght@400;700;900&family=Fira+Code:wght@400;700&family=Outfit:wght@400;700;900&display=swap');
                
                .font-option-sans { font-family: 'Inter', system-ui, sans-serif; }
                .font-option-serif { font-family: 'Lora', Georgia, serif; }
                .font-option-serif h1, .font-option-serif h2, .font-option-serif h3 { font-family: 'Playfair Display', Georgia, serif !important; }
                .font-option-tech { font-family: 'Space Grotesk', sans-serif; }
                .font-option-mono { font-family: 'Fira Code', monospace; }
                .font-option-geometric { font-family: 'Outfit', sans-serif; }
            ` }} />

            {/* Toolbar */}
            <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] divide-y-4 divide-black">
                {/* Row 1: Header Info & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center p-1 bg-slate-50 dark:bg-slate-800 border-2 border-black rounded-lg">
                            <img src="/logo.png" alt="Catalyst" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{dashboard.name}</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-0.5">
                                {ownerName ? `Created by ${ownerName}` : (dashboardOwner ? `Created by ${dashboardOwner.name}` : "Generated by Catalyst Conversational Data Agent")}
                            </p>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        {isOwner && (
                            <>
                                <Button 
                                    onClick={() => setShowDesigner(!showDesigner)}
                                    variant="outline" 
                                    className={cn(
                                        "rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all",
                                        showDesigner ? "bg-black text-white" : "bg-white text-black"
                                    )}
                                >
                                    <Sliders className="w-4 h-4 mr-2" />
                                    {showDesigner ? "Close Studio" : "Design Studio"}
                                </Button>

                                <Button 
                                    onClick={async () => {
                                        try {
                                            await updateDashboard({
                                                id: dashboardId,
                                                isPublic: !dashboard.isPublic
                                            });
                                            toast.success(dashboard.isPublic ? "Dashboard is now PRIVATE." : "Dashboard is now PUBLIC!");
                                        } catch (err) {
                                            toast.error("Failed to update dashboard visibility.");
                                        }
                                    }}
                                    className={cn(
                                        "rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all",
                                        dashboard.isPublic 
                                            ? "bg-amber-400 hover:bg-amber-500 text-black border-black" 
                                            : "bg-slate-800 hover:bg-slate-900 text-white border-black"
                                    )}
                                >
                                    {dashboard.isPublic ? (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Public
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Private
                                        </>
                                    )}
                                </Button>
                            </>
                        )}

                        <Button 
                            onClick={handleDownloadImage}
                            variant="outline" 
                            className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export PNG
                        </Button>
                        
                        <Button 
                            disabled={!dashboard.isPublic}
                            onClick={() => {
                                if (!dashboard.isPublic) return;
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied to clipboard!");
                            }}
                            className={cn(
                                "rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all",
                                dashboard.isPublic 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-black" 
                                    : "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-50 shadow-none hover:translate-x-0 hover:translate-y-0"
                            )}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            {dashboard.isPublic ? "Share Link" : "Private Link Only"}
                        </Button>
                    </div>
                </div>

                {/* Row 2: Theme Selector (Only visible to Owner) */}
                {isOwner && (
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Report Theme</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-800 p-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {[
                                { id: 'catalyst', name: 'Catalyst Default', color: 'bg-black text-white border-black' },
                                { id: 'executive', name: 'Executive Clean', color: 'bg-white text-black border-black' },
                                { id: 'midnight', name: 'Midnight Blue', color: 'bg-indigo-600 text-indigo-100 border-indigo-700' },
                                { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-600 text-emerald-100 border-emerald-750' },
                                { id: 'cyberpunk', name: 'Cyberpunk Neon', color: 'bg-fuchsia-600 text-fuchsia-100 border-fuchsia-700' },
                                { id: 'aurora', name: 'Aurora Borealis', color: 'bg-cyan-600 text-cyan-100 border-cyan-700' },
                                { id: 'corporate', name: 'Corporate BI', color: 'bg-slate-700 text-slate-100 border-slate-800' },
                                { id: 'minimalist', name: 'Warm Minimalist', color: 'bg-amber-600 text-amber-100 border-amber-700' }
                            ].map(t => (
                                <Button 
                                    key={t.id}
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setTheme(t.id)}
                                    className={cn(
                                        "h-8 px-3 rounded-none font-black uppercase text-[9px] transition-all",
                                        theme === t.id ? `${t.color} border-2` : "text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    {t.name}
                                </Button>
                            ))}

                            <div className="w-[2px] h-6 bg-black/10 dark:bg-white/10 mx-1 self-stretch" />

                            <Button 
                                disabled={!hasUnsavedChanges}
                                onClick={handleSaveDefaultDesign}
                                className={cn(
                                    "h-8 px-4 rounded-none font-black uppercase text-[9px] transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
                                    hasUnsavedChanges 
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" 
                                        : "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-50 shadow-none hover:translate-x-0 hover:translate-y-0"
                                )}
                            >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Save Theme
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Design Studio Workbench */}
            {showDesigner && (
                <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top duration-200">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Sliders className="w-6 h-6 text-black dark:text-white" />
                            <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Design & Layout Studio</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isOwner && (
                                <Button 
                                    disabled={!hasUnsavedChanges}
                                    onClick={handleSaveDefaultDesign}
                                    className={cn(
                                        "border-2 border-black font-black uppercase text-[10px] tracking-widest px-3 h-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all mr-2",
                                        hasUnsavedChanges 
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" 
                                            : "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-50 shadow-none hover:translate-x-0 hover:translate-y-0"
                                    )}
                                >
                                    Save Theme
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setFont('sans');
                                    setSpacing('cozy');
                                    setCardShape('theme');
                                    setShowHero(true);
                                    setShowSummary(true);
                                    setHiddenWidgets(new Set());
                                    setCustomColor('#10b981');
                                    setApplyCustomColor(false);
                                    toast.success("Reset all custom styles to defaults!");
                                }}
                                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black dark:hover:text-white"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                Reset Studio
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Typography */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Type className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Typography</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { id: 'sans', name: 'Inter (Modern Sans)' },
                                    { id: 'serif', name: 'Playfair (Elegant Serif)' },
                                    { id: 'tech', name: 'Space Grotesk (Tech)' },
                                    { id: 'mono', name: 'Fira Code (Data Mono)' },
                                    { id: 'geometric', name: 'Outfit (Sleek Geometric)' }
                                ].map(f => (
                                    <button 
                                        key={f.id} 
                                        onClick={() => setFont(f.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-transparent transition-all flex items-center justify-between",
                                            font === f.id 
                                                ? "bg-black text-white dark:bg-white dark:text-black border-black" 
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                                        )}
                                    >
                                        <span>{f.name}</span>
                                        {font === f.id && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Density */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Layout className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Grid Spacing</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { id: 'compact', name: 'Compact Spacing' },
                                    { id: 'cozy', name: 'Cozy (Default)' },
                                    { id: 'roomy', name: 'Roomy (Spacious)' }
                                ].map(s => (
                                    <button 
                                        key={s.id} 
                                        onClick={() => setSpacing(s.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-transparent transition-all flex items-center justify-between",
                                            spacing === s.id 
                                                ? "bg-black text-white dark:bg-white dark:text-black border-black" 
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                                        )}
                                    >
                                        <span>{s.name}</span>
                                        {spacing === s.id && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Border & Styles */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Palette className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Card Border Style</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { id: 'theme', name: 'Default Theme Card' },
                                    { id: 'sharp', name: 'Sharp Neo-Brutalist' },
                                    { id: 'rounded', name: 'Ultra Rounded Pill' },
                                    { id: 'dashed', name: 'Modern Dashed' },
                                    { id: 'double', name: 'Retro Double Frame' },
                                    { id: 'floating', name: 'Soft Shadow Floating' }
                                ].map(c => (
                                    <button 
                                        key={c.id} 
                                        onClick={() => setCardShape(c.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-transparent transition-all flex items-center justify-between",
                                            cardShape === c.id 
                                                ? "bg-black text-white dark:bg-white dark:text-black border-black" 
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                                        )}
                                    >
                                        <span>{c.name}</span>
                                        {cardShape === c.id && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Branding & Attribution */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <User className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Branding Attribution</span>
                            </div>
                            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black">
                                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase block leading-none">Custom Owner/Creator Name</label>
                                <input 
                                    type="text" 
                                    value={ownerName}
                                    placeholder={dashboardOwner ? dashboardOwner.name : "e.g., Samuel Olubukun"}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-black text-xs font-black uppercase tracking-wider px-2 py-1 mt-1 text-slate-850 dark:text-white"
                                />
                                <span className="text-[8px] text-slate-400 font-bold uppercase block mt-1">
                                    This brands the shared report with your name or organization.
                                </span>
                            </div>
                        </div>

                        {/* Custom Accent Color picker (Feature D) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Palette className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Custom Accent Color</span>
                            </div>
                            <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={applyCustomColor}
                                        onChange={(e) => setApplyCustomColor(e.target.checked)}
                                        className="w-4 h-4 rounded-md border-black accent-black cursor-pointer"
                                    />
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Enable Custom Color</span>
                                </label>
                                
                                {applyCustomColor && (
                                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customColor}
                                                onChange={(e) => setCustomColor(e.target.value)}
                                                className="w-10 h-10 border-2 border-black cursor-pointer bg-transparent rounded-none"
                                            />
                                            <div className="flex-1">
                                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase block leading-none">Hex Value</span>
                                                <input 
                                                    type="text" 
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-900 border-2 border-black text-xs font-black uppercase tracking-wider px-2 py-1 mt-1 text-slate-850 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        {/* Curated Palette for quick selection */}
                                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                                            {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#f43f5e", "#0ea5e9", "#f97316", "#000000"].map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setCustomColor(c)}
                                                    className={cn(
                                                        "w-6 h-6 border-2 border-black transition-all hover:scale-110",
                                                        customColor === c ? "ring-2 ring-emerald-500 scale-105" : ""
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visibility & Hidden Restoration */}
                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-slate-100 dark:border-slate-800 pt-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Global Visibility</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => setShowHero(!showHero)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-transparent transition-all flex items-center gap-2",
                                            showHero ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-350" : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-350"
                                        )}
                                    >
                                        <span>Hero Header</span>
                                        {showHero ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => setShowSummary(!showSummary)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-transparent transition-all flex items-center gap-2",
                                            showSummary ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-350" : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-350"
                                        )}
                                    >
                                        <span>AI Summary</span>
                                        {showSummary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Restoration widget block */}
                            {hiddenWidgets.size > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Hidden Cards Center ({hiddenWidgets.size})</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.from(hiddenWidgets).map(wId => (
                                            <button 
                                                key={wId}
                                                onClick={() => toggleWidgetVisibility(wId)}
                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider border-2 border-black flex items-center gap-1.5 transition-all"
                                            >
                                                <span>{wId.length > 20 ? wId.substring(0, 18) + '...' : wId}</span>
                                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Canvas */}
            <div ref={dashboardRef} className={cn(
                "max-w-7xl mx-auto pb-12 transition-all duration-500 custom-canvas-scope",
                SPACING_MAP[spacing].container,
                `font-option-${font}`,
                theme === 'midnight' ? "bg-slate-950 p-6 rounded-[2rem] border-4 border-indigo-500/20 shadow-2xl" : "",
                theme === 'emerald' ? "bg-emerald-950 p-6 rounded-[2rem] border-4 border-emerald-500/20 shadow-2xl" : "",
                theme === 'cyberpunk' ? "bg-[#07020d] p-6 rounded-[2rem] border-4 border-fuchsia-500/20 shadow-[0_0_50px_-10px_rgba(217,70,239,0.15)]" : "",
                theme === 'aurora' ? "bg-slate-950 p-6 rounded-[2rem] border-4 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" : "",
                theme === 'corporate' ? "bg-slate-100 p-8 rounded-none border border-slate-200/80 shadow-sm" : "",
                theme === 'minimalist' ? "bg-[#faf8f5] p-8 rounded-[2.5rem] border border-stone-700 shadow-sm" : ""
            )}>
                {/* Strategic Intel Hero */}
                {showHero && (
                    <div 
                        className={cn(
                            "p-10 transition-all duration-500 flex flex-col gap-8",
                            getHeroShapeClasses(theme, cardShape)
                        )}
                        style={applyCustomColor ? { borderColor: customColor } : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-2 h-2 rounded-full animate-pulse transition-colors"
                                    style={{ backgroundColor: applyCustomColor ? customColor : undefined }}
                                />
                                <span 
                                    className="text-[10px] font-black uppercase tracking-[0.4em] italic transition-colors"
                                    style={{ color: applyCustomColor ? customColor : undefined }}
                                >
                                    Agentic Intel Report
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-350">
                                    {new Date(dashboard._creationTime).toLocaleDateString()}
                                </span>
                                <div className="h-4 w-[1px] bg-slate-800/40 dark:bg-slate-800" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-350">
                                    {ownerName ? `By ${ownerName}` : (dashboardOwner ? `By ${dashboardOwner.name}` : "Catalyst v1.2")}
                                </span>
                            </div>
                        </div>
    
                        <div className="space-y-4">
                            <h1 className={cn(
                                "text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] max-w-4xl transition-all",
                                theme === 'executive' ? "text-slate-900" :
                                theme === 'emerald' ? "text-emerald-50" :
                                theme === 'minimalist' ? "text-stone-100" :
                                "text-white"
                            )}>
                                {dashboard.name}
                            </h1>
                            <p className={cn(
                                "text-lg font-bold max-w-2xl leading-snug uppercase tracking-tight italic transition-all",
                                theme === 'executive' ? "text-slate-600 font-medium" :
                                theme === 'emerald' ? "text-emerald-100 font-semibold" :
                                theme === 'cyberpunk' ? "text-fuchsia-100" :
                                theme === 'aurora' ? "text-cyan-100 font-medium" :
                                theme === 'corporate' ? "text-slate-100" :
                                theme === 'minimalist' ? "text-stone-200" :
                                "text-slate-200 font-medium"
                            )}>
                                Real-time data insights and visual reporting. 
                                Powered by Catalyst AI to help you find hidden trends, spot risks, and make smarter decisions with your spreadsheets.
                            </p>
                        </div>
    
                        <div className={cn(
                            "pt-6 border-t flex items-center justify-between",
                            theme === 'executive' ? "border-slate-100" :
                            theme === 'emerald' ? "border-emerald-800/40" :
                            theme === 'aurora' ? "border-white/10" :
                            theme === 'corporate' ? "border-slate-800" :
                            theme === 'minimalist' ? "border-stone-800" :
                            "border-slate-800"
                        )}>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                                    theme === 'executive' ? "bg-slate-50 border-slate-200" :
                                    theme === 'emerald' ? "bg-emerald-950/40 border-emerald-800/40" :
                                    theme === 'cyberpunk' ? "bg-[#1f0d3d] border-fuchsia-800/40" :
                                    theme === 'aurora' ? "bg-white/5 border-white/10" :
                                    theme === 'corporate' ? "bg-[#16223f] border-slate-700" :
                                    theme === 'minimalist' ? "bg-stone-900 border-stone-700" :
                                    "bg-white/5 border-white/10"
                                )}>
                                    <Zap className="w-4 h-4 transition-colors" style={{ color: applyCustomColor ? customColor : undefined }} />
                                </div>
                                <span 
                                    className="text-[10px] font-black uppercase tracking-widest transition-colors"
                                    style={{ color: applyCustomColor ? customColor : undefined }}
                                >
                                    Catalyst AI Engine
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div 
                                        key={i} 
                                        className="w-1.5 h-1.5 rounded-full transition-colors"
                                        style={{ backgroundColor: applyCustomColor ? customColor : undefined, opacity: 0.35 * i }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic KPI & Chart Rows */}
                {(() => {
                    const kpiWidgets = dashboard.config.filter(w => 
                        w.type === 'metric' || 
                        w.type === 'kpi' || 
                        (w.type === 'chart' && (!w.chartConfig || !Array.isArray(w.chartConfig.data) || w.chartConfig.data.length === 0))
                    );
                    
                    const otherWidgets = dashboard.config.filter(w => 
                        w.type !== 'summary' && 
                        !(w.type === 'metric' || w.type === 'kpi' || (w.type === 'chart' && (!w.chartConfig || !Array.isArray(w.chartConfig.data) || w.chartConfig.data.length === 0)))
                    );

                    return (
                        <div className="flex flex-col gap-6 w-full">
                            {/* KPI Metrics Row */}
                            {kpiWidgets.length > 0 && (
                                <div className={cn(
                                    "grid w-full transition-all duration-500",
                                    SPACING_MAP[spacing].grid,
                                    kpiWidgets.length === 1 && "grid-cols-1",
                                    kpiWidgets.length === 2 && "grid-cols-1 md:grid-cols-2",
                                    kpiWidgets.length === 3 && "grid-cols-1 md:grid-cols-3 lg:grid-cols-3",
                                    kpiWidgets.length >= 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                                )}>
                                    {kpiWidgets.map((widget, i) => {
                                        const widgetId = widget.title || `kpi-${i}`;
                                        if (hiddenWidgets.has(widgetId)) return null;

                                        const rawVal = widget.value || widget.chartConfig?.value || widget.notes || (widget.chartConfig?.data && widget.chartConfig.data[0] && (widget.chartConfig.data[0].value || widget.chartConfig.data[0][widget.chartConfig.yAxis])) || "";
                                        const valStr = String(rawVal).trim();
                                        const titleLower = (widget.title || "").toLowerCase();
                                        const subtextLower = (widget.subtext || "").toLowerCase();

                                        const isCurrency = valStr.includes('$') || 
                                                           titleLower.includes('revenue') || 
                                                           titleLower.includes('sales') || 
                                                           titleLower.includes('profit') || 
                                                           titleLower.includes('cost') ||
                                                           titleLower.includes('value') ||
                                                           subtextLower.includes('sales') ||
                                                           subtextLower.includes('revenue');

                                        const isPercentage = valStr.includes('%') || 
                                                             titleLower.includes('percent') || 
                                                             titleLower.includes('rate') || 
                                                             titleLower.includes('margin %');

                                        // Advanced Multi-Tier KPI Formatting Engine
                                        let parsedNum = NaN;
                                        let cleanStr = valStr.replace(/[$,]/g, "").toLowerCase();
                                        if (cleanStr.endsWith('k')) {
                                            parsedNum = Number(cleanStr.slice(0, -1)) * 1000;
                                        } else if (cleanStr.endsWith('m')) {
                                            parsedNum = Number(cleanStr.slice(0, -1)) * 1000000;
                                        } else if (cleanStr.endsWith('b')) {
                                            parsedNum = Number(cleanStr.slice(0, -1)) * 1000000000;
                                        } else {
                                            parsedNum = Number(cleanStr);
                                        }

                                        let valueStr = valStr;
                                        if (!isNaN(parsedNum)) {
                                            if (isPercentage) {
                                                valueStr = `${parsedNum.toFixed(1)}%`;
                                            } else {
                                                let formatted = "";
                                                if (Math.abs(parsedNum) >= 1000000000) {
                                                    formatted = `${(parsedNum / 1000000000).toFixed(2)}B`;
                                                } else if (Math.abs(parsedNum) >= 1000000) {
                                                    formatted = `${(parsedNum / 1000000).toFixed(2)}M`;
                                                } else if (Math.abs(parsedNum) >= 10000 && isCurrency) {
                                                    formatted = `${(parsedNum / 1000).toFixed(1)}K`;
                                                } else {
                                                    formatted = parsedNum.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                                }
                                                valueStr = isCurrency ? `$${formatted}` : formatted;
                                            }
                                        }

                                        const metricLabel = isCurrency 
                                            ? "Financial Metric" 
                                            : isPercentage 
                                                ? "Performance Rate" 
                                                : "Volume / Count";

                                        const trendColor = widget.trendType === 'positive' 
                                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30" 
                                            : widget.trendType === 'negative' 
                                                ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30" 
                                                : "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";

                                        return (
                                            <div 
                                                key={`kpi-${i}`} 
                                                className={cn(
                                                    "p-6 flex flex-col transition-all duration-500 relative group",
                                                    getCardShapeClasses(theme, cardShape)
                                                )}
                                                style={applyCustomColor && cardShape === 'sharp' ? { borderColor: customColor } : undefined}
                                            >
                                                {/* Hide Widget Overlay (Visible in Customizer Mode) */}
                                                {showDesigner && (
                                                    <button 
                                                        onClick={() => toggleWidgetVisibility(widgetId)}
                                                        className="absolute top-3 right-3 z-20 bg-rose-600 hover:bg-rose-700 text-white border-2 border-black px-2 py-1 text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1"
                                                    >
                                                        <EyeOff className="w-3 h-3" />
                                                        Hide
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 border-2 flex items-center justify-center transition-all",
                                                            theme === 'catalyst' ? "bg-slate-100 dark:bg-slate-800 border-black text-slate-900 dark:text-white" : 
                                                            theme === 'executive' ? "bg-blue-50 border-blue-200 rounded-lg text-blue-600" :
                                                            theme === 'emerald' ? "bg-emerald-950/50 border-emerald-500/30 rounded-lg text-amber-400" :
                                                            theme === 'cyberpunk' ? "bg-fuchsia-500/10 border-fuchsia-500/30 rounded-lg text-fuchsia-400" :
                                                            theme === 'aurora' ? "bg-cyan-500/10 border-cyan-500/30 rounded-lg text-cyan-400" :
                                                            theme === 'corporate' ? "bg-slate-50 border-slate-200 rounded-none text-sky-600" :
                                                            theme === 'minimalist' ? "bg-amber-50 border-stone-200 rounded-xl text-amber-700" :
                                                            "bg-indigo-500/10 border-indigo-500/50 rounded-lg text-indigo-400"
                                                        )}
                                                        style={applyCustomColor ? { color: customColor, borderColor: customColor } : undefined}
                                                        >
                                                            <TrendingUp className="w-4 h-4" />
                                                        </div>
                                                        <h3 className={cn(
                                                            "text-sm font-black uppercase tracking-tight transition-colors",
                                                            theme === 'midnight' || theme === 'emerald' || theme === 'cyberpunk' || theme === 'aurora' ? "text-white" :
                                                            theme === 'corporate' ? "text-slate-700 font-bold" :
                                                            theme === 'minimalist' ? "text-stone-850 font-extrabold" :
                                                            "text-slate-900 dark:text-white"
                                                        )}>{widget.title}</h3>
                                                    </div>
                                                </div>
                                                
                                                <div 
                                                    className="flex-1 flex flex-col justify-between py-2 relative pl-4 border-l-4 transition-all duration-500" 
                                                    style={{ 
                                                        borderLeftColor: applyCustomColor 
                                                            ? customColor 
                                                            : (theme === 'minimalist' ? (isCurrency ? '#d97706' : isPercentage ? '#b45309' : '#78716c') : (isCurrency ? '#10b981' : isPercentage ? '#f59e0b' : '#3b82f6')) 
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span 
                                                            className={cn(
                                                                "text-[8px] font-black uppercase tracking-widest",
                                                                theme === 'midnight' ? "text-indigo-300" :
                                                                theme === 'emerald' ? "text-emerald-300" :
                                                                theme === 'cyberpunk' ? "text-fuchsia-300" :
                                                                theme === 'aurora' ? "text-cyan-300" :
                                                                theme === 'corporate' ? "text-sky-600 font-bold" :
                                                                theme === 'minimalist' ? "text-amber-700 font-extrabold" :
                                                                "text-slate-400 dark:text-slate-400"
                                                            )}
                                                            style={applyCustomColor ? { color: customColor } : undefined}
                                                        >
                                                            {metricLabel}
                                                        </span>
                                                        {widget.trend && (
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                                                trendColor
                                                            )}>
                                                                {widget.trend}
                                                            </span>
                                                        )}
                                                    </div>
 
                                                    {/* Giant Bold Value Accent */}
                                                    <div className="my-2 overflow-hidden pr-2">
                                                        <span className={cn(
                                                            "font-black tracking-tight uppercase block leading-none transition-all duration-500 truncate",
                                                            valueStr.length > 12 ? "text-xl md:text-2xl" :
                                                            valueStr.length > 9 ? "text-2xl md:text-3xl" :
                                                            valueStr.length > 7 ? "text-3xl md:text-4xl" :
                                                            "text-4xl md:text-5xl",
                                                            theme === 'midnight' || theme === 'emerald' || theme === 'cyberpunk' || theme === 'aurora' ? "text-white" :
                                                            theme === 'corporate' ? "text-slate-800 font-black" :
                                                            theme === 'minimalist' ? "text-stone-900 font-black" :
                                                            "text-slate-900 dark:text-white"
                                                        )}>
                                                            {valueStr || "N/A"}
                                                        </span>
                                                    </div>
 
                                                    <div className="mt-2">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-[0.2em] block transition-colors",
                                                            theme === 'midnight' || theme === 'emerald' || theme === 'cyberpunk' || theme === 'aurora' ? "text-slate-400" :
                                                            theme === 'corporate' ? "text-slate-400 text-[8px]" :
                                                            theme === 'minimalist' ? "text-stone-500 font-semibold" :
                                                            "text-slate-500 dark:text-slate-400"
                                                        )}>
                                                            {widget.subtext || "Key Performance Indicator"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Main Charts & Visualizations Row */}
                            {otherWidgets.length > 0 && (
                                <div className={cn(
                                    "flex flex-wrap w-full transition-all duration-500",
                                    SPACING_MAP[spacing].grid
                                )}>
                                    {otherWidgets.map((widget, i) => {
                                        const widgetId = widget.title || `other-${i}`;
                                        if (hiddenWidgets.has(widgetId)) return null;

                                        const size = widget.size || 'small';
                                        
                                        // Dynamic Flexbox sizing: Auto-stretches to fill empty row space!
                                        const flexClass = {
                                            small: "flex-1 lg:flex-[1_1_21%] min-w-[290px]",
                                            medium: "w-full lg:w-[48%] lg:flex-[2_2_48%] min-w-[320px]",
                                            large: "w-full min-w-full flex-shrink-0"
                                        }[size] || "flex-1 min-w-[290px]";

                                        return (
                                            <div 
                                                key={`other-${i}`} 
                                                className={cn(
                                                    "p-6 flex flex-col transition-all duration-500 relative group",
                                                    flexClass,
                                                    getCardShapeClasses(theme, cardShape)
                                                )}
                                                style={applyCustomColor && cardShape === 'sharp' ? { borderColor: customColor } : undefined}
                                            >
                                                {/* Hide Widget Overlay (Visible in Customizer Mode) */}
                                                {showDesigner && (
                                                    <button 
                                                        onClick={() => toggleWidgetVisibility(widgetId)}
                                                        className="absolute top-3 right-3 z-20 bg-rose-600 hover:bg-rose-700 text-white border-2 border-black px-2 py-1 text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1"
                                                    >
                                                        <EyeOff className="w-3 h-3" />
                                                        Hide
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 border-2 flex items-center justify-center transition-all",
                                                            theme === 'catalyst' ? "bg-slate-100 dark:bg-slate-800 border-black text-slate-900 dark:text-white" : 
                                                            theme === 'executive' ? "bg-blue-50 border-blue-200 rounded-lg text-blue-600" :
                                                            theme === 'emerald' ? "bg-emerald-950/50 border-emerald-500/30 rounded-lg text-amber-400" :
                                                            theme === 'cyberpunk' ? "bg-fuchsia-500/10 border-fuchsia-500/30 rounded-lg text-fuchsia-400" :
                                                            theme === 'aurora' ? "bg-cyan-500/10 border-cyan-500/30 rounded-lg text-cyan-400" :
                                                            theme === 'corporate' ? "bg-slate-50 border-slate-200 rounded-none text-sky-600" :
                                                            theme === 'minimalist' ? "bg-stone-50 border-stone-200 rounded-xl text-stone-600" :
                                                            "bg-indigo-500/10 border-indigo-500/50 rounded-lg text-indigo-400"
                                                        )}
                                                        style={applyCustomColor ? { color: customColor, borderColor: customColor } : undefined}
                                                        >
                                                            {widget.type === 'chart' ? (
                                                                <BarChart3 className="w-4 h-4" />
                                                            ) : (
                                                                <FileText className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <h3 className={cn(
                                                            "text-sm font-black uppercase tracking-tight transition-colors",
                                                            theme === 'midnight' || theme === 'emerald' || theme === 'cyberpunk' || theme === 'aurora' ? "text-white" :
                                                            theme === 'corporate' ? "text-slate-700 font-bold" :
                                                            theme === 'minimalist' ? "text-stone-850 font-extrabold" :
                                                            "text-slate-900 dark:text-white"
                                                        )}>{widget.title}</h3>
                                                    </div>
                                                </div>
                                                
                                                {widget.type === 'chart' && widget.chartConfig && Array.isArray(widget.chartConfig.data) && widget.chartConfig.data.length > 0 ? (
                                                    <ChartRenderer 
                                                        config={widget.chartConfig} 
                                                        theme={theme} 
                                                        customColor={applyCustomColor ? customColor : null}
                                                    />
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <p className="text-slate-650 dark:text-slate-400 font-medium leading-relaxed italic">{widget.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {showSummary && dashboard.config.find(w => w.type === 'summary') && (
                    <div className={cn(
                        "p-8 transition-all duration-500",
                        getHeroShapeClasses(theme, cardShape)
                    )}
                    style={applyCustomColor ? { borderColor: customColor } : undefined}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                theme === 'executive' ? "bg-blue-600" :
                                theme === 'emerald' ? "bg-amber-400" :
                                theme === 'cyberpunk' ? "bg-fuchsia-500" :
                                theme === 'aurora' ? "bg-cyan-400" :
                                theme === 'corporate' ? "bg-sky-400" :
                                theme === 'minimalist' ? "bg-amber-500" :
                                "bg-emerald-500"
                            )} 
                            style={{ backgroundColor: applyCustomColor ? customColor : undefined }}
                            />
                            <h4 className={cn(
                                "text-[10px] font-black uppercase tracking-[0.4em]",
                                theme === 'executive' ? "text-slate-400" :
                                theme === 'emerald' ? "text-amber-400" :
                                theme === 'cyberpunk' ? "text-fuchsia-400" :
                                theme === 'aurora' ? "text-cyan-400" :
                                theme === 'corporate' ? "text-sky-400" :
                                theme === 'minimalist' ? "text-amber-500" :
                                "text-emerald-400"
                            )}
                            style={applyCustomColor ? { color: customColor } : undefined}
                            >Catalyst AI Intelligence Summary</h4>
                        </div>
                        <p className={cn(
                            "text-lg font-bold leading-relaxed uppercase tracking-tight w-full max-w-none italic break-words whitespace-pre-wrap",
                            theme === 'executive' ? "text-slate-700" :
                            theme === 'emerald' ? "text-emerald-100" :
                            theme === 'cyberpunk' ? "text-fuchsia-100" :
                            theme === 'aurora' ? "text-cyan-100/90" :
                            theme === 'corporate' ? "text-slate-200" :
                            theme === 'minimalist' ? "text-stone-200" :
                            "text-white"
                        )}>
                            {dashboard.config.find(w => w.type === 'summary').notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
