"use client";

import { useState } from "react";
import { addParticipant, removeParticipant, rotateStudentCohort } from "@/app/actions/participants";
import { Users, Search, Loader2, ShieldCheck, ShieldAlert, BarChart3, Database, CheckCircle2, RefreshCw } from "lucide-react";
import { BulkImportModal } from "./bulk-import-modal";
import { ProgressModal } from "./progress-modal";

interface Participant {
  email: string;
  name?: string;
  is_admin: boolean;
  is_completed?: boolean;
  created_at: string;
}

export function ParticipantRegistry({ 
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
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isRotating, setIsRotating] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdding(true);
    setErrorLine("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const res = await addParticipant({}, formData);
    
    if (res.error) {
      setErrorLine(res.error);
    } else {
      if (!fullParticipants.some(p => p.email === email)) {
        setFullParticipants(prev => [{
          email: email.toLowerCase(), 
          name: (formData.get("name") as string) || "",
          is_admin: false,
          created_at: new Date().toISOString()
        }, ...prev]);
      }
      (e.target as HTMLFormElement).reset();
    }
    setIsAdding(false);
  };


  const handleRemove = async (email: string) => {
    if (!confirm("Are you sure? This will permanently delete this student record and all their progress.")) return;
    
    const res = await removeParticipant(email);
    if (res.error) {
      setErrorLine(`Failed to remove ${email}: ${res.error}`);
    } else {
      setFullParticipants(prev => prev.filter(p => p.email.toLowerCase() !== email.toLowerCase()));
    }
  };

  const handleRotate = async () => {
    if (!confirm("CRITICAL: This will purge ALL registered students and their progress. This action cannot be undone. Proceed?")) return;
    setIsRotating(true);
    const res = await rotateStudentCohort();
    if (res.error) {
      setErrorLine(res.error);
    } else {
      setFullParticipants(prev => prev.filter(p => p.is_admin));
      alert(`Purge Complete: ${res.count} student records deallocated.`);
    }
    setIsRotating(false);
  };

  const filtered = participants.filter(p => 
    p.email?.toLowerCase().includes(filter.toLowerCase()) || 
    p.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="bg-[#0d0d12] border border-white/5 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-4">
               <Database className="w-8 h-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
               Student Registry
            </h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-12">Enrollment Control & Access Management</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleRotate}
               disabled={isRotating}
               className="px-8 py-4 bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center gap-3 disabled:opacity-50"
             >
               {isRotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
               Rotate Cohort
             </button>
             <button 
               type="button" 
               onClick={() => setIsImportOpen(true)}
               className="group px-8 py-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.1)] active:scale-95 flex items-center gap-3"
             >
                <UploadIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Bulk Enrollment Upload
             </button>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 relative z-10 p-8 bg-white/[0.02] rounded-[2rem] border border-white/5">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
               type="email" 
               name="email" 
               required
               placeholder="STUDENT EMAIL"
               className="bg-black/40 border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm rounded-2xl placeholder-zinc-700"
             />
             <input 
               type="text" 
               name="name" 
               placeholder="STUDENT NAME (OPTIONAL)"
               className="bg-black/40 border border-white/5 px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm rounded-2xl placeholder-zinc-700"
             />
          </div>
          <button 
            type="submit" 
            disabled={isAdding}
            className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all hover:bg-blue-500 hover:text-white disabled:opacity-50 flex items-center justify-center shadow-xl active:scale-95"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enroll Student"}
          </button>
        </form>

        {errorLine && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center gap-3">
             <ShieldAlert className="w-4 h-4" />
             {errorLine}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="SEARCH REGISTRY BY NAME OR EMAIL..."
              className="w-full bg-black/20 border border-white/5 pl-16 pr-6 py-5 text-white focus:outline-none focus:border-blue-500/30 transition-all text-sm font-mono placeholder-zinc-800 rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">No personnel matching criteria.</p>
              </div>
            ) : (
              filtered.map((p, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] group hover:bg-white/[0.06] hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-5 mb-4 md:mb-0">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all bg-white/5 border-white/10">
                        <Users className="w-6 h-6 text-zinc-600" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-black uppercase text-sm tracking-tight">{p.name || "Student Participant"}</p>
                          {p.is_completed && (
                             <span className="ml-2 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                               <CheckCircle2 className="w-3 h-3" /> Certified
                             </span>
                          )}
                        </div>
                        <p className="text-zinc-500 font-mono text-[10px] tracking-tight">{p.email}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectedStudent(p.email); setIsProgressOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 text-zinc-500 hover:text-blue-400 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Analytics
                    </button>
                    


                    <button 
                      onClick={() => handleRemove(p.email)}
                      className="p-2 border border-white/5 text-zinc-700 hover:text-red-500 hover:border-red-500/20 rounded-xl transition-all"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BulkImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ProgressModal email={selectedStudent} isOpen={isProgressOpen} onClose={() => setIsProgressOpen(false)} />
    </>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
