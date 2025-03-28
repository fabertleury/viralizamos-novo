import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/config/supabase';

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}
