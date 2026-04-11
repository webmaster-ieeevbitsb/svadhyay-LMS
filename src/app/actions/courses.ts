"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/utils/supabase/auth-utils";
import { revalidatePath } from "next/cache";

async function uploadImageToSupabase(file: File, bucket: string) {
  try {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

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
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return { error: "Failed to generate public URL for uploaded image." };
    }

    return { publicUrl: data.publicUrl };
  } catch (err: any) {
    return { error: `Internal upload failure: ${err.message}` };
  }
}

export async function createCourse(formData: FormData) {
  try {
    const auth = await verifyAdmin();
    if (auth.error !== null) return { error: auth.error };
    const { supabase } = auth;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const thumbnailFile = formData.get("thumbnail_image");
    let thumbnail_url = formData.get("thumbnail_url") as string | null;

    if (!title) {
      return { error: "Title is required" };
    }

    // Handle image upload if a file resides in FormData
    if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
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
      return { error: `Failed to create course: ${error.message}` };
    }

    revalidatePath("/admin/courses");
    return { success: true, courseId: data.id };
  } catch (err: any) {
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
    return [];
  }
  return data;
}

export async function updateCourse(courseId: string, formData: FormData) {
  try {
    const auth = await verifyAdmin();
    if (auth.error !== null) return { error: auth.error };
    const { supabase } = auth;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const thumbnailFile = formData.get("thumbnail_image");
    let thumbnail_url = formData.get("thumbnail_url") as string | null;

    if (!title) return { error: "Title is required" };

    // Handle image upload if a file resides in FormData
    if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
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
      return { error: `Database update failed: ${updateError.message}` };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    
    return { success: true };
  } catch (err: any) {
    return { error: "Internal server error. Please check backend logs." };
  }
}

export async function deleteCourse(courseId: string) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    return { error: `Deletion failed: ${error.message}` };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}
