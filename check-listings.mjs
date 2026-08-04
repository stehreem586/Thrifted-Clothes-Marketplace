import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGNlcnRwaWFsaWhjcXN1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjE3OTgsImV4cCI6MjA5OTU5Nzc5OH0.vWI1LgiUEE37KnpjY6YMT9uyo8eiVQFnK6PKat2TqTQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: listings, error } = await supabase.from('listings').select('*');
  console.log('Listings fetched directly:', listings?.length, error?.message || 'No error');
  console.log('Sample listing status values:', listings?.slice(0, 5).map(l => ({ id: l.id, status: l.status, seller_id: l.seller_id })));
}

test();
