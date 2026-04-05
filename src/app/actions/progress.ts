"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Syncs module mastery to the student_progress table.
 * If no progress record exists for this student/course, it creates one.
 */
export async function syncMastery(courseId: string, moduleId: string) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Authentication required for progress synchronization." };

  const email = user.email.toLowerCase();

  // 2. Fetch existing progress for this course
  const { data: progress, error: fetchError } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 is 'no rows found'
    console.error("[SYNC_MASTERY] Fetch Error:", fetchError);
    return { error: "Failed to retrieve existing progress." };
  }

  if (progress) {
    // 3. Update existing record if module not already in completed_modules
    if (progress.completed_modules.includes(moduleId)) {
      return { success: true, message: "Module already mastered." };
    }

    const updatedModules = [...progress.completed_modules, moduleId];
    
    // Check if this was the last module in the course to mark course as completed
    const { data: allModules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);
    
    const allModuleIds = allModules?.map(m => m.id) || [];
    const isCompleted = allModuleIds.every(id => updatedModules.includes(id));

    const { error: updateError } = await supabase
      .from("student_progress")
      .update({ 
        completed_modules: updatedModules,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : progress.completed_at
      })
      .eq("id", progress.id);

    if (updateError) {
      console.error("[SYNC_MASTERY] Update Error:", updateError);
      return { error: "Failed to persist mastery." };
    }
  } else {
    // 4. Create new progress record
    const { data: allModules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);
    
    const allModuleIds = allModules?.map(m => m.id) || [];
    const isCompleted = allModuleIds.length === 1 && allModuleIds[0] === moduleId;

    const { error: insertError } = await supabase
      .from("student_progress")
      .insert([{
        email,
        course_id: courseId,
        completed_modules: [moduleId],
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }]);

    if (insertError) {
      console.error("[SYNC_MASTERY] Insert Error:", insertError);
      return { error: "Failed to initialize progress record." };
    }
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Fetches mastery status for a specific course and module.
 */
export async function getModuleMastery(courseId: string, moduleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data: progress } = await supabase
    .from("student_progress")
    .select("completed_modules")
    .eq("email", user.email.toLowerCase())
    .eq("course_id", courseId)
    .single();

  return progress?.completed_modules?.includes(moduleId) || false;
}

/**
 * Tracks that a student has engaged with a specific module.
 * Creates or updates the progress record immediately.
 */
export async function trackEngagement(courseId: string, moduleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Authentication required." };

  const email = user.email.toLowerCase();

  const { data: existing } = await supabase
    .from("student_progress")
    .select("id")
    .eq("email", email)
    .eq("course_id", courseId)
    .single();

  if (existing) {
     await supabase
       .from("student_progress")
       .update({ 
          last_viewed_module_id: moduleId,
          last_viewed_at: new Date().toISOString()
       })
       .eq("id", existing.id);
  } else {
     await supabase
       .from("student_progress")
       .insert([{
          email,
          course_id: courseId,
          last_viewed_module_id: moduleId,
          completed_modules: [],
          is_completed: false
       }]);
  }

  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}
