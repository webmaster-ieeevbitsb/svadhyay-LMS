"use client";

import Image from "next/image";

export function Preloader() {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#050508] flex flex-col items-center justify-center">

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative flex flex-col items-center">
        <div
          className="absolute -inset-10 border border-blue-500/10 rounded-full animate-[ping_3s_linear_infinite]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute -inset-16 border border-blue-500/5 rounded-full animate-[ping_4s_linear_infinite]"
          style={{ animationDelay: '1s' }}
        />

        {/* Glowing ring around logo */}
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[2px] border-blue-500/10 border-t-blue-500 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.2)]" />

          {/* IEEE Logo modifed to appear immediately and larger */}
          <div className="relative w-32 h-20 md:w-44 md:h-28">
            <Image
              src="https://registration.ieeevbitsb.in/logo/ieee-vbit-sb/sb-blue.png"
              alt="IEEE logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 128px, 176px"
            />
          </div>
        </div>

        {/* Text indicators */}
        <div className="mt-12 text-center space-y-3">
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">
            INITIALIZING LEARNING PORTAL
          </div>

          {/* Simple Shimmer Progress Bar with Tailwind */}
          <div className="h-0.5 w-24 mx-auto bg-white/5 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-500/50 w-full animate-[shimmer_2s_infinite]" />
          </div>

          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            IEEE - VBIT SB
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
