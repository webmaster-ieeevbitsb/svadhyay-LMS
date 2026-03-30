"use client";

import { useState, useTransition } from "react";
import { updateQuizQuestion, addQuizQuestion, deleteQuizQuestion } from "@/app/actions/builder";
import { Loader2, Plus, Trash2, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function QuizEditor({ quiz, questions: initialQuestions }: { quiz: any, questions: any[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isPending, startTransition] = useTransition();
  const [savingIds, setSavingIds] = useState<string[]>([]);

  const handleAddQuestion = () => {
    startTransition(async () => {
      const res = await addQuizQuestion(quiz.id);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setQuestions([...questions, res.data]);
        toast.success("Question Architecture Allocated");
      }
    });
  };

  const handleUpdateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSaveQuestion = (q: any) => {
    setSavingIds(prev => [...prev, q.id]);
    startTransition(async () => {
      const res = await updateQuizQuestion(q.id, q);
      setSavingIds(prev => prev.filter(id => id !== q.id));
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Question Synchronized");
      }
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("Are you sure you want to deallocate this assessment node?")) return;
    startTransition(async () => {
      const res = await deleteQuizQuestion(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setQuestions(questions.filter(q => q.id !== id));
        toast.success("Node Deallocated");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
         <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Assessment <span className="text-blue-500">Editor</span></h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configure Final Certification Criteria</p>
         </div>
         <button 
           onClick={handleAddQuestion}
           disabled={isPending}
           className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center gap-2 group"
         >
           {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />}
           Add Question
         </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qidx) => {
          const isSaving = savingIds.includes(q.id);
          return (
            <div key={q.id} className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-8 lg:p-10 space-y-8 group/card hover:border-blue-500/20 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-6 flex-1">
                    <span className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-lg shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      {qidx + 1}
                    </span>
                    <input 
                      value={q.question_text}
                      onChange={(e) => handleUpdateQuestion(q.id, 'question_text', e.target.value)}
                      className="bg-transparent border-b border-white/5 px-2 py-3 text-white text-xl font-bold focus:outline-none focus:border-blue-500 transition-all w-full placeholder:text-zinc-800"
                      placeholder="Define the primary inquiry..."
                    />
                 </div>
                 <div className="flex items-center gap-3 ml-6">
                    <button 
                      onClick={() => handleSaveQuestion(q)}
                      disabled={isSaving}
                      className={`p-4 rounded-xl transition-all flex items-center justify-center ${isSaving ? 'bg-blue-600/20 text-blue-500' : 'bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white text-zinc-500'}`}
                      title="Save Node"
                    >
                      {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-4 bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-500 rounded-xl text-zinc-600 transition-all"
                      title="Deallocate Node"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                 {q.options?.map((opt: string, oidx: number) => (
                   <div key={oidx} className="flex items-center gap-4 p-5 bg-black/60 border border-white/5 rounded-2xl group/opt focus-within:border-blue-500/40 transition-all">
                      <button 
                        onClick={() => handleUpdateQuestion(q.id, 'correct_answer', opt)}
                        className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center shrink-0 ${q.correct_answer === opt ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'border-white/10 hover:border-white/20'}`}
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
                        className="bg-transparent text-base font-medium text-zinc-400 focus:text-white focus:outline-none w-full placeholder:text-zinc-700"
                        placeholder={`Parameter ${String.fromCharCode(65 + oidx)}`}
                      />
                   </div>
                 ))}
              </div>
            </div>
          );
        })}

        {questions.length === 0 && (
          <div className="p-24 border border-dashed border-white/5 rounded-[3rem] text-center bg-white/[0.01]">
             <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
             </div>
             <p className="text-zinc-600 uppercase font-black tracking-[0.4em] text-[10px]">No assessment nodes initialized</p>
             <p className="text-zinc-800 text-[10px] mt-2 font-bold uppercase tracking-widest">Protocol requires at least one evaluative parameter</p>
          </div>
        )}
      </div>
    </div>
  );
}
