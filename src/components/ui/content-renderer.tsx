"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  // SMART MEDIA PRE-PROCESSOR
  // This handles raw iframes, naked links, and common user formatting errors.
  const processedContent = (content || "")
    // 1. Handle ![video](<iframe ...>) or ![video](URL) robustly
    .replace(/!\[video\]\((.*?)\)/g, (match, p1) => {
      // If it contains an iframe, extract the src
      const urlMatch = p1.match(/src=["']([^"']+)["']/);
      const url = urlMatch ? urlMatch[1] : p1.replace(/<[^>]+>/g, "").trim();
      return `![video](${url})`;
    })
    // 2. Handle raw <iframe> tags outside of markdown
    .replace(/<iframe.*?src=["'](.*?)["'].*?><\/iframe>/g, "![video]($1)")
    // 3. Handle naked YouTube URLs on their own lines
    .replace(/(^|\n)(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)\/\S+)/g, "$1![video]($2)")
    // 4. Clean up generic markers like ^sup^ and ~sub~
    .replace(/\^([^^]+)\^/g, "<sup>$1</sup>")
    .replace(/~([^~]+)~/g, "<sub>$1</sub>");

  return (
    <div className={`font-serif-content leading-relaxed selection:bg-blue-500/30 ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
          strong: ({ children }) => <strong className="font-bold text-white/90">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
          img: ({ src, alt, ...props }) => {
            let source = typeof src === "string" ? src : "";
            if (!source) return null;

            // ABSOLUTE VIDEO DETECTION
            const altText = String(alt || "").toLowerCase();
            const srcUrl = String(source || "").toLowerCase();
            const isVideo = altText.includes("video") || 
                            srcUrl.includes("youtube.com") || 
                            srcUrl.includes("youtu.be") || 
                            srcUrl.includes("vimeo.com") ||
                            srcUrl.includes("/embed/");

            if (isVideo) {
               // Standardize YoutTube URLs
               if (source.includes("youtube.com/watch?v=")) {
                  source = source.replace("watch?v=", "embed/");
               } else if (source.includes("youtu.be/")) {
                  const parts = source.split("/");
                  const idAndQuery = parts[parts.length - 1]; 
                  source = `https://www.youtube.com/embed/${idAndQuery}`;
               }

               return (
                 <div className="aspect-video w-full my-10 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group shadow-blue-500/10">
                    <iframe 
                       src={source} 
                       className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" 
                       allowFullScreen 
                       title="Modular Video Intelligence"
                    />
                    <div className="absolute inset-0 pointer-events-none border-[2px] border-white/[0.05] rounded-2xl shadow-inner" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                 </div>
               );
            }
            
            return (
              <div className="my-10 space-y-2 group/media">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all hover:border-blue-500/30">
                  <img 
                    src={source} 
                    alt={alt} 
                    className="w-full h-auto" 
                    {...props} 
                  />
                  <div className="absolute inset-0 pointer-events-none border-[2px] border-white/[0.05] rounded-2xl shadow-inner" />
                </div>
                {alt && alt !== "image" && (
                  <p className="text-[10px] text-center font-bold uppercase tracking-widest text-zinc-500/80 italic group-hover/media:text-blue-400/60 transition-colors">
                    {alt}
                  </p>
                )}
              </div>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
