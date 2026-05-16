"use client"

import { useState, use, useEffect } from 'react'
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from '@/lib/utils'
import { 
    Table, MessageSquare, Plus, ChevronLeft, 
    Download, Play, Save, History, Users,
    Search, Filter, ChevronRight, BarChart3, Zap
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import FileUploader from '@/components/FileUploader'
import SpreadsheetViewer from '@/components/SpreadsheetViewer'
import { toast } from 'sonner'

import ChatPanel from '../_components/ChatPanel'
import ReportManagementModal from '../_components/ReportManagementModal'

export default function Workspace({ params }) {
    const resolvedParams = use(params);
    const workbookId = resolvedParams.projectId; // Keeping projectId for now to match folder name

    const [activeSheetId, setActiveSheetId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [previewData, setPreviewData] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Convex Data
    const workbook = useQuery(api.workbooks.getById, { id: workbookId });
    const files = useQuery(api.files.getByWorkbook, { workbookId });
    const activeFile = files?.[0]; 
    const updateSheetData = useMutation(api.sheets.updateData);
    const sheets = useQuery(api.sheets.getByFile, activeFile ? { fileId: activeFile._id } : "skip");
    
    const activeSheet = sheets?.find(s => s._id === activeSheetId) || sheets?.[0];

    const dashboards = useQuery(api.dashboards.getByWorkbook, { workbookId }) || [];
    const updateDashboard = useMutation(api.dashboards.update);

    useEffect(() => {
        if (sheets?.length > 0 && !activeSheetId) {
            setActiveSheetId(sheets[0]._id);
        }
    }, [sheets]);

    const handleCellChange = async (data, field, value) => {
        if (!activeSheetId) return;
        try {
            await updateSheetData({
                id: activeSheetId,
                data: data,
            });
            toast.success("Saved manual edit");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save edit");
        }
    };

    const toggleDashboardPublic = async (id, currentPublic) => {
        await updateDashboard({ id, isPublic: !currentPublic });
        toast.success(`Dashboard is now ${!currentPublic ? 'Public' : 'Private'}`);
    };

    if (!workbook) return <div className="h-full flex items-center justify-center">Loading...</div>;

    return (
        <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{workbook.name}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {activeFile ? activeFile.name : "No file uploaded"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {previewData && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setPreviewData(null)}
                            className="rounded-xl font-bold text-xs h-9"
                        >
                            Cancel Preview
                        </Button>
                    )}
                    
                    <Button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="bg-black text-white hover:bg-slate-800 rounded-xl font-bold text-xs h-9 px-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Reports {dashboards.length > 0 && `(${dashboards.length})`}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative">
                    {activeFile ? (
                        <>
                            {/* Sheet Tabs */}
                            <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center px-2 bg-white dark:bg-slate-900 gap-1 overflow-x-auto no-scrollbar">
                                {sheets?.map(sheet => (
                                    <button
                                        key={sheet._id}
                                        onClick={() => {
                                            setActiveSheetId(sheet._id);
                                            setPreviewData(null);
                                        }}
                                        className={cn(
                                            "px-4 h-8 flex items-center text-[11px] font-black uppercase tracking-widest transition-all rounded-lg",
                                            activeSheetId === sheet._id 
                                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <Table className="w-3 h-3 mr-2" />
                                        {sheet.name}
                                    </button>
                                ))}
                            </div>

                            {/* Grid Viewer */}
                            <div className="flex-1 overflow-hidden p-4">
                                <div className={cn(
                                    "w-full h-full rounded-2xl border overflow-hidden shadow-2xl bg-white transition-all",
                                    previewData ? "border-amber-400 ring-4 ring-amber-400/20" : "border-slate-200 dark:border-slate-800"
                                )}>
                                    <SpreadsheetViewer 
                                        sheetData={previewData || activeSheet?.data || []} 
                                        originalData={previewData ? activeSheet?.data : null}
                                        sheetId={activeSheet?._id}
                                        onCellChange={handleCellChange}
                                    />
                                </div>
                                {previewData && (
                                    <div className="absolute top-20 right-8 z-10 animate-in fade-in slide-in-from-top-4">
                                        <div className="bg-amber-400 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                            <Zap className="w-4 h-4 fill-black" />
                                            Previewing AI Changes
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="max-w-md w-full">
                                <FileUploader 
                                    workbookId={workbookId} 
                                    onUploadComplete={(fileId) => toast.success("File uploaded and parsed!")} 
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Chat Panel */}
                <aside className={cn(
                    "transition-all duration-300 flex flex-col shrink-0",
                    isChatOpen ? "w-[400px]" : "w-0 overflow-hidden"
                )}>
                    <ChatPanel 
                        workbookId={workbookId} 
                        activeSheetId={activeSheet?._id} 
                        onPreview={setPreviewData}
                        onClearPreview={() => setPreviewData(null)}
                    />
                </aside>
            </div>

            {/* Float Chat Toggle */}
            {!isChatOpen && (
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="absolute right-6 bottom-6 w-14 h-14 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-600/40 flex items-center justify-center hover:scale-110 transition-all z-20 group"
                >
                    <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                </button>
            )}

            <ReportManagementModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                workbookId={workbookId} 
            />
        </div>
    )
}
