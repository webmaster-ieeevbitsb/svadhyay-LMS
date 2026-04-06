"use client";

import { useState, useEffect } from "react";
import { X, Link as LinkIcon, Video, CheckCircle2 } from "lucide-react";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  type: "image" | "video";
  initialValue?: string;
}

export function MediaModal({ isOpen, onClose, onSubmit, type, initialValue = "" }: MediaModalProps) {
  const [url, setUrl] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setUrl(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0f] border border-blue-500/30 rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full shadow-[0_0_80px_rgba(59,130,246,0.15)] relative overflow-hidden">
        {/* Decorative tactical elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8">
          {type === "video" ? <Video className="w-8 h-8 text-blue-500" /> : <LinkIcon className="w-8 h-8 text-blue-500" />}
        </div>

        <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">
          {type === "video" ? "Embed Video" : "Link Image Asset"}
        </h4>
        <p className="text-zinc-500 text-[10px] font-bold mb-8 uppercase tracking-[0.2em] leading-relaxed">
          Provide the {type} source URL to integrate it into the submodule content stream.
        </p>

        <div className="space-y-6">
          <div className="group/input">
            <label className="text-[9px] font-black uppercase text-blue-500/70 mb-2 block tracking-widest group-focus-within/input:text-blue-500 transition-colors">
              Source URL / Embed Link
            </label>
            <input 
              autoFocus
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter" && url) {
                  e.preventDefault();
                  onSubmit(url); 
                }
              }}
              placeholder={type === "video" ? "https://youtube.com/watch?v=..." : "https://images.com/asset.jpg"}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-mono placeholder:text-zinc-700 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-white/5 border border-white/10 text-zinc-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:text-white hover:bg-white/10 transition-all"
            >
              Abort
            </button>
            <button 
              type="button"
              onClick={() => onSubmit(url)}
              disabled={!url}
              className="px-6 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Commit Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
