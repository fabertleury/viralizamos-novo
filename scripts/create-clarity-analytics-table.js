const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  connectionString: 'postgresql://postgres:osKzFdoorhHttFrGAMPdzNEEPjYDGnhL@turntable.proxy.rlwy.net:55873/railway'
});

async function createClarityAnalyticsTable() {
  try {
    // Conectar ao banco de dados
    const client = await pool.connect();
    
    console.log('Conectado ao banco de dados PostgreSQL');
    
    // Criar a tabela analytics_clarity
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS analytics_clarity (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        page_url TEXT,
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Campos específicos para análise de carrinhos abandonados
        cart_token VARCHAR(255),
        cart_amount DECIMAL(10, 2),
        service_name VARCHAR(255),
        customer_email VARCHAR(255),
        time_spent INTEGER,
        
        -- Metadados adicionais
        device_type VARCHAR(50),
        browser VARCHAR(100),
        country VARCHAR(100),
        referrer TEXT
      );
      
      -- Índices para melhorar a performance das consultas
      CREATE INDEX IF NOT EXISTS idx_analytics_clarity_event_type ON analytics_clarity(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_clarity_created_at ON analytics_clarity(created_at);
      CREATE INDEX IF NOT EXISTS idx_analytics_clarity_cart_token ON analytics_clarity(cart_token);
      CREATE INDEX IF NOT EXISTS idx_analytics_clarity_customer_email ON analytics_clarity(customer_email);
    `;
    
    await client.query(createTableQuery);
    console.log('Tabela analytics_clarity criada com sucesso!');
    
    // Criar view para análise de carrinhos abandonados
    const createViewQuery = `
      CREATE OR REPLACE VIEW view_abandoned_carts AS
      SELECT 
        cart_token,
        cart_amount,
        service_name,
        customer_email,
        page_url,
        MAX(time_spent) as time_spent,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen
      FROM 
        analytics_clarity
      WHERE 
        event_type = 'cart_abandoned'
      GROUP BY 
        cart_token, cart_amount, service_name, customer_email, page_url
      ORDER BY 
        last_seen DESC;
    `;
    
    await client.query(createViewQuery);
    console.log('View view_abandoned_carts criada com sucesso!');
    
    // Liberar o cliente
    client.release();
    console.log('Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar tabela analytics_clarity:', error);
  } finally {
    // Encerrar o pool
    await pool.end();
  }
}

// Executar a função
createClarityAnalyticsTable();
