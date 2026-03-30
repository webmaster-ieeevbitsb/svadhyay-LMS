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

interface StudentCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { courseId } = await params;
  const supabase = await createClient();

  // 1. Fetch Course details
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return notFound();
  }

  // 2. Fetch Modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  // 3. Fetch Quiz with its questions
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(*)")
    .eq("course_id", courseId);

  const finalQuiz = quizzes && quizzes.length > 0 && quizzes[0].quiz_questions?.length > 0 ? quizzes[0] : null;

  // 4. Fetch Progress State
  const { data: { user } } = await supabase.auth.getUser();
  const { data: progress } = await supabase
    .from("student_progress")
    .select("is_completed, completed_modules")
    .eq("course_id", courseId)
    .eq("email", user?.email?.toLowerCase() || "")
    .single();

  const isCourseCompleted = progress?.is_completed || false;
  const completedModuleIds = progress?.completed_modules || [];


  const metadata = course.metadata || {};
  const goals = metadata.goals_list ? metadata.goals_list.split('\n').filter((g: string) => g.trim()) : [];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 space-y-16 animate-in fade-in duration-700 pb-32">
      
      {/* Navigation */}
      <Link 
        href="/dashboard" 
        className="group flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Curriculum</span>
      </Link>

      {/* Tactical HUD Hero Section */}
      <div className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden">
        {/* Background Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Course Core Identity */}
        <div className="relative z-20 text-center mb-16 space-y-6">
           <div className="inline-flex items-center space-x-3 bg-blue-500/5 border border-blue-500/20 px-6 py-2 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Live Now</span>
           </div>
           
           <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
             {course.title}
           </h1>
           
           <p className="text-zinc-500 text-sm md:text-base font-bold max-w-2xl mx-auto uppercase tracking-widest opacity-80">
             {course.description || "Initializing high-performance learning module..."}
           </p>
        </div>

        {/* The Digital Artifact (Image Container) */}
        {course.thumbnail_url && (
          <div className="relative group p-4 md:p-8">
             {/* Animated HUD Corners */}
             <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-blue-500/40 rounded-tl-3xl transition-all duration-700 group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2" />
             <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-blue-500/40 rounded-br-3xl transition-all duration-700 group-hover:scale-110 group-hover:translate-x-2 group-hover:translate-y-2" />
             
             {/* Main Image Artifact */}
             <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] bg-black/40 backdrop-blur-md">
                <img 
                  src={course.thumbnail_url} 
                  alt="" 
                  className="w-full max-w-4xl h-auto md:h-[450px] object-contain relative z-10 transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Scanline Animation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-20" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_15px_blue] animate-[scan_4s_linear_infinite] z-30" />
             </div>

             {/* Dynamic Telemetry Tags */}
             <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="flex flex-col gap-4 text-[8px] font-mono text-blue-500/60 uppercase [writing-mode:vertical-rl] tracking-[0.3em]">
                   <span>COURSE :: {course.title.toUpperCase()}</span>
                   <span className="h-12 w-px bg-blue-500/20 self-center" />
                   <span>PORTAL // IDENTITY_VERIFIED</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Course Intel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Overview and Goals */}
        <div className="lg:col-span-8 space-y-12">
           {/* Overview */}
           <div className="space-y-6">
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

        {/* Right Column: Duration and Stats */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-6">
           <div className="glass p-8 bg-white/[0.02] border-white/5 rounded-3xl space-y-6">
              <div className="flex flex-col gap-2">
                 <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estimated Duration</div>
                 <div className="flex items-center gap-3 text-white text-xl font-bold italic tracking-tight">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>{metadata.duration_text || "2 - 3 Hours"}</span>
                 </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Modules</span>
                   <span className="text-white text-xl font-bold">{modules?.length || 0} Blocks</span>
                 </div>
                 <div className="flex flex-col text-right">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assessment</span>
                   <span className="text-blue-500 text-sm font-black uppercase italic">{finalQuiz ? "Required" : "Not Set"}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Curriculum Architecture */}
      <div className="space-y-8 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white shadow-none">
            Course <span className="text-blue-500">Curriculum</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {modules?.map((m: Module, idx: number) => {
            const isCompleted = completedModuleIds.includes(m.id);
            return (
              <Link 
                key={m.id} 
                href={`/courses/${courseId}/modules/${m.id}`}
                className={`group flex items-center justify-between p-8 ${isCompleted ? 'bg-green-600/5 hover:bg-green-600/10 border-green-500/20 hover:border-green-500/40' : 'bg-[#0d0d12]/50 border-white/5 hover:border-blue-500/30 hover:bg-blue-600/[0.03]'} transition-all duration-300 rounded-[2rem] shadow-xl`}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${isCompleted ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-zinc-900 border-white/5 text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]'}  transition-all font-black italic text-xl pb-1`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : (idx + 1 < 10 ? `0${idx + 1}` : idx + 1)}
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
               className={`group flex flex-col md:flex-row md:items-center justify-between p-10 gap-6 ${isCourseCompleted ? 'bg-green-600/10 border border-green-500/40' : 'bg-blue-600/5 border border-blue-500/30'} transition-all duration-500 rounded-[2.5rem] shadow-2xl relative overflow-hidden`}
             >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                    <FileQuestion className={`w-48 h-48 ${isCourseCompleted ? 'text-green-500' : 'text-blue-500'}`} />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10 w-full">
                   <div className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg ${isCourseCompleted ? 'bg-green-500 shadow-green-500/50' : 'bg-blue-600 shadow-blue-500/50'}`}>
                      {isCourseCompleted ? <CheckCircle2 className="w-8 h-8" /> : <FileQuestion className="w-8 h-8" />}
                   </div>
                   <div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${isCourseCompleted ? 'text-green-400' : 'text-blue-400'}`}>Final Assessment</div>
                      <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none shadow-none">
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

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto md:justify-end shrink-0">
                   {isCourseCompleted && (
                      <Link 
                        href={`/certificate/${courseId}`}
                        className="w-full text-center sm:w-auto px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-all text-green-400 border border-green-400 bg-green-950 flex justify-center items-center gap-2"
                      >
                         <Award className="w-4 h-4" /> Download Certificate
                      </Link>
                   )}
                   <Link 
                     href={`/courses/${courseId}/quiz/${finalQuiz.id}`}
                     className={`w-full text-center sm:w-auto px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex justify-center items-center ${isCourseCompleted ? 'bg-green-400 text-green-950' : 'bg-white text-black'}`}
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
