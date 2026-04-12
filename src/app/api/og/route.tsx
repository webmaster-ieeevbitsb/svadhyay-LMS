import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const courseId = searchParams.get("courseId");
  const targetEmail = searchParams.get("e");
  const date = searchParams.get("d") || "12th April, 2026";

  if (!courseId) {
    return new Response("Missing courseId", { status: 400 });
  }

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
  const courseTitle = (course?.title || "COURSE COMPLETION").toUpperCase();

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
          backgroundColor: "#050508",
          color: "#f8fafc",
          padding: "60px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Modern Border System */}
        <div style={{ position: "absolute", inset: "20px", border: "1px solid rgba(37, 99, 235, 0.2)", borderRadius: "24px" }} />
        <div style={{ position: "absolute", inset: "30px", border: "2px solid #2563eb", borderRadius: "16px", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: "35px", border: "1px solid rgba(37, 99, 235, 0.1)", borderRadius: "12px" }} />

        {/* Dynamic Glow Background */}
        <div 
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div 
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content Content Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5em",
              color: "#3b82f6",
              marginBottom: "40px",
              opacity: 0.9,
            }}
          >
            Svadhyay Recognition
          </div>

          <div
            style={{
              fontSize: "84px",
              fontWeight: 950,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "20px",
              display: "flex",
            }}
          >
            {studentName}
          </div>

          <div
            style={{
              width: "160px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #2563eb, transparent)",
              marginBottom: "40px",
            }}
          />

          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#94a3b8",
              marginBottom: "16px",
            }}
          >
            For the successful completion of
          </div>
          
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#f8fafc",
              padding: "0 40px",
              lineHeight: 1.1,
              maxWidth: "1000px",
              textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              marginBottom: "30px",
            }}
          >
            {courseTitle}
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#64748b",
            }}
          >
            Issued on {date}
          </div>
        </div>

        {/* Branding Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "calc(100% - 120px)",
            padding: "0 20px",
            opacity: 0.5,
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b" }}>
            VERIFIED VIA SVADHYAY-LMS
          </div>
          <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.2em", color: "#3b82f6" }}>
            IEEE - VBIT SB
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
