import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Play, Clock, Target, BookOpen } from "lucide-react";
import { LearningPathwayHUD } from "./components/learning-pathway-hud";
import { ContentRenderer } from "@/components/ui/content-renderer";
import { ModuleContent } from "@/types/database";
import { getNextStepUrl } from "@/utils/nav-utils";
import { EngagementTracker } from "@/components/progress/engagement-tracker";

interface ModulePageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  // Fetch current module and all modules for the HUD
  const [moduleResult, allModulesResult] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("modules").select("id, title, order_index").eq("course_id", courseId).order("order_index", { ascending: true })
  ]);

  const { data: module } = moduleResult;
  const { data: allModules } = allModulesResult;

  if (!module) return notFound();
  
  const sc = module.structured_content as ModuleContent;

  return (
    <div className="flex flex-col bg-[#050508] relative min-h-screen">
      <EngagementTracker courseId={courseId} moduleId={moduleId} />
      <LearningPathwayHUD courseId={courseId} moduleId={moduleId} allModules={allModules || []} />
      
      {/* 📡 Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,24,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,24,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_20%,transparent_100%)] pointer-events-none" />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12 pt-32 space-y-16 pb-64 relative z-10">
        
        {/* 1.0 CORE IDENTITY */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black tracking-[0.4em] text-blue-400">
                MODULE_PHASE_01.0
              </div>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">
                {module.title}
              </h1>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest pl-1">
                Foundational Intelligence & Core Concepts
              </p>
           </div>
        </div>

        {/* HUD Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 group hover:border-blue-500/30 transition-all">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Aspirational Objective</h4>
              {sc?.module_objective && <ContentRenderer content={sc.module_objective} className="text-sm font-bold text-white leading-relaxed" />}
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 group hover:border-blue-500/30 transition-all">
              <Clock className="w-5 h-5 text-blue-400" />
              <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Time Commitment</h4>
              <p className="text-lg font-black text-white italic">{sc?.duration_minutes || "30 to 35"} MINUTES</p>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 group hover:border-blue-500/30 transition-all">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Sub-module Depth</h4>
              <p className="text-lg font-black text-white italic">{sc?.drop_downs?.length || 0} CONCEPT SEGMENTS</p>
           </div>
        </div>

        {/* VIDEO DEPLOYMENT */}
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_#2563eb]">
                 <Play className="w-5 h-5 text-white fill-current translate-x-0.5" />
              </div>
              <div>
                 <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Strategic Video Brief</h2>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Watch carefully before entering sub-modules</p>
              </div>
           </div>

           <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
              {module.video_url ? (
                <iframe 
                  src={module.video_url}
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/50">
                   <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] animate-pulse">
                      CORE_VIDEO_FEED_OFFLINE
                   </div>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none border-[20px] border-white/[0.02] rounded-2xl" />
           </div>

           {sc?.intro_text && (
             <div className="p-8 bg-zinc-950/50 border border-white/5 rounded-2xl italic text-lg leading-relaxed text-zinc-400 border-l-4 border-l-blue-500 shadow-xl font-serif-content">
                <ContentRenderer content={sc.intro_text} />
             </div>
           )}
        </div>

        {/* PROGRESSION ANCHOR */}
        <div className="pt-12 border-t border-white/10 flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">SYSTEM_READY</div>
              <div className="w-px h-12 bg-gradient-to-b from-blue-500 to-transparent" />
           </div>
           
           <Link 
              scroll={true}
              href={getNextStepUrl(courseId, moduleId, "intro", sc)}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95 md:active:scale-100 group flex items-center gap-4"
           >
              <span>Initialize Module Content</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

      </main>
    </div>
  );
}
