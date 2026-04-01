import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Course } from "@/types/database";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/?error=unauthorized");
  }

  // Parallelize data fetching
  const [participantResult, coursesResult, progressResult] = await Promise.all([
    supabase
      .from("participants")
      .select("is_admin")
      .eq("email", user.email.toLowerCase())
      .single(),
    supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("student_progress")
      .select("course_id, is_completed, completed_modules")
      .eq("email", user.email.toLowerCase()),
  ]);

  // Server-side Debugging
  if (coursesResult.error) console.error("❌ COURSE_FETCH_ERROR:", coursesResult.error.message);
  if (participantResult.error) console.error("❌ PARTICIPANT_FETCH_ERROR:", participantResult.error.message);

  const participant = participantResult.data;
  const courses = coursesResult.data;
  const progress = progressResult.data;

  const isAdmin = !!participant?.is_admin;

  return (
    <div className="relative min-h-screen">
      
      {/* 💠 Dashboard Strategic Abstracts — Unmistakable tactical presence */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
        
        {/* Large Strategic HUD Brackets */}
        <div className="absolute top-1/4 right-[5%] w-64 h-64 border-t-2 border-r-2 border-blue-500/10 rounded-tr-[4rem]" />
        <div className="absolute bottom-1/4 left-[5%] w-64 h-64 border-b-2 border-l-2 border-blue-500/10 rounded-bl-[4rem]" />
        
        {/* Rotating Tactical Scanners */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/[0.02] rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[780px] border-t-2 border-b-2 border-blue-500/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        
        {/* High-Density Data Matrix */}
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#3b82f6_0.5px,transparent_0.5px)] bg-[size:32px_32px]" />
        
        {/* focal HUD Brackets */}
        <div className="absolute top-[20%] left-[10%] w-12 h-12 border-l-2 border-t-2 border-white/10" />
        <div className="absolute bottom-[20%] right-[10%] w-12 h-12 border-r-2 border-b-2 border-white/10" />

        {/* Global Floating HUD Circles */}
        <div className="absolute top-1/2 right-[5%] w-96 h-96 border border-white/[0.01] rounded-full animate-[spin_45s_linear_infinite]" />
        <div className="absolute top-1/2 right-[5%] w-[400px] h-[400px] border-l border-blue-500/[0.04] rounded-full animate-[spin_35s_linear_infinite_reverse]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-12 space-y-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 relative">
          <div className="absolute -top-6 left-0 flex items-center gap-3 text-blue-500/30 select-none">
            <div className="flex gap-1.5 items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-0.5 h-0.5 rounded-full bg-current ${i === 1 ? 'opacity-60 animate-pulse' : 'opacity-20'}`} />
              ))}
            </div>
            <div className="w-16 h-px bg-current opacity-20" />
            <div className="flex gap-1 pt-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-0.5 h-1.5 bg-current ${i % 2 === 0 ? 'opacity-40' : 'opacity-10'}`} />
              ))}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
            YOUR <span className="text-blue-500">CURRICULUM</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Select a module to begin your learning journey.</p>
        </div>

        {isAdmin && (
          <Link 
            href="/admin/courses" 
            className="group relative px-10 py-5 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex items-center justify-between w-full md:w-auto gap-4 hover:bg-blue-600/20 transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-blue-500/30 active:scale-95 group-hover:border-blue-500/60"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-2">
                Infrastructure
                <span className="flex gap-0.5">
                  <span className="w-1 h-2 bg-blue-500 animate-[pulse_1s_infinite]" />
                  <span className="w-1 h-2 bg-blue-500/40 animate-[pulse_1.5s_infinite]" />
                </span>
              </p>
              <div className="flex items-center gap-2">
                <p className="text-white font-black uppercase text-sm tracking-tighter">Enter Admin Portal</p>
                <div className="w-1 h-1 rounded-full bg-blue-500 group-hover:animate-ping" />
              </div>
            </div>
            <div className="ml-2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <span className="text-lg font-black leading-none pb-0.5">→</span>
            </div>
          </Link>
        )}
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.map((course: Course) => {
          const p = progress?.find(item => item.course_id === course.id);
          let statusText = "START COURSE";
          let statusColor = "text-blue-500";
          let statusBg = "bg-blue-600/10";
          let statusBorder = "border-blue-500/30";

          if (p?.is_completed) {
            statusText = "CERTIFIED";
            statusColor = "text-green-500";
            statusBg = "bg-green-600/10";
            statusBorder = "border-green-500/30";
          } else if (p && p.completed_modules?.length > 0) {
            statusText = "IN PROGRESS";
          }

          return (
            <Link 
              key={course.id} 
              href={`/courses/${course.id}`}
              className="w-full bg-[#0d0d12]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 shadow-2xl hover:border-blue-500/40 hover:shadow-blue-500/20 transition-all duration-500 flex flex-col group relative"
            >
              {/* Geometric Header Ornament */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-blue-500/40 rounded-full" />
                  <div className="h-px w-8 bg-white/5" />
                </div>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 border-t border-l border-white/10" />
                   <div className="w-1 h-1 border-b border-r border-white/10" />
                </div>
              </div>

              {course.thumbnail_url ? (
                <div className="h-48 overflow-hidden border-b border-white/5 relative">
                  <Image 
                    src={course.thumbnail_url} 
                    alt={course.title} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Subtle Gradient Over Thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent opacity-60" />
                  
                  {p?.is_completed && (
                    <div className="absolute top-4 right-4 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-20">
                       CERTIFIED
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-zinc-900/50 border-b border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
                  <BookOpen className="w-12 h-12 text-zinc-800 group-hover:text-blue-500/20 transition-colors" />
                  {p?.is_completed && (
                    <div className="absolute top-4 right-4 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-20">
                       CERTIFIED
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-8 flex-1 flex flex-col relative">
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 w-px h-2 bg-blue-500/40" />
                  <div className="absolute top-2 right-2 w-2 h-px bg-blue-500/40" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/[0.03]" />
                  <span className="text-[8px] font-mono text-blue-500/60 uppercase tracking-[0.2em]">Module Access</span>
                </div>

                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-4">
                  {course.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 flex-1 font-medium italic">
                  {course.description || "No description provided."}
                </p>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${statusColor} flex items-center gap-2`}>
                    <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    {statusText}
                  </div>
                  <div className={`w-10 h-10 ${statusBg} border ${statusBorder} flex items-center justify-center ${statusColor} rounded-full transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 shadow-lg group-hover:shadow-blue-500/40`}>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Inner highlight line at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/20 transition-all duration-700" />
            </Link>
          );
        })}
        
        {(!courses || courses.length === 0) && (
          <div className="col-span-full glass p-12 text-center border-dashed border-white/10">
            <p className="text-zinc-500 uppercase font-bold tracking-[0.2em]">
              No courses found
            </p>
            <p className="text-zinc-600 text-xs mt-2">
              Stay tuned - new high-tech curriculum is coming soon.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
