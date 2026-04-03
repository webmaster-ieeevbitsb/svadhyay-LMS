"use server";

import { createClient } from "@/utils/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadSubmoduleMedia(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    // 1. Validate File Size (10MB)
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Tactical Warning: File exceeds 10MB. Please compress and retry." };
    }

    // 2. Validate File Type
    if (!file.type.startsWith("image/")) {
      return { error: "Unauthorized format. Only high-performance image assets are allowed." };
    }

    const supabase = await createClient();
    
    // 3. Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `submodule-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Attempt upload to module-content bucket
    const { error: uploadError } = await supabase.storage
      .from('module-content')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("[MEDIA_UPLOAD] Supabase Error:", uploadError);
      return { error: `Relay failed: ${uploadError.message}` };
    }

    // 5. Build public URL
    const { data } = supabase.storage
      .from('module-content')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return { error: "Uplink confirmed but public URL generation failed. Check storage permissions." };
    }

    return { publicUrl: data.publicUrl };

  } catch (err: any) {
    console.error("[MEDIA_UPLOAD] Internal Error:", err);
    return { error: "Fatal transmission failure. Check repository logs." };
  }
}
