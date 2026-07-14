import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Warning: VITE_SUPABASE_ANON_KEY is missing. Make sure to define it in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
