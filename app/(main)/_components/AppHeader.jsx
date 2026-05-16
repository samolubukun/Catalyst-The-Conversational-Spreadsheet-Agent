"use client"

import { UserButton } from '@stackframe/stack'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserContext } from '@/app/_context/UserContext'
import { Plus, Layers } from 'lucide-react'
import { CreateWorkbookModal } from '@/app/(main)/dashboard/_components/CreateWorkbookModal'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function AppHeader() {
    const { userData } = useContext(UserContext);
    const pathname = usePathname();
    const router = useRouter();
    
    // Only show controls if we are deep inside a workspace route
    const isWorkspace = pathname?.startsWith('/workspace/');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Fetch workbooks to populate the switcher dropdown
    const workbooks = useQuery(api.workbooks.list, userData?._id ? { userId: userData._id } : "skip") || [];
    const createWorkbook = useMutation(api.workbooks.create);
    
    // Extract current workbook ID from the URL path
    let currentWorkbookId = null;
    if (isWorkspace) {
        const parts = pathname.split('/');
        currentWorkbookId = parts[parts.length - 1];
    }

    const handleCreateWorkbook = async (name) => {
        if (!userData?._id) return;
        try {
            const id = await createWorkbook({ name, userId: userData._id });
            toast.success("Workspace created!");
            router.push(`/workspace/${id}`);
        } catch (err) {
            toast.error("Failed to create workspace");
        }
    };

    return (
        <div className='p-2.5 md:py-2.5 md:px-6 shadow-sm flex justify-between items-center px-3 bg-background border-b border-border'>
            
            {/* Hidden Modal rendered here so it triggers over everything */}
            <CreateWorkbookModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateWorkbook} 
            />

            {/* Left side: Logo — hide text on mobile when in workspace (switcher takes that space) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2.5">
                    <div className="w-9 h-9 bg-white border-2 border-black rounded-lg flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
                        <img src="/logo.png" alt="Catalyst Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <span className={`text-base sm:text-lg md:text-xl font-black tracking-tighter text-foreground uppercase italic ${
                        isWorkspace ? 'hidden sm:inline' : ''
                    }`}>
                        Catalyst
                    </span>
                </Link>
            </div>

            {/* Right side: Controls & Profile */}
            <div className='flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0'>
                
                {isWorkspace && (
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                        {/* Workbook Switcher Dropdown — compact on mobile */}
                        <Select 
                            value={currentWorkbookId || ""}
                            onValueChange={(value) => router.push(`/workspace/${value}`)}
                        >
                            <SelectTrigger className="w-[125px] sm:w-[190px] lg:w-[240px] bg-slate-100 dark:bg-slate-900 border-border hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm focus:ring-emerald-500 text-[11px] sm:text-xs font-medium h-9 min-w-0">
                                <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                                    <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="truncate min-w-0">
                                        <SelectValue placeholder="Workspace" />
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent position="popper" className="w-[200px] bg-white dark:bg-slate-950 border border-border shadow-lg z-50">
                                {workbooks.map(w => (
                                    <SelectItem key={w._id} value={w._id} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Create Workspace Button — icon only on mobile */}
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold p-2 sm:py-2 sm:px-3 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 shadow-sm shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">New</span>
                        </button>
                    </div>
                )}
                
                <UserButton />
            </div>
        </div>
    )
}

export default AppHeader