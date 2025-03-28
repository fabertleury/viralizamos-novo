// Script para exportar dados do Supabase via API
// Execute com: node export_supabase_data.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações - ATUALIZE ESTAS INFORMAÇÕES
const SUPABASE_URL = 'https://ijpwrspomqdnxavpjbzh.supabase.co';
const SUPABASE_KEY = 'sua_chave_anon_ou_service_role_key'; // Substitua pela sua chave
const BACKUP_DIR = path.join(__dirname, 'backups');

// Tabelas para exportar
const TABLES = [
  'orders',
  'customers',
  'providers',
  'services',
  'transactions',
  'socials'
  // Adicione outras tabelas conforme necessário
];

// Criar diretório de backup
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Diretório de backup criado: ${BACKUP_DIR}`);
}

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para exportar uma tabela
async function exportTable(tableName) {
  console.log(`Exportando tabela: ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    
    const filePath = path.join(BACKUP_DIR, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✓ Exportados ${data.length} registros de ${tableName}`);
    return data.length;
  } catch (error) {
    console.error(`✗ Erro ao exportar ${tableName}:`, error.message);
    return 0;
  }
}

// Função principal
async function main() {
  console.log('=== EXPORTAÇÃO DE DADOS DO SUPABASE ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`URL do Supabase: ${SUPABASE_URL}`);
  console.log(`Diretório de backup: ${BACKUP_DIR}`);
  console.log('=======================================');
  
  const results = {};
  let totalRecords = 0;
  
  for (const table of TABLES) {
    const count = await exportTable(table);
    results[table] = count;
    totalRecords += count;
  }
  
  // Criar arquivo de resumo
  const summary = {
    timestamp: new Date().toISOString(),
    totalRecords,
    tables: results
  };
  
  const summaryPath = path.join(BACKUP_DIR, 'backup_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n=== RESUMO DA EXPORTAÇÃO ===');
  for (const [table, count] of Object.entries(results)) {
    console.log(`${table}: ${count} registros`);
  }
  console.log(`Total: ${totalRecords} registros`);
  console.log(`Resumo salvo em: ${summaryPath}`);
  console.log('============================');
}

// Executar
main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
