import { createClient } from '@/lib/supabase/server';
import { CustomerManager } from './modules/customerManager';
import { ProviderManager } from './modules/providerManager';
import { OrderProcessor } from './modules/orderProcessor';
import { OrderStatusManager } from './modules/orderStatusManager';
import { ErrorHandler } from './modules/errorHandler';
import { LinkFormatter } from './modules/linkFormatter';
import { Post } from './modules/types';
import fs from 'fs';
import path from 'path';

/**
 * Configurações globais de segurança para processamento de transações
 */
// Número máximo de posts/reels para qualquer serviço
const MAX_LINKS_PER_ORDER = 5;

/**
 * Função para registrar logs em arquivo
 */
function logToFile(message: string) {
  try {
    const logDir = path.join(process.cwd(), 'log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const logFile = path.join(logDir, `transaction-processor-${dateStr}.log`);
    
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('[Logger] Erro ao escrever log em arquivo:', err);
  }
}

/**
 * Interface para o resultado do processamento de transação
 */
interface ProcessResult {
  success: boolean;
  error?: string;
  orders?: any[];
  needsRetry: boolean;
  message?: string;
  duplicate?: boolean;
  duplicateTransactionId?: string;
}

/**
 * Função para buscar uma transação do banco de dados
 */
async function fetchTransaction(transactionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      service:service_id (
        id,
        name,
        external_id,
        provider_id,
        type,
        quantidade,
        metadata
      )
    `)
    .eq('id', transactionId)
    .single();
    
  if (error) {
    console.error(`[fetchTransaction] Erro ao buscar transação ${transactionId}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Processa uma transação, criando pedidos nos provedores apropriados
 * @param transactionId ID da transação a ser processada
 * @returns Os pedidos criados
 */
async function processTransaction(transactionId: string): Promise<ProcessResult> {
  console.log(`[ProcessTransaction] Iniciando processamento de transação ${transactionId}`);
  
  // Iniciar registro de log
  logToFile(`[Transaction] Iniciando processamento de transação ${transactionId}`);
  
  try {
    const supabase = createClient();
    
    // Buscar dados da transação
    console.log(`[ProcessTransaction] Buscando dados da transação ${transactionId}`);
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        service:service_id (*),
        customer:customer_id (*)
      `)
      .eq('id', transactionId)
      .maybeSingle();
    
    if (error) {
      console.error(`[ProcessTransaction] Erro ao buscar transação:`, error);
      logToFile(`[Transaction] Erro ao buscar transação: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!transaction) {
      console.error(`[ProcessTransaction] Transação ${transactionId} não encontrada`);
      logToFile(`[Transaction] Transação ${transactionId} não encontrada`);
      return {
        success: false,
        error: 'Transação não encontrada'
      };
    }
    
    logToFile(`[Transaction] Status da transação: ${transaction.status}`);
    
    // Verificar se a transação já foi processada anteriormente
    if (transaction.order_created === true) {
      console.log(`[ProcessTransaction] Transação ${transactionId} já foi processada anteriormente`);
      
      // Buscar pedidos existentes
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('transaction_id', transactionId);
      
      return {
        success: true,
        message: 'Transação já processada',
        orders: existingOrders || []
      };
    }
    
    // Verificar se o pagamento já foi processado em outra transação (verificação de duplicação)
    if (transaction.payment_id) {
      const { data: duplicateTransactions, error: duplicateError } = await supabase
        .from('transactions')
        .select('id, status, order_created')
        .eq('payment_id', transaction.payment_id)
        .neq('id', transactionId) // Excluir a transação atual
        .eq('order_created', true); // Apenas transações já processadas
      
      if (duplicateError) {
        console.error(`[ProcessTransaction] Erro ao verificar duplicatas:`, duplicateError);
      }
      
      if (duplicateTransactions && duplicateTransactions.length > 0) {
        console.warn(`[ProcessTransaction] Encontrada transação duplicada para payment_id ${transaction.payment_id}: ${duplicateTransactions[0].id}`);
        logToFile(`[Transaction] ALERTA: Payment ID ${transaction.payment_id} já foi processado na transação ${duplicateTransactions[0].id}`);
        
        // Atualizar a transação atual para evitar processamento repetido
        await supabase
          .from('transactions')
          .update({
            order_created: true,
            metadata: {
              ...transaction.metadata,
              duplicate_of: duplicateTransactions[0].id,
              duplicate_detection_time: new Date().toISOString()
            }
          })
          .eq('id', transactionId);
        
        return {
          success: true,
          message: `Pagamento já processado em outra transação (${duplicateTransactions[0].id})`,
          duplicate: true,
          duplicateTransactionId: duplicateTransactions[0].id
        };
      }
    }
    
    // Criar uma instância do ErrorHandler para usar no tratamento de erros
    const errorHandler = new ErrorHandler();
  
    // Verificar o status da transação
    console.log(`[Transaction] Status da transação: ${transaction.status}`);
    logToFile(`[Transaction] Status da transação: ${transaction.status}`);
    
    // IMPORTANTE: Apenas processar transações com status 'approved'
    if (transaction.status !== 'approved') {
      console.log(`[Transaction] Transação ${transactionId} com status '${transaction.status}' - não aprovada para processamento`);
      logToFile(`[Transaction] Transação ${transactionId} com status '${transaction.status}' - aguardando aprovação de pagamento`);
      return {
        success: false,
        error: `Transação com status '${transaction.status}', apenas transações aprovadas podem ser processadas`,
        needsRetry: transaction.status === 'pending' // Retry apenas para status pending
      };
    }

    // Registrar início do processamento no log
    try {
      await supabase.from('transaction_logs').insert({
        transaction_id: transactionId,
        level: 'info',
        message: 'Iniciando processamento da transação',
        metadata: {
          started_at: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('[ProcessTransaction] Erro ao registrar log de início:', logError);
    }
  
    // Inicializar os gerenciadores
    const customerManager = new CustomerManager();
    const providerManager = new ProviderManager();
    const orderProcessor = new OrderProcessor();
    const linkFormatter = new LinkFormatter();

    // Verificar se a transação já está bloqueada (sendo processada)
    const isLocked = await orderProcessor.isTransactionLocked(transactionId);
    if (isLocked) {
      console.warn(`[ProcessTransaction] A transação ${transactionId} já está sendo processada por outro processo`);
      
      // Registrar detecção de duplicação
      try {
        await supabase.from('transaction_logs').insert({
          transaction_id: transactionId,
          level: 'warning',
          message: 'Tentativa de processamento duplicado detectada',
          metadata: {
            detected_at: new Date().toISOString(),
            action: 'processamento_cancelado'
          }
        });
      } catch (logError) {
        console.error('[ProcessTransaction] Erro ao registrar log de processamento duplicado:', logError);
      }
      
      // Verificar se existem pedidos
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('transaction_id', transactionId);
      
      if (existingOrders && existingOrders.length > 0) {
        console.log(`[ProcessTransaction] Retornando ${existingOrders.length} pedidos existentes sem reprocessar`);
        return {
          success: true,
          orders: existingOrders,
          needsRetry: false
        };
      }
      
      throw new Error(`Transação ${transactionId} já está sendo processada. Tente novamente mais tarde.`);
    }

    try {
      console.log('[ProcessTransaction] Buscando dados da transação...');
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          service:service_id (
            id,
            name,
            external_id,
            provider_id,
            type,
            quantidade,
            metadata
          )
        `)
        .eq('id', transactionId)
        .single();

      if (transactionError) {
        console.error('[ProcessTransaction] Erro ao buscar transação:', transactionError);
        await logTransactionError(transactionId, 'Erro ao buscar transação', transactionError);
        throw transactionError;
      }

      if (!transaction) {
        console.error('[ProcessTransaction] Transação não encontrada:', transactionId);
        await logTransactionError(transactionId, 'Transação não encontrada', { transactionId });
        throw new Error(`Transação com ID ${transactionId} não encontrada`);
      }

      console.log('[ProcessTransaction] Transação encontrada:', transaction.id);
      
      // Verificação detalhada do serviço
      if (transaction.service) {
        console.log(`[ProcessTransaction] Serviço associado à transação:
          ID: ${transaction.service.id}
          Nome: ${transaction.service.name}
          Tipo: ${transaction.service.type}
          Provider ID: ${transaction.service.provider_id}
        `);
        
        // NOVA VERIFICAÇÃO: Verificar inconsistência entre serviço na transação e nos metadados
        if (transaction.metadata?.service) {
          const metadataService = transaction.metadata.service;
          console.log(`[ProcessTransaction] Serviço nos metadados:
            ID: ${metadataService.id}
            Nome: ${metadataService.name}
            Tipo: ${metadataService.type || (metadataService.name?.includes('Seguidores') ? 'followers' : 'likes')}
          `);
          
          // Se os IDs ou nomes são diferentes, há uma inconsistência
          if (metadataService.id && metadataService.id !== transaction.service.id ||
              metadataService.name && !transaction.service.name.includes(metadataService.name)) {
            console.warn(`[ProcessTransaction] ALERTA: Inconsistência detectada entre o serviço na transação e nos metadados!`);
            console.warn(`[ProcessTransaction] Serviço na transação: ${transaction.service.name} (${transaction.service.id})`);
            console.warn(`[ProcessTransaction] Serviço nos metadados: ${metadataService.name} (${metadataService.id})`);
            
            // Registrar a inconsistência no log
            await logTransactionError(transactionId, 'Inconsistência entre serviço na transação e nos metadados', {
              transaction_service: {
                id: transaction.service.id,
                name: transaction.service.name,
                type: transaction.service.type,
                provider_id: transaction.service.provider_id
              },
              metadata_service: metadataService
            });
            
            // CORREÇÃO: Para seguidores nos metadados e curtidas na transação, usar o serviço dos metadados
            if (metadataService.name?.includes('Seguidores') && !transaction.service.name.includes('Seguidores')) {
              console.log(`[ProcessTransaction] Corrigindo tipo de serviço: usando 'followers' dos metadados`);
              // Sobrescrever o tipo para garantir processamento correto
              transaction.service.type = 'followers';
            }
          }
        }
        
        // Log específico para serviços de curtidas
        if (transaction.service.name && transaction.service.name.includes('Curtidas Brasileiras')) {
          console.log('[ProcessTransaction] Detectado serviço de Curtidas Brasileiras');
          await logTransactionInfo(transactionId, 'Serviço identificado como Curtidas Brasileiras', {
            service_id: transaction.service.id,
            service_name: transaction.service.name,
            service_provider_id: transaction.service.provider_id
          });
        }
      } else {
        console.warn('[ProcessTransaction] Transação sem serviço associado');
        
        // Verificar se temos informações do serviço nos metadados que podemos usar
        if (transaction.metadata?.service) {
          console.log('[ProcessTransaction] Usando informações do serviço dos metadados');
          transaction.service = transaction.metadata.service;
        } else {
          await logTransactionError(transactionId, 'Transação sem serviço associado', { transaction_id: transactionId });
        }
      }

      // Verificar se a transação já foi processada
      if (transaction.order_created) {
        console.log('[ProcessTransaction] Transação já foi processada, verificando pedidos existentes');
        
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('transaction_id', transactionId);
        
        if (existingOrders && existingOrders.length > 0) {
          console.log('[ProcessTransaction] Pedidos já existem:', existingOrders);
          
          // Garantir que a transação esteja marcada como tendo pedidos criados
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              order_created: true
            })
            .eq('id', transactionId);
          
          if (updateError) {
            console.error('[ProcessTransaction] Erro ao atualizar status da transação:', updateError);
          }
          
          await logTransactionInfo(transactionId, 'Pedidos já existentes', { 
            order_count: existingOrders.length, 
            order_ids: existingOrders.map(o => o.id),
            reprocessed: false
          });
          
          return {
            success: true,
            orders: existingOrders,
            needsRetry: false
          };
        }
      }

      // Verificar e garantir que o cliente exista
      await customerManager.ensureCustomerExists(transaction, transactionId);

      // Buscar o provedor
      const provider = await providerManager.getProviderForTransaction(transaction);
      
      if (!provider) {
        console.error('[ProcessTransaction] Provedor não encontrado para a transação');
        await logTransactionError(transactionId, 'Provedor não encontrado', { transaction_id: transactionId });
        throw new Error('Provedor não encontrado para a transação');
      }

      // Registrar o provedor encontrado
      await logTransactionInfo(transactionId, 'Provedor encontrado', { 
        provider_id: provider.id,
        provider_name: provider.name
      });

      // Processar a transação com base no tipo de serviço
      if (transaction.service?.type === 'likes' || transaction.service?.type === 'curtidas') {
        console.log('[ProcessTransaction] Processando serviço de curtidas');
        
        // Verificar se temos posts no metadata
        if (transaction.metadata?.posts && transaction.metadata.posts.length > 0) {
          const username = transaction.target_username || 
                         transaction.metadata?.username || 
                         transaction.metadata?.profile?.username;
                         
          if (!username) {
            console.error('[ProcessTransaction] Username não encontrado para serviço de curtidas');
            await logTransactionError(transactionId, 'Username não encontrado', { service_type: 'curtidas' });
            throw new Error('Username não encontrado para serviço de curtidas');
          }
          
          // Verificar o tipo de serviço para tratamento específico
          const serviceName = transaction.service?.name?.toLowerCase() || '';
          const postsFromMetadata = [...transaction.metadata.posts]; // Criar cópia dos posts
          
          // Aplicar limite máximo de posts
          if (postsFromMetadata.length > MAX_LINKS_PER_ORDER) {
            console.log(`[ProcessTransaction] Limitando a ${MAX_LINKS_PER_ORDER} posts (original: ${postsFromMetadata.length})`);
            
            // Registrar este limite nos logs
            await logTransactionInfo(transactionId, 'Limite de posts aplicado', {
              original_count: postsFromMetadata.length,
              limited_to: MAX_LINKS_PER_ORDER,
              service_type: 'curtidas'
            });
            
            // Cortar para apenas os primeiros posts permitidos
            const limitedPosts = postsFromMetadata.slice(0, MAX_LINKS_PER_ORDER);
            
            return await orderProcessor.processLikesOrder(transaction, provider, limitedPosts, username);
          }
          
          // Para curtidas brasileiras, verificar e remover duplicações
          if (serviceName.includes('brasileira')) {
            console.log('[ProcessTransaction] Detectado serviço de Curtidas Brasileiras');
            
            // Remover possíveis duplicações de posts
            const uniquePosts = [];
            const seenIds = new Set();
            
            for (const post of postsFromMetadata) {
              if (post && post.id && !seenIds.has(post.id)) {
                seenIds.add(post.id);
                uniquePosts.push(post);
              }
            }
            
            // Aplicar limite máximo após deduplicação
            if (uniquePosts.length > MAX_LINKS_PER_ORDER) {
              console.log(`[ProcessTransaction] Limitando posts após deduplicação: ${uniquePosts.length} -> ${MAX_LINKS_PER_ORDER}`);
              const limitedUniquePosts = uniquePosts.slice(0, MAX_LINKS_PER_ORDER);
              return await orderProcessor.processLikesOrder(transaction, provider, limitedUniquePosts, username);
            }
            
            if (uniquePosts.length < postsFromMetadata.length) {
              console.log(`[ProcessTransaction] Removidas duplicações: ${postsFromMetadata.length} posts -> ${uniquePosts.length} posts únicos`);
              return await orderProcessor.processLikesOrder(transaction, provider, uniquePosts, username);
            }
          }
          // Para curtidas premium, verificar se todos os posts estão presentes
          else if (serviceName.includes('premium')) {
            console.log('[ProcessTransaction] Detectado serviço de Curtidas Premium');
            
            // Verificar se o total esperado coincide com o total enviado
            const expectedCount = transaction.metadata.selectedPostsCount as number;
            
            if (expectedCount && postsFromMetadata.length < expectedCount) {
              console.log(`[ProcessTransaction] Detectada inconsistência: esperados ${expectedCount} posts, recebidos ${postsFromMetadata.length}`);
              
              // Verificar se existem postsData como backup
              const backupPosts = transaction.metadata.postsData as Post[];
              
              if (backupPosts && Array.isArray(backupPosts) && backupPosts.length > postsFromMetadata.length) {
                console.log(`[ProcessTransaction] Usando posts de backup: ${backupPosts.length} posts`);
                // Aplicar limite de MAX_LINKS_PER_ORDER também aos posts de backup
                const limitedBackupPosts = backupPosts.slice(0, MAX_LINKS_PER_ORDER);
                return await orderProcessor.processLikesOrder(transaction, provider, limitedBackupPosts, username);
              }
            }
          }
          
          console.log(`[ProcessTransaction] Processando curtidas para ${username} com ${postsFromMetadata.length} posts`);
          return await orderProcessor.processLikesOrder(transaction, provider, postsFromMetadata, username);
        } else {
          // Caso antigo - sem posts no metadata
          return await orderProcessor.processLikesOrder(transaction, provider);
        }
      } else if (transaction.service?.type === 'reels' || 
                (transaction.service?.name && transaction.service.name.toLowerCase().includes('reel')) ||
                (transaction.metadata?.service?.name && transaction.metadata.service.name.toLowerCase().includes('reel'))) {
        console.log('[ProcessTransaction] Processando serviço de reels');
        
        // Verificar se temos reels no metadata
        if (transaction.metadata?.posts && transaction.metadata.posts.length > 0) {
          const username = transaction.target_username || 
                         transaction.metadata?.username || 
                         transaction.metadata?.profile?.username;
                         
          if (!username) {
            console.error('[ProcessTransaction] Username não encontrado para serviço de reels');
            throw new Error('Username não encontrado para serviço de reels');
          }
          
          // Aplicar limite máximo de reels
          if (transaction.metadata.posts.length > MAX_LINKS_PER_ORDER) {
            console.log(`[ProcessTransaction] Limitando a ${MAX_LINKS_PER_ORDER} reels (original: ${transaction.metadata.posts.length})`);
            
            // Registrar este limite nos logs
            await logTransactionInfo(transactionId, 'Limite de reels aplicado', {
              original_count: transaction.metadata.posts.length,
              limited_to: MAX_LINKS_PER_ORDER,
              service_type: 'reels'
            });
            
            // Cortar para apenas os primeiros reels permitidos
            const limitedReels = transaction.metadata.posts.slice(0, MAX_LINKS_PER_ORDER);
            
            console.log(`[ProcessTransaction] Processando reels para ${username} com ${limitedReels.length} reels (limitado)`);
            return await orderProcessor.processReelsOrder(transaction, provider, limitedReels, username);
          }
          
          console.log(`[ProcessTransaction] Processando reels para ${username} com ${transaction.metadata.posts.length} reels`);
          return await orderProcessor.processReelsOrder(transaction, provider, transaction.metadata.posts, username);
        }
        
        // Se não tiver reels no metadata, tratar como pedido genérico
        console.log('[ProcessTransaction] Serviço de reels sem posts especificados, processando como pedido genérico');
      } else if (transaction.service?.type === 'comentarios' || 
                (transaction.service?.name && transaction.service.name.toLowerCase().includes('coment')) ||
                (transaction.metadata?.service?.name && transaction.metadata.service.name.toLowerCase().includes('coment'))) {
        console.log('[ProcessTransaction] Processando serviço de comentários');
        
        // Verificar se temos posts no metadata
        if (transaction.metadata?.posts && transaction.metadata.posts.length > 0) {
          const username = transaction.target_username || 
                         transaction.metadata?.username || 
                         transaction.metadata?.profile?.username;
                         
          if (!username) {
            console.error('[ProcessTransaction] Username não encontrado para serviço de comentários');
            throw new Error('Username não encontrado para serviço de comentários');
          }
          
          // Aplicar limite máximo de posts para comentários
          if (transaction.metadata.posts.length > MAX_LINKS_PER_ORDER) {
            console.log(`[ProcessTransaction] Limitando a ${MAX_LINKS_PER_ORDER} posts para comentários (original: ${transaction.metadata.posts.length})`);
            
            // Registrar este limite nos logs
            await logTransactionInfo(transactionId, 'Limite de posts para comentários aplicado', {
              original_count: transaction.metadata.posts.length,
              limited_to: MAX_LINKS_PER_ORDER,
              service_type: 'comentarios'
            });
            
            // Cortar para apenas os primeiros posts permitidos
            const limitedPosts = transaction.metadata.posts.slice(0, MAX_LINKS_PER_ORDER);
            
            console.log(`[ProcessTransaction] Processando comentários para ${username} com ${limitedPosts.length} posts/reels (limitado)`);
            return await orderProcessor.processCommentsOrder(transaction, provider, limitedPosts, username);
          }
          
          console.log(`[ProcessTransaction] Processando comentários para ${username} com ${transaction.metadata.posts.length} posts/reels`);
          return await orderProcessor.processCommentsOrder(transaction, provider, transaction.metadata.posts, username);
        }
        
        // Se não tiver posts no metadata, tratar como pedido genérico
        console.log('[ProcessTransaction] Serviço de comentários sem posts especificados, processando como pedido genérico');
      } else if (transaction.service?.type === 'followers') {
        console.log('[ProcessTransaction] Checkout de seguidores');
        
        // Determinar o username do perfil
        const username = transaction.target_username || 
                       transaction.metadata?.username || 
                       transaction.metadata?.profile?.username;
        
        if (!username) {
          console.error('[ProcessTransaction] Username não encontrado no profile');
          throw new Error('Username não encontrado no profile');
        }
        
        console.log(`[ProcessTransaction] Checkout de seguidores para: ${username}`);
        
        // Verificação adicional para garantir que não haja processamento duplicado para seguidores
        // nos últimos minutos para o mesmo perfil
        try {
          const timeWindow = 30 * 60 * 1000; // 30 minutos em ms
          const thirtyMinutesAgo = new Date(Date.now() - timeWindow).toISOString();
          
          const { data: recentFollowerOrders } = await supabase
            .from('orders')
            .select('id, target_username, created_at, transaction_id')
            .or(`target_username.eq.${username},target_link.ilike.%${username}%`)
            .eq('service_type', 'followers')
            .gt('created_at', thirtyMinutesAgo)
            .order('created_at', { ascending: false });
          
          if (recentFollowerOrders && recentFollowerOrders.length > 0) {
            const otherTransactionOrders = recentFollowerOrders.filter(order => order.transaction_id !== transaction.id);
            
            if (otherTransactionOrders.length > 0) {
              console.error(`[ProcessTransaction] ⚠️ AVISO DE PROTEÇÃO: Detectados ${otherTransactionOrders.length} pedidos de seguidores para @${username} nos últimos 30 minutos em outras transações!`);
              
              // Registrar isso no log de transações
              await supabase.from('transaction_logs').insert({
                transaction_id: transaction.id,
                level: 'warning',
                message: `Bloqueado pedido duplicado de seguidores para @${username}`,
                metadata: {
                  username,
                  recent_orders: otherTransactionOrders,
                  reason: 'duplicate_followers_protection',
                  blocked_at: new Date().toISOString()
                }
              });
              
              throw new Error(`Pedido bloqueado: Já existe um pedido de seguidores para @${username} nos últimos 30 minutos. Para proteger sua conta, aguarde pelo menos 30 minutos antes de enviar outro pedido para o mesmo perfil.`);
            }
          }
        } catch (verificationError) {
          console.error('[ProcessTransaction] Erro ao verificar pedidos recentes de seguidores:', verificationError);
          // Não bloqueia em caso de erro na verificação
        }
        
        // Se passar por todas as verificações, processa normalmente
        return await orderProcessor.processFollowersOrder(transaction, provider);
      } else {
        console.log('[ProcessTransaction] Processando serviço genérico');
        
        // Determinar o username e o link alvo
        let username = transaction.target_username || 
                       transaction.metadata?.username || 
                       transaction.metadata?.profile?.username;
        
        let targetLink = '';
        
        // Para outros tipos, verificamos se temos username nos posts ou no profile
        username = transaction.metadata?.profile?.username || 
                  (transaction.metadata?.posts && transaction.metadata?.posts.length > 0 ? 
                    transaction.metadata?.posts[0].username : transaction.target_username);
        
        if (!username) {
          console.error('[ProcessTransaction] Username não encontrado nos posts ou no profile');
          throw new Error('Username não encontrado nos posts ou no profile');
        }
        
        console.log(`[ProcessTransaction] Checkout para: ${username}`);
        
        // Se temos posts, usamos o link do primeiro post
        if (transaction.metadata?.posts && transaction.metadata?.posts.length > 0) {
          const post = transaction.metadata.posts[0];
          console.log('[ProcessTransaction] Formatando link do post:', post);
          targetLink = linkFormatter.formatPostLink(post, true);
        } else {
          // Caso não tenha posts, usamos o perfil como fallback
          targetLink = transaction.target_profile_link || `https://instagram.com/${username}`;
        }
        
        console.log(`[ProcessTransaction] Link do alvo: ${targetLink}`);
        return await orderProcessor.processGenericOrder(transaction, provider);
      }
    } catch (error) {
      console.error('[ProcessTransaction] Erro geral:', error);
      // Registrar o erro diretamente no banco de dados
      try {
        await supabase
          .from('transaction_processing')
          .update({
            status: 'failed',
            last_error: error.message || 'Erro desconhecido',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
        
        console.error(`[ProcessTransaction] Transação ${transactionId} marcada como falha devido a erro: ${error.message}`);
      } catch (dbError) {
        console.error(`[ProcessTransaction] Erro ao registrar falha para transação ${transactionId}:`, dbError);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('[ProcessTransaction] Erro geral:', error);
    // Registrar o erro diretamente no banco de dados
    try {
      const supabase = createClient();
      await supabase
        .from('transaction_processing')
        .update({
          status: 'failed',
          last_error: error.message || 'Erro desconhecido',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
      
      console.error(`[ProcessTransaction] Transação ${transactionId} marcada como falha devido a erro: ${error.message}`);
    } catch (dbError) {
      console.error(`[ProcessTransaction] Erro ao registrar falha para transação ${transactionId}:`, dbError);
    }
    
    throw error;
  }
}

/**
 * Verifica o status de um pedido no provedor
 * @param orderId ID do pedido (string que será convertida para número)
 * @param providerId ID do provedor
 * @returns Status do pedido
 */
async function checkOrderStatus(orderId: string, providerId: string) {
  const orderStatusManager = new OrderStatusManager();
  // Converter o orderId para número
  const orderIdNumber = parseInt(orderId, 10);
  return await orderStatusManager.checkOrderStatus(orderIdNumber, providerId);
}

/**
 * Atualiza o status de um pedido no banco de dados
 * @param orderId ID do pedido
 * @param status Novo status
 * @returns Pedido atualizado
 */
async function updateOrderStatus(orderId: string, status: string) {
  const orderStatusManager = new OrderStatusManager();
  return await orderStatusManager.updateOrderStatus(orderId, status);
}

/**
 * Verifica o status de múltiplos pedidos nos provedores
 * @param orderIds Lista de IDs dos pedidos
 * @param providerId ID do provedor (opcional)
 * @returns Status dos pedidos
 */
async function checkMultipleOrdersStatus(orderIds: string[], providerId?: string) {
  const orderStatusManager = new OrderStatusManager();
  return await orderStatusManager.checkMultipleOrdersStatus(orderIds, providerId);
}

/**
 * Verifica o status de uma reposição (refill) no provedor
 * @param refillId ID da reposição
 * @param providerId ID do provedor (opcional)
 * @returns Status da reposição
 */
async function checkRefillStatus(refillId: string, providerId?: string) {
  const orderStatusManager = new OrderStatusManager();
  return await orderStatusManager.checkRefillStatus(refillId, providerId);
}

// Utility function to log transaction errors
async function logTransactionError(transactionId: string, message: string, details: unknown) {
  const supabase = createClient();
  try {
    await supabase.from('transaction_logs').insert({
      transaction_id: transactionId,
      level: 'error',
      message: message,
      metadata: {
        error: details instanceof Error ? details.message : JSON.stringify(details),
        stack: details instanceof Error ? details.stack : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (logError) {
    console.error('[ProcessTransaction] Erro ao registrar log de erro:', logError);
  }
}

// Utility function to log transaction info
async function logTransactionInfo(transactionId: string, message: string, details: Record<string, unknown>) {
  const supabase = createClient();
  try {
    await supabase.from('transaction_logs').insert({
      transaction_id: transactionId,
      level: 'info',
      message: message,
      metadata: {
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (logError) {
    console.error('[ProcessTransaction] Erro ao registrar log de informação:', logError);
  }
}

export { processTransaction, checkOrderStatus, updateOrderStatus, checkMultipleOrdersStatus, checkRefillStatus };
