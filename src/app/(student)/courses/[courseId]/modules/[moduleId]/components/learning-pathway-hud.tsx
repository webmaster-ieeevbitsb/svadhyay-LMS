"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronRight, X, LayoutGrid, Radio } from "lucide-react";
import { ModuleContent } from "@/types/database";
import { getNextStepUrl } from "@/utils/nav-utils";

interface Module {
  id: string;
  title: string;
  order_index: number;
}

interface LearningPathwayHUDProps {
  courseId: string;
  moduleId: string;
  allModules: Module[];
  structuredContent?: ModuleContent;
}

export function LearningPathwayHUD({ courseId, moduleId, allModules, structuredContent }: LearningPathwayHUDProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentIndex = allModules.findIndex(m => m.id === moduleId);

  // Identify current sub-step from URL
  const getSubStep = () => {
    if (pathname.includes("/concept/")) {
       const match = pathname.match(/\/concept\/(\d+)/);
       return match ? `1.${match[1]}` : "1.1";
    }
    if (pathname.includes("/activity")) return `1.${(structuredContent?.drop_downs?.length || 0) + 1}`;
    if (pathname.includes("/references")) return `1.${(structuredContent?.drop_downs?.length || 0) + 2}`;
    if (pathname.includes("/quiz")) return `1.${(structuredContent?.drop_downs?.length || 0) + 3}`;
    return "1.0";
  };

  const currentSubStep = getSubStep();

  return (
    <div className={`fixed top-[79px] left-0 w-full z-40 transition-all duration-500`}>
      <div className="relative w-full">
        
        {/* 🔘 TACTICAL COMMAND TAB — High visibility interaction point */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-4 px-8 py-3 bg-[#050508]/90 backdrop-blur-xl border border-blue-500/30 rounded-b-2xl shadow-[0_10px_30px_rgba(59,130,246,0.15)] group transition-all hover:bg-blue-500/10 hover:border-blue-500/60 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100'}`}
            >
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 group-hover:text-blue-300">EXPLORE_PATHWAY</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-blue-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
        </div>

        {/* 🗄️ EXPANDED COMMAND DRAWER */}
        <div className={`absolute top-0 left-0 w-full bg-[#050508]/98 backdrop-blur-3xl border-b border-blue-500/20 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_40px_100px_rgba(0,0,0,0.9)] ${isOpen ? 'h-[450px] md:h-[600px] opacity-100 visible' : 'h-0 opacity-0 invisible'}`}>
          <div className="max-w-7xl mx-auto min-h-full px-6 md:px-12 pt-6 pb-8 flex flex-col relative">
            
            {/* Header Area */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-8">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">CURRENT_DEPLOYMENT</span>
                     <h2 className="text-xl font-black italic text-white uppercase tracking-tighter tabular-nums">Sub-module {currentSubStep}</h2>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <Link href={`/courses/${courseId}`} className="group/btn flex items-center gap-3 text-[9px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                     <ArrowLeft className="w-3 h-3 group-hover/btn:-translate-x-1 transition-transform" />
                     Return to overview
                  </Link>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* SYMMETRIC NAVIGATION RAIL */}
            <div className="flex-1 flex overflow-x-auto no-scrollbar gap-12 md:gap-24 relative px-4 md:px-8 items-start py-8">
               {/* Background connection line */}
               <div className="absolute top-[48px] md:top-[64px] left-0 right-0 h-[2px] bg-white/[0.03] z-0" />
               
               {allModules.map((m, idx) => {
                 const isActive = m.id === moduleId;
                 const isCompleted = idx < currentIndex;
                 
                 return (
                   <div key={m.id} className="relative z-10 shrink-0 flex flex-col items-center gap-8">
                      {/* Major Module Node */}
                      <Link 
                        href={`/courses/${courseId}/modules/${m.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 relative group/node ${
                           isActive 
                             ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.25)] scale-110' 
                             : 'bg-zinc-950/80 border-white/10 hover:border-blue-500/40 hover:bg-white/[0.02]'
                        }`}
                      >
                         <span className={`text-4xl md:text-5xl font-black italic tracking-tighter transition-colors tabular-nums ${isActive ? 'text-white' : 'text-zinc-800 group-hover/node:text-zinc-600'}`}>
                           {m.order_index < 10 ? `0${m.order_index}` : m.order_index}
                         </span>
                         <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] transition-colors mt-1 ${isActive ? 'text-blue-300' : 'text-zinc-700'}`}>
                           MODULE_SESSION
                         </span>
                         
                         {isActive && (
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6] rounded-full" />
                         )}
                      </Link>

                      {/* SUB-NODE RAIL (Only for Active Module) */}
                      {isActive && structuredContent && (
                         <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {/* Intro Pip (1.0) */}
                            <SubPip 
                              active={currentSubStep === "1.0"} 
                              label="1.0" 
                              href={`/courses/${courseId}/modules/${moduleId}`} 
                              setIsOpen={setIsOpen} 
                            />
                            
                            {/* Concepts Pips (1.1, 1.2...) */}
                            {structuredContent.drop_downs.map((_, cIdx) => (
                              <SubPip 
                                key={cIdx}
                                active={currentSubStep === `1.${cIdx + 1}`} 
                                label={`1.${cIdx + 1}`} 
                                href={`/courses/${courseId}/modules/${moduleId}/concept/${cIdx + 1}`} 
                                setIsOpen={setIsOpen} 
                              />
                            ))}

                            {/* Utility Pips (Activity, Quiz) */}
                            <SubPip 
                              active={currentSubStep.startsWith("1.") && parseInt(currentSubStep.split(".")[1]) > (structuredContent?.drop_downs?.length || 0)}
                              label="PHASE_END"
                              href={getNextStepUrl(courseId, moduleId, "concept", structuredContent as any, (structuredContent?.drop_downs?.length || 1) - 1)}
                              setIsOpen={setIsOpen}
                              variant="pill"
                            />
                         </div>
                      )}

                      {/* Module Title Label */}
                      <div className={`mt-2 w-32 md:w-48 text-center px-2 transition-all ${isActive ? 'opacity-100' : 'opacity-40 group-hover/node:opacity-100'}`}>
                         <h4 className={`text-[9px] md:text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2 italic ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                           {m.title}
                         </h4>
                      </div>
                   </div>
                 )
               })}
            </div>

            {/* Footer Control Panel */}
            <div className="w-full h-12 mt-auto border-t border-white/5 flex items-center justify-between px-2 pt-2 opacity-30">
               <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-zinc-800 rounded-full" />)}
               </div>
               <div className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">SYSTEM_PATHWAY_STRATEGY_V3</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function SubPip({ active, label, href, setIsOpen, variant = "square" }: { active: boolean, label: string, href: string, setIsOpen: (o: boolean) => void, variant?: "square" | "pill" }) {
  return (
    <Link 
      href={href} 
      onClick={() => setIsOpen(false)}
      className={`transition-all duration-300 flex items-center justify-center border font-black italic tracking-tighter group/pip ${
        variant === "pill" ? "px-3 rounded-full" : "w-10 h-10 rounded-xl"
      } ${
        active 
          ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110 translate-y-[-2px]" 
          : "bg-white/5 border-white/10 text-zinc-500 hover:border-blue-500/50 hover:text-white"
      }`}
    >
      <span className={variant === "pill" ? "text-[8px] uppercase tracking-widest" : "text-[10px]"}>{label}</span>
      {active && variant === "square" && (
         <div className="absolute -top-1 right-0">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
         </div>
      )}
    </Link>
  );
}
