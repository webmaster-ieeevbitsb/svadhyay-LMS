import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import { SocialLinks } from "@/components/ui/social-links";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    // Basic redirect for no auth token
    redirect("/?error=unauthenticated");
  }

  const email = user.email.toLowerCase();
  
  // Check if they are a registered participant in the database (Student or Admin)
  const { data: participant } = await supabase
    .from("participants")
    .select("email")
    .eq("email", email)
    .single();
  
  if (!participant) {
    if (!email.endsWith("@vbithyd.ac.in")) {
      redirect("/?error=invalid_domain");
    } else {
      redirect("/?error=unauthorized_institutional");
    }
  }

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-400 font-sans flex flex-col pt-20 mt-0 relative overflow-x-hidden">
      <ScrollToTop />
      
      {/* ── Global Tactical HUD Background ────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-[-10]">
        {/* Primary Grid — very thin */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* 💠 Layered Dot Matrix — non-intrusive focus */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_85%)]">
           {/* High-Intensity Node Matrix */}
           <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_1px_at_center,#fff_0.5px,transparent_1.5px)] bg-[size:24px_24px]" />
           
           {/* Primary Blue Tactical Nodes — clearly visible */}
           <div className="absolute inset-0 opacity-[0.60] bg-[radial-gradient(circle_2px_at_center,#3b82f6_1.5px,transparent_3px)] bg-[size:96px_96px] animate-[pulse_4s_infinite]" />
        </div>

        {/* ── Geometric Curves & Arcs ────────────────────────────────── */}
        
        {/* Radar Arc — Top Left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 opacity-[0.03] hidden md:block">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="100 300" />
            <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="50 200" />
            <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="1" fill="none" strokeDasharray="10 50" />
          </svg>
        </div>

        {/* Radar Arc — Bottom Right */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-[0.03] hidden md:block">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_30s_linear_infinite_reverse]">
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="150 400" />
            <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="1" fill="none" strokeDasharray="20 100" />
          </svg>
        </div>

        {/* 🔲 Premium Glow Accents ────────────────────────────────── */}
        
        {/* Top Right Glow */}
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/[0.04] blur-[100px] rounded-full pointer-events-none md:mix-blend-screen" />

        {/* Bottom Left Glow */}
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-600/[0.03] blur-[100px] rounded-full pointer-events-none md:mix-blend-screen" />
        
        {/* Subtle Accent Glow */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/[0.02] blur-[120px] rounded-full pointer-events-none hidden md:block mix-blend-screen" />

        {/* ── Data Sine Waves — Very subtle flow ─────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 h-10 opacity-[0.015] overflow-hidden">
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0 50 Q 250 0, 500 50 T 1000 50" 
              stroke="white" 
              fill="none" 
              strokeWidth="1.5"
              className="animate-[pulse_4s_infinite]"
            />
          </svg>
        </div>

        {/* Subtle radial glow to pull focus to center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(5,5,8,0.4)_70%,rgba(5,5,8,0.8)_100%)]" />
      </div>
      <Navbar />
      <main className="flex-1 w-full relative z-10 mb-24">
        {children}
      </main>

      {/* Persistent Student Portal Footer */}
      {/* Footer Element with Social Connectivity */}
      <div className="mt-auto flex flex-col items-center text-center space-y-8 pb-12">
        <SocialLinks />
        
        <div className="space-y-6 max-w-4xl px-6 group cursor-default">
          <div className="flex flex-col space-y-1">
            <div className="text-[15px] font-black text-zinc-200 uppercase tracking-[0.3em] transition-colors duration-500 group-hover:text-blue-400">
              Designed and Developed by Web Designers | IEEE - VBIT SB
            </div>
            <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-[0.2em] text-center">
              Svadhyay (स्वाध्याय) — Self-Study & Growth
            </p>
          </div>
          
          <div className="text-[11px] text-zinc-500 font-black uppercase tracking-widest transition-colors duration-300 group-hover:text-zinc-400">
            © Copyright 2026 IEEE – All rights reserved.
          </div>
          
          <p className="text-[11px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider max-w-2xl mx-auto transition-colors duration-300 group-hover:text-zinc-400">
            A non profit Organisation, IEEE is the world's largest technical professional organization 
            dedicated to advancing technology for the benefit of humanity.
          </p>
        </div>
      </div>
    </div>
  );
}
