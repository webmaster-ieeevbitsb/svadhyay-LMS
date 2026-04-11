import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import QuizEngine from "./components/quiz-engine";

export default async function FinalQuizPage({
  params
}: {
  params: Promise<{ courseId: string; quizId: string }>
}) {
  const { courseId, quizId } = await params;
  const supabase = await createClient();

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(*)")
    .eq("id", quizId)
    .single();

  if (error || !quiz) {
    return notFound();
  }

  // Sort questions by order_index
  const sortedQuestions = (quiz.quiz_questions || []).sort((a: any, b: any) => a.order_index - b.order_index);

  // Check if they already passed
  const { data: { user } } = await supabase.auth.getUser();
  const { data: progress } = await supabase
    .from("student_progress")
    .select("is_completed")
    .eq("course_id", courseId)
    .eq("email", user?.email?.toLowerCase() || "")
    .single();

  const isCourseCompleted = progress?.is_completed || false;
  const initialResult = isCourseCompleted 
    ? { isPassed: true, score: 100, correctCount: sortedQuestions.length, totalCount: sortedQuestions.length }
    : null;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-32">
       <Link href={`/courses/${courseId}`} className="group flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span>Return to Course Architecture</span>
       </Link>

       <div className="glass bg-blue-500/5 border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_50px_rgba(59,130,246,0.05)] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-blue-500" />
         </div>
         
         <div className="relative z-10">
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" />
               <span>Final Assessment</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {quiz.title}
            </h1>
         </div>
         <div className="text-right relative z-10">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Authorization Criteria</p>
            <p className="text-3xl font-black text-blue-500 italic uppercase leading-none shadow-none">{quiz.passing_score_percentage}% Pass Rate</p>
         </div>
       </div>

       <div className="relative">
          <QuizEngine 
            courseId={courseId} 
            quizId={quizId} 
            questions={sortedQuestions} 
            initialResult={initialResult}
          />
       </div>
    </div>
  );
}
