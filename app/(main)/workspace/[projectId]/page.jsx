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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import ChatPanel from '../_components/ChatPanel'
import ReportManagementModal from '../_components/ReportManagementModal'

export default function Workspace({ params }) {
    const resolvedParams = use(params);
    const workbookId = resolvedParams.projectId; // Keeping projectId for now to match folder name

    const [activeSheetId, setActiveSheetId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [previewData, setPreviewData] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isUploaderModalOpen, setIsUploaderModalOpen] = useState(false);

    // Convex Data
    const workbook = useQuery(api.workbooks.getById, { id: workbookId });
    const files = useQuery(api.files.getByWorkbook, { workbookId });
    const updateSheetData = useMutation(api.sheets.updateData);
    const sheets = useQuery(api.sheets.getByWorkbook, { workbookId });
    const activeSheet = sheets?.find(s => s._id === activeSheetId) || sheets?.[0];
    
    const dashboards = useQuery(api.dashboards.getByWorkbook, { workbookId }) || [];
    const updateDashboard = useMutation(api.dashboards.update);

    const versions = useQuery(api.versions.listBySheet, activeSheetId ? { sheetId: activeSheetId } : "skip");
    const restoreVersion = useMutation(api.sheets.restoreVersion);

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

    const handleUndo = async () => {
        if (!versions || versions.length === 0) {
            toast.error("No history available to undo");
            return;
        }
        
        const loadingToast = toast.loading("Rolling back...");
        try {
            // The latest version in the 'versions' table is the state BEFORE the last change
            const latestVersion = versions[0];
            await restoreVersion({
                sheetId: activeSheetId,
                versionId: latestVersion._id
            });
            toast.success("Undid last change", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error("Undo failed", { id: loadingToast });
        }
    };

    const handleExport = () => {
        if (!activeSheet || !activeSheet.data || activeSheet.data.length === 0) {
            toast.error("No data to export");
            return;
        }

        try {
            const data = activeSheet.data;
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(","),
                ...data.map(row => headers.map(h => {
                    const cell = row[h] === null || row[h] === undefined ? "" : String(row[h]);
                    return `"${cell.replace(/"/g, '""')}"`;
                }).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${activeSheet.name}_export.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV Exported successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Export failed");
        }
    };

    const handleApplyPreview = async () => {
        if (!previewData || !activeSheetId) return;
        const loadingToast = toast.loading("Applying changes...");
        try {
            await updateSheetData({
                id: activeSheetId,
                data: previewData,
                type: 'ai',
                description: 'AI Transformation applied via preview'
            });
            setPreviewData(null);
            toast.success("Changes applied successfully", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error("Failed to apply changes", { id: loadingToast });
        }
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
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{workbook.name}</h1>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Sync</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {files?.length > 0 ? `${files.length} Files Unified in Workspace` : "No files uploaded"}
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

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={!versions || versions.length === 0}
                            onClick={handleUndo}
                            className="rounded-lg font-bold text-xs h-8 px-3 hover:bg-white dark:hover:bg-slate-700"
                        >
                            <History className="w-4 h-4 mr-2" />
                            Undo
                        </Button>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleExport}
                            className="rounded-lg font-bold text-xs h-8 px-3 hover:bg-white dark:hover:bg-slate-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                    
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
                    {files?.length > 0 ? (
                        <>
                            {/* Sheet Tabs */}
                            <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 gap-2 overflow-x-auto no-scrollbar shadow-inner">
                                {sheets?.map(sheet => {
                                    const file = files?.find(f => f._id === sheet.fileId);
                                    const isExcel = file?.name?.endsWith('.xlsx') || file?.name?.endsWith('.xls');
                                    const isJson = file?.name?.endsWith('.json');
                                    const isCsv = file?.name?.endsWith('.csv');

                                    return (
                                        <button
                                            key={sheet._id}
                                            onClick={() => {
                                                setActiveSheetId(sheet._id);
                                                setPreviewData(null);
                                            }}
                                            className={cn(
                                                "px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 group relative",
                                                activeSheetId === sheet._id 
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" 
                                                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:text-emerald-500"
                                            )}
                                        >
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    {isExcel && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                                    {isCsv && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                    {isJson && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                                    {sheet.name}
                                                </div>
                                                {files?.length > 1 && (
                                                    <span className={cn(
                                                        "text-[7px] font-bold truncate max-w-[80px]",
                                                        activeSheetId === sheet._id ? "text-emerald-200" : "text-slate-500"
                                                    )}>
                                                        {file?.name}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsUploaderModalOpen(true)}
                                    className="rounded-xl shrink-0 opacity-50 hover:opacity-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
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
                                    <div className="absolute top-20 right-8 z-10 animate-in fade-in slide-in-from-top-4 flex flex-col gap-2">
                                        <div className="bg-amber-400 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                            <Zap className="w-4 h-4 fill-black" />
                                            Previewing AI Changes
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => setPreviewData(null)}
                                                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-2 border-amber-400 rounded-xl font-black text-[9px] uppercase tracking-widest h-9 shadow-lg"
                                            >
                                                Discard
                                            </Button>
                                            <Button 
                                                onClick={handleApplyPreview}
                                                className="flex-1 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-xl font-black text-[9px] uppercase tracking-widest h-9 shadow-lg"
                                            >
                                                Apply Changes
                                            </Button>
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
                    isChatOpen ? "w-[480px]" : "w-0 overflow-hidden"
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

            <Dialog open={isUploaderModalOpen} onOpenChange={setIsUploaderModalOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 border-none bg-transparent shadow-none overflow-hidden">
                    <div className="bg-white dark:bg-slate-950 p-8 rounded-[3rem] border-4 border-emerald-500/20 shadow-2xl">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Add Data to Workbook</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Upload more CSV, Excel, or JSON files to this project.
                            </DialogDescription>
                        </DialogHeader>
                        <FileUploader 
                            workbookId={workbookId} 
                            onUploadComplete={() => {
                                setIsUploaderModalOpen(false);
                                toast.success("Additional data merged into workspace!");
                            }} 
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
