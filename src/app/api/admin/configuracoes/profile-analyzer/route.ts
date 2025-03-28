import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Rota para buscar configurações
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const supabase = createClient();

    const { data: config } = await supabase
      .from('profile_analyzer_config')
      .select('*')
      .single();

    const { data: stats } = await supabase
      .from('profile_analyzer_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    return NextResponse.json({ config, stats });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Rota para atualizar configurações
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();

    const { data: existingConfig } = await supabase
      .from('profile_analyzer_config')
      .select('*')
      .single();

    let config;
    if (existingConfig) {
      const { data, error } = await supabase
        .from('profile_analyzer_config')
        .update({
          is_enabled: body.isEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      config = data;
    } else {
      const { data, error } = await supabase
        .from('profile_analyzer_config')
        .insert({
          is_enabled: body.isEnabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      config = data;
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Rota para registrar uso
export async function POST() {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('profile_analyzer_stats')
      .insert({
        request_count: 1,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
