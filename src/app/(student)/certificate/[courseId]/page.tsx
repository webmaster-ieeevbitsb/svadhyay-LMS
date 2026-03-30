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

  const rollNumber = participant?.name || user.email.split("@")[0].toUpperCase();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center" style={{ backgroundColor: "#050508" }}>
      {/* Abstract Background Layer (Hex-Safe) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.1), transparent 50%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", filter: "blur(120px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full" style={{ backgroundColor: "rgba(8, 145, 178, 0.05)", filter: "blur(100px)" }} />
      </div>

      <div className="relative z-10 w-full pt-10 pb-20">
        <CertificateViewer 
            courseTitle={course.title}
            rollNumber={rollNumber}
            fullName={user.user_metadata?.full_name || "STUDENT NAME"}
            date={formattedDate}
            certificateId={certId}
        />
      </div>
    </div>
  );
}
