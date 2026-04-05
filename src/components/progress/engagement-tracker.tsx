"use client";

import { useEffect } from "react";
import { trackEngagement } from "@/app/actions/progress";

interface EngagementTrackerProps {
  courseId: string;
  moduleId: string;
}

export function EngagementTracker({ courseId, moduleId }: EngagementTrackerProps) {
  useEffect(() => {
    // We send the tracking ping in the background after mount
    const track = async () => {
      try {
        await trackEngagement(courseId, moduleId);
      } catch (err) {
        console.error("Failed to track engagement:", err);
      }
    };
    
    track();
  }, [courseId, moduleId]);

  return null;
}
