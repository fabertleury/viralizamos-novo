const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Iniciando criação das tabelas de monitoramento no PostgreSQL...');
  
  // Verificar se a variável de ambiente existe
  if (!process.env.MONITORING_DATABASE_URL) {
    console.error('❌ Variável de ambiente MONITORING_DATABASE_URL não encontrada.');
    console.error('Por favor, defina a variável MONITORING_DATABASE_URL no seu arquivo .env');
    process.exit(1);
  }
  
  // Criar cliente PostgreSQL
  const client = new Client({
    connectionString: process.env.MONITORING_DATABASE_URL
  });
  
  try {
    // Conectar ao banco de dados
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create-monitoring-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Executar o SQL
    console.log('📦 Criando tabelas de monitoramento...');
    await client.query(sqlContent);
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...');
    
    const tables = [
      'transactions_log',
      'orders_log',
      'integrations_log',
      'webhook_logs',
      'duplicate_detection'
    ];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [table]);
      
      const exists = result.rows[0].exists;
      console.log(`📋 Tabela ${table}: ${exists ? 'Criada com sucesso ✅' : 'Não encontrada ❌'}`);
    }
    
    console.log('🎉 Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao aplicar tabelas de monitoramento:', error);
    process.exit(1);
  } finally {
    // Fechar conexão
    await client.end();
  }
}

// Carregar variáveis de ambiente a partir do arquivo .env
require('dotenv').config();

main()
  .then(() => {
    console.log('✨ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  }); 