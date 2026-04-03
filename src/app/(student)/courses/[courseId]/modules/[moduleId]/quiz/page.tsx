import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Award, CheckCircle2, XCircle } from "lucide-react";
import { LearningPathwayHUD } from "../components/learning-pathway-hud";
import { ModuleContent } from "@/types/database";

interface QuizPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  const [moduleResult, allModulesResult] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("modules").select("id, title, order_index").eq("course_id", courseId).order("order_index", { ascending: true })
  ]);

  const { data: module } = moduleResult;
  const { data: allModules } = allModulesResult;

  if (!module || !module.structured_content) return notFound();
  const sc = module.structured_content as ModuleContent;
  const quiz = sc.mini_quiz;

  if (!quiz || quiz.questions.length === 0) return notFound();

  // Next module logic
  const currentIndex = allModules?.findIndex(m => m.id === moduleId) ?? -1;
  const nextModule = allModules ? allModules[currentIndex + 1] : null;

  return (
    <div className="flex flex-col bg-[#050508] relative min-h-screen">
      <LearningPathwayHUD courseId={courseId} moduleId={moduleId} allModules={allModules || []} structuredContent={sc} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pt-32 space-y-12 pb-64 relative z-10">
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Sub-module 1.{sc.drop_downs.length + 3}
          </div>
          <div className="flex items-center gap-4">
            <Award className="w-10 h-10 text-yellow-500 group-hover:scale-110 transition-transform" />
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase tracking-tighter">{quiz.title}</h1>
          </div>
        </div>

        {/* 
           Quiz questions here. Since it's a server component, 
           we'll render the static questions and use a small client logic
           for interactive feedback if necessary. For now, 
           I'll keep it as a tactical "Knowledge Check" view.
        */}
        <div className="space-y-6">
           {quiz.questions.map((q, idx) => (
             <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                <h4 className="text-xl font-bold text-white uppercase tracking-tighter leading-tight italic">
                   {idx + 1}. {q.question_text}
                </h4>
                <div className="flex gap-4">
                   <div className="flex-1 p-4 bg-zinc-950/50 border border-white/5 rounded-xl flex items-center gap-3 text-zinc-500 hover:text-white transition-all cursor-pointer hover:border-blue-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">TRUE</span>
                   </div>
                   <div className="flex-1 p-4 bg-zinc-950/50 border border-white/5 rounded-xl flex items-center gap-3 text-zinc-500 hover:text-white transition-all cursor-pointer hover:border-red-500/30">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-widest">FALSE</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="pt-12 border-t border-white/10 flex justify-end">
            {nextModule ? (
                <Link scroll={true} href={`/courses/${courseId}/modules/${nextModule.id}`} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-3 group">
                   <span>Proceed to Module {nextModule.order_index}</span>
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <Link scroll={true} href={`/courses/${courseId}`} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all flex items-center gap-3">
                   <span>Course Completed: Back to Summary</span>
                   <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
      </main>
    </div>
  );
}
