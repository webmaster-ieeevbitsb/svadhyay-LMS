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
  console.log(`[SYNC_MASTERY] Starting sync for ${email} in course ${courseId}, module ${moduleId}`);

  // 2. Fetch existing progress for this course
  const { data: progress, error: fetchError } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError) {
    console.error(`[SYNC_MASTERY] Error fetching progress for ${email}:`, fetchError);
    return { error: "Failed to retrieve existing progress record." };
  }

  // Get current modules, safely handling null
  const currentCompleted = (progress?.completed_modules || []).map(id => id.toLowerCase());
  const normalizedModuleId = moduleId.toLowerCase();

  // 3. Check if already mastered
  if (currentCompleted.includes(normalizedModuleId)) {
    console.log(`[SYNC_MASTERY] Module ${moduleId} already in completed_modules for ${email}.`);
    return { success: true, message: "Module already recorded as completed." };
  }

  // Add the new module ID
  const updatedModules = Array.from(new Set([...currentCompleted, normalizedModuleId]));
  
  // 4. Determine if course is now fully completed
  const { data: allModules, error: modulesError } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  
  if (modulesError) {
    console.error(`[SYNC_MASTERY] Error fetching all modules for course ${courseId}:`, modulesError);
    return { error: "Verification failed. Could not fetch course structure." };
  }

  const allModuleIds = (allModules || []).map(m => m.id.toLowerCase());
  const isCompleted = allModuleIds.length > 0 && allModuleIds.every(id => updatedModules.includes(id));
  
  if (isCompleted) {
    console.log(`[SYNC_MASTERY] Course ${courseId} is now FULLY COMPLETED for ${email}!`);
  }

  if (progress) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("student_progress")
      .update({ 
        completed_modules: updatedModules,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : progress.completed_at,
        updated_at: new Date().toISOString()
      })
      .eq("id", progress.id);

    if (updateError) {
      console.error(`[SYNC_MASTERY] Error updating progress for ${email}:`, updateError);
      return { error: "Failed to persist mastery to the database." };
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from("student_progress")
      .insert([{
        email,
        course_id: courseId,
        completed_modules: updatedModules,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }]);

    if (insertError) {
      console.error(`[SYNC_MASTERY] Error inserting progress for ${email}:`, insertError);
      return { error: "Failed to initialize progress record." };
    }
  }

  console.log(`[SYNC_MASTERY] Successfully updated progress for ${email}. Completed modules count: ${updatedModules.length}`);

  // Invalidate caches
  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/courses/${courseId}`, "layout");
  revalidatePath("/dashboard", "page");

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

/**
 * Resets (deletes) progress for a student in a specific course.
 * This is an administrative action.
 */
export async function resetStudentProgress(email: string, courseId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("student_progress")
    .delete()
    .eq("email", email.toLowerCase())
    .eq("course_id", courseId);

  if (error) {
    console.error("[RESET_PROGRESS] Error:", error);
    return { error: "Failed to reset student progress." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}
