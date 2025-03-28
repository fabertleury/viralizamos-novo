import { createClient } from '@/lib/supabase/server';
import * as dotenv from 'dotenv';
import { PaymentService } from '@/lib/core/payment/paymentService';
import { OrderStatusService } from '@/lib/core/services/orderStatusService';
import { Logger } from '@/lib/core/utils/logger';

// Carregar variáveis de ambiente do arquivo .env se estiver em desenvolvimento
dotenv.config();

const logger = new Logger('Check-Configuration');

/**
 * Verifica as configurações do sistema
 */
async function checkConfiguration() {
  logger.info('Iniciando verificação de configuração do sistema...');

  try {
    // Verificar variáveis de ambiente essenciais
    logger.info('Verificando variáveis de ambiente...');
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'MERCADO_PAGO_ACCESS_TOKEN',
      'PROVIDER_API_KEY',
      'PROVIDER_API_URL'
    ];

    let missingVars = false;
    for (const varName of envVars) {
      if (!process.env[varName]) {
        logger.error(`Variável de ambiente ${varName} não está configurada`);
        missingVars = true;
      } else {
        logger.success(`Variável de ambiente ${varName} está configurada`);
      }
    }

    if (missingVars) {
      logger.warn('Algumas variáveis de ambiente estão faltando. Verifique o arquivo .env');
    } else {
      logger.success('Todas as variáveis de ambiente necessárias estão configuradas');
    }

    // Testar conexão com o Supabase
    logger.info('Testando conexão com o Supabase...');
    const supabase = createClient();
    const { error } = await supabase.from('services').select('count').limit(1);

    if (error) {
      logger.error('Erro ao conectar com o Supabase:', error);
    } else {
      logger.success('Conexão com o Supabase estabelecida com sucesso');
    }

    // Verificar serviço de pagamento
    logger.info('Verificando serviço de pagamento...');
    new PaymentService(); // Verificar se o construtor executa sem erros
    
    // Verificar serviço de verificação de status
    logger.info('Verificando serviço de status de pedidos...');
    new OrderStatusService(); // Verificar se o construtor executa sem erros

    // Verificar tabelas necessárias (core_transactions, core_orders)
    logger.info('Verificando tabelas no banco de dados...');
    const tables = ['core_transactions', 'core_orders', 'core_transaction_posts', 'core_status_check_logs'];
    
    for (const table of tables) {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error(`Erro ao verificar tabela ${table}:`, countError);
      } else {
        logger.success(`Tabela ${table} existe e contém ${count} registros`);
      }
    }

    // Verificar funções do banco de dados
    logger.info('Verificando funções do banco de dados...');
    const functions = [
      { name: 'check_duplicate_payment', args: { p_service_id: '00000000-0000-0000-0000-000000000000', p_target_username: 'test', p_hours_window: 24 } },
      { name: 'increment_attempts', args: { transaction_id: '00000000-0000-0000-0000-000000000000' } }
    ];
    
    for (const func of functions) {
      try {
        const { error: funcError } = await supabase.rpc(func.name, func.args);
        
        if (funcError) {
          logger.error(`Erro ao chamar função ${func.name}:`, funcError);
        } else {
          logger.success(`Função ${func.name} existe e foi chamada com sucesso`);
        }
      } catch (error) {
        logger.error(`Erro ao testar função ${func.name}:`, error);
      }
    }

    logger.info('Verificação de configuração concluída');
  } catch (error) {
    logger.error('Erro durante a verificação de configuração:', error);
  }
}

// Executar a verificação
checkConfiguration().catch(console.error); 