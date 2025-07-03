
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Criar cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Verificar se o usuário é administrador
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Verificar se o usuário tem a role de admin
    const { data, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !data || data.role !== 'admin') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar permissão de administrador:', error);
    return false;
  }
}

// POST - Importar perfis a partir de um arquivo JSON ou CSV
export async function POST(request: NextRequest) {
  // Verificar se o usuário é administrador
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const reason = formData.get('reason') as string || 'Importado de arquivo';
    const blocked_until = formData.get('blocked_until') as string || null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Ler o conteúdo do arquivo
    const fileContent = await file.text();
    let usernames: string[] = [];

    // Determinar o tipo de arquivo pelo nome
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.json')) {
      // Processar arquivo JSON
      try {
        const jsonData = JSON.parse(fileContent);
        
        if (Array.isArray(jsonData)) {
          // Se for um array simples de strings
          usernames = jsonData.filter(item => typeof item === 'string');
        } else if (Array.isArray(jsonData.usernames)) {
          // Se tiver uma propriedade usernames que é um array
          usernames = jsonData.usernames.filter(item => typeof item === 'string');
        } else if (Array.isArray(jsonData.data)) {
          // Se tiver uma propriedade data que é um array de objetos
          usernames = jsonData.data
            .filter(item => typeof item === 'object' && item !== null)
            .map(item => {
              // Tentar encontrar uma propriedade que pareça ser um nome de usuário
              const usernameField = ['username', 'instagram_username', 'user', 'name', 'profile']
                .find(field => typeof item[field] === 'string');
              
              return usernameField ? item[usernameField] : null;
            })
            .filter(username => username !== null) as string[];
        } else {
          // Se for um objeto com propriedades que podem ser nomes de usuário
          usernames = Object.values(jsonData)
            .filter(value => typeof value === 'string')
            .map(value => value as string);
        }
      } catch (error) {
        console.error('Erro ao processar arquivo JSON:', error);
        return NextResponse.json({ error: 'Erro ao processar arquivo JSON' }, { status: 400 });
      }
    } else if (fileName.endsWith('.csv')) {
      // Processar arquivo CSV
      const lines = fileContent.split('\n');
      
      // Verificar se o arquivo tem cabeçalho
      const firstLine = lines[0].trim().toLowerCase();
      const hasHeader = firstLine.includes('username') || 
                        firstLine.includes('user') || 
                        firstLine.includes('instagram') || 
                        firstLine.includes('perfil');
      
      // Começar do índice 1 se tiver cabeçalho, senão do 0
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Se a linha contiver vírgula, é um CSV com múltiplas colunas
        if (line.includes(',')) {
          const columns = line.split(',');
          // Assumir que o nome de usuário está na primeira coluna
          if (columns[0]) {
            usernames.push(columns[0].trim());
          }
        } else {
          // Senão, é apenas uma lista de nomes de usuário
          usernames.push(line);
        }
      }
    } else {
      // Para outros tipos de arquivo, tentar como texto simples
      usernames = fileContent
        .split(/[\r\n,;]+/) // Dividir por quebras de linha ou separadores comuns
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    // Normalizar os nomes de usuário
    const normalizedUsernames = usernames.map(username => 
      username.replace('@', '').toLowerCase()
    ).filter(username => username !== '');

    if (normalizedUsernames.length === 0) {
      return NextResponse.json({ error: 'Nenhum nome de usuário válido encontrado no arquivo' }, { status: 400 });
    }

    // Preparar os dados para inserção em massa
    const now = new Date().toISOString();
    const dataToInsert = normalizedUsernames.map(username => ({
      username,
      reason,
      blocked_at: now,
      blocked_until
    }));

    // Inserir os perfis no banco de dados
    const { error } = await supabase
      .from('instagram_blocked_profiles')
      .upsert(dataToInsert, { onConflict: 'username' });

    if (error) {
      console.error('Erro ao importar perfis:', error);
      return NextResponse.json({ error: 'Erro ao importar perfis' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${normalizedUsernames.length} perfis importados com sucesso`,
      imported_usernames: normalizedUsernames
    });
  } catch (error) {
    console.error('Erro ao importar perfis:', error);
    return NextResponse.json({ error: 'Erro ao importar perfis' }, { status: 500 });
  }
}
