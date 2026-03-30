"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadImageToSupabase(file: File, bucket: string) {
  try {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log(`[STORAGE] Attempting upload to bucket: ${bucket}, path: ${filePath}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("[STORAGE] Supabase Error:", uploadError);
      return { error: `Upload failed: ${uploadError.message}` };
    }

    console.log(`[STORAGE] Upload successful! Generating public URL...`);

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error("[STORAGE] Failed to generate public URL");
      return { error: "Failed to generate public URL for uploaded image." };
    }

    return { publicUrl: data.publicUrl };
  } catch (err: any) {
    console.error("[STORAGE] Fatal Internal Error:", err);
    return { error: `Internal upload failure: ${err.message}` };
  }
}

export async function createCourse(formData: FormData) {
  try {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const thumbnailFile = formData.get("thumbnail_image");
    let thumbnail_url = formData.get("thumbnail_url") as string | null;

    if (!title) {
      return { error: "Title is required" };
    }

    // Handle image upload if a file resides in FormData
    if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
      console.log(`[ACTION] Detected file upload for new course`);
      const uploadResult = await uploadImageToSupabase(thumbnailFile, 'course-thumbnails');
      if (uploadResult.error) {
         return { error: uploadResult.error };
      }
      thumbnail_url = uploadResult.publicUrl || null;
    }

    const metadata = {
      overview: formData.get("overview") as string || "",
      goals_list: formData.get("goals_list") as string || "",
      duration_text: formData.get("duration_text") as string || "",
    };

    const { data, error } = await supabase
      .from("courses")
      .insert([{ 
        title, 
        description, 
        thumbnail_url,
        metadata 
      }])
      .select()
      .single();

    if (error) {
      console.error("[ACTION] DB Insert Error:", error.message);
      return { error: `Failed to create course: ${error.message}` };
    }

    revalidatePath("/admin/courses");
    return { success: true, courseId: data.id };
  } catch (err: any) {
    console.error("[ACTION] Fatal error in createCourse:", err.message);
    return { error: "Internal server error. Please check backend logs." };
  }
}

export async function fetchCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  return data;
}

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const thumbnailFile = formData.get("thumbnail_image");
    let thumbnail_url = formData.get("thumbnail_url") as string | null;

    if (!title) return { error: "Title is required" };

    // Handle image upload if a file resides in FormData
    if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
      console.log(`[ACTION] Detected file upload for course: ${courseId}`);
      const uploadResult = await uploadImageToSupabase(thumbnailFile, 'course-thumbnails');
      
      if (uploadResult.error) {
         console.error(`[ACTION] Upload failed: ${uploadResult.error}`);
         return { error: uploadResult.error };
      }
      thumbnail_url = uploadResult.publicUrl || null;
      console.log(`[ACTION] New thumbnail URL: ${thumbnail_url}`);
    }

    const metadata = {
      overview: formData.get("overview") as string || "",
      goals_list: formData.get("goals_list") as string || "",
      duration_text: formData.get("duration_text") as string || "",
    };

    const { error: updateError } = await supabase
      .from("courses")
      .update({ 
        title, 
        description, 
        thumbnail_url,
        metadata 
      })
      .eq("id", courseId);

    if (updateError) {
      console.error("[ACTION] DB Update Error:", updateError.message);
      return { error: `Database update failed: ${updateError.message}` };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    
    return { success: true };
  } catch (err: any) {
    console.error("[ACTION] Fatal error in updateCourse:", err.message);
    return { error: "Internal server error. Please check backend logs." };
  }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    console.error("Course deletion error:", error);
    return { error: `Deletion failed: ${error.message}` };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function markModuleComplete(courseId: string, moduleId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "No user authenticated" };

  const email = user.email.toLowerCase();

  // Try to find existing progress
  const { data: progress } = await supabase
    .from("student_progress")
    .select("*")
    .eq("email", email)
    .eq("course_id", courseId)
    .single();

  if (progress) {
    // Check if moduleId already exists
    if (progress.completed_modules.includes(moduleId)) {
      return { success: true };
    }

    const { error } = await supabase
      .from("student_progress")
      .update({ 
        completed_modules: [...progress.completed_modules, moduleId] 
      })
      .eq("id", progress.id);

    if (error) return { error: error.message };
  } else {
    // Create new progress row
    const { error } = await supabase
      .from("student_progress")
      .insert([{
        email,
        course_id: courseId,
        completed_modules: [moduleId],
        is_completed: false
      }]);

    if (error) return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}/modules/${moduleId}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}
