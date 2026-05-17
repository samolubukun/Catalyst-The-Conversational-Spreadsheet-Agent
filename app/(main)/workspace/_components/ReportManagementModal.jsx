"use client"

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
    X, 
    BarChart3, 
    Link2, 
    Lock, 
    Globe, 
    Trash2, 
    ExternalLink,
    Copy,
    Zap,
    Share2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ReportManagementModal({ isOpen, onClose, workbookId }) {
    const dashboards = useQuery(api.dashboards.getByWorkbook, { workbookId }) || [];
    const updateDashboard = useMutation(api.dashboards.update);
    const deleteDashboard = useMutation(api.dashboards.remove);

    const [deletingId, setDeletingId] = useState(null);

    const togglePublic = async (id, currentStatus) => {
        try {
            await updateDashboard({ id, isPublic: !currentStatus });
            toast.success(`Report is now ${!currentStatus ? 'Public' : 'Private'}`);
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        const loadingToast = toast.loading("Removing report...");
        try {
            await deleteDashboard({ id });
            toast.success("Report deleted", { id: loadingToast });
            setDeletingId(null);
        } catch (e) {
            toast.error("Failed to delete report", { id: loadingToast });
        }
    };

    const copyLink = (id) => {
        const url = `${window.location.origin}/share/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b-4 border-black flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black flex items-center justify-center rounded-2xl shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                            <BarChart3 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Report Intelligence</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Manage your shared insights</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-4 no-scrollbar">
                    {dashboards.length === 0 ? (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center opacity-50">
                                <Zap className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No reports generated yet</p>
                        </div>
                    ) : (
                        dashboards.map((d) => (
                            <div key={d._id} className="group bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-black dark:hover:border-emerald-500/50 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                                            d.isPublic ? "bg-emerald-500" : "bg-amber-500"
                                        )}>
                                            {d.isPublic ? <Globe className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight whitespace-normal break-words">{d.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                    d.isPublic ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                                                )}>
                                                    {d.isPublic ? 'Public Access' : 'Private Access'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Created {new Date(d._creationTime).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => togglePublic(d._id, d.isPublic)}
                                            className="h-9 px-3 rounded-xl border-2 border-black font-black uppercase tracking-widest text-[9px] hover:bg-slate-100"
                                        >
                                            {d.isPublic ? <Lock className="w-3.5 h-3.5 mr-2" /> : <Globe className="w-3.5 h-3.5 mr-2" />}
                                            Make {d.isPublic ? 'Private' : 'Public'}
                                        </Button>
                                        <Button 
                                            onClick={() => setDeletingId(d._id)}
                                            className="h-9 w-9 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-red-500 hover:bg-red-600 p-0 flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Actions & Links */}
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                                    <Button 
                                        onClick={() => window.open(`/share/${d._id}`, '_blank')}
                                        className="h-8 bg-black text-white hover:bg-slate-800 rounded-lg font-black uppercase tracking-widest text-[8px] flex-1 min-w-[120px]"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-2" />
                                        Open Report
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => copyLink(d._id)}
                                        className="h-8 rounded-lg border-2 border-slate-200 font-black uppercase tracking-widest text-[8px] flex-1 min-w-[120px]"
                                    >
                                        <Copy className="w-3 h-3 mr-2" />
                                        Copy Link
                                    </Button>
                                </div>

                                {/* Delete Confirmation */}
                                {deletingId === d._id && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Confirm deletion? This cannot be undone.</p>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleDelete(d._id)} className="h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[8px] font-black uppercase tracking-widest px-4">Delete Forever</Button>
                                            <Button onClick={() => setDeletingId(null)} variant="ghost" className="h-8 text-[8px] font-black uppercase tracking-widest px-4">Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t-4 border-black">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                        Public reports are accessible to anyone with the link.<br/>
                        Private reports are only visible to you while logged in.
                    </p>
                </div>
            </div>
        </div>
    );
}
