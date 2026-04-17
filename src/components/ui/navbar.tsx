import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-[#050508]/80 md:backdrop-blur-xl backdrop-blur-sm border-b border-white/10 z-50 flex items-center justify-between px-4 md:px-6 lg:px-12">
      {/* Branding Section */}
      <div className="flex items-center space-x-6 h-full">
        {/* Logos & Branding */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
          {/* Svadhyay LOGO */}
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
        </Link>


      </div>

      {/* Navigation / User Section */}
      <div className="flex items-center space-x-8">
        {user ? (
          <div className="flex items-center gap-8">
            <div className="hidden xl:flex flex-col items-end">
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
              <button type="submit" className="px-4 md:px-8 py-2 md:py-3 bg-zinc-900 border border-white/5 text-white hover:bg-red-600 hover:border-red-500/50 transition-all rounded-xl text-[11px] font-black uppercase tracking-widest md:shadow-2xl active:scale-95 md:active:scale-100 hover:shadow-red-500/10 touch-manipulation">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-full transition-all md:shadow-lg md:hover:shadow-blue-500/30 active:scale-95 md:active:scale-100 touch-manipulation">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
