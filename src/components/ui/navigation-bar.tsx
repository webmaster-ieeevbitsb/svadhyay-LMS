import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export async function NavigationBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050508]/80 backdrop-blur-md h-20 flex items-center justify-between px-6 md:px-12 pointer-events-auto">
      <Link href="/dashboard" className="flex flex-col">
        <div className="text-xl md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-lg">
          <span className="text-white">AVISHKAR</span>
          <span className="text-blue-500">LMS</span>
        </div>
        <div className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
          Official Learning Platform
        </div>
      </Link>

      {user ? (
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-white text-sm font-bold truncate max-w-[150px]">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
              Verified Participant
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="px-4 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all font-bold group">
               <span className="group-hover:hidden">Session Active</span>
               <span className="hidden group-hover:inline text-red-500">Terminate</span>
            </button>
          </form>
        </div>
      ) : (
        <Link 
           href="/"
           className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] rounded-full transition-all"
        >
           Initiate Access
        </Link>
      )}
    </header>
  );
}
