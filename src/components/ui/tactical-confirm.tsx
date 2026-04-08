"use client";

import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface TacticalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "danger" | "info";
}

export function TacticalConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Proceed", 
  variant = "info" 
}: TacticalConfirmProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-[#0a0a0f] border ${isDanger ? 'border-red-500/30' : 'border-blue-500/30'} rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ${isDanger ? 'ring-red-500/10' : 'ring-blue-500/10'}`}>
        
        {/* Tactical Scanline UI Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-zinc-600 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-20 h-20 ${isDanger ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20'} border rounded-3xl flex items-center justify-center mb-10 shadow-inner translate-y-[-10px]`}>
          {isDanger ? (
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-blue-500" />
          )}
        </div>

        <h4 className={`text-3xl font-black italic tracking-tighter uppercase mb-4 ${isDanger ? 'text-red-500' : 'text-white'}`}>
          {title}
        </h4>
        <p className="text-zinc-500 text-[11px] font-bold mb-10 uppercase tracking-[0.2em] leading-relaxed">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-6">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-5 bg-white/5 border border-white/10 text-zinc-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:text-white hover:bg-white/10 transition-all active:scale-95 md:active:scale-100"
          >
            Abort Protocol
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-8 py-5 ${isDanger ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)]'} text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95 md:active:scale-100 flex items-center justify-center gap-3`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmText}
          </button>
        </div>

        {/* Tactical Footer Badge */}
        <div className="mt-12 flex items-center gap-2 pt-6 border-t border-white/5 opacity-30">
          <div className={`w-1 h-1 rounded-full ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`} />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Verification Required</span>
        </div>
      </div>
    </div>
  );
}
