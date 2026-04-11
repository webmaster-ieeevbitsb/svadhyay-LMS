import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ModuleEditorForm from "./components/module-editor-form";

export default async function ModuleEditorPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; moduleId: string }> 
}) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  const { data: module, error } = await supabase
    .from("modules")
    .select("*, courses(title)")
    .eq("id", moduleId)
    .single();

  if (error || !module) {
    redirect(`/admin/courses/${courseId}`);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center space-x-4 shrink-0">
        <Link 
          href={`/admin/courses/${courseId}`} 
          className="text-zinc-500 hover:text-white transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Architecture</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* We pass the initial data to a pure client component so we have live interaction capabilities */}
        <ModuleEditorForm 
          courseId={courseId} 
          moduleId={moduleId} 
          initialData={{
            title: module.title,
            content_text: module.content_text || "",
            video_url: module.video_url || "",
            image_url: module.image_url || "",
            structured_content: module.structured_content || null
          }} 
        />
      </div>
    </div>
  );
}
