"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0e] pt-8 sticky top-20 h-[calc(100vh-80px)] shrink-0">
      <div className="px-6 mb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
        Navigation
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        <Link 
          href="/admin/dashboard" 
          className={`flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            pathname === "/admin/dashboard" || pathname === "/admin" 
              ? "bg-white/10 text-white shadow-inner border border-white/5" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
        >
          Dashboard Overview
        </Link>
        <Link 
          href="/admin/courses" 
          className={`flex items-center px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            pathname.startsWith("/admin/courses") 
              ? "bg-white/10 text-white shadow-inner border border-white/5" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
        >
          Manage Curriculum
        </Link>
      </div>

      <div className="p-6 border-t border-white/5 flex items-center justify-center opacity-50">
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
          IEEE - VBIT SB
        </div>
      </div>
    </aside>
  );
}
