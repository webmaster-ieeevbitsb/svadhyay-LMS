import { getURL } from "@/utils/supabase/get-url";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CertificateViewer from "./components/certificate-viewer";

function getOrdinalDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(day)} ${month}, ${year}`;
}

export async function generateMetadata({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ e?: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const { e: targetEmail } = await searchParams;
  const supabase = await createClient();
  const baseUrl = getURL();

  // If no email provided, we can't show specific social meta
  if (!targetEmail) {
    const { data: course } = await supabase.from("courses").select("title").eq("id", courseId).single();
    return { title: `Certificate - ${course?.title || "Verification"}` };
  }

  const { data: participant } = await supabase
    .from("participants")
    .select("name")
    .eq("email", targetEmail.toLowerCase())
    .single();

  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  const { data: progress } = await supabase
    .from("student_progress")
    .select("updated_at")
    .eq("course_id", courseId)
    .eq("email", targetEmail.toLowerCase())
    .single();

  const rawDate = new Date(progress?.updated_at || new Date().toISOString());
  const formattedDate = getOrdinalDate(rawDate);

  return {
    title: `${participant?.name || "Student"}'s Certificate of Achievement`,
    description: `Official certification for completing "${course?.title}" on Svadhyay-LMS Platform.`,
    openGraph: {
      title: `${participant?.name || "Student"}'s Achievement`,
      description: `Successfully completed "${course?.title}"`,
      images: [
        {
          url: `${baseUrl}/api/og?courseId=${courseId}&e=${encodeURIComponent(targetEmail)}&d=${encodeURIComponent(formattedDate)}&v=2`,
          width: 1200,
          height: 630,
          alt: "Certificate of Achievement",
        },
      ],
    },
  };
}

export default async function CertificatePage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { courseId } = await params;
  const { e: queryEmail } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  // PUBLIC ACCESS LOGIC: Use query email if present, otherwise fallback to logged-in user
  const targetEmail = queryEmail || user?.email;

  if (!targetEmail) redirect("/");

  // Fetch student progress to ensure they actually finished
  const { data: progress } = await supabase
    .from("student_progress")
    .select("is_completed, updated_at")
    .eq("course_id", courseId)
    .eq("email", targetEmail.toLowerCase())
    .single();

  if (!progress || !progress.is_completed) {
    // If logged in, send to course. If not, send to login.
    if (user) redirect(`/courses/${courseId}`);
    redirect("/");
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
    .eq("email", targetEmail.toLowerCase())
    .single();

  const studentName = participant?.name || (user?.user_metadata?.full_name) || "STUDENT";

  const rawDate = new Date(progress.updated_at || new Date().toISOString());
  const formattedDate = getOrdinalDate(rawDate);

  // Generate a unique Certificate ID based on their row ID
  const certId = courseId.split("-")[0].toUpperCase() + "-" + new Date().getFullYear();

  const rollNumber = participant?.name || targetEmail.split("@")[0].toUpperCase();

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
            fullName={studentName}
            date={formattedDate}
            certificateId={certId}
            userEmail={targetEmail}
        />
      </div>
    </div>
  );
}
