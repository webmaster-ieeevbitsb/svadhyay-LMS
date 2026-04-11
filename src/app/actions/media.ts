"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "@/utils/supabase/auth-utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Handles media uploads for course sub-modules.
 * Enforces a 10MB limit and image-only MIME types.
 */
export async function uploadSubmoduleMedia(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    if (file.size > MAX_FILE_SIZE) {
      return { error: "File exceeds 10MB limit. Please compress and retry." };
    }

    if (!file.type.startsWith("image/")) {
      return { error: "Unauthorized format. Only image assets are allowed." };
    }

    const auth = await verifyAdmin();
    if (auth.error !== null) return { error: auth.error };
    const { supabase } = auth;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `submodule-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('module-content')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const { data } = supabase.storage
      .from('module-content')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return { error: "Public URL generation failed. Check storage permissions." };
    }

    return { publicUrl: data.publicUrl };

  } catch (err: any) {
    return { error: "Internal server error during media transmission." };
  }
}
