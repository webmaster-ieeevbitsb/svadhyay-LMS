"use client";

import { useState, useTransition } from "react";
import { rotateStudentCohort } from "@/app/actions/participants";
import { 
  Users, 
  RefreshCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2,
  AlertTriangle,
  History
} from "lucide-react";
import { toast } from "sonner";

export default function CohortRotator({ participantCount }: { participantCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRotate = () => {
    startTransition(async () => {
      const res = await rotateStudentCohort();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Done — ${res.count} student accounts cleared.`);
        setShowConfirm(false);
      }
    });
  };

  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
       {/* Background HUD Decor */}
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <History className="w-32 h-32 text-blue-500" />
       </div>

       <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>New Batch</span>
             </div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Reset <span className="text-blue-500">Students</span></h3>
          </div>
          <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{participantCount} Enrolled</span>
          </div>
       </div>

       <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-md relative z-10">
          Clears all enrolled students and their progress to start a fresh batch. <span className="text-white font-bold">Admin accounts will not be affected.</span>
       </p>

       <div className="pt-4 relative z-10">
          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group/btn"
            >
              <RefreshCcw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
              Reset Student Batch
            </button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest leading-tight">
                     This cannot be undone. All student accounts and progress will be permanently deleted.
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    disabled={isPending}
                    onClick={handleRotate}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Yes, Reset Students
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="px-6 py-4 bg-white/5 text-zinc-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
