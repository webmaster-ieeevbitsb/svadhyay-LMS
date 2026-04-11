"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Syncs module mastery to the student_progress table.
 * Manages course-level completion based on child module status.
 */
export async function syncMastery(courseId: string, moduleId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Authentication required for progress synchronization." };

  const email = user.email.toLowerCase();

  const { data: progress, error: fetchError } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError) {
    return { error: "Failed to retrieve existing progress record." };
  }

  const currentCompleted = (progress?.completed_modules || []).map((id: string) => id.toLowerCase());
  const normalizedModuleId = moduleId.toLowerCase();

  if (currentCompleted.includes(normalizedModuleId)) {
    return { success: true };
  }

  const updatedModules = Array.from(new Set([...currentCompleted, normalizedModuleId]));
  
  const { data: allModules, error: modulesError } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  
  if (modulesError) {
    return { error: "Verification failed. Could not fetch course structure." };
  }

  const allModuleIds = (allModules || []).map(m => m.id.toLowerCase());
  const allModulesDone = allModuleIds.length > 0 && allModuleIds.every(id => updatedModules.includes(id));
  
  // 4a. Check if the course has any final assessments (quizzes)
  const { count: quizCount } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  // A course is only auto-completed by modules IF it has no final assessment.
  // Otherwise, completion must be triggered explicitly by passing the quiz.
  const isNewlyCompleted = allModulesDone && (quizCount === 0);
  const finalIsCompleted = (progress?.is_completed) || isNewlyCompleted;
  
  if (progress) {
    const { error: updateError } = await supabase
      .from("student_progress")
      .update({ 
        completed_modules: updatedModules,
        is_completed: finalIsCompleted,
        completed_at: finalIsCompleted ? (progress.completed_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", progress.id);

    if (updateError) {
      return { error: "Failed to persist mastery to the database." };
    }
  } else {
    const { error: insertError } = await supabase
      .from("student_progress")
      .insert([{
        email,
        course_id: courseId,
        completed_modules: updatedModules,
        is_completed: finalIsCompleted,
        completed_at: finalIsCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      return { error: "Failed to initialize progress record." };
    }
  }

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
 * Tracks student engagement with a specific module.
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
 * Revokes child assessment completion while maintaining module progress.
 */
export async function clearAssessmentCompletion(progressId: string, courseId: string) {
  const supabase = await createClient();
  
  // 1. Verify Authentication & Admin Status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Unauthorized" };

  const { data: participant } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!participant?.is_admin) {
    return { error: "Forbidden: Admin access required" };
  }

  const { error } = await supabase
    .from("student_progress")
    .update({ 
      is_completed: false,
      completed_at: null 
    })
    .eq("id", progressId);

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/admin/dashboard", "page");
  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/courses/${courseId}`, "layout");
  
  return { success: true };
}

/**
 * Resets student progress for a specific course.
 */
export async function resetStudentProgress(idOrEmail: string, courseId: string) {
  const supabase = await createClient();

  // 1. Verify Authentication & Admin Status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Unauthorized" };

  const { data: participant } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!participant?.is_admin) {
    return { error: "Forbidden: Admin access required" };
  }
  
  let query = supabase.from("student_progress").delete({ count: "exact" });
  
  if (idOrEmail.includes("-") && idOrEmail.length > 20) {
    query = query.eq("id", idOrEmail);
  } else {
    query = query.eq("email", idOrEmail.trim().toLowerCase()).eq("course_id", courseId);
  }

  const { error, count } = await query;

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/admin/dashboard", "page");
  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/courses/${courseId}`, "layout");
  
  return { success: true, count };
}
