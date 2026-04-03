"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Award, ChevronRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface Question {
  question_text: string;
  correct_answer: boolean;
}

interface TacticalQuizProps {
  questions: Question[];
  nextModuleUrl?: string;
  courseUrl?: string;
  nextModuleOrderIndex?: number;
}

export function TacticalQuiz({ 
  questions, 
  nextModuleUrl, 
  courseUrl, 
  nextModuleOrderIndex 
}: TacticalQuizProps) {
  const [currentAnswers, setCurrentAnswers] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));
  const [feedback, setFeedback] = useState<( "correct" | "incorrect" | null)[]>(new Array(questions.length).fill(null));
  const [isMastered, setIsMastered] = useState(false);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const handleAnswer = (index: number, answer: boolean) => {
    const isCorrect = questions[index].correct_answer === answer;
    
    // Update answers state
    const newAnswers = [...currentAnswers];
    newAnswers[index] = answer;
    setCurrentAnswers(newAnswers);

    // Provide tactical feedback
    const newFeedback = [...feedback];
    newFeedback[index] = isCorrect ? "correct" : "incorrect";
    setFeedback(newFeedback);

    if (!isCorrect) {
      setShakeIndex(index);
      setTimeout(() => setShakeIndex(null), 500);
    }
  };

  useEffect(() => {
    const allCorrect = feedback.every(f => f === "correct");
    if (allCorrect && questions.length > 0) {
      setIsMastered(true);
    } else {
      setIsMastered(false);
    }
  }, [feedback, questions.length]);

  return (
    <div className="space-y-8">
      {/* 📊 MISSION_PROGRESS_HUD */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(feedback.filter(f => f === "correct").length / questions.length) * 100}%` }}
            className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]"
          />
        </div>
        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest tabular-nums">
          DECIPHERED: {feedback.filter(f => f === "correct").length}/{questions.length}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const status = feedback[idx];
          const isShaking = shakeIndex === idx;

          return (
            <motion.div 
              key={idx}
              animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "group relative bg-white/5 border rounded-2xl p-8 space-y-6 transition-all duration-500",
                status === "correct" ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.05)]" : 
                status === "incorrect" ? "border-red-500/30 bg-red-500/5" : "border-white/10"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-xl font-bold text-white uppercase tracking-tighter leading-tight italic">
                  <span className="text-zinc-600 mr-3 not-italic">0{idx + 1}</span> {q.question_text}
                </h4>
                <AnimatePresence>
                  {status === "correct" && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="shrink-0 text-emerald-500"
                    >
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-4">
                <AnswerButton 
                  label="TRUE" 
                  icon={<CheckCircle2 className="w-5 h-5" />} 
                  isActive={currentAnswers[idx] === true}
                  status={status}
                  isCorrectChoice={q.correct_answer === true}
                  onClick={() => handleAnswer(idx, true)}
                />
                <AnswerButton 
                  label="FALSE" 
                  icon={<XCircle className="w-5 h-5" />} 
                  isActive={currentAnswers[idx] === false}
                  status={status}
                  isCorrectChoice={q.correct_answer === false}
                  onClick={() => handleAnswer(idx, false)}
                />
              </div>

              {/* TACTICAL STATUS MARKER */}
              <div className="absolute top-2 right-4 text-[7px] font-black uppercase tracking-[0.4em] text-zinc-800">
                {status === "correct" ? "NODE_SECURED" : status === "incorrect" ? "UPLINK_DENIED" : "AWAITING_INPUT"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 🚀 TERMINAL_ACTION_BAR */}
      <div className="pt-12 border-t border-white/10">
        <AnimatePresence mode="wait">
          {isMastered ? (
            <motion.div 
              key="proceed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-end gap-4"
            >
              <div className="flex items-center gap-3 text-emerald-400 font-black italic uppercase text-[11px] tracking-widest animate-pulse">
                <Award className="w-5 h-5" />
                TACTICAL_MASTERY_ACHIEVED: MODULE_CONNECTION_DECRYPTED
              </div>
              {nextModuleUrl ? (
                <Link 
                  href={nextModuleUrl}
                  className="px-12 py-5 bg-blue-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 group flex items-center gap-4 border border-white/10"
                >
                   <span>Initialize Module {nextModuleOrderIndex} Link</span>
                   <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href={courseUrl || "#"}
                  className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase italic tracking-[0.3em] rounded-2xl transition-all group flex items-center gap-4"
                >
                   <span>Mission Accomplished: Overview</span>
                   <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key="placeholder"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex justify-end"
            >
              <div className="px-10 py-5 bg-white/5 border border-white/5 rounded-2xl text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4 cursor-not-allowed">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Validating Security Protocols...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnswerButton({ 
  label, 
  icon, 
  isActive, 
  status, 
  isCorrectChoice, 
  onClick 
}: { 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  status: "correct" | "incorrect" | null; 
  isCorrectChoice: boolean;
  onClick: () => void;
}) {
  const isSelectedCorrect = isActive && status === "correct";
  const isSelectedIncorrect = isActive && status === "incorrect";

  return (
    <button 
      onClick={onClick}
      disabled={status === "correct"}
      className={cn(
        "flex-1 p-5 border rounded-xl flex items-center gap-4 transition-all duration-300 group",
        isActive 
          ? isSelectedCorrect 
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
            : "bg-red-500/20 border-red-500 text-red-400"
          : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/20",
        status === "correct" && !isActive && "opacity-30 grayscale cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-6 h-6 flex items-center justify-center transition-transform",
        isActive ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}
