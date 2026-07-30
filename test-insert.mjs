import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGNlcnRwaWFsaWhjcXN1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjE3OTgsImV4cCI6MjA5OTU5Nzc5OH0.vWI1LgiUEE37KnpjY6YMT9uyo8eiVQFnK6PKat2TqTQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  // 1. Login as seller first
  const { data: sellerLogin } = await supabase.auth.signInWithPassword({
    email: 'stehreem586@gmail.com',
    password: 'anayah2199'
  });
  console.log('Logged in as seller:', sellerLogin.user.id);

  // 2. Try to update a listing that belongs to ANOTHER seller (like admin would do)
  // Listing by Musawwir: 6e61d480-26f2-4a97-b640-129a67288ee9
  const testId = '6e61d480-26f2-4a97-b640-129a67288ee9';
  
  console.log('\n--- TEST 1: Update OTHER sellers listing (admin action) ---');
  const { data: d1, error: e1, count: c1 } = await supabase
    .from('listings')
    .update({ status: 'active' })
    .eq('id', testId)
    .select();
  console.log('Result:', { data: d1, error: e1 });

  // 3. Try to update own listing
  const testOwnId = '85dd3567-48bb-41f5-92be-4c72fccf9f45';
  console.log('\n--- TEST 2: Update OWN listing ---');
  const { data: d2, error: e2 } = await supabase
    .from('listings')
    .update({ status: 'active' })
    .eq('id', testOwnId)
    .select();
  console.log('Result:', { data: d2, error: e2 });

  // 4. Try to update profile role
  console.log('\n--- TEST 3: Update own profile role to seller ---');
  const { data: d3, error: e3 } = await supabase
    .from('profiles')
    .update({ role: 'seller' })
    .eq('id', sellerLogin.user.id)
    .select();
  console.log('Result:', { data: d3, error: e3 });

  // 5. Try to update ANOTHER profile (like admin setting seller_status)
  console.log('\n--- TEST 4: Update OTHER profile (admin action) ---');
  const musawwirId = 'ebf1f24e-4bc9-4402-824e-329b6c92e122';
  const { data: d4, error: e4 } = await supabase
    .from('profiles')
    .update({ role: 'seller' })
    .eq('id', musawwirId)
    .select();
  console.log('Result:', { data: d4, error: e4 });
}

test();
