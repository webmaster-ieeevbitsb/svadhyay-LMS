"use client";

import { useState, useRef } from "react";
import { Bold, List, Type, ChevronRight, ChevronDown, Superscript, Subscript, ListOrdered } from "lucide-react";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function RichTextarea({ value, onChange, placeholder, className, label }: RichTextareaProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarker = (startMarker: string, endMarker: string = startMarker) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    // For lists, handle line-by-line if multiple lines
    if (startMarker === "- " || startMarker === "1. ") {
      const lines = selection.split("\n");
      const formattedLines = lines.map(line => `${startMarker}${line}`);
      const newText = before + formattedLines.join("\n") + after;
      onChange(newText);
      return;
    }

    const newText = before + startMarker + selection + endMarker + after;
    onChange(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startMarker.length,
        end + startMarker.length
      );
    }, 0);
  };

  return (
    <div className={`space-y-2 group/rt ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>}
        <button 
          onClick={() => setShowToolbar(!showToolbar)}
          className={`p-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
            showToolbar 
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
              : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {showToolbar ? 'Hide Format' : 'Format'}
          </span>
          {showToolbar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {showToolbar && (
        <div className="flex items-center gap-1 p-1.5 bg-zinc-950 border border-white/10 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <ToolbarButton icon={<Bold className="w-3.5 h-3.5" />} onClick={() => insertMarker("**")} tooltip="Bold" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<List className="w-3.5 h-3.5" />} onClick={() => insertMarker("- ")} tooltip="Bullet List" />
          <ToolbarButton icon={<ListOrdered className="w-3.5 h-3.5" />} onClick={() => insertMarker("1. ")} tooltip="Numbered List" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<Superscript className="w-3.5 h-3.5" />} onClick={() => insertMarker("^", "^")} tooltip="Superscript" />
          <ToolbarButton icon={<Subscript className="w-3.5 h-3.5" />} onClick={() => insertMarker("~", "~")} tooltip="Subscript" />
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-950/50 border border-white/10 p-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] text-sm rounded-xl font-medium placeholder:text-zinc-700"
      />
    </div>
  );
}

function ToolbarButton({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
    >
      {icon}
    </button>
  );
}

function ChevronUp(props: any) {
  return <ChevronDown {...props} className={props.className + " rotate-180"} />;
}
