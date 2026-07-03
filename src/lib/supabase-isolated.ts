import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A second client instance used ONLY for creating new accounts (e.g. inviting
// a manager). persistSession/autoRefreshToken are disabled so this client
// never writes to localStorage or touches your logged-in superadmin session.
// Without this, calling signUp() on the main client would silently log you
// out and log in as the newly created user instead.
export const supabaseIsolated = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});