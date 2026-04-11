
import { SocialLinks } from "@/components/ui/social-links";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default async function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <div className="min-h-screen bg-[#050508] text-zinc-400 font-sans flex flex-col relative overflow-x-hidden">
      <ScrollToTop />
      
      {/* ── Global Tactical HUD Background ────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-[-10]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_85%)]">
           <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_1px_at_center,#fff_0.5px,transparent_1.5px)] bg-[size:24px_24px]" />
           <div className="absolute inset-0 opacity-[0.60] bg-[radial-gradient(circle_2px_at_center,#3b82f6_1.5px,transparent_3px)] bg-[size:96px_96px] animate-[pulse_4s_infinite]" />
           
           <div className="fixed top-24 left-6 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-xl pointer-events-none" />
           <div className="fixed top-24 right-6 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-xl pointer-events-none" />
           <div className="fixed bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/20 rounded-bl-xl pointer-events-none" />
           <div className="fixed bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-xl pointer-events-none" />
        </div>
      </div>

      <main className="flex-1 w-full relative z-10 pt-10 pb-20">
        {children}
      </main>

      <div className="mt-auto flex flex-col items-center text-center space-y-8 pb-12">
        <SocialLinks />
        <div className="space-y-6 max-w-4xl px-6">
          <div className="text-[15px] font-black text-zinc-200 uppercase tracking-[0.3em]">
            Designed and Developed by Web Designers | IEEE - VBIT SB
          </div>
          <div className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">
            © Copyright 2026 IEEE – All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
