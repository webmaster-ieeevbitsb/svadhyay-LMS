import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, BookOpen, Brain } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px" 
          }} 
        />
        
        {/* Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[80px] rounded-full animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl">
        {/* Branded Identity */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/logos/svadhyay-logo.png"
              alt="Svadhyay"
              fill
              className="object-contain relative z-10"
              priority
            />
          </div>
          <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
            Svadhyay-LMS Verified Identity
          </p>
        </div>

        {/* 404 Heading with Glitch Style */}
        <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-backwards">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 select-none">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-200">
            Lost in thought?
          </h2>
          <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed uppercase tracking-wider">
            The curriculum path you're looking for doesn't exist. Re-evaluate your journey or return to the main portal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 fill-mode-backwards">
          <Link
            href="/"
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-[0_0_50px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Home className="w-4 h-4" />
            Go to Landing Page
          </Link>
          <Link
            href="/dashboard"
            className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <BookOpen className="w-4 h-4" />
            Access Dashboard
          </Link>
        </div>
      </div>

      {/* Decorative HUD Details */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em] pointer-events-none select-none z-10 text-center space-y-2">
        <p>System Status: Path Resolution Failed</p>
        <p className="text-blue-500/30">Svadhyay (स्वाध्याय) — Self-Study & Growth</p>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/5 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/5 pointer-events-none hidden md:block" />
    </div>
  );
}
