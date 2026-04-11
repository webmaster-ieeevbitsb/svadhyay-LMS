"use client";

import { useState, useEffect } from "react";
import { 
  scanUnoptimizedAssets, 
  uploadSubmoduleMedia, 
  updateAssetRecord, 
  identifyOrphanedAssets,
  deleteStorageAssets
} from "@/app/actions/media";
import { optimizeImage } from "@/utils/image-optimizer";
import { 
  Zap, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Search,
  Activity,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export default function AssetOptimizer() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [orphans, setOrphans] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTaskName, setCurrentTaskName] = useState("");

  const runScan = async () => {
    setIsScanning(true);
    const res = await scanUnoptimizedAssets();
    if (res.tasks) {
      setTasks(res.tasks);
    }
    
    const orphanRes = await identifyOrphanedAssets();
    if (orphanRes.orphanedAssets) {
      setOrphans(orphanRes.orphanedAssets);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    runScan();
  }, []);

  const startOptimization = async () => {
    if (tasks.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    // ... same processing logic ...
    let completed = 0;

    for (const task of tasks) {
      setCurrentTaskName(task.name);
      try {
        const response = await fetch(task.url);
        const blob = await response.blob();
        const file = new File([blob], "legacy-asset.png", { type: blob.type });
        const optimizedFile = await optimizeImage(file);
        const formData = new FormData();
        formData.append("file", optimizedFile);
        const uploadRes = await uploadSubmoduleMedia(formData);
        if (uploadRes.error) throw new Error(uploadRes.error);
        await updateAssetRecord(task, uploadRes.publicUrl!);
        completed++;
        setProgress(Math.round((completed / tasks.length) * 100));
      } catch (err) {
        console.error(`Failed to optimize ${task.name}:`, err);
        toast.error(`Failed: ${task.name}`);
      }
    }

    setIsProcessing(false);
    setCurrentTaskName("");
    toast.success("System Asset Optimization Complete!");
    runScan();
  };

  const startCleanup = async () => {
    if (orphans.length === 0) return;
    setIsCleaning(true);
    try {
      await deleteStorageAssets(orphans);
      toast.success(`Cleanup Complete: ${orphans.length} files removed.`);
      setOrphans([]);
    } catch (err) {
      toast.error("Cleanup failed. Check storage permissions.");
    }
    setIsCleaning(false);
    runScan();
  };

  if (tasks.length === 0 && orphans.length === 0 && !isScanning) return null;

  const totalSavedSpace = (orphans.reduce((acc: number, curr: any) => acc + curr.size, 0) / (1024 * 1024)).toFixed(1);

  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden group mt-8">
       {/* Background HUD Decor */}
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Activity className="w-32 h-32 text-green-500" />
       </div>

       <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Performance Health</span>
             </div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Asset <span className="text-green-500">Optimizer</span></h3>
          </div>
          {(tasks.length > 0 || orphans.length > 0) && (
            <div className="px-4 py-2 bg-green-600/10 border border-green-500/20 rounded-xl flex items-center gap-2">
               <Database className="w-3 h-3 text-green-500" />
               <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{tasks.length + orphans.length} Issues Detected</span>
            </div>
          )}
       </div>

       <div className="space-y-4 pt-2 relative z-10">
          {/* Optimization Flow */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-md">
                 Found <span className="text-white font-bold">{tasks.length}</span> images using legacy formats (PNG/JPG).
              </p>
              {isProcessing ? (
                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-green-500">
                      <span>Compressing: {currentTaskName}</span>
                      <span>{progress}%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                   </div>
                </div>
              ) : (
                <button 
                  onClick={startOptimization}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Optimize Records
                </button>
              )}
            </div>
          )}

          {/* Deep Cleanup Flow */}
          {tasks.length === 0 && orphans.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                    <Trash2 className="w-3 h-3" />
                    <span>Deep Storage Cleanup</span>
                 </div>
                 <p className="text-zinc-400 text-[11px] leading-relaxed">
                   Detected <span className="text-white font-bold">{orphans.length} orphaned files</span> (~{totalSavedSpace}MB) left behind from previous legacy uploads.
                 </p>
                 {isCleaning ? (
                   <div className="flex items-center gap-2 text-blue-500 text-[9px] font-bold uppercase italic animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Wiping Ghost Assets...
                   </div>
                 ) : (
                   <button 
                     onClick={startCleanup}
                     className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                     Clear {orphans.length} Ghost Files
                   </button>
                 )}
              </div>
            </div>
          )}

          {tasks.length === 0 && orphans.length === 0 && !isScanning && (
            <div className="flex items-center gap-3 p-4 bg-green-600/5 border border-green-500/20 rounded-2xl">
               <ShieldCheck className="w-5 h-5 text-green-500" />
               <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">System Sanitized</span>
                  <p className="text-zinc-500 text-[10px]">All media assets are optimized and clean.</p>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
