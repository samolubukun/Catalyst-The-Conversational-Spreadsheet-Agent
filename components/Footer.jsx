import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="pt-20 md:pt-32 pb-12 md:pb-16 px-6 border-t-8 border-black text-center bg-slate-900">
            <div className="flex flex-col justify-center items-center gap-6 mb-12">
                <div className="w-24 h-24 bg-white border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] overflow-hidden">
                    <img src="/logo.png" alt="Catalyst" className="w-16 h-16 object-contain" />
                </div>
                <span className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Catalyst</span>
            </div>
            <div className="space-y-6">
                <p className="text-slate-300 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] px-4 leading-relaxed max-w-md mx-auto italic">
                    The agentic spreadsheet for the intelligence era.
                </p>
                <p className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-widest">
                    © 2026 CATALYST. ALL RIGHTS RESERVED.
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest pt-4">
                    Designed and developed by <a href="https://samuelolubukun.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors underline decoration-black">Samuel Olubukun</a>
                </p>
            </div>
        </footer>
    );
}
