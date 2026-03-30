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
    const res = await markModuleComplete(courseId, moduleId);
    
    if (res.success) {
      if (nextModuleId) {
        router.push(`/courses/${courseId}/modules/${nextModuleId}`);
      } else {
        router.push(`/courses/${courseId}`);
      }
      router.refresh();
    } else {
      alert("Error marking complete: " + res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center py-12 border-t border-white/10 mt-16 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Phase Knowledge Consumed?</h3>
        <p className="text-zinc-500 text-sm font-medium">Mark this module as complete to track your progress and unlock the next phase.</p>
      </div>

      <button
        onClick={handleComplete}
        disabled={isLoading}
        className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black italic uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
        <span>{nextModuleId ? "Complete & Continue" : "Complete Module"}</span>
        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </button>
    </div>
  );
}
