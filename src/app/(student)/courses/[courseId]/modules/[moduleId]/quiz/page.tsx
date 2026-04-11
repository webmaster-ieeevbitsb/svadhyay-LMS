import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Award, CheckCircle2, XCircle } from "lucide-react";
import { LearningPathwayHUD } from "../components/learning-pathway-hud";
import { ModuleContent } from "@/types/database";
import { TacticalQuiz } from "./components/tactical-quiz";

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
           <TacticalQuiz 
             questions={quiz.questions} 
             courseId={courseId}
             moduleId={moduleId}
             nextModuleUrl={nextModule ? `/courses/${courseId}/modules/${nextModule.id}` : undefined}
             courseUrl={`/courses/${courseId}`}
             nextModuleOrderIndex={nextModule?.order_index}
           />
        </div>

      </main>
    </div>
  );
}
