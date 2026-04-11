"use client";

import { useState, useEffect } from "react";
import { scanUnoptimizedAssets, uploadSubmoduleMedia, updateAssetRecord } from "@/app/actions/media";
import { optimizeImage } from "@/utils/image-optimizer";
import { 
  Zap, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Search,
  Activity
} from "lucide-react";
import { toast } from "sonner";

export default function AssetOptimizer() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTaskName, setCurrentTaskName] = useState("");

  const runScan = async () => {
    setIsScanning(true);
    const res = await scanUnoptimizedAssets();
    if (res.tasks) {
      setTasks(res.tasks);
      if (res.tasks.length > 0) {
        toast.info(`Scan Complete: Found ${res.tasks.length} unoptimized assets.`);
      }
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

    let completed = 0;

    for (const task of tasks) {
      setCurrentTaskName(task.name);
      try {
        // 1. Fetch original image
        const response = await fetch(task.url);
        const blob = await response.blob();
        
        // 2. Wrap in File object for our optimizer
        const file = new File([blob], "legacy-asset.png", { type: blob.type });

        // 3. Optimize (Canvas + WebP)
        const optimizedFile = await optimizeImage(file);

        // 4. Upload to Supabase
        const formData = new FormData();
        formData.append("file", optimizedFile);
        const uploadRes = await uploadSubmoduleMedia(formData);

        if (uploadRes.error) throw new Error(uploadRes.error);

        // 5. Update Database link
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
    runScan(); // Re-scan to confirm
  };

  if (tasks.length === 0 && !isScanning) return null;

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
          <div className="px-4 py-2 bg-green-600/10 border border-green-500/20 rounded-xl flex items-center gap-2">
             <Database className="w-3 h-3 text-green-500" />
             <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{tasks.length} Outdated Assets</span>
          </div>
       </div>

       <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-md relative z-10">
          We detected <span className="text-white font-bold">{tasks.length}</span> unoptimized images that are draining your bandwidth. Optimized WebP assets load up to 80% faster.
       </p>

       <div className="space-y-4 pt-2 relative z-10">
          {isProcessing ? (
            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-400">Processing: {currentTaskName}</span>
                  <span className="text-green-500 font-mono">{progress}%</span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
               </div>
               <div className="flex items-center gap-2 text-[9px] text-zinc-500 italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Stay on this page while optimization is in progress...</span>
               </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
               <button 
                 onClick={startOptimization}
                 disabled={isScanning || tasks.length === 0}
                 className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 active:scale-95 md:active:scale-100 disabled:opacity-50 group/btn"
               >
                 <Zap className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                 Optimize All System Assets
               </button>
               
               {isScanning && (
                 <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Scanning System Architecture...</span>
                 </div>
               )}
            </div>
          )}
       </div>

       {/* Quick Audit List (First 3 only) */}
       {!isProcessing && tasks.length > 0 && (
         <div className="pt-2 border-t border-white/5 space-y-2 opacity-60">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sample Identification</span>
            {tasks.slice(0, 2).map((task, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-medium text-zinc-500">
                <span className="truncate max-w-[150px]">{task.name}</span>
                <div className="flex items-center gap-2">
                   <span className="text-zinc-700">PNG/JPG</span>
                   <ArrowRight className="w-2.5 h-2.5" />
                   <span className="text-green-700">WEBP</span>
                </div>
              </div>
            ))}
            {tasks.length > 2 && <div className="text-[8px] text-zinc-700 font-bold">... and {tasks.length - 2} more</div>}
         </div>
       )}
    </div>
  );
}
