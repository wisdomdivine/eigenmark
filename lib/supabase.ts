import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(rawUrl && rawKey);

const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder-eigenmark.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? rawKey : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
