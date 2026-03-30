import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, LayoutList, FileQuestion, CheckCircle2 } from "lucide-react";
import CreateModuleForm from "./components/create-module-form";
import CreateQuizForm from "./components/create-quiz-form";

import CourseHeaderEditor from "./components/course-header-editor";
import QuizEditor from "./components/quiz-editor";

export default async function CourseBuilderStudio({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  // Fetch Course details
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !course) {
    redirect("/admin/courses");
  }

  // Fetch existing Modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  // Fetch Quiz (if one exists)
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("course_id", courseId);

  const hasQuiz = (quizzes?.length ?? 0) > 0;
  
  // Fetch Quiz questions if hasQuiz
  let questions: any[] = [];
  if (hasQuiz) {
    const { data: qData } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizzes![0].id)
      .order("order_index", { ascending: true });
    questions = qData || [];
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header and Metdata */}
      <div className="flex flex-col space-y-2 mb-4">
        <Link href="/admin/courses" className="text-zinc-500 hover:text-white transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-lg">
          Manage <span className="text-blue-500">Curriculum</span>
        </h1>
      </div>

      <CourseHeaderEditor 
        courseId={course.id}
        initialTitle={course.title}
        initialDescription={course.description}
        initialThumbnail={course.thumbnail_url}
        initialMetadata={course.metadata}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Curriculum Timeline */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center space-x-3 border-b border-white/10 pb-4">
              <LayoutList className="text-blue-500 shrink-0" />
              <span>Curriculum Architecture</span>
            </h2>

            <div className="space-y-4">
              {modules?.map((m, idx) => (
                <div key={m.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
                  <div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">
                      Module 0{idx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{m.title}</h3>
                  </div>
                  <Link href={`/admin/courses/${courseId}/modules/${m.id}`} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
                    Edit Content
                  </Link>
                </div>
              ))}

              {(!modules || modules.length === 0) && (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/20 rounded-xl">
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No modules created yet</p>
                  <p className="text-zinc-600 text-xs mt-2">Use the builder to add your first module.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Editor Section */}
          {hasQuiz && (
            <div className="pt-8 border-t border-white/5">
              <QuizEditor quiz={quizzes![0]} questions={questions} />
            </div>
          )}
        </div>

        {/* Right Column: Creation Toolkit */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-4">
            Studio Toolkit
          </h3>

          <div className="bg-[#0d0d12] border border-white/5 p-8 rounded-[2rem] space-y-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
             
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Plus className="w-3 h-3" />
                Add New Module
              </h3>
              <CreateModuleForm courseId={courseId} />
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="relative z-10">
               <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FileQuestion className="w-3 h-3" />
                Final Assessment
              </h3>
               {hasQuiz ? (
                 <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex flex-col items-center text-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                    <p className="text-white font-black uppercase text-xs tracking-tighter">Evaluation Active</p>
                    <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">The final assessment module is ready and configurable.</p>
                  </div>
               ) : (
                 <CreateQuizForm courseId={courseId} />
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
