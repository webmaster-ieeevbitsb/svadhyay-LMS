"use client";

import { useState } from "react";
import { addAdmin, toggleAdminStatus } from "@/app/actions/participants";
import { Search, Loader2, ShieldCheck, ShieldAlert, ShieldX, Upload, Users, Trash2 } from "lucide-react";
import { BulkImportModal } from "./bulk-import-modal";
import { cn } from "@/utils/cn";

interface Participant {
  email: string;
  name?: string;
  is_admin: boolean;
  is_completed?: boolean;
  created_at: string;
}

export function AdminRegistry({ 
  participants, 
  fullParticipants,
  setFullParticipants 
}: { 
  participants: Participant[], 
  fullParticipants: Participant[],
  setFullParticipants: React.Dispatch<React.SetStateAction<Participant[]>>
}) {
  const [filter, setFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorLine, setErrorLine] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [confirmingEmail, setConfirmingEmail] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdding(true);
    setErrorLine("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const res = await addAdmin({}, formData);
    
    if (res.error) {
      setErrorLine(res.error);
    } else {
      if (!fullParticipants.some(p => p.email === email)) {
        setFullParticipants(prev => [{
          email: email.toLowerCase(), 
          name: (formData.get("name") as string) || "",
          is_admin: true,
          created_at: new Date().toISOString()
        }, ...prev]);
      }
      (e.target as HTMLFormElement).reset();
    }
    setIsAdding(false);
  };

  const handleRevoke = async (email: string) => {
    setConfirmingEmail(null);
    setProcessingEmail(email);
    setErrorLine("");
    
    try {
      const res = await toggleAdminStatus(email, true);
      if (res.error) {
        setErrorLine(`Security Override Failed: ${res.error}`);
      } else {
        setFullParticipants((prev: Participant[]) => prev.map((p: Participant) => 
          p.email.toLowerCase() === email.toLowerCase() 
          ? { ...p, is_admin: false } 
          : p
        ));
      }
    } catch (err: any) {
      setErrorLine(`System Error: ${err.message || "Terminal connection interrupted."}`);
    } finally {
      setProcessingEmail(null);
    }
  };

  const filtered = participants.filter(p => 
    p.email?.toLowerCase().includes(filter.toLowerCase()) || 
    p.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <BulkImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        isAdminMode={true} 
      />

      {/* 🛡️ TACTICAL CONFIRMATION MODAL */}
      {confirmingEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#0a0a0f] border border-red-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-12 h-12 mb-6 mx-auto text-red-500" />
              <h4 className="text-xl font-black italic tracking-tight uppercase text-white text-center mb-2">
                Revoke Authority?
              </h4>
              <p className="text-zinc-500 text-xs text-center font-bold mb-8 uppercase tracking-widest">Target: {confirmingEmail}</p>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setConfirmingEmail(null)}
                   className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                 >
                    Abort
                 </button>
                 <button 
                   onClick={() => handleRevoke(confirmingEmail)}
                   className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                 >
                    Confirm
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="bg-[#0a0a0e] border border-blue-500/20 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.05)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div className="space-y-4">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-4">
             <ShieldCheck className="w-8 h-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
             Core Authority Registry
          </h3>
        </div>

        <button 
          type="button" 
          onClick={() => setIsImportOpen(true)}
          className="group px-8 py-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.1)] active:scale-95 md:active:scale-100 flex items-center gap-3"
        >
           <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
           Bulk Admin Upload
        </button>
      </div>

      {/* Add Entry Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 relative z-10 p-8 rounded-[2rem] border transition-all bg-blue-600/[0.02] border-blue-500/10">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           <input 
             type="email" 
             name="email" 
             required
             placeholder="ADMIN EMAIL ADDRESS"
             className="bg-black/60 border border-blue-500/20 px-6 py-4 text-white focus:outline-none focus:border-blue-500/60 transition-all font-mono text-sm rounded-2xl placeholder-blue-500/50"
           />
           <input 
             type="text" 
             name="name" 
             placeholder="ADMIN NAME (OPTIONAL)"
             className="bg-black/60 border border-blue-500/20 px-6 py-4 text-white focus:outline-none focus:border-blue-500/60 transition-all text-sm rounded-2xl placeholder-blue-500/50"
           />
        </div>
        <button 
          type="submit" 
          disabled={isAdding}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all flex items-center justify-center active:scale-95 md:active:scale-100 disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Admin"}
        </button>
      </form>

      {errorLine && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center gap-3 relative z-10">
           <ShieldAlert className="w-4 h-4" />
           {errorLine}
        </div>
      )}

      <div className="space-y-6 relative z-10">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="SEARCH ADMINS BY NAME OR EMAIL..."
            className="w-full bg-black/40 border border-blue-500/10 pl-16 pr-6 py-5 text-white focus:outline-none focus:border-blue-500/40 transition-all text-sm font-mono placeholder-zinc-700 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">No personnel matching criteria.</p>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.02] border border-blue-500/20 rounded-[1.5rem] group transition-all hover:bg-blue-600/[0.05] hover:border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                   <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-500/40 bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <ShieldCheck className="w-6 h-6 text-blue-400" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black uppercase text-sm tracking-tight">{p.name || "System Admin"}</p>
                        <span className="text-[9px] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg bg-blue-600 shadow-blue-500/20">
                          Authorized
                        </span>
                      </div>
                      <p className="text-zinc-500 font-mono text-[10px] tracking-tight">{p.email}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setConfirmingEmail(p.email)}
                    disabled={processingEmail === p.email}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 md:active:scale-100 disabled:opacity-50"
                  >
                    {processingEmail === p.email ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )} 
                    {processingEmail === p.email ? "Processing..." : "Revoke Authorization"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </>
  );
}
