"use client";

import { useState } from "react";
import { ParticipantRegistry } from "./participant-registry";
import { AdminRegistry } from "./admin-registry";
import { Users, ShieldCheck } from "lucide-react";

export function DashboardTabs({ participants: initialParticipants }: { participants: any[] }) {
  const [activeTab, setActiveTab] = useState<"students" | "admins">("students");
  const [participants, setParticipants] = useState<any[]>(initialParticipants);


  return (
    <div className="space-y-6">
       {/* Segmented Control HUD */}
       <div className="flex justify-center md:justify-start">
         <div className="inline-flex items-center p-1.5 bg-[#0a0a0f] border border-white/5 rounded-2xl relative shadow-xl">
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-xl transition-transform duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]`} 
              style={{ transform: activeTab === 'students' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button 
              onClick={() => setActiveTab("students")}
              className={`relative z-10 flex items-center gap-2 px-8 py-3 text-xs font-black uppercase tracking-widest transition-colors w-40 justify-center ${activeTab === 'students' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
               <Users className={`w-4 h-4 transition-colors ${activeTab === 'students' ? 'text-white' : 'text-zinc-600'}`} /> Students
            </button>
            <button 
              onClick={() => setActiveTab("admins")}
              className={`relative z-10 flex items-center gap-2 px-8 py-3 text-xs font-black uppercase tracking-widest transition-colors w-40 justify-center ${activeTab === 'admins' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
               <ShieldCheck className={`w-4 h-4 transition-colors ${activeTab === 'admins' ? 'text-white' : 'text-blue-500/50'}`} /> Admins
            </button>
         </div>
       </div>

       {/* Tab Content Display */}
       <div className="relative">
          <div className={`${activeTab === 'students' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}`}>
             <ParticipantRegistry 
               participants={participants.filter(p => !p.is_admin)} 
               fullParticipants={participants}
               setFullParticipants={setParticipants}
             />
          </div>
          <div className={`${activeTab === 'admins' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}`}>
             <AdminRegistry 
               participants={participants.filter(p => p.is_admin)} 
               fullParticipants={participants}
               setFullParticipants={setParticipants}
             />
          </div>
       </div>
    </div>
  );
}
