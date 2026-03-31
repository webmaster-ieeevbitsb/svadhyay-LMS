"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, Suspense } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getURL } from "@/utils/supabase/get-url";
import Image from "next/image";
import { Preloader } from "@/components/ui/preloader";
import { SocialLinks } from "@/components/ui/social-links";

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
    <div className="relative z-10 w-full flex-1 flex flex-col items-center animate-in fade-in zoom-in duration-700">
      {isLoading && <Preloader />}
      
      {/* Scrollable Content wrapper to push footer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full py-12">
        {/* Top Logos Widget */}
        <div className="flex items-center gap-4 md:space-x-8 bg-[#0d0d12]/80 backdrop-blur-md border border-white/5 px-6 md:px-12 py-4 md:py-5 rounded-[2rem] md:rounded-[2.5rem] mb-8 md:mb-12 shadow-2xl">
          <div className="relative w-16 h-10 md:w-24 md:h-14 flex items-center justify-center shrink-0">
            <Image 
              src="https://avishkar2k25.ieeevbitsb.in/logo/AVK_LOGO.png" 
              alt="Avishkar" fill className="object-contain" 
              sizes="(max-width: 768px) 64px, 120px"
            />
          </div>
          <div className="w-px h-8 md:h-12 bg-white/10 shrink-0" />
          <div className="relative w-16 h-10 md:w-24 md:h-14 flex items-center justify-center opacity-90 shrink-0">
            <Image 
              src="https://registration.ieeevbitsb.in/logo/ieee-vbit-sb/sb-blue.png" 
              alt="IEEE" fill className="object-contain" 
              sizes="(max-width: 768px) 64px, 120px"
            />
          </div>
        </div>

        {/* Main Branding */}
        <div className="text-center space-y-4 mb-10 w-full px-4">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-lg flex flex-col md:flex-row items-center justify-center gap-2">
            <span className="text-white">IEEE - VBIT SB</span>
            <span className="text-blue-500">Learning Portal</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
            Professional Student Learning Infrastructure
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-lg bg-[#0d0d12] border border-white/5 rounded-[3rem] p-8 md:p-12 text-center shadow-2xl min-h-[300px] flex flex-col justify-center mx-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Student Access</h2>
          <p className="text-zinc-500 text-xs md:text-sm mb-10 font-medium tracking-wide">
            Authentication limited to @vbithyd.ac.in emails
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
                <span>Sign in with Google</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-[11px] font-bold uppercase tracking-wider mt-6 rounded-lg">
              {errorMsg === "unauthorized" 
                ? "Access Denied. Please authenticate with your registered institution email." 
                : "Authentication Error. Please try again."}
            </div>
          )}
        </div>
      </div>

      {/* Footer Element with Social Connectivity */}
      <div className="mt-auto flex flex-col items-center text-center space-y-6 py-10 w-full">
        <SocialLinks />
        
        <div className="space-y-4 max-w-4xl px-6">
          <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Designed and Developed by Web Designers | IEEE - VBIT SB
          </div>
          
          <div className="text-[10px] text-zinc-600 font-bold">
            © Copyright 2026 IEEE – All rights reserved.
          </div>
          
          <p className="text-[10px] text-zinc-700 leading-relaxed font-normal">
            A non profit Organisation, IEEE is the world's largest technical professional organization 
            dedicated to advancing technology for the benefit of humanity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] flex flex-col items-center overflow-hidden font-sans">
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

