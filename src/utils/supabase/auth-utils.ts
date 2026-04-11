import { createClient } from "./server";
import { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Strictly typed result for administrative authorization.
 * Uses a Discriminated Union to allow for elegant type narrowing in consuming actions.
 */
export type AuthResult = 
  | { supabase: SupabaseClient; user: User; error: null; status: null }
  | { supabase: null; user: null; error: string; status: number };

/**
 * Standardizes administrative authorization across server actions and API routes.
 * Verifies active session and checks the participants registry for admin status.
 */
export async function verifyAdmin(): Promise<AuthResult> {
  const supabase = await createClient();
  
  // 1. Session Verification
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { 
      supabase: null,
      user: null,
      error: "Authentication Failure: Active session required for this operation.", 
      status: 401 
    };
  }

  // 2. Privilege Verification
  const { data: participant, error: fetchError } = await supabase
    .from("participants")
    .select("is_admin")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (fetchError || !participant?.is_admin) {
    return { 
      supabase: null,
      user: null,
      error: "Security Access Violation: Administrative clearance required.", 
      status: 403 
    };
  }

  // Return context for further database operations
  return { 
    supabase: supabase as unknown as SupabaseClient, 
    user,
    error: null,
    status: null
  };
}
