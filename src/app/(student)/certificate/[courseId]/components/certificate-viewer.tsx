"use client";

import { useRef, useState, useEffect } from "react";
import { Download, ShieldCheck, Asterisk, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CertificateViewerProps {
  courseTitle: string;
  rollNumber: string;
  fullName: string;
  date: string;
  certificateId: string;
}

export default function CertificateViewer({
  courseTitle,
  rollNumber,
  fullName,
  date,
  certificateId
}: CertificateViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Pixel-Perfect Responsive Scaling Logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const targetWidth = 1050; // Targeted fixed width for perfect layout
        if (containerWidth < targetWidth) {
          setScale(containerWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      if (!printRef.current) return;

      const canvas = await html2canvas(printRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          // --- NUCLEAR TAILWIND 4 SCRUBBER ---
          // 1. Recursive style cleaning for modern colors
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              const styleText = el.getAttribute("style") || "";
              if (styleText.includes("okl") || styleText.includes("--")) {
                const cleaned = styleText
                  .replace(/(oklch|oklab)\([^)]+\)/g, "#000000")
                  .replace(/--[a-zA-Z0-9-]+:[^;]+;/g, "");
                el.setAttribute("style", cleaned);
              }
            }
          }

          // 2. Clear all potentially offending stylesheets
          const styleTags = Array.from(clonedDoc.getElementsByTagName("style"));
          styleTags.forEach(tag => {
            if (tag.innerHTML.includes("okl") || tag.innerHTML.includes("--")) {
              tag.innerHTML = tag.innerHTML.replace(/(oklch|oklab)\([^)]+\)/g, "#000000");
            }
          });

          // 3. Restore static layout
          const clonedElement = clonedDoc.querySelector(".certificate-content") as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.width = "1050px";
            clonedElement.style.height = "742px";
            clonedElement.style.display = "block";
            clonedElement.style.position = "relative";
          }
          
          const canvasEl = clonedDoc.querySelector(".certificate-canvas") as HTMLElement;
          if (canvasEl) {
            canvasEl.style.width = "1050px";
            canvasEl.style.height = "742px";
            canvasEl.style.position = "relative";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `IEEE-Certificate-${fullName.replace(/\s+/g, "-")}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("High-Resolution Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12 animate-in fade-in duration-1000 overflow-x-hidden relative">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .certificate-canvas, .certificate-canvas * { visibility: visible !important; }
          .certificate-canvas { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print px-2 relative z-50">
        <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <button 
          onClick={handleDownload}
          disabled={isExporting}
          className="px-8 py-5 bg-[#2563eb] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_50px_rgba(37,99,235,0.3)] disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? "SECURELY CAPTURING..." : "DOWNLOAD CERTIFICATE (PNG)"}
        </button>
      </div>

      {/* True-View Elastic Scaling Container */}
      <div 
        ref={containerRef} 
        className="flex justify-center relative items-start overflow-hidden pt-10"
        style={{ height: `${Math.floor(742 * scale) + 80}px` }} 
      >
        <div 
          className="certificate-content transition-transform duration-500 will-change-transform flex items-start justify-center"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: "top center",
            width: "1050px",
            height: "742px"
          }}
        >
          {/* Certificate Canvas - Branded Slate Tech Edition */}
          <div 
            ref={printRef}
            className="certificate-canvas relative w-[1050px] h-[742px] overflow-hidden flex flex-col rounded-sm"
            style={{ 
              backgroundColor: "#09090b", 
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 40px 150px rgba(0,0,0,0.8)"
            }}
          >
            {/* Branded White Header Bar */}
            <div 
              className="h-[120px] bg-white w-full flex items-center justify-between px-16 relative z-30"
              style={{ borderBottom: "4px solid #2563eb" }}
            >
                {/* Left Slot: IEEE SB Branding */}
                <div className="flex gap-6 w-[500px] items-center">
                   <img 
                       src="/logos/ieee-sb.png" 
                       alt="IEEE"
                       className="h-20 w-auto object-contain flex-shrink-0"
                   />
                   <div className="w-px h-16 mx-1" style={{ backgroundColor: "#e4e4e7" }} />
                   <div className="flex-shrink-0">
                       <h2 className="text-2xl font-black tracking-tight uppercase leading-none" style={{ color: "#09090b" }}>
                         IEEE - VBIT SB
                       </h2>
                       <p className="text-[14px] font-bold tracking-[0.05em] mt-2 italic" style={{ color: "#2563eb", opacity: 0.6 }}>
                         Advancing Technology for Humanity
                       </p>
                   </div>
                </div>

               {/* Right Slot: AVK Branding */}
               <div className="text-right flex items-center justify-end gap-1 w-[350px]">
                  <img 
                      src="/logos/avk.png" 
                      alt="Avishkar"
                      className="h-20 w-auto object-contain flex-shrink-0"
                  />
               </div>
            </div>

            {/* Body Container (High-Fidelity Content) */}
            <div className="flex-grow relative flex flex-col p-16 justify-between z-10 overflow-hidden">
               
               {/* Watermark Logo (Slate High-Contrast) */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.03 }}>
                  <ShieldCheck style={{ width: "800px", height: "800px", color: "#f8fafc" }} />
               </div>

               {/* Tactical HUD Corner Accents */}
               <div className="absolute top-0 left-0 w-24 h-24" style={{ borderTop: "3px solid #0ea5e9", borderLeft: "3px solid #0ea5e9", opacity: 0.2 }} />
               <div className="absolute top-0 right-0 w-24 h-24" style={{ borderTop: "3px solid #0ea5e9", borderRight: "3px solid #0ea5e9", opacity: 0.2 }} />
               <div className="absolute bottom-0 left-0 w-24 h-24" style={{ borderBottom: "3px solid #0ea5e9", borderLeft: "3px solid #0ea5e9", opacity: 0.2 }} />
               <div className="absolute bottom-0 right-0 w-24 h-24" style={{ borderBottom: "3px solid #0ea5e9", borderRight: "3px solid #0ea5e9", opacity: 0.2 }} />

               {/* Main Body Content: High-Contrast Identity */}
               <div className="text-center space-y-2 pt-10">
                  <p className="text-sm font-black tracking-[0.8em] uppercase" style={{ color: "#2563eb" }}>Certificate of Achievement</p>
                  
                  <div className="flex flex-col items-center py-10">
                     {/* Signature Identity Typography - Optimized for fit */}
                     <h2 className="text-[60px] font-black uppercase tracking-[0.15em] leading-tight px-10" style={{ color: "#f8fafc" }}>
                        {fullName}
                     </h2>
                     <div className="w-20 h-1 mt-6 rounded-full" style={{ backgroundColor: "#0ea5e9" }} />
                  </div>
                  
                  <div className="max-w-4xl mx-auto py-6 space-y-6">
                     <h3 className="text-4xl font-black uppercase tracking-tight leading-snug px-12" style={{ color: "#f8fafc" }}>
                        {courseTitle}
                     </h3>
                  </div>
               </div>

               {/* Footer: Tech Sign-off */}
               <div className="flex justify-between items-end pb-4">
                  <div className="space-y-6">
                     <div className="w-[400px] h-[4px] rounded-full" style={{ backgroundColor: "rgba(14, 165, 233, 0.1)" }} />
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black tracking-[0.6em] uppercase" style={{ color: "rgba(248, 250, 252, 0.4)" }}>Verified Platform Record</p>
                           <p className="text-sm font-black uppercase tracking-[0.1em]" style={{ color: "#f8fafc" }}>IEEE - VBIT SB</p>
                        </div>
                        <div className="pt-2 max-w-sm" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                           <p className="text-[8px] font-medium leading-relaxed italic" style={{ color: "rgba(248, 250, 252, 0.3)" }}>
                              This is an electronically generated official document by the institution and does not require a physical signature. 
                              Student ID: {rollNumber}
                           </p>
                        </div>
                     </div>
                  </div>
                  
                  {/* Validation Timestamp */}
                  <div className="text-right space-y-6">
                    <p className="text-[9px] font-mono tracking-tighter uppercase" style={{ color: "rgba(248, 250, 252, 0.4)" }}>
                       X-IDENTIFIER: {certificateId}
                    </p>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black tracking-[0.4em] uppercase" style={{ color: "rgba(248, 250, 252, 0.4)" }}>Validation Timestamp</p>
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f8fafc" }}>{date}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Aesthetic Bottom HUD line */}
            <div className="h-[4px] w-full" style={{ backgroundColor: "rgba(37, 99, 235, 0.3)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
