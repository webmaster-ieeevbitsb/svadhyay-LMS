import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import AdminSidebar from "./components/admin-sidebar";
import AdminHeader from "./components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect("/?error=unauthorized");
  }

  const email = user.email.toLowerCase();
  
  // Developer Bypass - Hardcoded Admin for Initial Setup
  const isHardcodedAdmin = email === "22p61a0480@vbithyd.ac.in";
  
  let isAdmin = false;
  if (isHardcodedAdmin) {
    isAdmin = true;
  } else {
    // Check if is_admin in participants table
    const { data: participant } = await supabase
      .from("participants")
      .select("is_admin")
      .eq("email", email)
      .single();

    if (participant?.is_admin) isAdmin = true;
  }

  if (!isAdmin) {
    redirect("/dashboard"); // Kick out non-admins to dashboard
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-zinc-400 font-sans flex flex-col items-stretch overflow-hidden">
      <AdminHeader />
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 w-full bg-[#050508] p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
}
