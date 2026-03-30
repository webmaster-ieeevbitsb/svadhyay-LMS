import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/navbar";

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
    </div>
  );
}
