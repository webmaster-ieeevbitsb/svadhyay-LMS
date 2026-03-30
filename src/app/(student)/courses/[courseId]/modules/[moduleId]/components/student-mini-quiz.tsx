"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface MiniQuizProps {
  quiz: {
    title: string;
    questions: Array<{
      question_text: string;
      correct_answer: boolean;
    }>;
  };
}

export function StudentMiniQuiz({ quiz }: MiniQuizProps) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (idx: number, answer: boolean) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  let score = 0;
  if (showResults) {
    score = quiz.questions.filter((q, idx) => answers[idx] === q.correct_answer).length;
  }

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-8 max-w-3xl space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-black italic uppercase text-yellow-500 tracking-tighter">{quiz.title}</h3>
        <p className="text-zinc-400 text-sm">Test your understanding before proceeding.</p>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCorrect = isAnswered && answers[idx] === q.correct_answer;
          
          return (
            <div key={idx} className="space-y-3 p-4 bg-black/40 rounded-xl border border-white/5">
              <p className="text-white font-medium">{idx + 1}. {q.question_text}</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleSelect(idx, true)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                    answers[idx] === true
                      ? showResults 
                        ? (isCorrect ? "bg-green-500/20 border-green-500/50 text-green-500" : "bg-red-500/20 border-red-500/50 text-red-500")
                        : "bg-blue-500 text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  } border border-transparent`}
                >
                  True
                </button>
                <button
                  onClick={() => handleSelect(idx, false)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                    answers[idx] === false
                      ? showResults 
                        ? (isCorrect ? "bg-green-500/20 border-green-500/50 text-green-500" : "bg-red-500/20 border-red-500/50 text-red-500")
                        : "bg-blue-500 text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  } border border-transparent`}
                >
                  False
                </button>
              </div>

              {showResults && answers[idx] !== undefined && (
                <div className="flex items-center gap-2 text-sm font-bold pt-2">
                  {isCorrect ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-green-500">Correct</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red-500" /><span className="text-red-500">Incorrect</span></>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults ? (
        <button
          onClick={checkAnswers}
          disabled={Object.keys(answers).length < quiz.questions.length}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-tighter rounded-xl disabled:opacity-50 transition-colors"
        >
          Check Concept Mastery
        </button>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
          <p className="text-white font-bold">
            Score: <span className="text-yellow-500">{score} / {quiz.questions.length}</span>
          </p>
          <button onClick={() => { setShowResults(false); setAnswers({}); }} className="mt-4 text-xs uppercase tracking-widest text-zinc-400 hover:text-white">
            Retry Quiz
          </button>
        </div>
      )}
    </div>
  );
}
