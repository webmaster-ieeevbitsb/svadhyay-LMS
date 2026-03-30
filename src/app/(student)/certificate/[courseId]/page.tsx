import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import CertificateViewer from "./components/certificate-viewer";

export default async function CertificatePage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/login");

  // Fetch student progress to ensure they actually finished
  const { data: progress } = await supabase
    .from("student_progress")
    .select("is_completed, updated_at")
    .eq("course_id", courseId)
    .eq("email", user.email.toLowerCase())
    .single();

  if (!progress || !progress.is_completed) {
    // Cannot view certificate if not fully completed
    redirect(`/courses/${courseId}`);
  }

  // Fetch course details for title
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  if (!course) return notFound();

  // Fetch user details for name
  const { data: participant } = await supabase
    .from("participants")
    .select("name")
    .eq("email", user.email.toLowerCase())
    .single();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date(progress.updated_at || new Date().toISOString()));

  // Generate a unique Certificate ID based on their row ID
  const certId = courseId.split("-")[0].toUpperCase() + "-" + new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white">
       <CertificateViewer 
          courseTitle={course.title}
          studentName={participant?.name || user.email.split("@")[0]}
          date={formattedDate}
          certificateId={certId}
       />
    </div>
  );
}
