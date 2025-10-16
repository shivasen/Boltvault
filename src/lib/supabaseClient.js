import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let supabaseInitializationError = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseInitializationError = "Configuration Error: Your Supabase URL and Anon Key are missing. These must be set as environment variables in your deployment settings.";
  console.error(supabaseInitializationError);
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, supabaseInitializationError };
