import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGNlcnRwaWFsaWhjcXN1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjE3OTgsImV4cCI6MjA5OTU5Nzc5OH0.vWI1LgiUEE37KnpjY6YMT9uyo8eiVQFnK6PKat2TqTQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error.message);
  } else {
    console.log('Orders table exists! Columns:', Object.keys(data[0] || {}));
  }
}

test();
