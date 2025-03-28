import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Criar cliente com service key para ações administrativas
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Lista de administradores para criar
const adminsToCreate = [
  {
    email: 'fabert_@hotmail.com',
    password: '@@Fabert2025@@',
    name: 'Fabert',
  },
  {
    email: 'gabrielmsantan@gmail.com',
    password: '@@Gabriel2025@@',
    name: 'Gabriel',
  }
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const results = [];
    
    for (const admin of adminsToCreate) {
      try {
        console.log(`Processando admin: ${admin.email}`);
        
        // Verificar se o usuário já existe
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', admin.email)
          .single();
          
        if (existingUser) {
          console.log(`Usuário ${admin.email} já existe, atualizando para admin`);
          
          // Atualizar para admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin', active: true })
            .eq('email', admin.email);
            
          if (updateError) {
            throw updateError;
          }
          
          results.push({
            email: admin.email,
            status: 'atualizado',
            message: 'Usuário já existia e foi atualizado para admin'
          });
          continue;
        }
        
        // Criar usuário no auth
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            name: admin.name,
            role: 'admin'
          }
        });
        
        if (authError) {
          throw authError;
        }
        
        console.log(`Usuário criado: ${userData.user.id}`);
        
        // Inserir na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
            active: true
          });
          
        if (profileError) {
          throw profileError;
        }
        
        results.push({
          email: admin.email,
          id: userData.user.id,
          status: 'criado',
          message: 'Admin criado com sucesso'
        });
        
      } catch (error: any) {
        results.push({
          email: admin.email,
          status: 'erro',
          message: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('Erro ao criar admins:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 