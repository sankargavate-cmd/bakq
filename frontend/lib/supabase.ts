import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawAnonKey &&
    !rawUrl.includes("your-project-id") &&
    !rawUrl.includes("placeholder-project")
);

// Fallbacks prevent static page prerender from throwing "supabaseUrl is required" during CI / next build
const supabaseUrl = rawUrl || "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  rawAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyLXByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder";

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[Shetkari Sathi] Supabase credentials missing or set to placeholder. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local."
  );
}

/**
 * Client-side Supabase client singleton for browser and client components.
 * Configured with persistent local session storage.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
