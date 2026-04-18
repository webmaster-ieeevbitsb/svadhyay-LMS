"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/utils/supabase/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Fetches all participants and maps their completion status.
 */
export async function fetchParticipants() {
  const auth = await verifyAdmin();
  if (auth.error !== null) return [];
  const { supabase } = auth;
  const { data: participants, error } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !participants) {
    return [];
  }

  const { data: progress, error: progressError } = await supabase
    .from("student_progress")
    .select("email")
    .eq("is_completed", true);

  if (progressError || !progress) {
    return participants.map(p => ({ ...p, is_completed: false }));
  }

  const completedSet = new Set(progress.map(p => p.email.toLowerCase()));

  return participants.map(p => ({
    ...p,
    is_completed: completedSet.has(p.email?.toLowerCase())
  }));
}

/**
 * Manually adds a student participant to the registry.
 */
export async function addParticipant(prevState: any, formData: FormData) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) {
    return { error: "A valid email or user ID is required." };
  }

  const payload: any = {
    email: email.toLowerCase(),
    is_admin: false
  };

  if (name) {
    payload.name = name;
  }

  const { error } = await supabase
    .from("participants")
    .insert([payload]);

  if (error) {
    // Dynamic fallback for potential schema variations
    if (error.code === 'PGRST204' || error.message.includes("column")) {
      const fallbackPayload = { email: email.toLowerCase(), is_admin: false };
      const { error: fallbackError } = await supabase.from("participants").insert([fallbackPayload]);
      if (fallbackError) {
        return { error: "Failed to add participant to registry." };
      }
    } else {
      return { error: error.message };
    }
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

/**
 * Allocates administrative privileges to a specific email.
 */
export async function addAdmin(prevState: any, formData: FormData) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) {
    return { error: "A valid email or user ID is required." };
  }

  const payload: any = {
    email: email.toLowerCase(),
    is_admin: true
  };

  if (name) {
    payload.name = name;
  }

  const { error } = await supabase
    .from("participants")
    .upsert([payload], { onConflict: "email" });

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes("column")) {
      const fallbackPayload = { email: email.toLowerCase(), is_admin: true };
      const { error: fallbackError } = await supabase.from("participants").upsert([fallbackPayload], { onConflict: "email" });
      if (fallbackError) {
        return { error: "Failed to allocate admin privileges." };
      }
    } else {
      return { error: error.message };
    }
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

/**
 * Permanently removes a participant from the secure registry.
 */
export async function removeParticipant(email: string) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("email", email.toLowerCase());

  if (error) {
    return { error: "Failed to delete participant record." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

/**
 * Processes bulk participant imports with duplicate detection.
 */
export async function bulkAddParticipants(participants: { email: string; name?: string }[], isAdminMode: boolean = false) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const { data: existingAdmins } = await supabase
    .from("participants")
    .select("email")
    .eq("is_admin", true);

  const adminEmails = new Set(existingAdmins?.map(a => a.email.toLowerCase()) || []);

  const payloadMap = new Map();
  for (const p of participants) {
    const email = p.email.toLowerCase();
    payloadMap.set(email, {
      email,
      name: p.name || "",
      is_admin: isAdminMode ? true : adminEmails.has(email)
    });
  }
  const payload = Array.from(payloadMap.values());

  const { error } = await supabase
    .from("participants")
    .upsert(payload, { onConflict: "email" });

  if (error) {
    if (error.code === 'PGRST204' || error.message.includes("column")) {
      const fallbackPayload = payload.map(p => {
        return {
          email: p.email,
          is_admin: p.is_admin
        };
      });
      const { error: fallbackError } = await supabase
        .from("participants")
        .upsert(fallbackPayload, { onConflict: "email" });

      if (fallbackError) {
        return { error: `Failed to import participants: ${fallbackError.message}` };
      }
    } else {
      return { error: `Failed to import participants: ${error.message}` };
    }
  }

  revalidatePath("/admin/dashboard");
  return { success: true, count: payload.length, originalCount: participants.length };
}

/**
 * Refactors administrative access status for a participant.
 */
export async function toggleAdminStatus(email: string) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

    const { error } = await supabase.rpc("revoke_admin_access", {
      target_email: email.toLowerCase()
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/dashboard");
    return { success: true };
  }

  /**
   * Diagnostic tool to fetch granular progress metrics for a student.
   */
  export async function fetchStudentProgress(email: string) {
    const auth = await verifyAdmin();
    if (auth.error !== null) return [];
    const { supabase } = auth;

    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*, courses(id, title)")
      .eq("email", email.toLowerCase());

    if (progressError || !progress) {
      return [];
    }

    const courseIds = progress.map(p => p.course_id);
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, title, course_id")
      .in("course_id", courseIds);

    if (modulesError) {
      return progress;
    }

    return progress.map(p => ({
      ...p,
      completed_module_titles: p.completed_modules.map((mId: string) =>
        modules.find(m => m.id === mId)?.title || `Unknown Module (${mId.slice(0, 4)})`
      )
    }));
  }

  /**
   * Purges the entire student cohort while preserving administrative accounts.
   */
  export async function rotateStudentCohort() {
    const auth = await verifyAdmin();
    if (auth.error !== null) return { error: auth.error };
    const { supabase } = auth;

    const { error, count } = await supabase
      .from("participants")
      .delete({ count: 'exact' })
      .eq("is_admin", false);

    if (error) {
      return { error: "Failed to purge student cohort. Check DB permissions or RLS policies." };
    }

    revalidatePath("/admin/dashboard");
    return { success: true, count: count || 0 };
  }
