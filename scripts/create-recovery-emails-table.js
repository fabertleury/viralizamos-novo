const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:osKzFdoorhHttFrGAMPdzNEEPjYDGnhL@turntable.proxy.rlwy.net:55873/railway'
});

async function createRecoveryEmailsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Criando tabela recovery_emails...');
    
    // Verificar se a tabela já existe
    const checkTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recovery_emails'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (tableExists) {
      console.log('A tabela recovery_emails já existe. Pulando criação.');
      return;
    }
    
    // Criar a tabela recovery_emails
    await client.query(`
      CREATE TABLE recovery_emails (
        id SERIAL PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        cart_token VARCHAR(255) NOT NULL,
        service_name VARCHAR(255),
        cart_amount DECIMAL(10, 2) NOT NULL,
        coupon_code VARCHAR(50),
        sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
        email_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Criar índices para melhorar a performance das consultas
    await client.query(`
      CREATE INDEX idx_recovery_emails_customer_email ON recovery_emails (customer_email);
      CREATE INDEX idx_recovery_emails_cart_token ON recovery_emails (cart_token);
      CREATE INDEX idx_recovery_emails_sent_at ON recovery_emails (sent_at);
    `);
    
    console.log('Tabela recovery_emails criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela recovery_emails:', error);
  } finally {
    client.release();
  }
}

// Executar a função para criar a tabela
createRecoveryEmailsTable()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
  });
