"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const TacticalCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Precision Position Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High-performance snappy spring config
  const springConfig = { damping: 25, stiffness: 500, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      
      // Update hidden state on move (fallback if mouseover misses)
      const target = e.target as HTMLElement;
      const isOverVideoOrIframe = 
        target?.tagName === "IFRAME" || 
        target?.tagName === "VIDEO" || 
        !!target?.closest("iframe") || 
        !!target?.closest("video");
      
      if (isHidden !== isOverVideoOrIframe) {
        setIsHidden(isOverVideoOrIframe);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Hide on video/iframe
      const isOverVideoOrIframe = 
        target?.tagName === "IFRAME" || 
        target?.tagName === "VIDEO" || 
        !!target?.closest("iframe") || 
        !!target?.closest("video");
      
      setIsHidden(isOverVideoOrIframe);

      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") ||
        window.getComputedStyle(target).cursor === "pointer";
      
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible, isHidden]);

  if (!isVisible || isHidden) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block overflow-hidden">
      
      {/* ── Blue Vector Pointer (Reference Replica v2) ──────────────────── */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-10%", // Exactly offset to make the TIP (top-left) the click focal point
          translateY: "-8%",
        }}
        animate={{
          scale: isHovered ? 1.15 : 1,
        }}
        className="absolute w-12 h-12 flex items-center justify-center"
      >
         <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {/* The Asymmetrical Pointer Path */}
            <path 
              d="M10,10 L70,55 L45,55 L35,85 Z" 
              fill={isHovered ? "#3b82f6" : "#2563eb"} // Solid Blue
              stroke="#000" // Solid Black Outline
              strokeWidth="6" 
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition-colors duration-200"
            />
            
            {/* Optional subtle inner highlight for premium look (optional match to original) */}
            <path 
              d="M10,10 L70,55 L45,55 L35,85 Z" 
              fill="none" 
              stroke="white" 
              strokeWidth="0.5" 
              className="opacity-20 translate-x-[1px] translate-y-[1px]"
            />
         </svg>
      </motion.div>

      {/* ── Focal Glow (Revealing Content Ambiently) ──────────────────── */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 1.5 : 1,
          opacity: isHovered ? 0.3 : 0.15,
        }}
        className="absolute w-20 h-20 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)] blur-2xl"
      />

    </div>
  );
};
