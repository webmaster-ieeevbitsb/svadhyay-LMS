import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import { SocialLinks } from "@/components/ui/social-links";

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
  const isAllowedPrefix = email.startsWith("22p6");

  let isParticipant = false;

  if (isAllowedPrefix) {
    isParticipant = true;
  } else {
    // Check if they are a registered participant in the database
    const { data: participant } = await supabase
      .from("participants")
      .select("email")
      .eq("email", email)
      .single();
    
    if (participant) isParticipant = true;
  }

  if (!isParticipant) {
    redirect("/?error=unauthorized"); 
  }

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-400 font-sans flex flex-col pt-20 mt-0 relative overflow-x-hidden">
      
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
           
           {/* Global HUD Corner Brackets — fixed to viewport */}
           <div className="fixed top-24 left-6 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-xl pointer-events-none" />
           <div className="fixed top-24 right-6 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-xl pointer-events-none" />
           <div className="fixed bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/20 rounded-bl-xl pointer-events-none" />
           <div className="fixed bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-xl pointer-events-none" />
        </div>

        {/* ── Geometric Curves & Arcs ────────────────────────────────── */}
        
        {/* Radar Arc — Top Left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="100 300" />
            <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="50 200" />
            <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="1" fill="none" strokeDasharray="10 50" />
          </svg>
        </div>

        {/* Radar Arc — Bottom Right */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_30s_linear_infinite_reverse]">
            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="150 400" />
            <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="1" fill="none" strokeDasharray="20 100" />
          </svg>
        </div>

        {/* 🔲 Complex Tactical Brackets ────────────────────────────────── */}
        
        {/* Top Right Bracket */}
        <div className="absolute top-12 right-12 w-16 h-16 opacity-20">
          <div className="absolute top-0 right-0 w-full h-px bg-white/40" />
          <div className="absolute top-0 right-0 w-px h-full bg-white/40" />
          <div className="absolute top-2 right-2 w-8 h-px bg-white/20" />
          <div className="absolute top-2 right-2 w-px h-8 bg-white/20" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500/40" />
        </div>

        {/* Bottom Left Bracket */}
        <div className="absolute bottom-12 left-12 w-16 h-16 opacity-20">
          <div className="absolute bottom-0 left-0 w-full h-px bg-white/40" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-white/40" />
          <div className="absolute bottom-2 left-2 w-8 h-px bg-white/20" />
          <div className="absolute bottom-2 left-2 w-px h-8 bg-white/20" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-blue-500/40" />
        </div>

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
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>

      {/* Persistent Student Portal Footer */}
      {/* Footer Element with Social Connectivity */}
      <div className="mt-auto flex flex-col items-center text-center space-y-8 pb-12">
        <SocialLinks />
        
        <div className="space-y-6 max-w-4xl px-6">
          <div className="text-[15px] font-black text-zinc-200 uppercase tracking-[0.3em]">
            Designed and Developed by Web Designers | IEEE - VBIT SB
          </div>
          
          <div className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">
            © Copyright 2026 IEEE – All rights reserved.
          </div>
          
          <p className="text-[11px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider max-w-2xl mx-auto">
            A non profit Organisation, IEEE is the world's largest technical professional organization 
            dedicated to advancing technology for the benefit of humanity.
          </p>
        </div>
      </div>
    </div>
  );
}
