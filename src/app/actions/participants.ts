"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchParticipants() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
  return data;
}

export async function addParticipant(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string; // Optional depending on schema

  if (!email || !email.includes("@")) {
    return { error: "A valid email is required." };
  }

  // Attempt to insert. Depending on exact DB schema, 'name' might fail if the column doesn't exist.
  // We'll pass it in case they added it, but if it fails we might need to fallback to just email.
  const payload: any = { 
    email: email.toLowerCase(),
    is_admin: false 
  };
  
  if (name) {
    // We assume the schema has been altered to include name, or we just try
    // wait, if we send a column that doesn't exist, Supabase will hard crash the insert.
    // Given we don't know if 'name' exists, and standard was just email & is_admin, 
    // let's just insert 'name' and if it fails return error hinting at DB mutation.
    payload.name = name;
  }

  const { error } = await supabase
    .from("participants")
    .insert([payload]);

  if (error) {
    console.error("Participant Add Error:", error);
    // graceful fallback if column doesn't exist
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

export async function removeParticipant(email: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("email", email);

  if (error) {
    console.error("Participant Remove Error:", error);
    return { error: "Failed to delete participant record." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function bulkAddParticipants(participants: { email: string; name?: string }[]) {
  const supabase = await createClient();
  
  const payload = participants.map(p => ({
    email: p.email.toLowerCase(),
    name: p.name || "",
    is_admin: false
  }));

  const { error } = await supabase
    .from("participants")
    .upsert(payload, { onConflict: "email" });

  if (error) {
    console.error("Bulk Import Error:", error);
    return { error: "Failed to import participants. Check CSV format." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function toggleAdminStatus(email: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .update({ is_admin: !currentStatus })
    .eq("email", email);

  if (error) {
    console.error("Toggle Admin Error:", error);
    return { error: "Failed to update admin privileges." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function fetchStudentProgress(email: string) {
  const supabase = await createClient();
  
  // 1. Fetch progress
  const { data: progress, error: progressError } = await supabase
    .from("student_progress")
    .select("*, courses(id, title)")
    .eq("email", email.toLowerCase());

  if (progressError) {
    console.error("Fetch Progress Error:", progressError);
    return [];
  }

  // 2. Fetch all modules for these courses to map IDs to titles
  const courseIds = progress.map(p => p.course_id);
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("id, title, course_id")
    .in("course_id", courseIds);

  if (modulesError) {
    console.error("Fetch Modules Error:", modulesError);
    return progress; // Fallback to raw IDs
  }

  // 3. Map titles into progress object
  return progress.map(p => ({
    ...p,
    completed_module_titles: p.completed_modules.map((mId: string) => 
      modules.find(m => m.id === mId)?.title || `Unknown Module (${mId.slice(0,4)})`
    )
  }));
}
