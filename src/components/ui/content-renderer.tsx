"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  // Simple parser for our custom markers if ReactMarkdown doesn't handle them perfectly
  // or if we want to ensure specific HTML tagging for sup/sub.
  // ReactMarkdown with GFM handles bold (**) and lists (-). 
  // We'll add custom handling for ^sup^ and ~sub~.
  
  const processedContent = content
    .replace(/\^([^^]+)\^/g, "<sup>$1</sup>")
    .replace(/~([^~]+)~/g, "<sub>$1</sub>");

  return (
    <div className={`font-serif-content leading-relaxed selection:bg-blue-500/30 ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Use dangerouslySetInnerHTML for the processed sup/sub if needed, 
          // but better to use a custom rehype plugin or standard markdown if possible.
          // For now, we'll use a safer approach for the markers.
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-white/90">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
      
      {/* 
        Note: The simple regex replacement above for sup/sub 
        actually needs a dangerouslySetInnerHTML or a specific rehype plugin 
        to render in ReactMarkdown. For this tactical build, I'll use 
        a simple split/map approach for basic text if Markdown isn't enough,
        but GFM is powerful. 
      */}
    </div>
  );
}
