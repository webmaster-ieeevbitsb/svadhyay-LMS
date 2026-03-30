"use client";

import { Globe } from "lucide-react";
import Link from "next/link";

export function SocialLinks({ className = "" }: { className?: string }) {
  const links = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/ieeevbitsb/",
      hoverColor: "#1877F2",
      svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/ieee_vbitsb/",
      hoverColor: "#E4405F",
      svg: <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/ieee-vbit-sb/",
      hoverColor: "#0A66C2",
      svg: (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </>
      )
    },
    {
      name: "WhatsApp",
      href: "https://whatsapp.com/channel/0029Vb6F16ALdQekr3hPVz3D",
      hoverColor: "#25D366",
      customViewBox: "0 0 510 512.459",
      svg: <path d="M435.689 74.468C387.754 26.471 324 .025 256.071 0 116.098 0 2.18 113.906 2.131 253.916c-.024 44.758 11.677 88.445 33.898 126.946L0 512.459l134.617-35.311c37.087 20.238 78.85 30.891 121.345 30.903h.109c139.949 0 253.88-113.917 253.928-253.928.024-67.855-26.361-131.645-74.31-179.643v-.012zm-179.618 390.7h-.085c-37.868-.011-75.016-10.192-107.428-29.417l-7.707-4.577-79.886 20.953 21.32-77.889-5.017-7.987c-21.125-33.605-32.29-72.447-32.266-112.322.049-116.366 94.729-211.046 211.155-211.046 56.373.025 109.364 22.003 149.214 61.903 39.853 39.888 61.781 92.927 61.757 149.313-.05 116.377-94.728 211.058-211.057 211.058v.011zm115.768-158.067c-6.344-3.178-37.537-18.52-43.358-20.639-5.82-2.119-10.044-3.177-14.27 3.178-4.225 6.357-16.388 20.651-20.09 24.875-3.702 4.238-7.403 4.762-13.747 1.583-6.343-3.178-26.787-9.874-51.029-31.487-18.86-16.827-31.597-37.598-35.297-43.955-3.702-6.355-.39-9.789 2.775-12.943 2.849-2.848 6.344-7.414 9.522-11.116s4.225-6.355 6.343-10.581c2.12-4.238 1.06-7.937-.522-11.117-1.584-3.177-14.271-34.409-19.568-47.108-5.151-12.37-10.385-10.69-14.269-10.897-3.703-.183-7.927-.219-12.164-.219s-11.105 1.582-16.925 7.939c-5.82 6.354-22.209 21.709-22.209 52.927 0 31.22 22.733 61.405 25.911 65.642 3.177 4.237 44.745 68.318 108.389 95.812 15.135 6.538 26.957 10.446 36.175 13.368 15.196 4.834 29.027 4.153 39.96 2.52 12.19-1.825 37.54-15.353 42.824-30.172 5.283-14.818 5.283-27.529 3.701-30.172-1.582-2.641-5.819-4.237-12.163-7.414l.011-.024z" />
    },
    {
      name: "ieeevbitsb.in",
      href: "https://ieeevbitsb.in/",
      hoverColor: "#00629B",
      icon: Globe
    },
  ];

  return (
    <div className={`flex items-center gap-8 ${className}`}>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="group relative"
          style={{ "--hover-color": link.hoverColor } as React.CSSProperties}
        >
          {/* Concentric Glowing Rings (Color-coded on Hover) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[var(--hover-color)] opacity-0 scale-0 group-hover:scale-125 group-hover:opacity-40 transition-all duration-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[var(--hover-color)] opacity-0 scale-0 group-hover:scale-150 group-hover:opacity-20 transition-all duration-700 delay-100" />

          {/* Subtle Color Glow Background */}
          <div className="absolute -inset-3 blur-xl opacity-0 group-hover:opacity-10 transition-all duration-500" style={{ backgroundColor: link.hoverColor }} />

          {link.svg ? (
            <svg
              viewBox={link.customViewBox || "0 0 24 24"}
              fill="none"
              stroke="currentColor"
              strokeWidth={link.customViewBox ? "0" : "2"}
              fillRule={link.customViewBox ? "evenodd" : undefined}
              clipRule={link.customViewBox ? "evenodd" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-zinc-500 group-hover:text-[var(--hover-color)] transition-all duration-300 relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_12px_var(--hover-color)]"
              style={{
                fill: link.customViewBox ? "currentColor" : "none",
                // We'll use currentColor for the WhatsApp path but it's complex.
              }}
            >
              {link.svg}
              {link.name === "Instagram" && (
                <>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </>
              )}
              {link.name === "LinkedIn" && (
                <circle cx="4" cy="4" r="2" />
              )}
            </svg>
          ) : link.icon && (
            <link.icon
              className="w-5 h-5 text-zinc-500 group-hover:text-[var(--hover-color)] transition-all duration-300 relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_12px_var(--hover-color)]"
              strokeWidth={2}
            />
          )}

          {/* Label tooltip (Matches Brand Color) */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-[8px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none tracking-widest whitespace-nowrap shadow-2xl" style={{ backgroundColor: link.hoverColor }}>
            {link.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
