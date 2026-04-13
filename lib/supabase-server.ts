import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client for use in Server Actions / Server Components
// This creates a fresh instance to avoid shared state between requests
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
