"use client";

import { useActionState, useEffect } from "react";
import { addModuleToCourse } from "@/app/actions/builder";
import { Loader2, Plus } from "lucide-react";

export default function CreateModuleForm({ courseId }: { courseId: string }) {
  // Bind the courseId to the server action so it always posts to the right course
  const addModuleWithCourseId = addModuleToCourse.bind(null, courseId);
  const [state, formAction, isPending] = useActionState(addModuleWithCourseId, {} as any);

  // We want to clear the form input when successful so they can add N modules rapidly
  useEffect(() => {
    if (state?.success) {
      const form = document.getElementById("module-quick-form") as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state]);

  return (
    <form id="module-quick-form" action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 text-[10px] uppercase font-bold tracking-widest text-center">
          {state.error}
        </div>
      )}

      <div>
        <input
          name="title"
          type="text"
          placeholder="e.g. Setting up the Development Environment"
          className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          disabled={isPending}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Generate Module</span>
          </>
        )}
      </button>
    </form>
  );
}
