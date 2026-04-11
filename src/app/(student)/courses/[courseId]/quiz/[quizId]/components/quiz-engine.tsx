"use client";

import { useState, useTransition, useEffect } from "react";
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
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

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
  
  // Proctoring States
  const [isSecureModeStarted, setIsSecureModeStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationType, setViolationType] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

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

  const enterSecureMode = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }
      setIsSecureModeStarted(true);
      setIsFullscreen(true);
      setShowWarning(false);
      setCountdown(5);
    } catch (err) {
      toast.error("Fullscreen is required to start the assessment.");
    }
  };

  useEffect(() => {
    if (showWarning && !result) {
       document.body.style.overflow = "hidden";
    } else {
       document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showWarning, result]);

  useEffect(() => {
    if (!showWarning || !!result) {
      if (countdown !== 5) setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, result]);

  useEffect(() => {
    if (showWarning && countdown === 0 && !result) {
      router.push(`/courses/${courseId}`);
    }
  }, [countdown, showWarning, result, courseId, router]);

  useEffect(() => {
    if (!isSecureModeStarted || !!result) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWarning(true);
        setViolationType("TAB_SWITCH");
      }
    };

    const handleBlur = () => {
      setShowWarning(true);
      setViolationType("WINDOW_BLUR");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowWarning(true);
        setViolationType("FULLSCREEN_EXIT");
      } else {
        setIsFullscreen(true);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isSecureModeStarted, result]);

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
               <h2 className="text-4xl font-black uppercase tracking-tighter text-white font-mono">
                  Assessment <span className={result.isPassed ? 'text-green-500' : 'text-red-500'}>{result.isPassed ? 'Passed' : 'Failed'}</span>
               </h2>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Final Grading Protocol Complete</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-1">
               <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Accuracy Rate</div>
               <div className="text-4xl font-black tracking-tighter text-white leading-none pt-2">{result.score}%</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center space-y-1">
               <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Correct Answers</div>
               <div className="text-4xl font-black tracking-tighter text-blue-500 leading-none pt-2">{result.correctCount}/{result.totalCount}</div>
            </div>
         </div>

         <div className="space-y-4">
            {result.isPassed ? (
               <Link 
                 href="/dashboard"
                 className="flex items-center justify-center gap-3 w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all md:shadow-xl md:shadow-blue-600/20 active:scale-95 md:active:scale-100 touch-manipulation"
               >
                 Go to Dashboard <ArrowRight className="w-4 h-4" />
               </Link>
            ) : (
               <button 
                 onClick={() => setResult(null)}
                 className="flex items-center justify-center gap-3 w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 md:active:scale-100 touch-manipulation group"
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

  if (!isSecureModeStarted && !result) {
    return (
      <div className="max-w-xl mx-auto py-16 lg:py-24 text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
         <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none">Assessment Prep</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Review instructions before initiation</p>
         </div>

         <div className="grid grid-cols-1 gap-4 text-left max-w-md mx-auto">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
               <p className="text-zinc-400 text-xs font-medium leading-relaxed">The exam will <span className="text-white">lock into full-screen mode</span> to maintain a dedicated testing environment.</p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
               <p className="text-zinc-400 text-xs font-medium leading-relaxed">Switching tabs or minimizing the window will <span className="text-white">automatically pause</span> your session.</p>
            </div>
         </div>

         <div className="space-y-6 pt-4">
            <button 
               onClick={enterSecureMode}
               className="w-full py-6 bg-white text-black text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-zinc-200 active:scale-95 flex items-center justify-center gap-3 group"
            >
               Begin Examination <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link 
               href={`/courses/${courseId}`}
               className="block text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] transition-all"
            >
               Cancel & Return
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="relative">
       {/* Warning Overlay */}
       {showWarning && !result && (
         <div className="fixed inset-0 z-[200] bg-[#050507] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-[#0d0d12] border border-white/10 p-10 rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
               <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                  <AlertCircle className="w-10 h-10" />
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">Session Interrupted</h2>
                     <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">
                       {violationType === "TAB_SWITCH" ? "Active Tab Focus Lost" : violationType === "WINDOW_BLUR" ? "Browser Visibility Interrupted" : "Immersive Mode Exited"}
                     </p>
                  </div>
                  <p className="text-zinc-200 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                     Your assessment session has been paused to ensure environment integrity. Please return to the exam window to continue.
                  </p>
               </div>
               <div className="space-y-6">
                  <button 
                     onClick={enterSecureMode}
                     className="w-full py-5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:bg-zinc-200 active:scale-95"
                  >
                     Resume Assessment
                  </button>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center justify-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                     Redirecting to curriculum in <span className="text-red-500 font-mono text-xs">{countdown}s</span>
                  </div>
               </div>
            </div>
         </div>
       )}

    <div className={cn("max-w-4xl mx-auto space-y-12 transition-all duration-500", showWarning ? "blur-md pointer-events-none scale-95" : "")}>
       {/* Diagnostic HUD */}
       <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Question {currentIdx + 1} of {totalQuestions}</h2>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Assessment In Progress</h1>
             </div>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
             <div 
               className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 md:shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
               style={{ width: `${progress}%` }} 
             />
          </div>
       </div>

       {/* Evaluative Interface */}
       <div className="space-y-12 py-8 animate-in slide-in-from-right-4 duration-500">
          <h3 className="text-3xl font-bold tracking-tight text-white leading-snug max-w-3xl">
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
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isSelected ? 'text-blue-200/60' : 'text-zinc-600 group-hover:text-blue-500'}`}>
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
    </div>
  );
}
