import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

/**
 * Handler para executar migrações SQL
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar a chave de API
    const apiKey = request.headers.get('X-API-KEY');
    const expectedApiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Requisição de migração rejeitada: Chave de API inválida');
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }
    
    // Ler o arquivo de migrações SQL
    const migrationPath = path.join(process.cwd(), 'docs/n8n-migrations.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('Arquivo de migrações não encontrado');
      return NextResponse.json({ error: 'Arquivo de migrações não encontrado' }, { status: 404 });
    }
    
    const sqlCommands = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar as migrações SQL
    const supabase = createClient();
    
    // Dividir e executar comandos SQL
    const commands = sqlCommands.split(';').filter(cmd => cmd.trim().length > 0);
    
    // Executar cada comando individualmente
    for (const command of commands) {
      const { error } = await supabase.rpc('pg_execute', { sql_command: command.trim() + ';' });
      if (error) {
        console.error(`Erro ao executar migração: ${error.message}`);
        console.error(`Comando SQL: ${command}`);
        return NextResponse.json({ 
          error: `Erro ao executar migração: ${error.message}`,
          command: command 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${commands.length} comandos SQL executados com sucesso`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao executar migrações SQL: ${errorMessage}`);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 