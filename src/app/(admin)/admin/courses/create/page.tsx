"use client";

import { useActionState, useEffect } from "react";
import { createCourse } from "@/app/actions/courses";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

type ActionState = {
  success?: boolean;
  error?: string;
  courseId?: string;
};

const initialState: ActionState = {};

export default function CreateCoursePage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // React 19 native action state hook for server mutation without useEffect waterfalls
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      const result = await createCourse(formData);
      return result as ActionState;
    }, 
    initialState
  );

  useEffect(() => {
    if (state.success && state.courseId) {
      router.push(`/admin/courses/${state.courseId}`);
    }
  }, [state, router]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link 
          href="/admin/courses"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
          Initialize Course
        </h1>
      </div>

      <form action={formAction} className="glass p-8 flex flex-col space-y-6">
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-sm font-bold uppercase tracking-wider">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Course Title *
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full bg-zinc-950/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Advanced Cybersecurity Concepts"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full bg-zinc-950/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder="Brief overview of what students will learn..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block">
            Course Branding (Thumbnail)
          </label>
          <div className="flex flex-col md:flex-row gap-6 items-center bg-zinc-950/30 p-6 border border-white/5 rounded-2xl">
            <div className="w-full md:w-40 h-28 relative rounded-xl overflow-hidden border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-blue-500/50 transition-all group flex items-center justify-center shrink-0">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-700">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Select Image</span>
                </div>
              )}
              <input
                id="thumbnail_image"
                name="thumbnail_image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="flex-1 space-y-3 w-full">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight leading-relaxed">
                Upload a cover image or provide a hosted URL. <br/>
                <span className="text-blue-500/70">Recommended size: 1280x720px.</span>
              </p>
              <input
                id="thumbnail_url"
                name="thumbnail_url"
                type="url"
                onChange={(e) => setPreviewUrl(e.target.value)}
                className="w-full bg-zinc-950/50 border border-white/10 px-4 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                placeholder="Or paste external URL..."
              />
            </div>
          </div>
        </div>

        <button
          disabled={isPending}
          type="submit"
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white fill-current disabled:opacity-50 disabled:cursor-not-allowed py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
        >
          {isPending ? "Constructing Database Record..." : "Create Course Architecture"}
        </button>
      </form>
    </div>
  );
}
