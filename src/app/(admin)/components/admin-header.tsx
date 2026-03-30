import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0f] border-b border-white/5 h-20 shadow-2xl flex items-center px-4 lg:px-12 justify-between">
      <div className="flex items-center gap-4 h-full">
        {/* Logos & Branding (No Links) */}
        <div className="flex items-center gap-4">
           {/* AVK LOGO */}
           <div className="relative h-10 w-16 flex items-center justify-center">
            <Image 
               src="https://avishkar2k25.ieeevbitsb.in/logo/AVK_LOGO.png" 
               alt="Avishkar Logo" fill className="object-contain"
            />
           </div>
           
           <div className="w-px h-6 bg-white/20 mx-2" />

           {/* IEEE LOGO */}
           <div className="relative h-10 w-16 flex items-center justify-center">
            <Image 
               src="https://registration.ieeevbitsb.in/logo/ieee-vbit-sb/sb-blue.png" 
               alt="IEEE Logo" fill className="object-contain"
            />
           </div>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2" />
        
        {/* Admin Title with Blue Badge (No Star) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
          <span className="text-zinc-300 font-black uppercase tracking-[0.2em] text-sm italic">
            AVISHKAR LMS ADMIN
          </span>
        </div>
      </div>

      {/* User / Logout */}
      <div className="flex items-center gap-6">
        <form action={async () => {
          "use server";
          const supabase = await createClient();
          await supabase.auth.signOut();
          redirect("/");
        }}>
           <button type="submit" className="px-4 md:px-8 py-2 md:py-3 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95">
             Log Out
           </button>
        </form>
      </div>
    </header>
  );
}
