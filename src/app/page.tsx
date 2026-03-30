"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, Suspense } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getURL } from "@/utils/supabase/get-url";
import Image from "next/image";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const redirectUrl = `${getURL()}/auth/callback`;
    console.log("Redirecting to:", redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
      
      {/* Top Logos Widget */}
      <div className="flex items-center space-x-8 bg-[#0d0d12]/80 backdrop-blur-md border border-white/5 px-12 py-5 rounded-[2.5rem] mb-12 shadow-2xl">
        <div className="relative w-24 h-14 flex items-center justify-center">
          <Image 
            src="https://avishkar2k25.ieeevbitsb.in/logo/AVK_LOGO.png" 
            alt="Avishkar" fill className="object-contain" 
            sizes="120px"
          />
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="relative w-24 h-14 flex items-center justify-center opacity-90">
          <Image 
            src="https://registration.ieeevbitsb.in/logo/ieee-vbit-sb/sb-blue.png" 
            alt="IEEE" fill className="object-contain" 
            sizes="120px"
          />
        </div>
      </div>

      {/* Main Branding */}
      <div className="text-center space-y-4 mb-10 min-w-max">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase drop-shadow-lg flex items-center justify-center gap-1">
          <span className="text-white">AVISHKAR</span>
          <span className="text-blue-500">LMS</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">
          Official Course Learning Platform
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-lg bg-[#0d0d12] border border-white/5 rounded-[3rem] p-12 text-center shadow-2xl min-h-[300px] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-white mb-3">Student Portal</h2>
        <p className="text-zinc-500 text-sm mb-10 font-medium tracking-wide">
          Authentication via VBIT Domain Required
        </p>

        <div className="h-16 flex items-center justify-center">
          {isLoading ? (
             <div className="relative flex items-center justify-center">
                {/* Sleek Custom Glowing Half-Circle Spinner */}
                <div className="w-10 h-10 rounded-full border-[2px] border-blue-500/10 border-t-blue-500 border-r-blue-500 animate-[spin_0.8s_linear_infinite] shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
             </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 transition-all font-bold text-white py-5 px-8 rounded-2xl group shadow-lg shadow-blue-500/20 text-lg"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-[11px] font-bold uppercase tracking-wider mt-6 rounded-lg">
            {errorMsg === "unauthorized" 
              ? "Access Denied. You are not a verified 22p6 participant." 
              : "Authentication Error. Please try again."}
          </div>
        )}
      </div>

      {/* Footer Element */}
      <div className="mt-16 text-zinc-600 uppercase tracking-[0.3em] text-[8px] font-bold flex flex-col items-center space-y-2">
        <span>IEEE - VBIT SB</span>
        <div className="w-8 h-px bg-blue-500/50" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] flex flex-col items-center justify-center overflow-hidden font-sans p-6">
      {/* Very subtle Background Glows to match the dark aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[30%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-[20%] w-[30%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <Suspense fallback={<Loader2 className="animate-spin text-white w-8 h-8 relative z-10" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

