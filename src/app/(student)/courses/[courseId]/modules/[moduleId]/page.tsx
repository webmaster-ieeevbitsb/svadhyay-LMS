import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, BookOpen, ChevronRight, ChevronLeft, Lightbulb, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Accordion } from "@/components/ui/accordion";
import { StudentMiniQuiz } from "./components/student-mini-quiz";
import MarkCompleteButton from "./components/mark-complete-button";
import { ModuleContent } from "@/types/database";

interface StudentModulePageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function StudentModulePage({ params }: StudentModulePageProps) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  const { data: module, error: moduleError } = await supabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (moduleError || !module) return notFound();

  const { data: allModules } = await supabase
    .from("modules")
    .select("id, title, order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  const currentIndex = allModules?.findIndex(m => m.id === moduleId) ?? -1;
  const prevModule = currentIndex > 0 ? allModules?.[currentIndex - 1] : null;
  const nextModule = currentIndex < (allModules?.length ?? 0) - 1 ? allModules?.[currentIndex + 1] : null;

  const sc = module.structured_content as ModuleContent | null;

  return (
    <div className="flex bg-[#050508] min-h-[calc(100vh-80px)] selection:bg-blue-500/30">
      
      {/* LEFT SIDEBAR - COURSE OUTLINE (AWS Skill Builder style) */}
      <aside className="w-80 hidden lg:flex flex-col border-r border-white/10 bg-[#0a0a0f] shrink-0 sticky top-0 h-[calc(100vh-80px)]">
        <div className="p-6 border-b border-white/5 space-y-4">
          <Link href={`/courses/${courseId}`} className="group flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Outline</span>
          </Link>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Course Curriculum</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {allModules?.map((m) => {
            const isActive = m.id === moduleId;
            return (
              <Link 
                key={m.id}
                href={`/courses/${courseId}/modules/${m.id}`}
                className={`flex gap-3 items-start p-4 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? "bg-blue-500/10 border-blue-500/40 text-white" 
                    : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <div className={`mt-0.5 flex items-center justify-center rounded-full w-5 h-5 shrink-0 border text-[8px] font-bold ${isActive ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent border-zinc-600'}`}>
                  {m.order_index}
                </div>
                <div className="flex-1">
                   <h3 className={`text-sm font-bold leading-snug ${isActive ? 'text-white' : 'text-zinc-400'}`}>{m.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#050508] relative">
        <div className="max-w-4xl mx-auto w-full p-6 md:p-12 space-y-16 pb-32">
          
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

          {/* Top Video Emded */}
          <div className="space-y-6">
            {(sc?.video_title || sc?.video_description) && (
              <div className="space-y-2">
                {sc?.video_title && <h2 className="text-2xl font-black text-white">{sc.video_title}</h2>}
                {sc?.video_description && <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">{sc.video_description}</p>}
              </div>
            )}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl">
              {module.video_url ? (
                <iframe 
                  src={module.video_url.replace("watch?v=", "embed/")} 
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-zinc-950/50 backdrop-blur-sm">
                  <PlayCircle className="w-16 h-16 text-zinc-800" />
                  <p className="text-zinc-600 uppercase text-xs font-bold tracking-widest">No primary video for this module</p>
                </div>
              )}
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
          <div className="flex items-center justify-between pt-12 border-t border-white/10 mt-20">
            {prevModule ? (
              <Link 
                href={`/courses/${courseId}/modules/${prevModule.id}`}
                className="group flex flex-col items-start gap-2"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Previous Phase</span>
                <div className="flex items-center space-x-2 text-white font-bold group-hover:text-blue-500 transition-colors">
                   <ChevronLeft className="w-5 h-5" />
                   <span className="text-lg">{prevModule.title}</span>
                </div>
              </Link>
            ) : <div />}

            {nextModule ? (
              <Link 
                href={`/courses/${courseId}/modules/${nextModule.id}`}
                className="group flex flex-col items-end gap-2 text-right"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Next Phase</span>
                <div className="flex items-center space-x-2 text-white font-bold group-hover:text-blue-500 transition-colors">
                   <span className="text-lg">{nextModule.title}</span>
                   <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ) : (
               <div className="flex flex-col items-end gap-2 text-right">
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
