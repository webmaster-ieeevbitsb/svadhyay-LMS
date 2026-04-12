import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { LearningPathwayHUD } from "../../components/learning-pathway-hud";
import { ContentRenderer } from "@/components/ui/content-renderer";
import { EngagementTracker } from "@/components/progress/engagement-tracker";
import { ModuleContent } from "@/types/database";
import { getNextStepUrl } from "@/utils/nav-utils";

interface ConceptPageProps {
  params: Promise<{ courseId: string; moduleId: string; id: string }>;
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { courseId, moduleId, id } = await params;
  const index = parseInt(id) - 1;
  const supabase = await createClient();

  const [moduleResult, allModulesResult] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("modules").select("id, title, order_index").eq("course_id", courseId).order("order_index", { ascending: true })
  ]);

  const { data: module } = moduleResult;
  const { data: allModules } = allModulesResult;

  if (!module || !module.structured_content) return notFound();
  const sc = module.structured_content as ModuleContent;
  const concept = sc.drop_downs[index];

  if (!concept) return notFound();

  // Navigation logic
  const nextStep = getNextStepUrl(courseId, moduleId, "concept", sc, index);

  return (
    <div className="flex flex-col bg-[#050508] relative min-h-screen">
      <EngagementTracker courseId={courseId} moduleId={moduleId} />
      <LearningPathwayHUD courseId={courseId} moduleId={moduleId} allModules={allModules || []} structuredContent={sc} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pt-32 space-y-12 pb-64 relative z-10">
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Sub-module 1.{index + 1}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">{concept.title}</h1>
        </div>

        {/* 🎬 CONCEPT_VIDEO_DEPLOYMENT (Optional) */}
        {(concept.video_url || concept.image_url) && (
           <div className="space-y-12">
              {concept.video_url && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group shadow-blue-500/10 transition-transform duration-500 hover:scale-[1.01]">
                   <iframe 
                     src={(() => {
                       try {
                         // Robustly handle YouTube URLs to ensure they are embed-formatted
                         let finalUrl = concept.video_url;
                         if (finalUrl.includes("watch?v=")) {
                           finalUrl = finalUrl.replace("watch?v=", "embed/");
                         } else if (finalUrl.includes("youtu.be/")) {
                           const id = finalUrl.split("/").pop();
                           finalUrl = `https://www.youtube.com/embed/${id}`;
                         }

                         const url = new URL(finalUrl);
                         if (concept.video_start_time) {
                           const val = concept.video_start_time.toString().trim();
                           let secs = 0;
                           if (val.includes(':')) {
                             const parts = val.split(':');
                             secs = parseInt(parts[0] || '0') * 60 + parseInt(parts[1] || '0');
                           } else {
                             secs = Math.round(parseFloat(val) * 60);
                           }
                           if (!isNaN(secs) && secs >= 0) {
                             url.searchParams.set("start", secs.toString());
                           }
                         }
                         // Ensure no cookies and clean embed
                         url.searchParams.set("rel", "0");
                         return url.toString();
                       } catch (e) {
                         return concept.video_url;
                       }
                     })()}
                     className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                     allowFullScreen
                   />
                   <div className="absolute inset-0 pointer-events-none border-[2px] border-white/[0.05] rounded-2xl shadow-inner" />
                </div>
              )}

              {concept.image_url && (
                <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/50 shadow-2xl relative group transition-all duration-500 hover:border-blue-500/30">
                   <img 
                      src={concept.image_url} 
                      alt={concept.title}
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 hover:scale-[1.02]"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              )}
           </div>
        )}

        <div className="grid grid-cols-1 gap-12">
          {/* Boilerplate Sections */}
          <Section label="What it is" content={concept.what_it_is} excludeImageUrl={concept.image_url ?? undefined} />
          <Section label="Why it matters" content={concept.why_it_matters} excludeImageUrl={concept.image_url ?? undefined} />
          <Section label="Example" content={concept.example} excludeImageUrl={concept.image_url ?? undefined} />
          <Section label="Common Mistake" content={concept.common_mistake} excludeImageUrl={concept.image_url ?? undefined} />
          <Section label="Try it" content={concept.try_it} excludeImageUrl={concept.image_url ?? undefined} />

          {/* Custom Sections */}
          {concept.custom_sections?.map((cs, i) => (
            <Section key={i} label={cs.heading} content={cs.content} excludeImageUrl={concept.image_url ?? undefined} />
          ))}
        </div>

        <div className="pt-12 border-t border-white/10 flex justify-between items-center">
            <Link href={`/courses/${courseId}/modules/${moduleId}`} className="text-zinc-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <ChevronLeft className="w-4 h-4" /> Overview
            </Link>
            <Link scroll={true} href={nextStep} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-3">
               <span>Proceed to Next Phase</span>
               <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ label, content, excludeImageUrl }: { label: string; content: string; excludeImageUrl?: string }) {
  if (!content) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] border-l-2 border-blue-500/30 pl-4">{label}</h3>
      <ContentRenderer content={content} className="text-lg text-zinc-300" excludeImageUrl={excludeImageUrl} />
    </div>
  );
}
