// Script para criar novos administradores usando a API

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
// Substitua com suas informações reais
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin(email, password, name) {
  try {
    console.log(`Criando usuário admin: ${email}`);
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log(`Usuário ${email} já existe. Atualizando role para admin...`);
      
      // Atualizar role para admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', active: true })
        .eq('email', email);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`Usuário ${email} atualizado para admin com sucesso.`);
      return;
    }
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin'
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    console.log(`Usuário criado no auth: ${authData.user.id}`);
    
    // Inserir dados na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'admin',
        active: true
      });
    
    if (profileError) {
      throw profileError;
    }
    
    console.log(`Perfil admin criado com sucesso para: ${email}`);
  } catch (error) {
    console.error(`Erro ao criar admin ${email}:`, error.message);
  }
}

async function main() {
  try {
    // Criar primeiro admin
    await createAdmin('fabert_@hotmail.com', '@@Fabert2025@@', 'Fabert');
    
    // Criar segundo admin
    await createAdmin('gabrielmsantan@gmail.com', '@@Gabriel2025@@', 'Gabriel');
    
    console.log('Processo concluído!');
  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

main(); 