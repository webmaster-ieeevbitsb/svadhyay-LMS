"use client";

import { useState, useTransition } from "react";
import { updateQuizQuestion, addQuizQuestion, deleteQuizQuestion } from "@/app/actions/builder";
import { Loader2, Plus, Trash2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function QuizEditor({ quiz, questions: initialQuestions }: { quiz: any, questions: any[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isPending, startTransition] = useTransition();

  const handleAddQuestion = () => {
    startTransition(async () => {
      const res = await addQuizQuestion(quiz.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Question Added");
        // We refreshing the page is better to get the new ID from DB
        window.location.reload();
      }
    });
  };

  const handleUpdateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSaveQuestion = (q: any) => {
    startTransition(async () => {
      const res = await updateQuizQuestion(q.id, q);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Question Synchronized");
      }
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("Delete this question?")) return;
    startTransition(async () => {
      const res = await deleteQuizQuestion(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setQuestions(questions.filter(q => q.id !== id));
        toast.success("Question Removed");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
         <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Assessment <span className="text-blue-500">Editor</span></h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Configure Final Certification Criteria</p>
         </div>
         <button 
           onClick={handleAddQuestion}
           disabled={isPending}
           className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
         >
           {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
           Add Question
         </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qidx) => (
          <div key={q.id} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 lg:p-10 space-y-8 group hover:border-blue-500/20 transition-all">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-sm shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    {qidx + 1}
                  </span>
                  <input 
                    value={q.question_text}
                    onChange={(e) => handleUpdateQuestion(q.id, 'question_text', e.target.value)}
                    className="bg-transparent border-b border-white/10 px-4 py-2 text-white text-lg font-bold focus:outline-none focus:border-blue-500 transition-all w-full max-w-xl"
                    placeholder="Enter question text..."
                  />
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSaveQuestion(q)}
                    className="p-3 bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white rounded-xl text-zinc-500 transition-all"
                    title="Save Changes"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-3 bg-white/5 border border-white/5 hover:bg-red-500 hover:text-white rounded-xl text-zinc-500 transition-all"
                    title="Delete Question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {q.options?.map((opt: string, oidx: number) => (
                 <div key={oidx} className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl group/opt focus-within:border-blue-500/30 transition-all">
                    <button 
                      onClick={() => handleUpdateQuestion(q.id, 'correct_answer', opt)}
                      className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${q.correct_answer === opt ? 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'}`}
                    >
                       {q.correct_answer === opt && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                    <input 
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[oidx] = e.target.value;
                        handleUpdateQuestion(q.id, 'options', newOpts);
                      }}
                      className="bg-transparent text-sm text-zinc-300 focus:outline-none w-full"
                      placeholder={`Option ${String.fromCharCode(65 + oidx)}`}
                    />
                 </div>
               ))}
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="p-20 border border-dashed border-white/5 rounded-[3rem] text-center bg-white/[0.01]">
             <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
             <p className="text-zinc-600 uppercase font-black tracking-[0.3em] text-[10px]">No questions defined in assessment architecture.</p>
          </div>
        )}
      </div>
    </div>
  );
}
