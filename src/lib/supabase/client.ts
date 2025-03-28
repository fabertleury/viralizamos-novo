import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

let supabaseInstance: SupabaseClient | null = null;

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Supabase Anon Key Length:', SUPABASE_ANON_KEY.length);

  supabaseInstance = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        // Adicionar cabeçalhos que ajudam a passar pelo Cloudflare
        'X-Client-Info': 'supabase-js/2.31.0',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    },
    realtime: {
      // Melhorar a performance de reconexão
      params: {
        eventsPerSecond: 10
      }
    }
  });

  return supabaseInstance;
};
