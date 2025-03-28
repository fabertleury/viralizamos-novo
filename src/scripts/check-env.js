// Script simplificado para verificação do Supabase
const { createClient } = require('@supabase/supabase-js');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logger simplificado
const logger = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCESSO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[AVISO]${colors.reset} ${msg}`),
  error: (msg, err) => console.log(`${colors.red}[ERRO]${colors.reset} ${msg}${err ? ': ' + JSON.stringify(err) : ''}`)
};

// *** INSIRA MANUALMENTE AS VARIÁVEIS DO SEU .env.local AQUI ***
// Substitua os valores vazios pelos valores corretos do seu .env.local
const env = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://ijpwrspomqdnxavpjbzh.supabase.co',
  NEXT_PUBLIC_SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcHdyc3BvbXFkbnhhdnBqYnpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODM0Njc3NiwiZXhwIjoyMDUzOTIyNzc2fQ.9qjf-8uWdN6t1wS5i7BXI1Zp6lv-b0mcxXDaUJXFhTM'
};

/**
 * Função principal para verificação básica da conexão
 */
async function checkSupabase() {
  logger.info('Iniciando teste simples de conexão...');

  try {
    // Testar conexão com o Supabase
    logger.info('Testando conexão com o Supabase...');
    
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
      logger.error('Não é possível conectar ao Supabase sem as credenciais. Verifique as variáveis definidas no script.');
      return;
    }
    
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    logger.info('Conectando ao Supabase...');
    const { data, error } = await supabase.from('services').select('count').limit(1);

    if (error) {
      logger.error('Erro ao conectar com o Supabase', error);
    } else {
      logger.success('Conexão com o Supabase estabelecida com sucesso!');
      
      // Verificar tabelas necessárias
      logger.info('Verificando se as tabelas existem...');
      const tables = ['core_transactions', 'core_orders', 'providers', 'services'];
      
      for (const table of tables) {
        try {
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            logger.error(`Erro ao verificar tabela ${table}`, countError);
          } else {
            logger.success(`Tabela ${table} existe e contém ${count} registros`);
          }
        } catch (tableError) {
          logger.error(`Erro ao verificar tabela ${table}`, tableError);
        }
      }
    }

    logger.info('Verificação concluída.');
  } catch (error) {
    logger.error('Erro durante a verificação:', error);
  }
}

// Executar a verificação
checkSupabase().catch(console.error); 