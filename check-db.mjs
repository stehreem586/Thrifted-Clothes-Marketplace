import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://qlhcertpialihcqsuxjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGNlcnRwaWFsaWhjcXN1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjE3OTgsImV4cCI6MjA5OTU5Nzc5OH0.vWI1LgiUEE37KnpjY6YMT9uyo8eiVQFnK6PKat2TqTQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixImages() {
  // Real high quality URLs
  const r7JerseyUrl = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80';
  const jeansUrl = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80';

  // 1. Update listings with truncated base64
  const { data: listings } = await supabase.from('listings').select('*');
  if (listings) {
    for (const l of listings) {
      if (!l.image_url || l.image_url.startsWith('data:image')) {
        let newUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80';
        const titleLower = (l.title || '').toLowerCase();
        if (titleLower.includes('madrid') || titleLower.includes('jersey') || titleLower.includes('r7') || titleLower.includes('roanldo') || titleLower.includes('ronaldo')) {
          newUrl = r7JerseyUrl;
        } else if (titleLower.includes('jeans') || titleLower.includes('pants')) {
          newUrl = jeansUrl;
        }
        console.log(`Updating listing ${l.id} (${l.title}) to ${newUrl}`);
        await supabase.from('listings').update({ image_url: newUrl }).eq('id', l.id);
      }
    }
  }

  // 2. Update orders with truncated base64
  const { data: orders } = await supabase.from('orders').select('*');
  if (orders) {
    for (const o of orders) {
      if (!o.listing_image || o.listing_image.startsWith('data:image')) {
        let newUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80';
        const titleLower = (o.listing_title || '').toLowerCase();
        if (titleLower.includes('madrid') || titleLower.includes('jersey') || titleLower.includes('r7') || titleLower.includes('ronaldo')) {
          newUrl = r7JerseyUrl;
        }
        console.log(`Updating order ${o.id} (${o.listing_title}) to ${newUrl}`);
        await supabase.from('orders').update({ listing_image: newUrl }).eq('id', o.id);
      }
    }
  }

  console.log('--- DB IMAGES FIXED SUCCESSFULLY ---');
}

fixImages();
