import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

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

  // Very basic static render for now. Fully interactive client logic would be added here
  // to track states and submit the final score via a server action.

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12 pb-32">
       <Link href={`/courses/${courseId}`} className="group flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span>Return to Course</span>
       </Link>

       <div className="glass bg-blue-500/10 border-blue-500/20 p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Final Assessment Engine</span>
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {quiz.title}
            </h1>
         </div>
         <div className="text-right">
            <p className="text-sm font-mono text-zinc-300">Passing Score Required</p>
            <p className="text-2xl font-black text-blue-500">{quiz.passing_score_percentage}%</p>
         </div>
       </div>

       <div className="space-y-8">
         {quiz.quiz_questions?.map((q: any, idx: number) => (
           <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4">
             <h3 className="text-lg font-bold text-white tracking-wide">{idx + 1}. {q.question_text}</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {q.options?.map((opt: string, oIdx: number) => (
                 <button key={oIdx} className="w-full text-left p-4 rounded-lg border border-white/5 bg-black/40 hover:bg-white/10 transition-colors text-sm text-zinc-300 font-mono">
                   <span className="text-zinc-500 mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                   {opt}
                 </button>
               ))}
             </div>
           </div>
         ))}
       </div>

       <div className="pt-8 border-t border-white/10">
         <button className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-lg font-black italic uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20">
           Submit Assessment For Grading
         </button>
       </div>
    </div>
  );
}
