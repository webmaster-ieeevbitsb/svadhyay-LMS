import { createClient } from "@/utils/supabase/server";
import { fetchParticipants } from "@/app/actions/participants";
import { ParticipantRegistry } from "./components/participant-registry";

export default async function AdminDashboardPage() {
  const participants = await fetchParticipants();
  
  // Total stats logic (we could query users directly via supabase admin, but we are querying participants table)
  const totalStudents = participants.length;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
         <div>
           <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white drop-shadow-lg">
             Platform <span className="text-blue-500">Control</span>
           </h1>
           <p className="text-zinc-500 mt-2">Managing LMS Resource Dashboard</p>
         </div>

         {/* Stats Widget */}
         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[160px] flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Students</span>
            <span className="text-4xl font-black text-white">{totalStudents}</span>
         </div>
       </div>

       {/* Core Registry Block */}
       <ParticipantRegistry initialParticipants={participants} />

    </div>
  );
}
