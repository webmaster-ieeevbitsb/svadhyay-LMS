"use client";

import { useState } from "react";
import { Rocket, Power, Loader2, CheckCircle2 } from "lucide-react";
import { togglePublishStatus } from "@/app/actions/courses";

interface DeploymentControlProps {
  courseId: string;
  isPublished: boolean;
}

export default function DeploymentControl({ courseId, isPublished: initialStatus }: DeploymentControlProps) {
  const [isPublished, setIsPublished] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    const result = await togglePublishStatus(courseId, isPublished);
    setIsPending(false);

    if (result.success) {
      setIsPublished(!isPublished);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert(result.error || "Failed to toggle deployment status.");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {showSuccess && (
        <div className="flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-right-4 duration-500">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">State Updated</span>
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest overflow-hidden ${
          isPublished 
            ? "bg-zinc-800 hover:bg-red-950/20 text-zinc-400 hover:text-red-500 border border-white/5 hover:border-red-500/30" 
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : isPublished ? (
          <Power className="w-4 h-4 text-current" />
        ) : (
          <Rocket className="w-4 h-4 text-current group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        )}
        
        <span>{isPublished ? "Undeploy Course" : "Deploy to Dashboard"}</span>
        
        {/* Shine effect for primary CTA */}
        {!isPublished && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        )}
      </button>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-700'} transition-all`} />
        <span className={`text-[10px] font-black uppercase tracking-wider ${isPublished ? 'text-white' : 'text-zinc-600'}`}>
          {isPublished ? "Live" : "Draft"}
        </span>
      </div>
    </div>
  );
}
