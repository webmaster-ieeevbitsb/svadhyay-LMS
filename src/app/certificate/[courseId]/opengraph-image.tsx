import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

export default async function Image({ 
  params,
  searchParams 
}: { 
  params: { courseId: string };
  searchParams: { e?: string };
}) {
  const { courseId } = params;
  const targetEmail = searchParams.e;
  const supabase = await createClient();

  // Fetch data
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  const { data: participant } = await supabase
    .from("participants")
    .select("name")
    .eq("email", targetEmail?.toLowerCase() || "")
    .single();

  const studentName = (participant?.name || "STUDENT").toUpperCase();
  const courseTitle = (course?.title || "COURE COMPLETION").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          color: "#f8fafc",
          padding: "40px",
          border: "20px solid #2563eb",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Background Design */}
        <div 
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              color: "#2563eb",
              marginBottom: "20px",
            }}
          >
            Certificate of Achievement
          </div>

          <div
            style={{
              fontSize: "72px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#ffffff",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            {studentName}
          </div>

          <div
            style={{
              width: "120px",
              height: "4px",
              backgroundColor: "#0ea5e9",
              borderRadius: "2px",
              marginBottom: "40px",
            }}
          />

          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#94a3b8",
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            FOR SUCCESSFULLY COMPLETING
          </div>
          
          <div
            style={{
              fontSize: "48px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#f8fafc",
              marginTop: "20px",
              maxWidth: "900px",
              lineHeight: 1.2,
            }}
          >
            {courseTitle}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(248, 250, 252, 0.4)",
          }}
        >
          IEEE - VBIT SB VERIFIED RECORD
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
