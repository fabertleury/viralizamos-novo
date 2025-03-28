// Script para verificar as tabelas e relações no Supabase via API
// Autor: Cascade AI
// Data: 03/03/2025

const { createClient } = require('@supabase/supabase-js');

// Configurações - ATUALIZE ESTAS INFORMAÇÕES
const SUPABASE_URL = 'https://ijpwrspomqdnxavpjbzh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sua_chave_anon_ou_service_role_key'; // Use uma variável de ambiente ou insira sua chave

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tabelas para verificar
const TABLES = [
  'orders',
  'customers',
  'providers',
  'services',
  'transactions',
  'socials'
];

// Função para verificar a estrutura de uma tabela
async function checkTable(tableName) {
  console.log(`\n=== Verificando tabela: ${tableName} ===`);
  
  try {
    // Consultar a tabela para obter sua estrutura (primeira linha apenas)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log(`✓ Tabela '${tableName}' existe e contém dados`);
      
      // Mostrar estrutura (colunas)
      const columns = Object.keys(data[0]);
      console.log(`Colunas (${columns.length}):`);
      columns.forEach(col => {
        const value = data[0][col];
        const type = value === null ? 'null' : typeof value;
        console.log(`  - ${col}: ${type}`);
      });
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`Total de registros: ${count}`);
      }
    } else {
      console.log(`✓ Tabela '${tableName}' existe mas está vazia`);
    }
    
    return true;
  } catch (error) {
    if (error.code === 'PGRST116') {
      console.log(`✗ Tabela '${tableName}' não existe`);
    } else {
      console.error(`✗ Erro ao verificar tabela '${tableName}':`, error.message);
    }
    return false;
  }
}

// Função para verificar relações específicas
async function checkRelations() {
  console.log('\n=== Verificando relações específicas ===');
  
  // Verificar relação entre orders e providers
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        provider:provider_id (
          id,
          name
        )
      `)
      .limit(1);
    
    if (error) {
      console.log('✗ Relação orders -> providers (provider_id) não está configurada corretamente');
      console.log(`  Erro: ${error.message}`);
    } else {
      console.log('✓ Relação orders -> providers (provider_id) está configurada corretamente');
    }
  } catch (error) {
    console.error('✗ Erro ao verificar relação orders -> providers:', error.message);
  }
  
  // Verificar relação entre orders e customers
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer:customer_id (
          id,
          name,
          email
        )
      `)
      .limit(1);
    
    if (error) {
      console.log('✗ Relação orders -> customers (customer_id) não está configurada corretamente');
      console.log(`  Erro: ${error.message}`);
    } else {
      console.log('✓ Relação orders -> customers (customer_id) está configurada corretamente');
    }
  } catch (error) {
    console.error('✗ Erro ao verificar relação orders -> customers:', error.message);
  }
  
  // Verificar relação entre orders e services
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        service:service_id (
          id,
          name
        )
      `)
      .limit(1);
    
    if (error) {
      console.log('✗ Relação orders -> services (service_id) não está configurada corretamente');
      console.log(`  Erro: ${error.message}`);
    } else {
      console.log('✓ Relação orders -> services (service_id) está configurada corretamente');
    }
  } catch (error) {
    console.error('✗ Erro ao verificar relação orders -> services:', error.message);
  }
}

// Função principal
async function main() {
  console.log('=== VERIFICAÇÃO DE TABELAS E RELAÇÕES DO SUPABASE ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`URL do Supabase: ${SUPABASE_URL}`);
  console.log('=====================================================');
  
  // Verificar cada tabela
  for (const table of TABLES) {
    await checkTable(table);
  }
  
  // Verificar relações
  await checkRelations();
  
  console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
}

// Executar
main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
