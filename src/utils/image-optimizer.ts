/**
 * Utility to optimize images client-side before uploading to Supabase.
 * Reduces bandwidth usage and stays within free tier limits.
 */

export async function optimizeImage(file: File): Promise<File> {
  // Only optimize images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Set constraints
  const MAX_WIDTH = 1600;
  const MAX_HEIGHT = 1600;
  const QUALITY = 0.8;
  const OUTPUT_FORMAT = 'image/webp';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original if canvas fails
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Create a new file from the blob
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: OUTPUT_FORMAT,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          OUTPUT_FORMAT,
          QUALITY
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

/**
 * Heuristic to check if a URL likely points to an optimized WebP image.
 */
export function isOptimized(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.toLowerCase().endsWith('.webp') || url.includes('/storage/v1/object/public/');
}
