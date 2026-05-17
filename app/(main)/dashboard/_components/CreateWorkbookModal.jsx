"use client"

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap } from 'lucide-react'

export function CreateWorkbookModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name);
            setName('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-4 border-black rounded-none shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] p-8">
                <DialogHeader>
                    <div className="w-14 h-14 border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] bg-white overflow-hidden p-1.5">
                        <img src="/logo.png" alt="Catalyst Logo" className="w-full h-full object-contain" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Initialize Workbook</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                        Create a new agentic workspace to start analyzing your data.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Workbook Name</label>
                        <Input
                            id="name"
                            placeholder="e.g. Q4 Financial Report"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-none border-2 border-black h-12 font-bold focus-visible:ring-emerald-500 bg-slate-50 placeholder:text-slate-400 placeholder:opacity-50"
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={!name.trim()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-none border-2 border-black font-black uppercase tracking-widest h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                            Create Workspace
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
