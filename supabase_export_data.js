// Script para exportar dados do Supabase via API
// Salve este arquivo como supabase_export_data.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configurações
const SUPABASE_URL = 'https://ijpwrspomqdnxavpjbzh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sua_chave_anon_aqui'; // Use uma variável de ambiente ou insira sua chave anon
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const DATE_FORMAT = new Date().toISOString().split('T')[0].replace(/-/g, '');

// Tabelas para backup
const TABLES = [
  'orders',
  'customers',
  'providers',
  'services',
  'transactions',
  'socials',
  'users',
  // Adicione outras tabelas conforme necessário
];

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Diretório de backup criado: ${BACKUP_DIR}`);
}

// Função para exportar uma tabela
async function exportTable(tableName) {
  console.log(`Exportando tabela: ${tableName}`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    const filePath = path.join(BACKUP_DIR, `${tableName}_${DATE_FORMAT}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exportado ${data.length} registros para ${filePath}`);
    return { tableName, count: data.length, success: true };
  } catch (error) {
    console.error(`❌ Erro ao exportar ${tableName}:`, error.message);
    return { tableName, error: error.message, success: false };
  }
}

// Função principal
async function main() {
  console.log('Iniciando backup do Supabase via API...');
  console.log(`Data: ${new Date().toLocaleString()}`);
  
  const results = [];
  
  for (const table of TABLES) {
    const result = await exportTable(table);
    results.push(result);
  }
  
  // Criar arquivo de resumo
  const summaryPath = path.join(BACKUP_DIR, `backup_summary_${DATE_FORMAT}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results
  }, null, 2));
  
  console.log('\nResumo do backup:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.tableName}: ${result.count} registros`);
    } else {
      console.log(`❌ ${result.tableName}: ${result.error}`);
    }
  });
  
  console.log(`\nBackup concluído! Resumo salvo em: ${summaryPath}`);
}

// Executar
main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
