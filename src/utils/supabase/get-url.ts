/**
 * Robust URL detection utility for Supabase redirects.
 * Handles production, preview, and local environments.
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Manual override
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for all deployments
    'http://localhost:3000/';
  
  // Ensure the URL starts with https:// unless it's localhost
  url = url.includes('http') ? url : `https://${url}`;
  
  // Ensure trailing slash is present
  url = url.endsWith('/') ? url : `${url}/`;
  
  return url;
};
