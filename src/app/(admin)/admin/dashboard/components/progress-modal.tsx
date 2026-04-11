"use client";

import { useState, useEffect } from "react";
import { fetchStudentProgress } from "@/app/actions/participants";
import { X, CheckCircle2, Loader2, Award, BookOpen, RotateCcw } from "lucide-react";
import { TacticalConfirm } from "@/components/ui/tactical-confirm";
import { resetStudentProgress } from "@/app/actions/progress";

export function ProgressModal({ email, isOpen, onClose }: { email: string, isOpen: boolean, onClose: () => void }) {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadProgress = async () => {
    setIsLoading(true);
    const data = await fetchStudentProgress(email);
    setProgressData(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && email) {
      loadProgress();
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <TacticalConfirm 
          isOpen={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setSelectedCourseId(null);
          }}
          onConfirm={async () => {
             if (!selectedCourseId) return;
             setIsResetting(true);
             const result = await resetStudentProgress(email, selectedCourseId);
             if (result.success) {
               await loadProgress();
             }
             setIsResetting(false);
             setIsConfirmOpen(false);
             setSelectedCourseId(null);
          }}
          title="Confirm Reset"
          description={`You are about to initiate a permanent deletion of progress records for ${email} in this course. This payload cannot be recovered.`}
          confirmText="Execute Reset"
          variant="danger"
        />

        {/* Background Decorative Blur */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-50 p-2"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Student Progress</h2>
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl w-fit">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <p className="text-sm font-mono text-blue-400 font-bold uppercase tracking-tight">{email}</p>
              </div>
            </div>
            {progressData.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Status</span>
                <span className="text-sm font-bold text-white uppercase italic bg-blue-600/20 px-4 py-1.5 border border-blue-500/30 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)]">Enrolled</span>
              </div>
            )}
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                 <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Querying Progress Metrics...</p>
              </div>
            ) : progressData.length === 0 ? (
              <div className="h-48 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
                <BookOpen className="w-12 h-12 text-zinc-800" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-600">No course activity recorded.</p>
              </div>
            ) : (
              progressData.map((p, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black uppercase text-white group-hover:text-blue-400 transition-colors tracking-tight">{p.courses?.title || "Unknown Course"}</h3>
                      <div className="flex flex-col items-end gap-2">
                        <span className={p.is_completed ? "text-green-400 font-black italic uppercase text-xs tracking-widest" : "text-blue-500 font-black italic uppercase text-xs tracking-widest"}>
                          {p.is_completed ? "Completed" : "In Progress"}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedCourseId(p.course_id);
                            setIsConfirmOpen(true);
                          }}
                          disabled={isResetting}
                          className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-3">
                       <Award className="w-4 h-4 text-blue-500" />
                       Completed Modules: <span className="text-white ml-2">{p.completed_modules?.length || 0}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                       {p.completed_module_titles?.length > 0 ? (
                         p.completed_module_titles.map((title: string, midx: number) => (
                           <div key={midx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 group-hover:border-blue-500/50 transition-all uppercase tracking-tighter">
                             <CheckCircle2 className="w-3 h-3" />
                             {title}
                           </div>
                         ))
                       ) : (
                         <p className="text-zinc-600 text-xs italic">Learning Journey Initiated...</p>
                       )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
