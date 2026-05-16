"use client"

import { useContext, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { UserContext } from "@/app/_context/UserContext"
import { 
    Plus, FileSpreadsheet, Settings, MoreVertical, LayoutGrid, Clock, 
    Loader2, Layers, Trash2, Search, Table, MessageSquare, 
    Zap, ArrowRight, TrendingUp, BarChart3, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
// Note: We will need to create/update these modals as well
import { CreateWorkbookModal } from './_components/CreateWorkbookModal'
import { DeleteWorkbookModal } from './_components/DeleteWorkbookModal'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dashboard() {
    const router = useRouter();
    const { userData } = useContext(UserContext);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeWorkbookToDelete, setActiveWorkbookToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Fetch workbooks
    const workbooks = useQuery(api.workbooks.list, userData?._id ? { userId: userData._id } : "skip");
    
    const createWorkbook = useMutation(api.workbooks.create);
    const deleteWorkbook = useMutation(api.workbooks.remove);

    const filteredWorkbooks = useMemo(() => {
        if (!workbooks) return [];
        return workbooks.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [workbooks, searchQuery]);

    const handleCreateWorkbook = async (name) => {
        if (!userData?._id) return;
        try {
            const id = await createWorkbook({ name, userId: userData._id });
            toast.success("Workbook created!");
            router.push(`/workspace/${id}`);
        } catch (err) {
            toast.error("Failed to create workbook");
        }
    };

    const handleOpenDelete = (e, workbook) => {
        e.stopPropagation();
        setActiveWorkbookToDelete(workbook);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteWorkbook = async (workbookId) => {
        try {
            await deleteWorkbook({ id: workbookId });
            toast.success("Workbook deleted");
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error("Failed to delete workbook");
        }
    };

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            {/* CreateWorkbookModal and DeleteWorkbookModal would go here */}

            <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <FileSpreadsheet className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Catalyst Analytics</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Your Workbooks</h1>
                        <p className="text-slate-500 font-medium">Analyze, transform, and visualize your data with AI.</p>
                    </div>

                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 py-6 h-auto text-[13px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Workbook
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {(() => {
                        const totalSheets = workbooks?.reduce((acc, w) => acc + (w.sheetCount || 0), 0) || 0;
                        const totalRecords = workbooks?.reduce((acc, w) => acc + (w.recordCount || 0), 0) || 0;
                        
                        return [
                            { label: 'Total Workbooks', value: workbooks?.length || 0, icon: Layers, color: 'bg-emerald-500' },
                            { label: 'Files Analyzed', value: totalSheets, icon: Table, color: 'bg-blue-500' },
                            { label: 'Total Records', value: totalRecords.toLocaleString(), icon: Zap, color: 'bg-amber-500' },
                            { label: 'Reports Generated', value: 0, icon: BarChart3, color: 'bg-indigo-500' },
                        ].map((s, i) => (
                            <div key={i} className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 min-w-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${s.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
                                <s.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-slate-400 leading-tight mb-1 whitespace-nowrap">{s.label}</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
                            </div>
                        </div>
                    ))})()}
                </div>

                {/* Search & Filtering */}
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm shadow-black/[0.02]">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            placeholder="Search workbooks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none pl-14 pr-6 py-6 h-auto text-[15px] outline-none placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                        <Button variant="ghost" className="rounded-full px-4 text-slate-400 hover:text-slate-900">
                            <Filter className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                        </Button>
                    </div>
                </div>

                {/* Workbooks Grid */}
                {workbooks === undefined ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing Catalyst Engine</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Create Workbook Card */}
                        <motion.button 
                            whileHover={{ y: -8, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group flex flex-col items-center justify-center min-h-[280px] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer p-8"
                        >
                            <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl shadow-black/[0.03] border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-100 group-hover:border-emerald-200 flex items-center justify-center mb-6 transition-all duration-300">
                                <Plus className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 transition-colors duration-300" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-emerald-700">New Workbook</h3>
                                <p className="text-xs font-medium text-slate-400 max-w-[180px] mx-auto">Start by uploading an Excel or CSV file.</p>
                            </div>
                        </motion.button>

                        {/* Existing Workbooks */}
                        <AnimatePresence mode="popLayout">
                            {filteredWorkbooks.map((workbook) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={workbook._id}
                                    onClick={() => router.push(`/workspace/${workbook._id}`)}
                                    className="group relative flex flex-col min-h-[280px] rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-500 cursor-pointer overflow-hidden"
                                >
                                    <div className="p-8 pb-4 flex justify-between items-start">
                                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                            <Table className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={(e) => handleOpenDelete(e, workbook)}
                                            className="h-10 w-10 text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-10"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="px-8 flex-1 flex flex-col justify-end pb-8">
                                        <div className="space-y-1 mb-6">
                                            <h3 className="font-black text-2xl text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">{workbook.name}</h3>
                                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                <span>Active {moment(workbook._creationTime).fromNow()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[14px] sm:text-[16px] font-black text-slate-900 dark:text-white leading-none truncate">{workbook.sheetCount || 0}</span>
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">Sheets</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[14px] sm:text-[16px] font-black text-slate-900 dark:text-white leading-none truncate">{(workbook.recordCount || 0).toLocaleString()}</span>
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">Records</span>
                                            </div>
                                            <div className="ml-auto shrink-0">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300 group-hover:translate-x-1">
                                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/[0.02] group-hover:to-teal-500/[0.02] pointer-events-none transition-all duration-500" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <CreateWorkbookModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateWorkbook} 
            />
            <DeleteWorkbookModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={() => handleDeleteWorkbook(activeWorkbookToDelete?._id)} 
                workbookName={activeWorkbookToDelete?.name} 
            />
        </div>
    )
}