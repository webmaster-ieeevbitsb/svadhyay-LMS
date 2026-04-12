import { fetchCourses } from "@/app/actions/courses";
import { Course } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

export default async function AdminCoursesPage() {
  const courses: Course[] = await fetchCourses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
            Manage Curriculum
          </h1>
          <p className="text-zinc-500 mt-2 text-sm md:text-base">
            Create and edit global courses for Svadhyay-LMS.
          </p>
        </div>
        <Link 
          href="/admin/courses/create"
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 md:active:scale-100 flex items-center justify-center gap-3 group shrink-0"
        >
          <span className="text-xl leading-none group-hover:-rotate-90 transition-transform duration-300">+</span> Build New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/admin/courses/${course.id}`}
            className="group relative h-64 bg-[#0d0d12] border border-white/5 rounded-xl p-6 flex flex-col justify-end overflow-hidden hover:border-blue-500/50 transition-all duration-300"
          >
            {course.thumbnail_url && (
              <Image 
                src={course.thumbnail_url} 
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10" />
            
            <div className="absolute top-4 right-4 z-30">
               {course.is_published ? (
                 <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-green-500 text-white rounded-full">LIVE</span>
               ) : (
                 <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-800 border border-white/10 text-white rounded-full">DRAFT</span>
               )}
            </div>

            <div className="relative z-20">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase truncate">
                {course.title}
              </h2>
              <p className="text-zinc-400 text-sm line-clamp-2 mt-2">
                {course.description || "No description provided."}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                  Edit Curriculum
                </span>
                <span className="text-zinc-600 text-xs">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full h-64 bg-[#0d0d12] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center space-y-4">
            <span className="text-zinc-600 italic">No courses found in database.</span>
          </div>
        )}
      </div>
    </div>
  );
}
