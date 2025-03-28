export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
if (!SUPABASE_ANON_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
if (!SUPABASE_SERVICE_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_SERVICE_KEY is required');

console.log('Supabase Config:', {
  URL: SUPABASE_URL,
  ANON_KEY_LENGTH: SUPABASE_ANON_KEY.length,
  SERVICE_KEY_LENGTH: SUPABASE_SERVICE_KEY.length
});
