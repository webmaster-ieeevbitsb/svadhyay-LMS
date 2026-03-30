import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-[#050508]/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-6 lg:px-12">
      {/* Branding Section */}
      <div className="flex items-center space-x-6 h-full">
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
        
        {/* Title (No Bar) */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-300 font-black uppercase tracking-[0.2em] text-sm italic">
            AVISHKAR LEARNING PORTAL
          </span>
        </div>
      </div>

      {/* Navigation / User Section */}
      <div className="flex items-center space-x-8">
        {user ? (
          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                {user.email}
              </p>
              <p className="text-white text-sm font-black uppercase tracking-tight">
                {user.user_metadata?.full_name || "STUDENT PARTICIPANT"}
              </p>
            </div>
            <form action={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/");
            }}>
              <button type="submit" className="px-8 py-3 bg-zinc-900 border border-white/5 text-white hover:bg-red-600 hover:border-red-500/50 transition-all rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 hover:shadow-red-500/10">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-full transition-all">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
