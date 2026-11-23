import { createClient, SupabaseClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Mode DEMO aktif otomatis jika kunci Supabase kosong
export const isDemo = !url || !key;
let client: SupabaseClient | null = null;
export function getSupabase() {
  if (!client) client = createClient(url, key);
  return client;
}
