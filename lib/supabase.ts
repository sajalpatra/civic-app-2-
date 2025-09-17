import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://csdivocqvqjsdishrjct.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGl2b2NxdnFqc2Rpc2hyamN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTkxMTksImV4cCI6MjA3MjczNTExOX0.ze9dGozSNuETBiMXVd-dD6hqiAPwHDPacBcCq_IF-II";

// Service role key for admin operations (bypasses RLS)
const supabaseServiceRoleKey =
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZGl2b2NxdnFqc2Rpc2hyamN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE1OTExOSwiZXhwIjoyMDcyNzM1MTE5fQ.WZFg2tPa4xODG3JrHNfJCWwu3R0q_3bQWoOWM1v_-Mo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types
export interface Report {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  category: string;
  location_latitude?: number;
  location_longitude?: number;
  location_accuracy?: number;
  address: string;
  photos: string[];
  audio_uri?: string;
  status: "draft" | "submitted" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
