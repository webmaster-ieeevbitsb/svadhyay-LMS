"use client";

import { useState } from "react";
import { addAdmin, removeParticipant } from "@/app/actions/participants";
import { Search, Loader2, ShieldCheck, ShieldAlert, XIcon, Upload } from "lucide-react";
import { BulkImportModal } from "./bulk-import-modal";

export function AdminRegistry({ initialParticipants }: { initialParticipants: any[] }) {
  const [participants, setParticipants] = useState(initialParticipants.filter(p => p.is_admin));
  const [filter, setFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorLine, setErrorLine] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

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
      // Check if they are already in the list
      if (!participants.some(p => p.email === email)) {
        setParticipants([{
          email: email.toLowerCase(), 
          name: formData.get("name") || "",
          is_admin: true,
          created_at: new Date().toISOString()
        }, ...participants]);
      }
      (e.target as HTMLFormElement).reset();
    }
    setIsAdding(false);
  };

  const handleRemove = async (email: string) => {
    // Basic protection against removing oneself could be added here, 
    // but the backend doesn't explicitly block it yet.
    if (!confirm("Are you sure you want to completely remove this admin record?")) return;
    
    setParticipants(participants.filter(p => p.email !== email));
    const res = await removeParticipant(email);
    if (res.error) {
       setErrorLine(`Failed to remove ${email}`);
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
      <div className="bg-[#0a0a0e] border border-blue-500/20 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.05)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-4">
             <ShieldCheck className="w-8 h-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
             Core Authority Registry
          </h3>
          <p className="text-blue-500/80 text-xs font-bold uppercase tracking-widest pl-12">Level 1 Clearance Personnel</p>
        </div>
        <button 
          type="button" 
          onClick={() => setIsImportOpen(true)}
          className="group px-8 py-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.1)] active:scale-95 flex items-center gap-3"
        >
           <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
           Bulk Admin Upload
        </button>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 relative z-10 p-8 bg-blue-600/[0.02] rounded-[2rem] border border-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.02)]">
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
          className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Personnel"}
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
            className="w-full bg-blue-600/[0.02] border border-blue-500/10 pl-16 pr-6 py-5 text-white focus:outline-none focus:border-blue-500/40 transition-all text-sm font-mono placeholder-zinc-700 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-blue-500/20 rounded-3xl bg-blue-600/[0.01]">
              <p className="text-blue-500/60 text-[10px] font-black uppercase tracking-[0.3em]">No authorities matching criteria.</p>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-blue-600/[0.02] border border-blue-500/20 rounded-[1.5rem] group hover:bg-blue-600/[0.05] hover:border-blue-500/40 transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                   <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-500/40 bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <ShieldCheck className="w-6 h-6 text-blue-400" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black uppercase text-sm tracking-tight">{p.name || "System Admin"}</p>
                        <span className="text-[9px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">Authorized</span>
                      </div>
                      <p className="text-blue-500/70 font-mono text-[10px] tracking-tight">{p.email}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRemove(p.email)}
                    className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                  >
                    <XIcon className="w-4 h-4" /> Remove Access
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
