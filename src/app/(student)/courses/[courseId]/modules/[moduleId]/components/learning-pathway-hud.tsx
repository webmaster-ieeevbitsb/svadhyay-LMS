"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, X } from "lucide-react";

interface Module {
  id: string;
  title: string;
  order_index: number;
}

interface LearningPathwayHUDProps {
  courseId: string;
  moduleId: string;
  allModules: Module[];
}

export function LearningPathwayHUD({ courseId, moduleId, allModules }: LearningPathwayHUDProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentIndex = allModules.findIndex(m => m.id === moduleId);

  return (
    <div className={`fixed top-[79px] left-0 w-full z-40 transition-all duration-500`}>
      <div className="relative w-full">
        {/* 🔘 Data Rail Toggle — Acting as a tactile interaction point */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#050508] border-b border-white/[0.05] transition-all relative group flex items-center justify-center overflow-hidden h-10 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Pulsing Data Stream (Lower Opacity) */}
          <div className="absolute inset-y-0 left-0 bg-blue-500/10 w-full animate-[pulse_5s_infinite] blur-sm opacity-5" />
          
          <div className="flex items-center gap-6 px-10 py-2 border-x border-blue-500/10 bg-blue-500/[0.03] transition-all group-hover:bg-blue-500/10">
             <div className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]`} />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400/80 group-hover:text-blue-400 transition-colors">
               {isOpen ? 'COLLAPSE_PATH' : 'EXPLORE_COURSE_PATH'}
             </span>
             <div className={`w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]`} />
          </div>

          {/* Node Pips — Compact mapping markers (Mobile optimized) */}
          <div className="absolute inset-y-0 left-0 w-full flex items-center justify-around px-12 md:px-24 opacity-20 pointer-events-none">
             {allModules.map((m) => (
               <div key={m.id} className={`w-0.5 h-0.5 rounded-full ${m.id === moduleId ? 'bg-blue-400 shadow-[0_0_5px_#3b82f6]' : 'bg-white/20'}`} />
             ))}
          </div>
        </button>

        {/* 🖥️ Command Overlay — The expanded strategic view */}
        <div className={`absolute top-0 left-0 w-full bg-[#050508]/98 backdrop-blur-3xl border-b border-blue-500/10 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_40px_100px_rgba(0,0,0,0.9)] ${isOpen ? 'h-[200px] md:h-[340px] opacity-100 visible' : 'h-0 opacity-0 invisible'} overflow-y-hidden`}>
          <div className="max-w-7xl mx-auto h-full px-6 md:px-12 pt-4 pb-2 flex flex-col items-center relative">
            
            {/* HUD Header */}
            <div className="w-full flex items-center justify-between mb-2 md:mb-4 border-b border-white/5 pb-2">
               <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] md:text-[9px] font-black tracking-[0.3em] text-blue-400">
                     LEARNING_PATHWAY
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  <Link href={`/courses/${courseId}`} className="group/btn flex items-center gap-3 text-[9px] md:text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                     <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                     <span className="hidden sm:inline">Back to Overview</span>
                  </Link>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* 🔗 Symmetric Data Path (Scrollable on Mobile) */}
            <div className="flex-1 w-full flex items-start pt-6 md:pt-10 pb-14 md:pb-20 overflow-x-auto overflow-y-hidden no-scrollbar gap-12 md:gap-32 relative px-10 md:px-16">
               {/* Background connection line — Only for Desktop/Large screens as reference */}
               <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.03] z-0 hidden md:block" />
               
               {allModules.map((m, idx) => {
                 const isActive = m.id === moduleId;
                 const isCompleted = idx < currentIndex;
                 
                 return (
                   <Link 
                    key={m.id} 
                    href={`/courses/${courseId}/modules/${m.id}`}
                    onClick={() => setIsOpen(false)}
                    className="relative z-10 shrink-0 group/node"
                   >
                     {/* Desktop Node Connector */}
                     {idx > 0 && (
                        <div className={`absolute right-full top-1/2 -translate-y-1/2 h-px transition-all duration-1000 hidden md:block ${
                          isActive || isCompleted ? 'w-32 bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'w-32 bg-white/[0.05]'
                        }`} />
                     )}

                     <div className="flex flex-col items-center gap-4 md:gap-6">
                        {/* The Node Identifier */}
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 rotate-45 flex items-center justify-center transition-all duration-500 relative ${
                           isActive 
                             ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-110' 
                             : 'bg-[#0a0a0f] border-white/10 hover:border-blue-500/50 hover:bg-white/[0.03]'
                        }`}>
                           <span className={`-rotate-45 text-xs md:text-sm font-black italic tracking-tighter ${isActive ? 'text-white' : 'text-zinc-600 group-hover/node:text-white'}`}>
                             {m.order_index < 10 ? `0${m.order_index}` : m.order_index}
                           </span>
                           
                           {/* Active Node Highlight */}
                           {isActive && (
                              <div className="absolute inset-0 bg-blue-400/10" />
                           )}
                        </div>

                        {/* Node Metadata (Mobile aligned) */}
                        <div className={`absolute top-20 md:top-24 w-32 md:w-48 text-center flex flex-col items-center gap-1 transition-all duration-500 ${
                           isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:group-hover/node:opacity-100 md:group-hover/node:scale-100'
                        }`}>
                           <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-blue-400' : 'text-zinc-700'}`}>
                             {isActive ? 'CURRENT_SESSION' : ''}
                           </span>
                           <h4 className={`text-[9px] md:text-[11px] font-black uppercase tracking-tight line-clamp-2 md:line-clamp-none leading-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover/node:text-white'}`}>
                             {m.title}
                           </h4>
                        </div>
                     </div>
                   </Link>
                 )
               })}
            </div>

            {/* HUD Footer status */}
            <div className="w-full flex justify-between items-center mt-auto border-t border-white/5 pt-4 opacity-20">
               <div className="flex gap-2">
                  <div className="w-1 h-2 bg-zinc-700" />
                  <div className="w-1 h-2 bg-zinc-700" />
                  <div className="w-1 h-2 bg-zinc-700" />
               </div>
               <div className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
                  SYSTEM_MAPPING_V2.0_RESPONSIVE
               </div>
            </div>
         </div>
      </div>
      </div>
    </div>
  );
}
