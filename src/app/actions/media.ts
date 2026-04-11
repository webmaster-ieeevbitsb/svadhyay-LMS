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

/**
 * Scans Courses and Modules for unoptimized image assets.
 * Now includes "Deep Scan" for images embedded in Markdown text.
 */
export async function scanUnoptimizedAssets() {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  const tasks: { type: 'course' | 'module' | 'submodule' | 'markdown', id: string, url: string, name: string, field: string, submoduleIndex?: number, sectionIndex?: number }[] = [];

  const isNotOptimized = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) && url.includes('supabase.co');
  };

  const extractMarkdownImages = (text: string) => {
    const regex = /!\[.*?\]\((https?:\/\/.*?)\)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (isNotOptimized(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  // 1. Scan Courses
  const { data: courses } = await supabase.from('courses').select('id, title, thumbnail_url');
  courses?.forEach(c => {
    if (isNotOptimized(c.thumbnail_url)) {
      tasks.push({ type: 'course', id: c.id, url: c.thumbnail_url!, name: c.title, field: 'thumbnail_url' });
    }
  });

  // 2. Scan Modules
  const { data: modules } = await supabase.from('modules').select('id, title, image_url, structured_content');
  modules?.forEach(m => {
    // Top-level image
    if (isNotOptimized(m.image_url)) {
      tasks.push({ type: 'module', id: m.id, url: m.image_url!, name: m.title, field: 'image_url' });
    }

    // Sub-module and Markdown images
    const sc = m.structured_content as any;
    if (sc?.drop_downs) {
      sc.drop_downs.forEach((dd: any, idx: number) => {
        // Explicit image field
        if (isNotOptimized(dd.image_url)) {
          tasks.push({ 
            type: 'submodule', 
            id: m.id, 
            url: dd.image_url, 
            name: `${m.title} > ${dd.title}`, 
            field: 'structured_content', 
            submoduleIndex: idx 
          });
        }

        // Markdown scan in text fields
        const textFields = ['what_it_is', 'common_mistake', 'why_it_matters', 'try_it', 'example'];
        textFields.forEach(f => {
          if (dd[f]) {
            const urls = extractMarkdownImages(dd[f]);
            urls.forEach(u => {
              tasks.push({
                type: 'markdown',
                id: m.id,
                url: u,
                name: `${m.title} > ${dd.title} (Text)`,
                field: f,
                submoduleIndex: idx
              });
            });
          }
        });

        // Custom sections scan
        if (dd.custom_sections) {
          dd.custom_sections.forEach((cs: any, csIdx: number) => {
            if (cs.content) {
              const urls = extractMarkdownImages(cs.content);
              urls.forEach(u => {
                tasks.push({
                  type: 'markdown',
                  id: m.id,
                  url: u,
                  name: `${m.title} > ${dd.title} > ${cs.heading || 'Section'}`,
                  field: 'custom_sections',
                  submoduleIndex: idx,
                  sectionIndex: csIdx
                });
              });
            }
          });
        }
      });
    }
  });

  return { tasks };
}

/**
 * Updates a specific asset record with a new optimized URL.
 * Handles both direct fields and Markdown text replacement.
 */
export async function updateAssetRecord(task: any, newUrl: string) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  if (task.type === 'course') {
    await supabase.from('courses').update({ thumbnail_url: newUrl }).eq('id', task.id);
  } else if (task.type === 'module') {
    await supabase.from('modules').update({ image_url: newUrl }).eq('id', task.id);
  } else if (task.type === 'submodule' || task.type === 'markdown') {
    const { data: m } = await supabase.from('modules').select('structured_content').eq('id', task.id).single();
    if (m?.structured_content) {
      const sc = m.structured_content as any;
      const dd = sc.drop_downs[task.submoduleIndex];
      
      if (task.type === 'submodule') {
        dd.image_url = newUrl;
      } else if (task.type === 'markdown') {
        if (task.field === 'custom_sections') {
          const cs = dd.custom_sections[task.sectionIndex];
          cs.content = cs.content.replace(task.url, newUrl);
        } else {
          dd[task.field] = dd[task.field].replace(task.url, newUrl);
        }
      }
      
      await supabase.from('modules').update({ structured_content: sc }).eq('id', task.id);
    }
  }

  return { success: true };
}

/**
 * Identifies assets in storage buckets that have NO reference in the database.
 */
export async function identifyOrphanedAssets() {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  // 1. Get all active URLs from the database
  const { tasks } = await scanUnoptimizedAssets();
  // We actually need ALL active URLs, not just unoptimized ones
  const { data: courses } = await supabase.from('courses').select('thumbnail_url');
  const { data: modules } = await supabase.from('modules').select('image_url, structured_content');

  const activeFilenames = new Set<string>();
  
  courses?.forEach(c => { if(c.thumbnail_url) activeFilenames.add(c.thumbnail_url.split('/').pop()!); });
  modules?.forEach(m => {
    if(m.image_url) activeFilenames.add(m.image_url.split('/').pop()!);
    const sc = m.structured_content as any;
    sc?.drop_downs?.forEach((dd: any) => {
      if(dd.image_url) activeFilenames.add(dd.image_url.split('/').pop()!);
      // Markdown extract (simplified for filename check)
      const regex = /submodule-.*?\.(png|jpg|jpeg|webp)/g;
      const combinedText = `${dd.what_it_is} ${dd.common_mistake} ${dd.why_it_matters} ${dd.try_it} ${dd.example} ${JSON.stringify(dd.custom_sections || [])}`;
      const matches = combinedText.match(regex);
      matches?.forEach(m => activeFilenames.add(m));
    });
  });

  const orphanedAssets: { bucket: string, name: string, size: number }[] = [];
  const buckets = ['course-thumbnails', 'module-content'];

  for (const bucket of buckets) {
    const { data: files } = await supabase.storage.from(bucket).list();
    files?.forEach(file => {
      // If a file is NOT in our active set and is a legacy format (PNG/JPG)
      const isLegacy = file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
      if (isLegacy && !activeFilenames.has(file.name)) {
        orphanedAssets.push({ 
          bucket, 
          name: file.name, 
          size: file.metadata?.size || 0 
        });
      }
    });
  }

  return { orphanedAssets };
}

/**
 * Bulk deletes specific storage assets.
 */
export async function deleteStorageAssets(assets: { bucket: string, name: string }[]) {
  const auth = await verifyAdmin();
  if (auth.error !== null) return { error: auth.error };
  const { supabase } = auth;

  // Group by bucket for efficient deletion
  const groups: Record<string, string[]> = {};
  assets.forEach(a => {
    if (!groups[a.bucket]) groups[a.bucket] = [];
    groups[a.bucket].push(a.name);
  });

  for (const [bucket, files] of Object.entries(groups)) {
    const { error } = await supabase.storage.from(bucket).remove(files);
    if (error) {
       console.error(`Failed to delete from ${bucket}:`, error);
       return { error: `Storage API Error (${bucket}): ${error.message}` };
    }
  }

  return { success: true };
}
