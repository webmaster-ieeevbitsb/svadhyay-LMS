"use client";

import { X, Copy, Share2, CheckCircle2, Globe, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  certificateUrl: string;
}

export default function ShareModal({ isOpen, onClose, courseTitle, certificateUrl }: ShareModalProps) {
  if (!isOpen) return null;

  const shareText = `I just completed the "${courseTitle}" on Svadhyay-LMS! Check out my certificate:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(certificateUrl);

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: <Globe className="w-5 h-5 text-[#0A66C2]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30"
    },
    {
      name: "Twitter (X)",
      icon: <Send className="w-5 h-5 text-white" />,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "hover:bg-white/10 hover:border-white/30"
    },
    {
      name: "WhatsApp",
      icon: <MessageSquare className="w-5 h-5 text-[#25D366]" />,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: "hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificateUrl);
    toast.success("Certificate Link Copied to Clipboard", {
      icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0f] border border-blue-500/20 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-[0_0_100px_rgba(59,130,246,0.15)] relative overflow-hidden">
        
        {/* Tactical Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-zinc-600 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mb-10 shadow-inner">
          <Share2 className="w-10 h-10 text-blue-500" />
        </div>

        <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">
           Broadcast Achievement
        </h4>
        <p className="text-zinc-500 text-[10px] font-bold mb-10 uppercase tracking-[0.2em] leading-relaxed">
          The validation protocol is complete. Distribute your certification record across the primary communication networks.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-all group ${link.color} active:scale-95 md:active:scale-100`}
              >
                 <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-current transition-colors">
                    {link.icon}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{link.name}</span>
              </a>
            ))}
            
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-all group hover:bg-blue-600/10 hover:border-blue-500/30 active:scale-95 md:active:scale-100 text-left"
            >
               <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Copy className="w-5 h-5 text-blue-500" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white line-clamp-1">Copy Link</span>
            </button>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-2 pt-6 border-t border-white/5 opacity-30">
          <div className="w-1 h-1 rounded-full bg-blue-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Secure Share Protocol v1.4</span>
        </div>
      </div>
    </div>
  );
}
