import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Criar cliente com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    // Testar a conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (error) {
      console.error('Erro na conexão com Supabase:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Conexão com Supabase estabelecida com sucesso',
      data 
    });

  } catch (error: any) {
    console.error('Erro ao testar conexão:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
