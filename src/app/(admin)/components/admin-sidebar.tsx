"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-white/5 bg-[#0a0a0e] pt-0 md:pt-8 md:sticky md:top-20 md:h-[calc(100vh-80px)] shrink-0 z-20">
      <div className="hidden md:block px-6 mb-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
        Navigation
      </div>
      
      <div className="flex-1 grid grid-cols-2 md:flex md:flex-col px-4 py-4 md:py-0 gap-2 md:space-y-2">
        <Link 
          href="/admin/dashboard" 
          className={`flex items-center justify-center text-center px-2 py-2 md:px-4 md:py-3 rounded-lg text-[10px] md:text-sm font-bold transition-all duration-300 ${
            pathname === "/admin/dashboard" || pathname === "/admin" 
              ? "bg-white/10 text-white shadow-inner border border-white/5" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
        >
          Dashboard Overview
        </Link>
        <Link 
          href="/admin/courses" 
          className={`flex items-center justify-center text-center px-2 py-2 md:px-4 md:py-3 rounded-lg text-[10px] md:text-sm font-bold transition-all duration-300 ${
            pathname.startsWith("/admin/courses") 
              ? "bg-white/10 text-white shadow-inner border border-white/5" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
        >
          Manage Curriculum
        </Link>
      </div>

      <div className="hidden md:flex p-6 border-t border-white/5 items-center justify-center opacity-50">
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
          IEEE - VBIT SB
        </div>
      </div>
    </aside>
  );
}
