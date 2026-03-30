"use client";

import { useRef } from "react";
import { Download, ShieldCheck, Asterisk, Award } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CertificateViewerProps {
  courseTitle: string;
  studentName: string;
  date: string;
  certificateId: string;
}

export default function CertificateViewer({
  courseTitle,
  studentName,
  date,
  certificateId
}: CertificateViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between no-print">
        <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
        <button 
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        >
          <Download className="w-4 h-4" /> Export Document (PDF)
        </button>
      </div>

      <div className="flex justify-center">
        {/* The Certificate Canvas */}
        <div 
          ref={printRef}
          className="print-container relative w-full max-w-[1024px] aspect-[1.414/1] bg-white text-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden border-8 border-zinc-100"
        >
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
             <ShieldCheck className="w-[800px] h-[800px] text-zinc-900" />
          </div>

          {/* Certificate Border Details */}
          <div className="absolute top-8 left-8 right-8 bottom-8 border-[2px] border-zinc-200 rounded-2xl flex flex-col p-12 lg:p-16 justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 flex items-center gap-3">
                     <Award className="w-8 h-8 text-blue-600" />
                     IEEE - VBIT SB <span className="text-blue-600">Learning Portal</span>
                  </h1>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mt-1">Certificate ID: {certificateId}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Authenticity Verified</p>
                  <p className="text-xs font-black tracking-widest uppercase text-zinc-900 mt-1">{date}</p>
               </div>
            </div>

            {/* Body */}
            <div className="text-center space-y-8 my-12">
               <div>
                  <p className="text-sm font-bold tracking-[0.4em] uppercase text-blue-600 mb-4">Certificate of Completion</p>
                  <p className="text-zinc-500 text-xs tracking-widest uppercase font-mono mb-2">This is to certify that</p>
                  <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-zinc-900 line-clamp-1 py-2">
                    {studentName}
                  </h2>
               </div>
               
               <div className="max-w-2xl mx-auto border-t border-b border-zinc-100 py-8">
                  <p className="text-zinc-500 text-xs tracking-widest uppercase font-mono mb-6">has successfully completed the instructional curriculum</p>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900">
                    {courseTitle}
                  </h3>
               </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <div className="w-48 h-px bg-zinc-300 mb-3" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400">Authorized Signature</p>
                  <p className="text-xs font-bold uppercase text-zinc-900">IEEE - VBIT SB Education Directorate</p>
               </div>
               
               <div className="opacity-20">
                  <Asterisk className="w-24 h-24" />
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
