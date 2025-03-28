import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Error getting session' }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('User data error:', userError);
      return NextResponse.json({ error: 'Error getting user data' }, { status: 500 });
    }

    return NextResponse.json({
      isAdmin: userData?.role === 'admin',
      email: userData?.email,
      role: userData?.role
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
