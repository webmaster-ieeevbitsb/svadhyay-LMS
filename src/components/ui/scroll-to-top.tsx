"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    // Immediate
    handleScroll();
    
    // Multiple pulses to catch various hydration/restoration timings
    const timers = [10, 50, 100, 200].map(delay => setTimeout(handleScroll, delay));
    
    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
