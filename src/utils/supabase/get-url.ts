/**
 * Robust URL detection utility for Supabase redirects.
 * Handles production, preview, and local environments.
 */
export const getURL = () => {
  // 1. Check if we're on the client side
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/`;
  }

  // 2. Fallback for server-side (if needed)
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000/';
  
  url = url.includes('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  
  return url;
};
