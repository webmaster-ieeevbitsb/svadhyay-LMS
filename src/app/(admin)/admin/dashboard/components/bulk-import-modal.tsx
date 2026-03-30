"use client";

import { useState } from "react";
import { bulkAddParticipants } from "@/app/actions/participants";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function BulkImportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setStatus(null);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const hasHeader = !lines[0].includes("@");
      const dataLines = hasHeader ? lines.slice(1) : lines;
      
      const participants = dataLines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        const email = parts.find(p => p.includes("@"));
        const name = parts.find(p => !p.includes("@") && p !== "");
        return email ? { email, name } : null;
      }).filter(p => p !== null) as { email: string; name?: string }[];

      if (participants.length === 0) {
        throw new Error("No valid emails found in CSV.");
      }

      const res = await bulkAddParticipants(participants);
      if (res.error) {
        setStatus({ type: 'error', message: res.error });
      } else {
        setStatus({ type: 'success', message: `Imported ${participants.length} students successfully!` });
        setTimeout(onClose, 2000);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "Failed to parse CSV." });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d12] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-50 p-2"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-2">
               <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Bulk CSV Import</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Format: <span className="text-blue-500">email, name</span><br/>or just <span className="text-blue-500">email</span> per line.
            </p>
          </div>

          <div className="space-y-4">
            <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}>
               <input 
                 type="file" 
                 accept=".csv,.txt"
                 onChange={(e) => setFile(e.target.files?.[0] || null)}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
               <p className="text-zinc-400 text-sm font-medium">{file ? file.name : "Click or drag CSV here"}</p>
            </div>

            {status && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="text-xs font-bold uppercase tracking-widest leading-tight">{status.message}</p>
              </div>
            )}

            <button
               onClick={handleImport}
               disabled={!file || isImporting}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
               {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Import Engine"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
