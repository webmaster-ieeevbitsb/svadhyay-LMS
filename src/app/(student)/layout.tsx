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
    <div className="min-h-screen bg-[#050508] text-zinc-400 font-sans flex flex-col pt-20 mt-0 relative">
      <Navbar />
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>

      {/* Persistent Student Portal Footer */}
      {/* Footer Element with Social Connectivity */}
      <div className="mt-20 flex flex-col items-center text-center space-y-8 pb-12">
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
