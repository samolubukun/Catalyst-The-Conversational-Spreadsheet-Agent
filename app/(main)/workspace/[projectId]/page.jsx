"use client"

import { useState, use, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from '@/lib/utils'
import { 
    Table, MessageSquare, Plus, ChevronLeft, 
    Download, Play, Save, History, Users,
    Search, Filter, ChevronRight, BarChart3, Zap,
    Database,
    ChevronDown,
    Undo2,
    Redo2,
    Trash2,
    Settings2,
    FileBox,
    FileSpreadsheet,
    FileJson
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import FileUploader from '@/components/FileUploader'
import SpreadsheetViewer from '@/components/SpreadsheetViewer'
import Loader from '@/components/Loader'
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
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [sourceDeletingId, setSourceDeletingId] = useState(null);
    const [sheetDeletingId, setSheetDeletingId] = useState(null);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState('sheet'); // 'sheet' | 'chat'

    // Convex Data
    const workbook = useQuery(api.workbooks.getById, { id: workbookId });
    const files = useQuery(api.files.getByWorkbook, { workbookId });
    const updateSheetData = useMutation(api.sheets.updateData);
    const sheets = useQuery(api.sheets.getByWorkbookMetadata, { workbookId });
    const resolvedActiveSheetId = activeSheetId || sheets?.[0]?._id;
    const activeSheet = useQuery(
        api.sheets.getById,
        resolvedActiveSheetId ? { id: resolvedActiveSheetId } : "skip"
    );
    const removeSheet = useMutation(api.sheets.remove);
    const removeFile = useMutation(api.files.remove);
    
    const dashboards = useQuery(api.dashboards.getByWorkbook, { workbookId }) || [];
    const updateDashboard = useMutation(api.dashboards.update);

    const versions = useQuery(api.versions.listBySheetMetadata, activeSheetId ? { sheetId: activeSheetId } : "skip");
    const undo = useMutation(api.sheets.undo);
    const redo = useMutation(api.sheets.redo);

    const [pendingActiveFileId, setPendingActiveFileId] = useState(null);

    useEffect(() => {
        if (sheets?.length > 0 && !activeSheetId) {
            setActiveSheetId(sheets[0]._id);
        }
    }, [sheets, activeSheetId]);

    useEffect(() => {
        if (pendingActiveFileId && sheets?.length > 0) {
            const newSheet = sheets.find(s => s.fileId === pendingActiveFileId);
            if (newSheet) {
                setActiveSheetId(newSheet._id);
                setPendingActiveFileId(null);
            }
        }
    }, [sheets, pendingActiveFileId]);

    const cellEditDebounceRef = useRef(null);
    const handleCellChange = useCallback((data, field, value) => {
        if (!activeSheetId) return;
        // Debounce: wait 800ms after the last keystroke before persisting to DB
        if (cellEditDebounceRef.current) clearTimeout(cellEditDebounceRef.current);
        cellEditDebounceRef.current = setTimeout(async () => {
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
        }, 800);
    }, [activeSheetId, updateSheetData]);

    const toggleDashboardPublic = async (id, currentPublic) => {
        await updateDashboard({ id, isPublic: !currentPublic });
        toast.success(`Dashboard is now ${!currentPublic ? 'Public' : 'Private'}`);
    };

    const historyPointer = activeSheet?.historyPointer;
    const isUndoDisabled = !versions || versions.length === 0 || (historyPointer !== undefined && historyPointer !== null && historyPointer >= versions.length - 1);
    const isRedoDisabled = !versions || versions.length === 0 || historyPointer === undefined || historyPointer === null;

    const handleUndo = async () => {
        if (isUndoDisabled) {
            toast.error("No history available to undo");
            return;
        }
        
        const loadingToast = toast.loading("Undoing last change...");
        try {
            await undo({
                sheetId: activeSheetId || activeSheet?._id
            });
            toast.success("Undid change", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error("Undo failed", { id: loadingToast });
        }
    };

    const handleRedo = async () => {
        if (isRedoDisabled) {
            toast.error("Nothing to redo");
            return;
        }
        
        const loadingToast = toast.loading("Redoing next change...");
        try {
            await redo({
                sheetId: activeSheetId || activeSheet?._id
            });
            toast.success("Redid change", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error("Redo failed", { id: loadingToast });
        }
    };

    const handleExport = (format = 'csv') => {
        if (!activeSheet || !activeSheet.data || activeSheet.data.length === 0) {
            toast.error("No data to export");
            return;
        }

        try {
            const data = activeSheet.data;
            
            if (format === 'json') {
                const dataStr = JSON.stringify(data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `${activeSheet.name}_export.json`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("JSON Exported successfully!");
            } else if (format === 'xlsx') {
                const parentFile = files?.find(f => f._id === activeSheet.fileId);
                const siblingSheets = sheets?.filter(s => s.fileId === activeSheet.fileId) || [activeSheet];
                
                const workbook = XLSX.utils.book_new();
                siblingSheets.forEach(sheet => {
                    const wsData = sheet.data || [];
                    const worksheet = XLSX.utils.json_to_sheet(wsData);
                    const cleanSheetName = (sheet.name || "Sheet").substring(0, 30).replace(/[\\\?\*\/\[\]]/g, "");
                    XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName);
                });
                
                const fileName = parentFile ? parentFile.name.replace(/\.[^/.]+$/, "") : activeSheet.name;
                XLSX.writeFile(workbook, `${fileName}_export.xlsx`);
                toast.success("Excel Workbook Exported successfully!");
            } else {
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
            }
        } catch (e) {
            console.error(e);
            toast.error("Export failed");
        }
    };

    const handleApplyPreview = async () => {
        if (!previewData || !activeSheetId) return;
        const loadingToast = toast.loading("Applying changes...");
        try {
            // Safety check: ensure the serialized JSON data does not exceed the Convex 1MB document limit
            const serializedSize = new Blob([JSON.stringify(previewData)]).size;
            if (serializedSize > 900 * 1024) {
                toast.error("Transformed data exceeds database size limit. Try filtering or grouping your data into smaller aggregations.", { id: loadingToast });
                return;
            }

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

    if (!workbook) return <Loader />;

    return (
        <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 md:px-4 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-1 md:gap-4 min-w-0">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="h-8 w-8 rounded-lg shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center p-0 border-none bg-transparent text-slate-900 dark:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1 md:gap-2">
                            <h1 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight break-words whitespace-normal max-w-[90px] xs:max-w-[120px] sm:max-w-none">{workbook.name}</h1>
                            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Sync</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsSourceModalOpen(true)}
                                className="h-8 w-8 md:h-6 md:w-auto md:px-2 rounded-lg text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all bg-transparent md:bg-slate-50 dark:md:bg-slate-900 shrink-0 border-0 md:border md:border-slate-300 dark:md:border-slate-700"
                            >
                                <Settings2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-slate-700 dark:text-slate-200" />
                                <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Sources</span>
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                            {files?.length > 0 ? `${files.length} Files Unified in Workspace` : "No files uploaded"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    {previewData && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setPreviewData(null)}
                            className="rounded-xl font-bold text-xs h-9 animate-pulse"
                        >
                            Cancel Preview
                        </Button>
                    )}

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 md:p-1 rounded-xl gap-0.5 md:gap-1 shrink-0">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={isUndoDisabled}
                            onClick={handleUndo}
                            className="rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-2.5 p-0 md:p-auto hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center"
                        >
                            <Undo2 className="w-4 h-4 md:mr-1.5" />
                            <span className="hidden md:inline">Undo</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={isRedoDisabled}
                            onClick={handleRedo}
                            className="rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-2.5 p-0 md:p-auto hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center"
                        >
                            <Redo2 className="w-4 h-4 md:mr-1.5" />
                            <span className="hidden md:inline">Redo</span>
                        </Button>

                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                                className={cn(
                                    "rounded-lg font-bold text-xs h-8 w-8 md:w-auto md:px-3 p-0 md:p-auto hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-all",
                                    isExportDropdownOpen && "bg-white dark:bg-slate-700 shadow-sm"
                                )}
                            >
                                <Download className="w-4 h-4 md:mr-1.5" />
                                <span className="hidden md:inline">Export</span>
                                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60 hidden md:inline" />
                            </Button>

                            {isExportDropdownOpen && (
                                <>
                                    {/* Click outside handler */}
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsExportDropdownOpen(false)}
                                    />
                                    
                                    <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <button
                                            onClick={() => {
                                                handleExport('xlsx');
                                                setIsExportDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            Excel Sheet (.xlsx)
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleExport('csv');
                                                setIsExportDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"
                                        >
                                            <FileBox className="w-4 h-4 text-blue-600" />
                                            CSV Sheet (.csv)
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleExport('json');
                                                setIsExportDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg transition-colors"
                                        >
                                            <FileJson className="w-4 h-4 text-amber-600" />
                                            JSON Structure (.json)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="bg-black text-white hover:bg-slate-800 rounded-lg md:rounded-xl font-bold text-xs h-8 w-auto px-2 border border-black md:border-2 md:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] shrink-0 flex items-center justify-center gap-1"
                    >
                        <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="hidden md:inline">Reports</span> {dashboards.length > 0 && <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5 font-black leading-none">{dashboards.length}</span>}
                    </Button>
                </div>
            </header>

             <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative",
                    mobileTab === 'sheet' ? "flex" : "hidden md:flex"
                )}>
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
                                        <div
                                            key={sheet._id}
                                            onClick={() => {
                                                setActiveSheetId(sheet._id);
                                                setPreviewData(null);
                                            }}
                                            className={cn(
                                                "px-4 h-9 flex items-center text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border-2 shrink-0 group relative cursor-pointer select-none",
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
                                                        activeSheetId === sheet._id ? "text-emerald-200" : "text-slate-400"
                                                    )}>
                                                        {file?.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Delete Sheet Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSheetDeletingId(sheet._id);
                                                }}
                                                className={cn(
                                                    "ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white",
                                                    activeSheetId === sheet._id ? "text-emerald-200" : "text-slate-400"
                                                )}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            {/* Inline Sheet Delete Confirm */}
                                            {sheetDeletingId === sheet._id && (
                                                <div className="absolute inset-0 bg-red-600 rounded-xl flex items-center justify-center gap-2 z-10 px-2">
                                                    <p className="text-[8px] font-black text-white uppercase whitespace-nowrap">Delete?</p>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSheet({ id: sheet._id });
                                                            setSheetDeletingId(null);
                                                            if (activeSheetId === sheet._id) setActiveSheetId(null);
                                                        }}
                                                        className="bg-white text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase"
                                                    >
                                                        Yes
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSheetDeletingId(null);
                                                        }}
                                                        className="text-white text-[8px] font-black uppercase"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                            <div className="flex-1 overflow-hidden p-2 md:p-4">
                                <div className={cn(
                                    "w-full h-full rounded-xl md:rounded-2xl border overflow-hidden shadow-2xl bg-white transition-all",
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
                                    <div className="absolute top-16 md:top-20 left-4 right-4 md:left-auto md:right-8 z-10 animate-in fade-in slide-in-from-top-4 flex flex-col gap-2">
                                        <div className="bg-amber-400 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2">
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
                                    onUploadComplete={(fileId) => {
                                        setPendingActiveFileId(fileId);
                                        toast.success("File uploaded and parsed!");
                                    }} 
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Chat Panel */}
                <aside className={cn(
                    "transition-all duration-300 flex flex-col shrink-0",
                    "md:flex",
                    isChatOpen ? "md:w-[480px]" : "md:w-0 md:overflow-hidden",
                    mobileTab === 'chat' ? "w-full flex" : "hidden"
                )}>
                    <ChatPanel 
                        workbookId={workbookId} 
                        activeSheetId={activeSheet?._id}
                        allSheets={sheets || []}
                        onActiveSheetChange={setActiveSheetId}
                        onPreview={setPreviewData}
                        onClearPreview={() => setPreviewData(null)}
                    />
                </aside>
            </div>

            {/* Mobile Tab switcher (Sticky bottom navigation bar) */}
            <div className="md:hidden h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-around z-20 px-4 shrink-0">
                <button
                    onClick={() => setMobileTab('sheet')}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all",
                        mobileTab === 'sheet'
                            ? "text-emerald-600 dark:text-emerald-400 font-black"
                            : "text-slate-400 dark:text-slate-500 font-bold"
                    )}
                >
                    <Table className="w-5 h-5" />
                    <span className="text-[9px] uppercase tracking-wider">Sheet Grid</span>
                </button>
                
                <button
                    onClick={() => {
                        setMobileTab('chat');
                        setIsChatOpen(true);
                    }}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative",
                        mobileTab === 'chat'
                            ? "text-emerald-600 dark:text-emerald-400 font-black"
                            : "text-slate-400 dark:text-slate-500 font-bold"
                    )}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[9px] uppercase tracking-wider">Catalyst AI</span>
                    {previewData && (
                        <span className="absolute top-2 right-1/3 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* Float Chat Toggle */}
            {!isChatOpen && (
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="absolute right-6 bottom-6 w-14 h-14 bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-600/40 flex items-center justify-center hover:scale-110 transition-all z-20 group hidden md:flex"
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
                <DialogContent className="w-[95%] max-w-[600px] mx-auto rounded-3xl md:rounded-[3rem] p-0 border-none bg-transparent shadow-none overflow-hidden">
                    <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-3xl md:rounded-[3rem] border-2 md:border-4 border-emerald-500/20 shadow-2xl">
                        <DialogHeader className="mb-4 md:mb-6">
                            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Add Data to Workbook</DialogTitle>
                            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Upload more CSV, Excel, or JSON files to this project.
                            </DialogDescription>
                        </DialogHeader>
                        <FileUploader 
                            workbookId={workbookId} 
                            onUploadComplete={(fileId) => {
                                setPendingActiveFileId(fileId);
                                setIsUploaderModalOpen(false);
                                toast.success("Additional data merged into workspace!");
                            }} 
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isSourceModalOpen} onOpenChange={setIsSourceModalOpen}>
                <DialogContent className="w-[95%] max-w-[600px] mx-auto rounded-3xl md:rounded-[3rem] p-0 border-none bg-transparent shadow-none overflow-hidden">
                    <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-3xl md:rounded-[3rem] border-2 md:border-4 border-emerald-500/20 shadow-2xl">
                        <DialogHeader className="mb-4 md:mb-6">
                            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Manage Data Sources</DialogTitle>
                            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Review or remove uploaded files and their associated sheets.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {files?.map(file => {
                                const cleanType = (file.type || '').toLowerCase();
                                const isExcel = cleanType === 'xlsx' || cleanType === 'xls';
                                const isJson = cleanType === 'json';
                                
                                // Dynamic Color mappings
                                const borderClass = isExcel ? "border-emerald-500" : isJson ? "border-amber-500" : "border-blue-500";
                                const shadowClass = isExcel ? "shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] md:shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]" : isJson ? "shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] md:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]" : "shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] md:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]";
                                const textClass = isExcel ? "text-emerald-500" : isJson ? "text-amber-500" : "text-blue-500";
                                const badgeClass = isExcel 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                    : isJson 
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

                                return (
                                    <div key={file._id} className="relative group overflow-hidden">
                                        <div className="p-4 md:p-6 border-2 md:border-4 border-black bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                <div className={cn("w-10 h-10 md:w-12 md:h-12 bg-black flex items-center justify-center border-2 transition-all shrink-0", borderClass, shadowClass)}>
                                                    {isExcel ? (
                                                        <FileSpreadsheet className={cn("w-5 h-5 md:w-6 md:h-6", textClass)} />
                                                    ) : isJson ? (
                                                        <FileJson className={cn("w-5 h-5 md:w-6 md:h-6", textClass)} />
                                                    ) : (
                                                        <FileBox className={cn("w-5 h-5 md:w-6 md:h-6", textClass)} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-xs md:text-sm text-black dark:text-white uppercase tracking-tighter truncate max-w-[120px] sm:max-w-[200px] leading-tight">{file.name}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 leading-none">
                                                        <span className={cn("px-1.5 py-0.5 rounded border text-[8px] font-black tracking-wide leading-none", badgeClass)}>
                                                            {file.type}
                                                        </span>
                                                        • {sheets?.filter(s => s.fileId === file._id).length} Sheets
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setSourceDeletingId(file._id)}
                                                className="rounded-xl border-2 border-black bg-red-600 text-white hover:bg-red-700 hover:border-black transition-all font-black uppercase tracking-widest text-[9px] h-9 px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto text-center justify-center shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                Delete Source
                                            </Button>
                                        </div>

                                        {/* Inline Source Delete Confirm */}
                                        {sourceDeletingId === file._id && (
                                            <div className="absolute inset-0 bg-red-600 z-20 flex items-center justify-center gap-4 md:gap-6 animate-in slide-in-from-right duration-200 p-4 text-center">
                                                <div>
                                                    <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] mb-2 leading-tight">Delete entire source permanently?</p>
                                                    <div className="flex justify-center gap-3">
                                                        <Button 
                                                            onClick={() => {
                                                                removeFile({ id: file._id });
                                                                setSourceDeletingId(null);
                                                                toast.success("Source removed from workspace");
                                                            }} 
                                                            className="bg-white text-red-600 hover:bg-slate-100 font-black uppercase tracking-widest text-[9px] h-8 px-4 rounded-xl leading-none"
                                                        >
                                                            Yes, Delete
                                                        </Button>
                                                        <Button 
                                                            onClick={() => setSourceDeletingId(null)} 
                                                            variant="ghost" 
                                                            className="text-white hover:bg-white/10 font-black uppercase tracking-widest text-[9px] h-8 px-4 rounded-xl leading-none"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {files?.length === 0 && (
                                <p className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No data sources found.</p>
                            )}
                        </div>
                        
                        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-slate-100 flex justify-center">
                            <Button 
                                onClick={() => {
                                    setIsSourceModalOpen(false);
                                    setIsUploaderModalOpen(true);
                                }}
                                className="bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl px-6 md:px-8 h-10 md:h-12 border-2 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <Plus className="mr-2 w-4 h-4" /> Add New Source
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
