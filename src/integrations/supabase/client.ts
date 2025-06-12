import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xzrgoudfoiwrytrdjozn.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cmdvdWRmb2l3cnl0cmRqb3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTQ0MjUsImV4cCI6MjA2MzU3MDQyNX0.Nu8OPqULsfZi5zHS-oEpLtRB9JPLIpWIpONOLn5puik";

// Create a single Supabase client instance to be used throughout the app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});