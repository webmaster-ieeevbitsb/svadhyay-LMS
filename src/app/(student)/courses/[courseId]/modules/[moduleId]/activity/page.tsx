import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Lightbulb } from "lucide-react";
import { LearningPathwayHUD } from "../components/learning-pathway-hud";
import { ContentRenderer } from "@/components/ui/content-renderer";
import { ModuleContent } from "@/types/database";
import { getNextStepUrl } from "@/utils/nav-utils";

interface ActivityPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
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
  const activity = sc.activity_block;

  if (!activity || !activity.title) return notFound();

  return (
    <div className="flex flex-col bg-[#050508] relative min-h-screen">
      <LearningPathwayHUD courseId={courseId} moduleId={moduleId} allModules={allModules || []} structuredContent={sc} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pt-32 space-y-12 pb-64 relative z-10">
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Sub-module 1.{sc.drop_downs.length + 1}
          </div>
          <div className="flex items-center gap-4">
            <Lightbulb className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">{activity.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-blue-900/5 border border-blue-500/20 rounded-2xl p-8 md:p-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Instructional Tasks</h3>
            <ContentRenderer content={activity.instructions} className="text-lg text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Expected Learning Outcome</h3>
            <ContentRenderer content={activity.outcome_expected} className="text-lg text-blue-200" />
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex justify-end">
            <Link scroll={true} href={getNextStepUrl(courseId, moduleId, "activity", sc)} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-3">
               <span>Proceed back to References</span>
               <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
      </main>
    </div>
  );
}
