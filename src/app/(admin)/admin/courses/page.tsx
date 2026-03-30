import { fetchCourses } from "@/app/actions/courses";
import { Course } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

export default async function AdminCoursesPage() {
  const courses: Course[] = await fetchCourses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Manage Curriculum
          </h1>
          <p className="text-zinc-500 mt-1">
            Create and edit global courses for Avishkar LMS.
          </p>
        </div>
        <Link 
          href="/admin/courses/create"
          className="glass px-6 py-3 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-colors"
        >
          + Build New Course
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
            
            <div className="relative z-20">
              <h2 className="text-2xl font-black italic tracking-tight text-white uppercase truncate">
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
