"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionProps {
  title: string;
  items: {
    label: string;
    content: string;
  }[];
}

export function Accordion({ title, items }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-md transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-lg font-bold text-white tracking-wide">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 pt-0 space-y-6 border-t border-white/5 mt-4 bg-black/20">
          {items.map((item, idx) => (
            item.content && (
              <div key={idx} className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-blue-500 tracking-[0.2em]">{item.label}</h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
