import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para criar um cliente Supabase com chave de serviço
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: Request) {
  try {
    // Configurar headers CORS para ambiente de desenvolvimento
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log(`Tentando login para: ${email}`);
    
    // Criar cliente com chave anônima para autenticação
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true
      }
    });

    // Tenta autenticar o usuário
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Erro de autenticação:', authError.message);
      return NextResponse.json(
        { error: authError.message },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Verificar se authData e session existem
    if (!authData || !authData.session) {
      console.error('Sessão não criada ou dados de autenticação vazios');
      return NextResponse.json(
        { error: 'Sessão não criada ou dados de autenticação inválidos' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Verifica se o usuário é administrador usando o próprio cliente de autenticação
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.session.user.id)
      .single();
      
    if (profileError) {
      console.error('Erro ao verificar perfil:', profileError.message);
      
      // Tentar com o cliente admin se o perfil não for encontrado
      const supabaseAdmin = createAdminClient();
      const { data: adminProfileData, error: adminProfileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', authData.session.user.id)
        .single();
        
      if (adminProfileError || !adminProfileData) {
        return NextResponse.json(
          { error: 'Erro ao verificar permissões' },
          { 
            status: 500,
            headers: corsHeaders
          }
        );
      }
      
      // Use os dados do perfil administrativo
      if (adminProfileData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Não autorizado. Apenas administradores podem acessar este recurso.' },
          { 
            status: 403,
            headers: corsHeaders
          }
        );
      }
      
      // Retorna o token com os dados do perfil admin
      return NextResponse.json({
        success: true,
        user: {
          id: authData.session.user.id,
          email: authData.session.user.email,
          role: adminProfileData.role
        },
        session: {
          access_token: authData.session.access_token,
          expires_at: authData.session.expires_at
        }
      }, { headers: corsHeaders });
    }

    // Verifica se é admin usando os dados do perfil padrão
    if (profileData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas administradores podem acessar este recurso.' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }

    // Retorna token para autenticação manual
    return NextResponse.json({
      success: true,
      user: {
        id: authData.session.user.id,
        email: authData.session.user.email,
        role: profileData.role
      },
      session: {
        access_token: authData.session.access_token,
        expires_at: authData.session.expires_at
      }
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Erro interno:', error instanceof Error ? error.message : 'Erro desconhecido');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Adicionar handler para requisições OPTIONS (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 