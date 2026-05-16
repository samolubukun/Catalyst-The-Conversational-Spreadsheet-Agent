"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

export function DeleteWorkbookModal({ isOpen, onClose, onConfirm, workbookName }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-4 border-black rounded-none shadow-[12px_12px_0px_0px_rgba(239,68,68,1)] p-8">
                <DialogHeader>
                    <div className="w-14 h-14 bg-red-50 border-2 border-red-200 flex items-center justify-center mb-6">
                        <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Delete Workbook?</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">
                        You are about to delete <span className="text-slate-900 font-black">"{workbookName}"</span>. This action is permanent and all associated files, sheets, and research will be purged.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 flex flex-col gap-2 sm:flex-row">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="flex-1 rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-12"
                    >
                        Keep Workbook
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
