import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  FileQuestion, 
  Layers, 
  Clock,
  ChevronRight,
  Award
} from "lucide-react";
import { Course, Module, Quiz } from "@/types/database";
import Image from "next/image";

interface StudentCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { courseId } = await params;
  const supabase = await createClient();

  // 1. Fetch User
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email?.toLowerCase() || "";

  // 2. Parallelize data fetching
  const [courseResult, modulesResult, quizzesResult, progressResult] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single(),
    supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true }),
    supabase
      .from("quizzes")
      .select("*, quiz_questions(*)")
      .eq("course_id", courseId),
    supabase
      .from("student_progress")
      .select("is_completed, completed_modules")
      .eq("course_id", courseId)
      .eq("email", userEmail)
      .maybeSingle(),
  ]);

  const { data: course, error: courseError } = courseResult;
  const { data: modules } = modulesResult;
  const { data: quizzes } = quizzesResult;
  const { data: progress } = progressResult;

  if (courseError || !course) {
    return notFound();
  }

  const finalQuiz = quizzes && quizzes.length > 0 && quizzes[0].quiz_questions?.length > 0 ? quizzes[0] : null;
  const isCourseCompleted = progress?.is_completed || false;
  const completedModuleIds = progress?.completed_modules || [];


  const metadata = course.metadata || {};
  const goals = metadata.goals_list ? metadata.goals_list.split('\n').filter((g: string) => g.trim()) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 py-8 space-y-8 animate-in fade-in duration-700 pb-32">
      
      {/* Navigation & Course Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link 
          href="/dashboard" 
          className="group flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Curriculum</span>
        </Link>
        <div className="flex items-center gap-2 opacity-30 hidden md:flex">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
          <div className="w-8 h-px bg-blue-500/50" />
        </div>
      </div>

      {/* ── CLEAN MODERN HERO ─────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden px-8 md:px-12 py-10 md:py-14">

        {/* Abstract background overlays */}
        <div className="absolute inset-0 bg-[#0a0a0f] pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
        {/* Blue glow — top left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        {/* Purple glow — bottom right */}
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        {/* Thin border */}
        <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
        
        {/* L-Bracket Ornaments */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500/20 rounded-tl-lg pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500/20 rounded-br-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-16 lg:items-center">

          {/* LEFT: info */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Status tags */}
            <div className="flex flex-wrap gap-2">
              {isCourseCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[11px] font-bold text-green-400">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] font-bold text-blue-400">
                  <PlayCircle className="w-3 h-3" /> Enrolled
                </span>
              )}
              {finalQuiz && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-zinc-400">
                  <FileQuestion className="w-3 h-3" /> Assessment Included
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
              {course.description || "A focused learning module built to develop practical, real-world skills."}
            </p>

            {/* Inline stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                {modules?.length || 0} Modules
              </span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                {metadata.duration_text || "2–3 Hours"}
              </span>
              {finalQuiz && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-500" />
                    {finalQuiz.passing_score_percentage}% to pass
                  </span>
                </>
              )}
            </div>

            {/* Single CTA — Start Course only */}
            {modules && modules.length > 0 && (
              <div className="pt-1">
                <Link
                  href={`/courses/${courseId}/modules/${modules[0].id}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 active:scale-95"
                >
                  <PlayCircle className="w-4 h-4" />
                  {isCourseCompleted ? "Continue Learning" : "Start Course"}
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Thumbnail */}
          {course.thumbnail_url ? (
            <div className="lg:w-[45%] shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_50px_rgba(0,0,0,0.6)] group">
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-auto max-h-[320px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="lg:w-[45%] shrink-0">
              <div className="w-full h-52 rounded-2xl bg-white/[0.02] border border-dashed border-white/8 flex items-center justify-center">
                <Layers className="w-10 h-10 text-zinc-700" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />


      {/* ── OVERVIEW + GOALS ─────────────────────────────────────── */}
      <div className="space-y-8">
           {/* Overview */}
           <div className="space-y-3">
              <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
                 <span className="w-8 h-px bg-blue-500/30" />
                 Course Overview
              </h2>
              <div className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                 {metadata.overview || "Deep dive into the core concepts and practical applications of this specialized technology track."}
              </div>
           </div>

           {/* Goals */}
           {goals.length > 0 && (
             <div className="space-y-6">
                <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
                   <span className="w-8 h-px bg-blue-500/30" />
                   What you will learn
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {goals.map((goal: string, i: number) => (
                     <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{goal}</span>
                     </li>
                   ))}
                </ul>
             </div>
           )}
        </div>

      {/* Curriculum Architecture */}
      <div id="curriculum" className="space-y-8 pt-8 border-t border-white/5 relative">
        <div className="absolute -top-px left-0 w-32 h-px bg-blue-500/40" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-2 h-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="w-1 h-1 bg-blue-500/40 rounded-full" />
               ))}
               <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white shadow-none leading-none">
              Course <span className="text-blue-500">Curriculum</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 opacity-20 hidden md:flex mb-1">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="w-1 h-1 border border-zinc-500 rotate-45" />
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {modules?.map((m: Module, idx: number) => {
            const isCompleted = completedModuleIds.includes(m.id);
            return (
              <Link 
                key={m.id} 
                href={`/courses/${courseId}/modules/${m.id}`}
                className={`group flex items-center justify-between p-8 ${isCompleted ? 'bg-green-600/5 hover:bg-green-600/10 border-green-500/20 hover:border-green-500/40' : 'bg-[#0a0a0f] border-white/5 hover:border-blue-500/30 hover:bg-blue-600/[0.03]'} transition-all duration-300 rounded-2xl shadow-xl relative overflow-hidden`}
              >
                <div className="flex items-center gap-4 md:gap-8">
                  <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-2xl ${isCompleted ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-zinc-900 border-white/5 text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]'}  transition-all font-black italic text-lg md:text-xl pb-1`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : (idx + 1 < 10 ? `0${idx + 1}` : idx + 1)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black tracking-tight group-hover:translate-x-1 transition-transform uppercase ${isCompleted ? 'text-green-50' : 'text-white'}`}>
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">

                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 border-r border-white/10 pr-4">
                       <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                       Interactive Content
                    </div>
                    {m.structured_content?.duration_minutes && (
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic font-mono">
                        {m.structured_content.duration_minutes} Mins
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="hidden group-hover:block animate-in slide-in-from-right-2 duration-300">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Enter Module</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>
            );
          })}

          {finalQuiz && (
             <div 
               className={`group flex flex-col xl:flex-row xl:items-center justify-between p-6 md:p-10 gap-6 ${isCourseCompleted ? 'bg-green-600/10 border border-green-500/40' : 'bg-blue-600/5 border border-blue-500/30'} transition-all duration-500 rounded-[2.5rem] shadow-2xl relative overflow-hidden`}
             >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                    <FileQuestion className={`w-48 h-48 ${isCourseCompleted ? 'text-green-500' : 'text-blue-500'}`} />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 relative z-10 w-full">
                   <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 flex items-center justify-center rounded-full text-white shadow-lg ${isCourseCompleted ? 'bg-green-500 shadow-green-500/50' : 'bg-blue-600 shadow-blue-500/50'}`}>
                      {isCourseCompleted ? <CheckCircle2 className="w-8 h-8" /> : <FileQuestion className="w-8 h-8" />}
                   </div>
                   <div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${isCourseCompleted ? 'text-green-400' : 'text-blue-400'}`}>Final Assessment</div>
                      <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase leading-none shadow-none">
                        {isCourseCompleted ? "Assessment Certified" : "Certification Exam"}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                        {isCourseCompleted ? (
                           <>
                             <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                             Certification Achieved
                           </>
                        ) : (
                           <>
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             Passing Score: {finalQuiz.passing_score_percentage}%
                           </>
                        )}
                      </p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 relative z-10 w-full xl:w-auto xl:justify-end shrink-0">
                   {isCourseCompleted && (
                      <Link 
                        href={`/certificate/${courseId}`}
                        className="w-full text-center md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-all text-green-400 border border-green-400 bg-green-950 flex justify-center items-center gap-2"
                      >
                         <Award className="w-4 h-4" /> Download Certificate
                      </Link>
                   )}
                   <Link 
                     href={`/courses/${courseId}/quiz/${finalQuiz.id}`}
                     className={`w-full text-center md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex justify-center items-center ${isCourseCompleted ? 'bg-green-400 text-green-950' : 'bg-white text-black'}`}
                   >
                      {isCourseCompleted ? "View Result" : "Start Exam"}
                   </Link>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
