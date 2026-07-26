import { createClient } from '@supabase/supabase-js';

// Using Vite env vars if possible, or direct fallback from supabaseClient.js
const supabaseUrl = 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGNlcnRwaWFsaWhjcXN1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjE3OTgsImV4cCI6MjA5OTU5Nzc5OH0.vWI1LgiUEE37KnpjY6YMT9uyo8eiVQFnK6PKat2TqTQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const email = 'stehreem586@gmail.com';
  console.log(`Checking profile for email: ${email}`);
  
  // 1. Sign in
  const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: 'anayah2199'
  });
  
  if (loginError) {
    console.error('Login failed:', loginError);
    return;
  }
  
  console.log('User ID:', user.id);
  console.log('User Metadata Role:', user.user_metadata?.role);

  // 2. Query Profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile query failed:', profileError);
  } else {
    console.log('DB Profile Role:', profile.role);
    console.log('Full DB Profile:', JSON.stringify(profile, null, 2));
  }
}

check();
