import { useState, useRef, useMemo } from "react";
import { Bold, List, Type, ChevronRight, ChevronDown, Superscript, Subscript, ListOrdered, Image, Video, Loader2, Signal, Eye, AlertCircle } from "lucide-react";
import { uploadSubmoduleMedia } from "@/app/actions/media";
import { MediaModal } from "@/components/ui/media-modal";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function RichTextarea({ value, onChange, placeholder, className, label }: RichTextareaProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: "image" | "video"; isOpen: boolean } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // REAL-TIME MEDIA SCANNER
  const mediaUplinks = useMemo(() => {
    const regex = /!\[(image|video)\]\((.*?)\)/g;
    const matches = [...value.matchAll(regex)];
    return matches.map(m => ({ type: m[1], url: m[2] }));
  }, [value]);

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

  const handleImageClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      setModalConfig({ type: "image", isOpen: true });
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Tactical Warning: File exceeds 10MB. Please compress and retry.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadSubmoduleMedia(formData);
      if (result.error) {
        alert(result.error);
      } else if (result.publicUrl) {
        insertMarker(`![image](${result.publicUrl})`, "");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Fatal transmission failure. Check repository logs.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVideoClick = () => {
    setModalConfig({ type: "video", isOpen: true });
  };

  const handleModalSubmit = (url: string) => {
    if (url && modalConfig) {
      insertMarker(`![${modalConfig.type}](${url})`, "");
    }
    setModalConfig(null);
  };

  return (
    <div className={`space-y-2 group/rt ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>}
        <button 
          type="button"
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

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {showToolbar && (
        <div className="flex items-center gap-1 p-1.5 bg-zinc-950 border border-white/10 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <ToolbarButton icon={<Bold className="w-3.5 h-3.5" />} onClick={() => insertMarker("**")} tooltip="Bold" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<List className="w-3.5 h-3.5" />} onClick={() => insertMarker("- ")} tooltip="Bullet List" />
          <ToolbarButton icon={<ListOrdered className="w-3.5 h-3.5" />} onClick={() => insertMarker("1. ")} tooltip="Numbered List" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton icon={<Superscript className="w-3.5 h-3.5" />} onClick={() => insertMarker("^", "^")} tooltip="Superscript" />
          <ToolbarButton icon={<Subscript className="w-3.5 h-3.5" />} onClick={() => insertMarker("~", "~")} tooltip="Subscript" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolbarButton 
            disabled={isUploading}
            icon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />} 
            onClick={handleImageClick} 
            tooltip={isUploading ? "Uploading..." : "Upload Image (Shift+Click for URL)"} 
          />
          <ToolbarButton icon={<Video className="w-3.5 h-3.5" />} onClick={handleVideoClick} tooltip="Insert Video Link" />
        </div>
      )}

      {/* MEDIA PREVIEW GALLERY */}
      {mediaUplinks.length > 0 && (
         <div className="flex gap-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl overflow-x-auto custom-scrollbar group/preview shadow-inner">
            {mediaUplinks.map((media, idx) => (
              <div key={idx} className="flex-shrink-0 w-32 group/item relative transition-all hover:w-48">
                 <div className="aspect-video w-full bg-black rounded-lg border border-white/10 overflow-hidden relative shadow-2xl transition-all group-hover/item:border-blue-500/50">
                    {media.type === "image" ? (
                       <img 
                         src={media.url} 
                         alt="Preview" 
                         className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity"
                         onError={(e) => {
                            (e.target as any).src = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop";
                            (e.target as any).className = "w-full h-full object-cover grayscale opacity-20";
                         }}
                       />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                          <Video className="w-6 h-6 text-white/20 mb-2" />
                          <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest px-2 text-center truncate w-full">{media.url}</span>
                       </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-lg" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-md border border-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                       {media.type === "image" ? <Image className="w-3 h-3 text-white/50" /> : <Video className="w-3 h-3 text-white/50" />}
                    </div>
                 </div>
              </div>
            ))}
         </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-950/50 border border-white/10 p-4 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] text-sm rounded-xl font-medium placeholder:text-zinc-700"
      />

      <MediaModal 
        isOpen={!!modalConfig}
        type={modalConfig?.type || "video"}
        onClose={() => setModalConfig(null)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

function ToolbarButton({ icon, onClick, tooltip, disabled }: { icon: React.ReactNode, onClick: (e: React.MouseEvent) => void, tooltip: string, disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`p-2 rounded transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed text-zinc-600' 
          : 'hover:bg-white/10 text-zinc-400 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function ChevronUp(props: any) {
  return <ChevronDown {...props} className={props.className + " rotate-180"} />;
}
