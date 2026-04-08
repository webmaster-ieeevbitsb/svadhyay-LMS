"use client";

import { useState } from "react";
import { markModuleComplete } from "@/app/actions/courses";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MarkCompleteButtonProps {
  courseId: string;
  moduleId: string;
  nextModuleId?: string;
}

export default function MarkCompleteButton({ 
  courseId, 
  moduleId, 
  nextModuleId 
}: MarkCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Determine target URL for immediate navigation
    const targetUrl = nextModuleId 
      ? `/courses/${courseId}/modules/${nextModuleId}` 
      : `/courses/${courseId}`;

    // Start the server action in the background
    markModuleComplete(courseId, moduleId).then((res) => {
      if (!res.success) {
        console.error("Background sync failed:", res.error);
      }
      // Refresh to ensure server-side state is updated
      router.refresh();
    }).catch(err => {
      console.error("Critical background error:", err);
    });

    // Navigate immediately (Optimistic UI)
    router.push(targetUrl);
  };

  return (
    <div className="flex flex-col items-center py-12 border-t border-white/10 mt-16 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Achieve Completion</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Synchronize progress to unlock the next module phase.</p>
      </div>

      <button
        onClick={handleComplete}
        disabled={isLoading}
        className="group relative px-14 py-6 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-white rounded-[1.5rem] font-black italic uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_40px_rgba(59,130,246,0.1)] active:scale-95 md:active:scale-100 flex items-center gap-4 disabled:opacity-50 group-hover:border-blue-500/60"
      >
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
        
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        ) : (
          <div className="relative">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <div className="absolute inset-0 bg-blue-500 blur-sm opacity-40 animate-pulse" />
          </div>
        )}
        <span className="relative z-10">{nextModuleId ? "Commit & Advance" : "Finalize Module"}</span>
        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
        
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </button>
    </div>
  );
}
