import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminHeader() {
  const supabase = await createClient();


  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0f] border-b border-white/5 h-20 shadow-2xl flex items-center px-4 lg:px-12 justify-between">
      <div className="flex items-center gap-4 h-full">
        {/* Logos & Branding (No Links) */}
        <div className="flex items-center gap-4">
           {/* AVK LOGO */}
           <div className="relative h-10 w-16 flex items-center justify-center">
            <Image 
               src="/logos/svadhyay-logo.png" 
               alt="Svadhyay Logo" fill className="object-contain"
            />
           </div>
           
           <div className="w-px h-6 bg-white/20 mx-2" />

           {/* IEEE LOGO */}
           <div className="relative h-10 w-16 flex items-center justify-center">
            <Image 
               src="/logos/ieee-sb.png" 
               alt="IEEE Logo" fill className="object-contain"
            />
           </div>
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
           <button type="submit" className="px-4 md:px-8 py-2 md:py-3 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 md:active:scale-100">
             Log Out
           </button>
        </form>
      </div>
    </header>
  );
}
