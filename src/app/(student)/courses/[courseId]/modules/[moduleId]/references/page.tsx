import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Bookmark } from "lucide-react";
import { LearningPathwayHUD } from "../components/learning-pathway-hud";
import { ModuleContent } from "@/types/database";

interface ReferencesPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function ReferencesPage({ params }: ReferencesPageProps) {
  const { courseId, moduleId } = await params;
  const supabase = await createClient();

  const [moduleResult, allModulesResult] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("modules").select("id, title, order_index").eq("course_id", courseId).order("order_index", { ascending: true })
  ]);

  const { data: module } = moduleResult;
  const { data: allModules } = allModulesResult;

  if (!module || !module.structured_content) return notFound();
  const sc = module.structured_content as ModuleContent;
  const references = sc.references;

  if (!references || references.length === 0) return notFound();

  return (
    <div className="flex flex-col bg-[#050508] relative min-h-screen">
      <LearningPathwayHUD courseId={courseId} moduleId={moduleId} allModules={allModules || []} structuredContent={sc} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pt-32 space-y-12 pb-64 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Bookmark className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase tracking-tighter">Further Reading</h1>
          </div>
        </div>

        <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          {references.map((ref, idx) => (
             <a  
                key={idx}
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col p-6 bg-zinc-950/50 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all space-y-2 hover:translate-x-1"
             >
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Resource {idx + 1}</span>
                <span className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{ref.title}</span>
                <span className="text-xs font-mono text-zinc-500 truncate">{ref.url}</span>
             </a>
          ))}
        </div>

        <div className="pt-12 border-t border-white/10 flex justify-end">
            <Link scroll={true} href={`/courses/${courseId}/modules/${moduleId}/quiz`} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-3">
               <span>Final Step: Sub-module Mini Quiz</span>
               <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
      </main>
    </div>
  );
}
