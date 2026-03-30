import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Course } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/?error=unauthorized");
  }

  const email = user.email.toLowerCase();
  const isHardcodedAdmin = email === "22p61a0480@vbithyd.ac.in";

  // To check if they are admin to show a link to the admin panel
  const { data: participant } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", email)
    .single();

  const isAdmin = isHardcodedAdmin || participant?.is_admin;

  // Fetch all courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
            YOUR <span className="text-blue-500">CURRICULUM</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Select a module to begin your learning journey.</p>
        </div>

        {isAdmin && (
          <Link 
            href="/admin/courses" 
            className="group relative px-10 py-5 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex items-center gap-4 hover:bg-blue-600/20 transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-blue-500/30 active:scale-95 group-hover:border-blue-500/60"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1.5">Infrastructure</p>
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
        {courses?.map((course: Course) => (
          <Link 
            key={course.id} 
            href={`/courses/${course.id}`}
            className="w-full bg-[#0d0d12] rounded-xl overflow-hidden border border-white/5 shadow-2xl hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all duration-300 flex flex-col group"
          >
            {course.thumbnail_url ? (
              <div className="h-48 overflow-hidden rounded-t-xl border-b border-white/5 relative">
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ) : (
              <div className="h-48 bg-black/40 border-b border-white/5 flex items-center justify-center rounded-t-3xl relative">
                <BookOpen className="w-12 h-12 text-zinc-800" />
              </div>
            )}
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-wide">
                {course.title}
              </h3>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed line-clamp-3 flex-1 font-mono italic">
                {course.description || "No description provided."}
              </p>
              
              <div className="mt-8 flex items-center justify-between">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                  CONTINUE LEARNING
                </div>
                <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 rounded-full transition-all group-hover:bg-blue-600 group-hover:text-white shadow-lg">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
        
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
  );
}
