"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, Suspense } from "react";
import { Loader2, ArrowRight, ShieldAlert, Lock } from "lucide-react";
// ... (omitting intermediate parts for brevity in Instruction, but will provide full block in ReplacementContent)
import { useSearchParams } from "next/navigation";
import { getURL } from "@/utils/supabase/get-url";
import Image from "next/image";
import { Preloader } from "@/components/ui/preloader";
import { SocialLinks } from "@/components/ui/social-links";
import { motion, AnimatePresence } from "framer-motion";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.87 14.13c-.22-.67-.35-1.39-.35-2.13s.13-1.46.35-2.13V7.03H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.97l3.69-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z" fill="#EA4335"/>
  </svg>
);

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const redirectUrl = `${getURL()}/auth/callback`;

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

  const getErrorMessage = (err: string) => {
    switch (err) {
      case "invalid_domain":
        return "Access Denied. Please authenticate with your registered institution email.";
      case "unauthorized_institutional":
        return "Access Denied. You are not authorized to access this portal.";
      case "unauthorized":
        return "Access Denied. Please authenticate with your registered institution email.";
      default:
        return "Authentication Error. Please try again.";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 w-full flex-1 flex flex-col items-center"
    >
      {isLoading && <Preloader />}
      
      <div className="flex-1 flex flex-col items-center justify-center w-full py-12">
        {/* Top Logos Widget */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-4 md:space-x-8 bg-[#0d0d12]/80 backdrop-blur-md border border-white/5 px-6 md:px-12 py-4 md:py-5 rounded-[2rem] md:rounded-[2.5rem] mb-8 md:mb-12 shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
        </motion.div>

        {/* Main Branding */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center space-y-4 mb-10 w-full px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-lg flex flex-col md:flex-row items-center justify-center gap-2">
            <span className="text-white">IEEE - VBIT SB</span>
            <span className="text-blue-500">Learning Portal</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
             <div className="h-px w-8 bg-blue-500/30" />
             <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
               Professional Student Learning Infrastructure
             </p>
             <div className="h-px w-8 bg-blue-500/30" />
          </div>
        </motion.div>

        {/* Login Card */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-[calc(100%-3rem)] sm:w-full max-w-md bg-[#0d0d12]/90 backdrop-blur-sm border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 text-center shadow-2xl min-h-[300px] flex flex-col justify-center mx-auto relative overflow-hidden group"
          >
          {/* Internal Tactical HUD Corner Brackets */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/10 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/10 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/10 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/10 rounded-br-lg" />

          <div className="relative z-10">
            <Lock className="w-10 h-10 text-blue-500/40 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Student Access</h2>
            <p className="text-zinc-500 text-xs md:text-sm mb-10 font-medium tracking-wide">
              Exclusive Course Access for Freshman Engineering
            </p>

            <div className="h-16 flex items-center justify-center">
              {isLoading ? (
                 <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-[2px] border-blue-500/10 border-t-blue-500 border-r-blue-500 animate-[spin_0.8s_linear_infinite] shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                 </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGoogleLogin}
                  className="w-[85%] max-w-[280px] mx-auto flex items-center justify-center space-x-3 bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all font-bold text-white py-3.5 px-6 rounded-xl md:rounded-2xl group/btn shadow-2xl relative overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-white/10 to-blue-500/0 translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
                  <GoogleIcon />
                  <span className="tracking-tight whitespace-nowrap">Sign in with Google</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-3 text-left"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{getErrorMessage(errorMsg)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer Element — Tactical HUD Pod */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-auto mb-10 px-6 w-full max-w-6xl relative z-10"
      >
        <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.05] bg-[#0d0d12]/60 backdrop-blur-3xl p-6 md:p-12 shadow-2xl transform-gpu ring-1 ring-white/5">
          {/* Decorative HUD Corner Brackets */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-blue-500/20 rounded-tl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-blue-500/20 rounded-br-[2rem]" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12 relative z-10">
            {/* Left Section: Institutional Branding & Mission */}
            <div className="flex flex-col items-center md:items-start space-y-5 flex-1 max-w-xs sm:max-w-md md:max-w-xl">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                 <h3 className="text-[14px] font-black text-white uppercase tracking-[0.4em]">
                   IEEE - VBIT SB
                 </h3>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed text-center md:text-left">
                A non profit Organisation, IEEE is the world's largest technical professional 
                organization dedicated to advancing technology for the benefit of humanity.
              </p>
              <p className="text-[9px] font-black text-zinc-500/30 uppercase tracking-[0.2em] mt-2 transition-colors">
                Designed and Developed by Web Designers | IEEE - VBIT SB
              </p>
            </div>

            {/* Right Section: Interaction & Identity */}
            <div className="flex flex-col items-center md:items-end space-y-8">
              <SocialLinks />
              
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-zinc-800" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                    © Copyright 2026 IEEE – All rights reserved.
                  </span>
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] flex flex-col items-center overflow-x-hidden overflow-y-auto font-sans">
      {/* ── Global Tactical HUD Background ────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        {/* Primary Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Dot Matrix */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_85%)]">
           <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_1px_at_center,#fff_0.5px,transparent_1.5px)] bg-[size:24px_24px]" />
           <div className="absolute inset-0 opacity-[0.40] bg-[radial-gradient(circle_2px_at_center,#3b82f6_1.5px,transparent_3px)] bg-[size:96px_96px] animate-[pulse_4s_infinite]" />
        </div>

        {/* HUD Brackets */}
        <div className="fixed top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-white/5 rounded-tl-3xl pointer-events-none" />
        <div className="fixed bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-3xl pointer-events-none" />
      </div>

      {/* Subtle Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-red-600/[0.02] blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[5%] w-[30%] h-[30%] bg-yellow-600/[0.01] blur-[100px] rounded-full" />
        <div className="absolute bottom-[40%] left-[5%] w-[30%] h-[30%] bg-green-600/[0.01] blur-[100px] rounded-full" />
      </div>

      <Suspense fallback={<Loader2 className="animate-spin text-white w-8 h-8 relative z-10" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

