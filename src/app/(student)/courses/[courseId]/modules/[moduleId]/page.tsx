import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, BookOpen, ChevronRight, ChevronLeft, Lightbulb, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Accordion } from "@/components/ui/accordion";
import { StudentMiniQuiz } from "./components/student-mini-quiz";
import { LearningPathwayHUD } from "./components/learning-pathway-hud";
import MarkCompleteButton from "./components/mark-complete-button";
import { ModuleContent } from "@/types/database";

interface StudentModulePageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function StudentModulePage({ params }: StudentModulePageProps) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  const [moduleResult, allModulesResult] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .single(),
    supabase
      .from("modules")
      .select("id, title, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })
  ]);

  const { data: module, error: moduleError } = moduleResult;
  const { data: allModules } = allModulesResult;

  if (moduleError || !module) return notFound();

  const currentIndex = allModules?.findIndex(m => m.id === moduleId) ?? -1;
  const prevModule = currentIndex > 0 ? allModules?.[currentIndex - 1] : null;
  const nextModule = currentIndex < (allModules?.length ?? 0) - 1 ? allModules?.[currentIndex + 1] : null;

  const sc = module.structured_content as ModuleContent | null;

  return (
    <div className="flex flex-col bg-[#050508] selection:bg-blue-500/30 relative">
      
      {/* 💠 Tactical Abstracts — Main Background Depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
         {/* Floating HUD Brackets */}
         <div className="absolute top-1/4 right-80 w-32 h-32 border-r border-t border-blue-500/20" />
         <div className="absolute bottom-1/4 left-10 w-32 h-32 border-l border-b border-blue-500/20" />
         
         {/* Telemetry Dots — High Density */}
         {[...Array(12)].map((_, i) => (
           <div 
             key={i} 
             className="absolute w-1.5 h-1.5 bg-blue-500/30 rounded-full animate-pulse"
             style={{ 
               top: `${(i * 17) % 95}%`, 
               left: `${(i * 23) % 95}%`,
               animationDelay: `${i * 0.4}s`
             }}
           />
         ))}

         {/* Secondary Dot Grid Segment */}
         <div className="absolute top-1/2 left-1/4 w-40 h-40 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-0 bg-transparent relative z-10">
        <LearningPathwayHUD 
          courseId={courseId}
          moduleId={moduleId}
          allModules={allModules || []}
        />
        
        <div className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-16 pb-96 relative z-10">
          
          <div className="space-y-6">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Module 0{module.order_index}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase drop-shadow-lg">
              {module.title}
            </h1>
            
            {sc?.module_objective && (
              <p className="text-xl font-bold text-zinc-300 mt-4 leading-relaxed max-w-3xl">
                {sc.module_objective}
              </p>
            )}

            {sc?.duration_minutes && (
              <div className="inline-block mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest rounded-full">
                ⏱ {sc.duration_minutes}
              </div>
            )}
            
            {/* Module Intro */}
            {(sc?.intro_text || module.content_text) && (
              <div className="prose prose-invert prose-zinc max-w-none prose-lg leading-relaxed text-zinc-300 border-l-[3px] border-blue-500/30 pl-6 mt-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sc?.intro_text || module.content_text || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Top Video Emded — Tactical Monitor Frame */}
          <div className="space-y-6">
            {(sc?.video_title || sc?.video_description) && (
              <div className="space-y-2 border-l-2 border-blue-500/20 pl-6">
                <div className="flex items-center gap-2 mb-2 opacity-20">
                   <div className="w-2 h-2 border-t border-l border-zinc-500" />
                   <div className="w-8 h-px bg-zinc-500" />
                </div>
                {sc?.video_title && <h2 className="text-2xl font-black text-white uppercase tracking-tight">{sc.video_title}</h2>}
                {sc?.video_description && <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl italic">{sc.video_description}</p>}
              </div>
            )}
            
            <div className="relative group">
              {/* Tactical Monitor Ornaments */}
              <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-blue-500/30 rounded-tl-xl pointer-events-none z-20 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-blue-500/30 rounded-br-xl pointer-events-none z-20 group-hover:scale-110 transition-transform" />
              
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
                {module.video_url ? (
                  <iframe 
                    src={module.video_url.replace("watch?v=", "embed/")} 
                    className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-zinc-950/50 backdrop-blur-sm">
                    <PlayCircle className="w-16 h-16 text-zinc-800" />
                    <p className="text-zinc-600 uppercase text-xs font-bold tracking-widest">No primary video for this module</p>
                  </div>
                )}
                
                {/* Scanline Overlay Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,3px_100%] z-20 opacity-20" />
              </div>
              
              {/* Bottom Monitor Metadata */}
              <div className="mt-4 flex items-center justify-between px-2">
                 <div className="flex items-center gap-3 opacity-30">
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div className="w-12 h-px bg-zinc-800" />
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                 </div>
                 <div className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                    [ MOD_{currentIndex + 1} / {allModules?.length} ]
                 </div>
              </div>
            </div>
          </div>

          {/* Expandable Concept Dropdowns */}
          {sc?.drop_downs && sc.drop_downs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4">
                Core Concepts Exploration
              </h3>
              <div className="space-y-4">
                {sc.drop_downs.map((dd, idx) => (
                  <Accordion 
                    key={idx} 
                    title={dd.title} 
                    items={[
                      { label: "What it is", content: dd.what_it_is },
                      { label: "Why it matters", content: dd.why_it_matters },
                      { label: "Example", content: dd.example },
                      { label: "Common Mistake", content: dd.common_mistake },
                      { label: "Try it", content: dd.try_it },
                    ]} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Activity Block */}
          {sc?.activity_block && sc.activity_block.title && (
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-blue-900/10">
              <div className="flex items-center gap-3 border-b border-blue-500/20 pb-4">
                <Lightbulb className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">{sc.activity_block.title}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Instructional Tasks</h4>
                  <p className="text-white text-sm font-mono whitespace-pre-wrap">{sc.activity_block.instructions}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Expected Learning Outcome</h4>
                  <p className="text-blue-200 text-sm font-mono whitespace-pre-wrap">{sc.activity_block.outcome_expected}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mini Quiz */}
          {sc?.mini_quiz && sc.mini_quiz.questions.length > 0 && (
            <StudentMiniQuiz quiz={sc.mini_quiz} />
          )}

          {/* References */}
          {sc?.references && sc.references.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Further Reading & Credentials</h3>
              <ul className="space-y-3">
                {sc.references.map((ref, idx) => (
                  <li key={idx}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2 text-sm font-mono transition-all">
                       <span className="w-1 h-1 bg-blue-500 rounded-full" />
                       {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Tracking */}
          <MarkCompleteButton 
            courseId={courseId}
            moduleId={moduleId}
            nextModuleId={nextModule?.id}
          />

          {/* Navigation Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-12 border-t border-white/10 mt-20">
            {prevModule ? (
              <Link 
                href={`/courses/${courseId}/modules/${prevModule.id}`}
                className="group flex flex-col items-center md:items-start gap-2 w-full md:w-auto"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Previous Phase</span>
                <div className="flex items-center space-x-2 text-white font-bold group-hover:text-blue-500 transition-colors">
                   <ChevronLeft className="w-5 h-5 shrink-0" />
                   <span className="text-base md:text-lg text-center md:text-left">{prevModule.title}</span>
                </div>
              </Link>
            ) : <div className="hidden md:block" />}

            {nextModule ? (
              <Link 
                href={`/courses/${courseId}/modules/${nextModule.id}`}
                className="group flex flex-col items-center md:items-end gap-2 text-center md:text-right w-full md:w-auto"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Next Phase</span>
                <div className="flex items-center space-x-2 text-white font-bold group-hover:text-blue-500 transition-colors">
                   <span className="text-base md:text-lg text-center md:text-right">{nextModule.title}</span>
                   <ChevronRight className="w-5 h-5 shrink-0" />
                </div>
              </Link>
            ) : (
               <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right w-full md:w-auto">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Module Finalized</span>
                <Link href={`/courses/${courseId}`} className="text-blue-500 hover:text-white transition-colors flex items-center gap-2 font-black italic uppercase tracking-tighter text-xl">
                   <span>Back to Path</span>
                   <CheckCircle className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
