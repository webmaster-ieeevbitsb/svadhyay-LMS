/**
 * Robust URL detection utility for Supabase redirects.
 * Handles production, preview, and local environments.
 */
export const getURL = () => {
  // 1. Client-side: use window.location.origin (the most reliable)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 2. Server-side: use environment variables
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000';
  
  // Ensure the URL starts with https:// unless it's localhost
  url = url.includes('http') ? url : `https://${url}`;
  
  // Remove trailing slash for consistency
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  
  return url;
};
