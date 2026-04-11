import { fetchParticipants } from "@/app/actions/participants";
import { DashboardTabs } from "./components/dashboard-tabs";
import CohortRotator from "./components/cohort-rotator";
import AssetOptimizer from "./components/asset-optimizer";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const participants = await fetchParticipants();
  
  // Total stats logic
  const students = participants.filter(p => !p.is_admin);
  const totalStudents = students.length;
  const certifiedStudents = students.filter(p => p.is_completed).length;
  const totalAdmins = participants.filter(p => p.is_admin).length;
  const certRate = totalStudents > 0 ? Math.round((certifiedStudents / totalStudents) * 100) : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       
       <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-6 border-b border-white/5">
         <div>
           <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white drop-shadow-lg leading-none">
             Platform <span className="text-blue-500">Administration</span>
           </h1>
           <p className="text-zinc-500 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">IEEE - VBIT SB Learning Platform Control</p>
         </div>

         {/* Stats Widget */}
         <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[140px] flex-1 xl:flex-none flex flex-col items-center justify-center">
               <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Registered Students</span>
               <span className="text-4xl font-black text-white">{totalStudents}</span>
            </div>
            <div className="bg-green-600/10 border border-green-500/20 rounded-2xl p-6 min-w-[140px] flex-1 xl:flex-none flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 blur-xl"></div>
               <span className="text-[10px] uppercase tracking-widest font-black text-green-500 relative z-10">Pass Rate</span>
               <span className="text-4xl font-black text-green-400 relative z-10">{certRate}%</span>
            </div>
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 min-w-[140px] flex-1 xl:flex-none flex flex-col items-center justify-center w-full md:w-auto">
               <span className="text-[10px] uppercase tracking-widest font-black text-blue-500">System Admins</span>
               <span className="text-4xl font-black text-blue-400">{totalAdmins}</span>
            </div>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
             <DashboardTabs participants={participants} />
          </div>
          <div className="lg:col-span-4 sticky top-6 space-y-8">
             <CohortRotator participantCount={totalStudents} />
             <AssetOptimizer />
          </div>
       </div>

    </div>
  );
}
