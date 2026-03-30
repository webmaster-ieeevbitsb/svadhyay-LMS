"use client";

import { useTransition } from "react";
import { createQuiz } from "@/app/actions/builder";
import { FileQuestion, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateQuizForm({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCreateQuiz = async () => {
    startTransition(async () => {
      const result = await createQuiz(courseId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Final Assessment architecture generated successfully!");
      }
    });
  };

  return (
    <button 
      onClick={handleCreateQuiz}
      disabled={isPending}
      className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] tracking-widest py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      ) : (
        <FileQuestion className="w-4 h-4" />
      )}
      <span>{isPending ? "Configuring Quiz..." : "Generate Final Quiz"}</span>
    </button>
  );
}
