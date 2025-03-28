// Script de verificação de configuração do sistema
require('dotenv').config({ path: '.env.local' });

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

/**
 * Função principal para verificação de configuração
 */
async function checkConfiguration() {
  logger.info('Iniciando verificação de configuração do sistema...');

  try {
    // Verificar variáveis de ambiente essenciais
    logger.info('Verificando variáveis de ambiente...');
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_SERVICE_KEY',
      'MERCADO_PAGO_ACCESS_TOKEN',
      'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY',
      'MERCADOPAGO_SANDBOX',
      'MERCADO_PAGO_WEBHOOK_SECRET'
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
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
      logger.error('Não é possível conectar ao Supabase sem as credenciais');
      return;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    try {
      const { error } = await supabase.from('services').select('count').limit(1);

      if (error) {
        logger.error('Erro ao conectar com o Supabase', error);
      } else {
        logger.success('Conexão com o Supabase estabelecida com sucesso');
      }
      
      // Verificar tabelas necessárias
      logger.info('Verificando tabelas no banco de dados...');
      const tables = ['core_transactions', 'core_orders', 'core_transaction_posts', 'core_status_check_logs', 'providers', 'services'];
      
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

      // Verificar provedores cadastrados
      logger.info('Verificando provedores cadastrados...');
      try {
        const { data: providers, error: providersError } = await supabase
          .from('providers')
          .select('id, name, slug, api_key, api_url, status')
          .eq('status', true);
        
        if (providersError) {
          logger.error('Erro ao buscar provedores', providersError);
        } else if (!providers || providers.length === 0) {
          logger.warn('Não há provedores ativos cadastrados no sistema');
        } else {
          logger.success(`Encontrados ${providers.length} provedores ativos:`);
          
          for (const provider of providers) {
            const hasValidConfig = provider.api_key && provider.api_url;
            if (hasValidConfig) {
              logger.success(`- ${provider.name} (${provider.slug}): Configurado corretamente`);
            } else {
              logger.error(`- ${provider.name} (${provider.slug}): Falta ${!provider.api_key ? 'API key' : ''}${!provider.api_key && !provider.api_url ? ' e ' : ''}${!provider.api_url ? 'API URL' : ''}`);
            }
          }
        }
      } catch (providersError) {
        logger.error('Erro ao verificar provedores', providersError);
      }

      // Verificar serviços cadastrados
      logger.info('Verificando serviços cadastrados...');
      try {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, name, provider_id, type, status')
          .eq('status', true);
        
        if (servicesError) {
          logger.error('Erro ao buscar serviços', servicesError);
        } else if (!services || services.length === 0) {
          logger.warn('Não há serviços ativos cadastrados no sistema');
        } else {
          logger.success(`Encontrados ${services.length} serviços ativos`);
          
          // Verificar se os serviços têm provedores válidos
          const { data: providers } = await supabase
            .from('providers')
            .select('id, name')
            .eq('status', true);
          
          const providerMap = {};
          if (providers) {
            providers.forEach(p => providerMap[p.id] = p.name);
          }
          
          for (const service of services) {
            if (service.provider_id && providerMap[service.provider_id]) {
              logger.success(`- ${service.name} (${service.type}): Vinculado ao provedor ${providerMap[service.provider_id]}`);
            } else {
              logger.warn(`- ${service.name} (${service.type}): Não está vinculado a um provedor ativo`);
            }
          }
        }
      } catch (servicesError) {
        logger.error('Erro ao verificar serviços', servicesError);
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
            logger.error(`Erro ao chamar função ${func.name}`, funcError);
          } else {
            logger.success(`Função ${func.name} existe e foi chamada com sucesso`);
          }
        } catch (funcCallError) {
          logger.error(`Erro ao testar função ${func.name}`, funcCallError);
        }
      }
    } catch (supabaseError) {
      logger.error('Erro ao conectar ao Supabase', supabaseError);
    }

    logger.info('Verificação de configuração concluída');
  } catch (error) {
    logger.error('Erro durante a verificação de configuração', error);
  }
}

// Executar a verificação
checkConfiguration().catch(console.error); 