import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Criar cliente com service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.json({ error: 'Error fetching user role' }, { status: 500 });
    }

    return NextResponse.json({ role: profile?.role || null });
  } catch (error) {
    console.error('Error in check-role route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
