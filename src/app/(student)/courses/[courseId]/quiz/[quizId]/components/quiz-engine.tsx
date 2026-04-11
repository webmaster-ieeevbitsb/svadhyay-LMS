"use client";

import { useState, useTransition } from "react";
import { submitQuizAttempt } from "@/app/actions/quiz";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Trophy, 
  AlertCircle,
  RefreshCcw,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface QuizEngineProps {
  courseId: string;
  quizId: string;
  questions: any[];
  initialResult?: any;
}

export default function QuizEngine({ courseId, quizId, questions, initialResult }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(initialResult || null);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const progress = ((currentIdx + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIdx === totalQuestions - 1;

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
     if (Object.keys(answers).length < totalQuestions) {
        toast.error("Please answer all questions before submission.");
        return;
     }

     startTransition(async () => {
        const res = await submitQuizAttempt(courseId, quizId, answers);
        if (res.error) {
           toast.error(res.error);
        } else {
           setResult(res);
        }
     });
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-8 lg:py-16 space-y-8 animate-in zoom-in-95 duration-700">
         <div className="text-center space-y-6">
            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center p-1 border-2 ${result.isPassed ? 'border-green-500/30' : 'border-red-500/30'}`}>
               <div className={`w-full h-full rounded-full flex items-center justify-center ${result.isPassed ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.1)]'}`}>
                  {result.isPassed ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
               </div>
            </div>
            
            <div className="space-y-2">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white font-mono">
                  Assessment <span className={result.isPassed ? 'text-green-500' : 'text-red-500'}>{result.isPassed ? 'Passed' : 'Failed'}</span>
               </h2>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Final Grading Protocol Complete</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-1">
               <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Accuracy Rate</div>
               <div className="text-4xl font-black italic tracking-tighter text-white leading-none pt-2">{result.score}%</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-1">
               <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Correct Answers</div>
               <div className="text-4xl font-black italic tracking-tighter text-blue-500 leading-none pt-2">{result.correctCount}/{result.totalCount}</div>
            </div>
         </div>

         <div className="space-y-4">
            {result.isPassed ? (
               <Link 
                 href="/dashboard"
                 className="flex items-center justify-center gap-3 w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black italic uppercase tracking-widest rounded-2xl transition-all md:shadow-xl md:shadow-blue-600/20 active:scale-95 md:active:scale-100 touch-manipulation"
               >
                 Go to Dashboard <ArrowRight className="w-4 h-4" />
               </Link>
            ) : (
               <button 
                 onClick={() => setResult(null)}
                 className="flex items-center justify-center gap-3 w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-black italic uppercase tracking-widest rounded-2xl transition-all active:scale-95 md:active:scale-100 touch-manipulation group"
               >
                 <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" /> Retake Assessment
               </button>
            )}
            
            <Link 
              href={`/courses/${courseId}`}
              className="flex items-center justify-center gap-2 w-fit mx-auto text-[11px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-all hover:-translate-x-1 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" /> Back to course view
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
       {/* Diagnostic HUD */}
       <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="space-y-1">
             <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Question {currentIdx + 1} of {totalQuestions}</h2>
             <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Assessment In Progress</h1>
          </div>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
             <div 
               className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 md:shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
               style={{ width: `${progress}%` }} 
             />
          </div>
       </div>

       {/* Evaluative Interface */}
       <div className="space-y-12 py-8 animate-in slide-in-from-right-4 duration-500">
          <h3 className="text-3xl font-bold tracking-tight text-white leading-snug max-w-3xl italic">
            "{currentQuestion.question_text}"
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {currentQuestion.options.map((option: string, oidx: number) => {
               const isSelected = answers[currentQuestion.id] === option;
               return (
                 <button 
                   key={oidx}
                   onClick={() => handleSelectOption(currentQuestion.id, option)}
                   className={`p-8 text-left rounded-[2rem] border transition-all duration-300 relative group active:scale-95 md:active:scale-100 touch-manipulation overflow-hidden ${isSelected ? 'bg-blue-600 border-blue-500 md:shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-[#0d0d12] border-white/5 hover:border-blue-500/30'}`}
                 >
                    {isSelected && (
                       <div className="absolute top-0 right-0 p-4 animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 className="w-5 h-5 text-blue-200" />
                       </div>
                    )}
                    <span className={`text-[10px] font-black italic uppercase tracking-widest block mb-2 ${isSelected ? 'text-blue-200/60' : 'text-zinc-600 group-hover:text-blue-500'}`}>
                      Option {String.fromCharCode(65 + oidx)}
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {option}
                    </span>
                 </button>
               );
             })}
          </div>
       </div>

       {/* Operational Controls */}
       <div className="flex items-center justify-between pt-12 border-t border-white/5">
          <button 
            disabled={currentIdx === 0}
            onClick={handlePrevious}
            className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:pointer-events-none active:scale-95 md:active:scale-100 touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Question
          </button>

          {isLastQuestion ? (
            <button 
              disabled={isPending}
              onClick={handleSubmit}
              className="flex items-center gap-3 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all md:shadow-[0_0_40px_rgba(59,130,246,0.3)] active:scale-95 md:active:scale-100 disabled:opacity-50 touch-manipulation"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Trophy className="w-4 h-4" />}
              Submit Exam
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center gap-3 px-10 py-5 bg-[#0a0a0f] border border-blue-500/40 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all md:shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-95 md:active:scale-100 touch-manipulation"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          )}
       </div>
    </div>
  );
}
