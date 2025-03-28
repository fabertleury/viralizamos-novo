import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

// Criar cliente do Supabase com a chave de serviço para ter permissões elevadas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

async function executeScript() {
  try {
    // Caminho para o arquivo de migração
    const migrationPath = path.resolve(__dirname, '../migrations/011_add_needs_admin_attention_to_orders.sql');
    
    // Ler o arquivo SQL
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executando migração...');
    console.log('SQL:', sql);
    
    // Executar o SQL usando a API do Supabase
    const { data, error } = await supabase.rpc('pgx_queries', { query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migração executada com sucesso!');
    console.log('Resultado:', data);
    
    // Verificar as colunas depois da migração
    const { data: columns, error: columnsError } = await supabase.rpc('pgx_queries', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders'
        ORDER BY column_name;
      `
    });
    
    if (columnsError) {
      console.error('Erro ao verificar colunas:', columnsError);
    } else {
      console.log('Colunas na tabela orders:');
      console.log(columns);
    }
    
  } catch (error) {
    console.error('Erro ao executar migração:', error);
  }
}

// Executar o script
executeScript().catch(console.error); 