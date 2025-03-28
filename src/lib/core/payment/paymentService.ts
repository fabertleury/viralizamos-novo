import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import { TransactionService } from './transactionService';

/**
 * Serviço para processamento e verificação de pagamentos
 */
export class PaymentService {
  private supabase;
  private transactionService;
  private mercadoPagoAccessToken;

  constructor() {
    this.supabase = createClient();
    this.transactionService = new TransactionService();
    this.mercadoPagoAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  }

  /**
   * Cria um pagamento PIX e a transação associada
   */
  async createPixPayment({
    userId,
    serviceId,
    amount,
    profile,
    customer,
    paymentId,
    posts = [],
    qrCode = '',
    qrCodeBase64 = '',
    quantity = 0
  }: {
    userId: string | null;
    serviceId: string;
    amount: number;
    profile: {
      username: string;
      full_name?: string;
      link?: string;
    };
    customer: {
      name?: string;
      email: string;
      phone?: string;
    };
    paymentId: string;
    posts?: Array<{
      id?: string;
      code?: string;
      url?: string;
      caption?: string;
      quantity?: number;
    }>;
    qrCode?: string;
    qrCodeBase64?: string;
    quantity?: number;
  }) {
    try {
      // Validar informações do cliente
      if (!customer.name) {
        console.log('[PaymentService] Cliente sem nome fornecido, usando parte do email');
        customer.name = customer.email.split('@')[0];
      }
      
      const customerInfo = customer.name || 'Cliente ' + customer.email.substring(0, 5);
      console.log(`[PaymentService] Criando transação PIX para cliente ${customerInfo}...`);

      // DEBUG: Log detalhado dos posts e suas quantidades
      console.log(`[PaymentService] DEBUG - Posts recebidos para pagamento (${posts.length}):`, 
        posts.map((post, index) => ({
          index,
          id: post.id,
          code: post.code,
          url: post.url,
          hasQuantity: typeof post.quantity === 'number',
          quantity: post.quantity,
          postStructure: Object.keys(post)
        }))
      );

      // Calcular a quantidade total somando as quantidades individuais dos posts
      let totalQuantity = quantity; // Usar a quantidade passada explicitamente se disponível
      
      if (totalQuantity <= 0 && posts.length > 0) {
        // Verificar se todos os posts têm quantidade definida
        const allPostsHaveQuantity = posts.every(post => typeof post.quantity === 'number');
        
        if (allPostsHaveQuantity) {
          // Somar as quantidades de todos os posts
          totalQuantity = posts.reduce((sum, post) => sum + (typeof post.quantity === 'number' ? post.quantity : 0), 0);
          console.log(`[PaymentService] Quantidade total calculada dos posts: ${totalQuantity}`);
        } else {
          // Se nem todos os posts têm quantidade, buscar a quantidade do serviço
          console.log(`[PaymentService] Nem todos os posts têm quantidade definida. Consultando serviço.`);
          
          try {
            const { data: service } = await this.supabase
              .from('services')
              .select('quantidade')
              .eq('id', serviceId)
              .single();
              
            if (service) {
              totalQuantity = service.quantidade;
              console.log(`[PaymentService] Quantidade obtida do serviço: ${totalQuantity}`);
              
              // Distribuir a quantidade entre os posts que não têm quantidade definida
              if (posts.length > 0) {
                const postsWithoutQuantity = posts.filter(post => typeof post.quantity !== 'number');
                if (postsWithoutQuantity.length > 0) {
                  const baseQuantity = Math.floor(totalQuantity / posts.length);
                  const remainder = totalQuantity % posts.length;
                  
                  console.log(`[PaymentService] Distribuindo quantidade ${totalQuantity} entre ${posts.length} posts: base=${baseQuantity}, remainder=${remainder}`);
                  
                  // Atribuir quantidades aos posts que não têm
                  posts.forEach((post, index) => {
                    if (typeof post.quantity !== 'number') {
                      post.quantity = baseQuantity + (index < remainder ? 1 : 0);
                      console.log(`[PaymentService] Atribuindo quantidade ${post.quantity} para post ${index}`);
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.error('[PaymentService] Erro ao buscar quantidade do serviço:', error);
          }
        }
      }

      // Log final dos posts que serão enviados para o TransactionService
      console.log('[PaymentService] Posts finais com quantidades:', 
        posts.map((post, index) => ({
          index,
          id: post.id,
          code: post.code,
          quantity: post.quantity,
          hasFinalQuantity: typeof post.quantity === 'number'
        }))
      );

      // Usar o TransactionService para criar a transação
      const result = await this.transactionService.createTransaction({
        userId,
        serviceId,
        amount,
        profile,
        customer,
        paymentId,
        paymentProvider: 'mercadopago',
        paymentMethod: 'pix',
        posts,
        qrCode,
        qrCodeBase64,
        quantity: totalQuantity > 0 ? totalQuantity : undefined
      });

      if (!result || !result.success) {
        const errorMessage = result?.error || 'Erro desconhecido ao criar transação';
        console.error(`[PaymentService] Erro ao criar transação: ${errorMessage}`);
        
        // Registrar o erro nos logs do sistema
        try {
          await this.supabase.from('core_processing_logs').insert({
            level: 'error',
            message: 'Falha ao criar transação para pagamento PIX',
            metadata: {
              error_message: String(errorMessage),
              payment_id: paymentId,
              service_id: serviceId
            }
          });
        } catch (logError) {
          console.error('[PaymentService] Erro ao registrar log de falha:', logError);
        }
        
        throw new Error(`Erro ao salvar transação: ${errorMessage}`);
      }

      // Registrar log de sucesso na tabela core_processing_logs
      await this.supabase.from('core_processing_logs').insert({
        transaction_id: result.transaction.id,
        level: 'info',
        message: 'Pagamento PIX criado com sucesso',
        metadata: {
          payment_id: paymentId,
          transaction_id: result.transaction.id,
          service_id: serviceId,
          amount
        }
      });

      return {
        success: true,
        transaction: result.transaction,
        qrCode,
        qrCodeBase64
      };
    } catch (error) {
      console.error('[PaymentService] Erro ao processar pagamento PIX:', error);
      await this.supabase.from('core_processing_logs').insert({
        level: 'error',
        message: 'Erro ao criar pagamento PIX',
        metadata: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          payment_id: paymentId,
          service_id: serviceId
        }
      });

      throw error;
    }
  }

  /**
   * Verifica o status do pagamento no MercadoPago
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    message?: string;
    status?: string;
    mappedStatus?: string;
    action?: string;
    data?: unknown;
  }> {
    try {
      console.log(`[PaymentService] Verificando status do pagamento ${paymentId}`);

      // Configurar o cliente do Mercado Pago
      mercadopago.configurations.setAccessToken(this.mercadoPagoAccessToken);

      // Consultar o status do pagamento no Mercado Pago
      const paymentResult = await mercadopago.payment.get(paymentId);
      const payment = paymentResult.body;
      
      if (!payment) {
        console.warn(`[PaymentService] Pagamento ${paymentId} não encontrado`);
        return {
          success: false,
          message: `Pagamento ${paymentId} não encontrado`,
          action: 'payment_not_found'
        };
      }
      
      // Buscar todas as transações associadas a este pagamento, podem existir duplicatas
      const { data: transactions, error } = await this.supabase
        .from('core_transactions_v2')
        .select('id, status, payment_status, metadata, order_created')
        .eq('payment_id', paymentId);
      
      if (error || !transactions || transactions.length === 0) {
        console.error(`[PaymentService] Erro ao buscar transação para pagamento ${paymentId}:`, error || 'Nenhuma transação encontrada');
        return {
          success: false,
          message: error ? `Erro ao buscar transação: ${error.message}` : 'Nenhuma transação encontrada',
          action: 'transaction_not_found'
        };
      }
      
      console.log(`[PaymentService] Encontradas ${transactions.length} transações para o pagamento ${paymentId}`);
      
      // Usar a primeira transação para processamento
      const transaction = transactions[0];
      
      // Mapear o status do MercadoPago para nosso padrão interno
      const mpStatus = payment.status;
      const mappedStatus = this.mapPaymentStatus(mpStatus);
      
      console.log(`[PaymentService] Status do pagamento ${paymentId}: ${mpStatus} (mapeado para: ${mappedStatus})`);
      
      // Verificar se o status mudou
      const currentPaymentStatus = transaction.payment_status || 'pending';
      const statusChanged = currentPaymentStatus !== mappedStatus;
      
      console.log(`[PaymentService] Verificação de status: ${currentPaymentStatus} -> ${mappedStatus} (mudou: ${statusChanged})`);
      
      // Atualizar o metadata da transação com o histórico de status
      const previousMetadata = transaction.metadata || {};
      const now = new Date().toISOString();
      
      // Criar um objeto de metadados atualizado com registro de status
      const updatedMetadata = {
        ...previousMetadata,
        payment_status: mappedStatus,
        mapped_status: mappedStatus,
        last_checked_at: now,
        last_status_change: statusChanged ? now : previousMetadata.last_status_change,
        previous_status: statusChanged ? currentPaymentStatus : previousMetadata.previous_status,
        status_change_action: statusChanged ? `status_changed_from_${currentPaymentStatus}_to_${mappedStatus}` : previousMetadata.status_change_action
      };
      
      // Garantir que temos um array de histórico de transações
      if (!updatedMetadata.transaction_history) {
        updatedMetadata.transaction_history = [];
      }
      
      // Adicionar entrada ao histórico de transações
      if (Array.isArray(updatedMetadata.transaction_history)) {
        updatedMetadata.transaction_history.push({
          timestamp: now,
          status: mappedStatus,
          previous_status: currentPaymentStatus,
          payment_provider: 'mercadopago',
          changed: statusChanged
        });
      }
      
      // Atualizar a transação com o novo status
      const { error: updateError } = await this.supabase
        .from('core_transactions_v2')
        .update({
          payment_status: mappedStatus,
          status: mappedStatus,
          updated_at: now,
          metadata: updatedMetadata
        })
        .eq('id', transaction.id);
      
      if (updateError) {
        console.error(`[PaymentService] Erro ao atualizar status da transação ${transaction.id}:`, updateError);
        return {
          success: false,
          message: `Erro ao atualizar status: ${updateError.message}`,
          action: 'update_failed'
        };
      }
      
      // Registrar log de atualização de status
      await this.supabase.from('core_processing_logs').insert({
        transaction_id: transaction.id,
        level: 'info',
        message: `Status do pagamento ${paymentId} verificado: ${mpStatus} (${mappedStatus})`,
        metadata: {
          payment_id: paymentId,
          mp_status: mpStatus,
          mapped_status: mappedStatus,
          changed: statusChanged,
          previous_status: currentPaymentStatus
        }
      });
      
      // Verificar se alguma transação já tem pedido criado
      const anyOrderCreated = transactions.some(t => t.order_created);
      
      // Se o status mudou para 'approved' e nenhuma transação tem pedido criado, criar um pedido
      if (statusChanged && mappedStatus === 'approved' && !anyOrderCreated) {
        console.log(`[PaymentService] Pagamento ${paymentId} mudou status para APPROVED. Iniciando criação de pedido...`);
        
        // Registrar log específico da mudança de status para approved
        await this.supabase.from('core_processing_logs').insert({
          transaction_id: transaction.id,
          level: 'info',
          message: `Status do pagamento mudou para APPROVED, criando pedido em core_orders`,
          metadata: {
            payment_id: paymentId,
            previous_status: currentPaymentStatus,
            new_status: mappedStatus,
            transaction_id: transaction.id
          }
        });
        
        try {
          console.log(`[PaymentService] Criando pedido para a transação ${transaction.id}`);
          
          // Buscar informações completas da transação para ter certeza de que temos todos os campos
          const { data: transactionDetail, error: detailError } = await this.supabase
            .from('core_transactions_v2')
            .select('*')
            .eq('id', transaction.id)
            .maybeSingle();
          
          if (detailError || !transactionDetail) {
            console.error(`[PaymentService] Erro ao buscar detalhes da transação:`, detailError || 'Transação não encontrada');
            throw new Error(`Erro ao buscar detalhes da transação: ${detailError?.message || 'Transação não encontrada'}`);
          }
          
          // Gerar ID do pedido
          const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          // Registrar log de início da criação do pedido
          await this.supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'info',
            message: `Iniciando criação de pedido para o pagamento ${paymentId}`,
            metadata: {
              payment_id: paymentId,
              transaction_id: transaction.id,
              mp_status: mpStatus,
              mapped_status: mappedStatus
            }
          });
          
          // Buscar posts da transação
          const { data: transactionPosts, error: postsError } = await this.supabase
            .from('core_transaction_posts_v2')
            .select('*')
            .eq('transaction_id', transaction.id);
            
          if (postsError) {
            console.error(`[PaymentService] Erro ao buscar posts:`, postsError);
            throw new Error(`Erro ao buscar posts: ${postsError.message}`);
          }
          
          console.log(`[PaymentService] Encontrados ${transactionPosts?.length || 0} posts para a transação`);
          
          // Criar pedido na tabela core_orders com campos seguros
          const orderData = {
            transaction_id: transaction.id,
            order_id: orderId,
            customer_id: transactionDetail.customer_id || null,
            customer_name: transactionDetail.customer_name || '',
            customer_email: transactionDetail.customer_email || '',
            customer_phone: transactionDetail.customer_phone || '',
            service_id: transactionDetail.service_id || '',
            amount: transactionDetail.amount || 0,
            status: 'pending',
            target_username: transactionDetail.target_username || '',
            posts_count: transactionPosts?.length || 0,
            metadata: {
              payment_id: paymentId,
              transaction_id: transaction.id,
              posts: transactionPosts || [],
              customer_metadata: transactionDetail.metadata || {}
            }
          };
          
          console.log(`[PaymentService] Dados do pedido:`, JSON.stringify(orderData));
          
          // Verificar se já existe um pedido para esta transação
          const { data: existingOrder, error: checkOrderError } = await this.supabase
            .from('core_orders')
            .select('id')
            .eq('transaction_id', transaction.id)
            .maybeSingle();
            
          if (checkOrderError) {
            console.error(`[PaymentService] Erro ao verificar pedido existente:`, checkOrderError);
          }
          
          if (existingOrder) {
            console.log(`[PaymentService] Pedido já existe para a transação ${transaction.id}, atualizando status`);
            
            // Atualizar pedido existente
            const { error: updateOrderError } = await this.supabase
              .from('core_orders')
              .update({ 
                status: 'pending',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingOrder.id);
              
            if (updateOrderError) {
              console.error(`[PaymentService] Erro ao atualizar pedido:`, updateOrderError);
              throw new Error(`Erro ao atualizar pedido: ${updateOrderError.message}`);
            }
          } else {
            // Criar novo pedido
            const { error: orderError } = await this.supabase
              .from('core_orders')
              .insert(orderData);
              
            if (orderError) {
              console.error(`[PaymentService] Erro ao criar pedido:`, orderError);
              throw new Error(`Erro ao criar pedido: ${orderError.message}`);
            }
          }
          
          console.log(`[PaymentService] Pedido ${orderId} criado com sucesso!`);
          
          // Marcar TODAS as transações com este payment_id como tendo pedido criado
          for (const t of transactions) {
            const { error: updateError } = await this.supabase
              .from('core_transactions_v2')
              .update({ 
                order_created: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', t.id);
              
            if (updateError) {
              console.error(`[PaymentService] Erro ao atualizar transação ${t.id}:`, updateError);
            }
          }
            
          // Registrar que o pedido foi criado
          await this.supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'info',
            message: `Pedido ${orderId} criado para o pagamento ${paymentId}`,
            metadata: {
              order_id: orderId,
              payment_id: paymentId,
              mp_status: mpStatus,
              mapped_status: mappedStatus
            }
          });
        } catch (orderCreationError) {
          console.error(`[PaymentService] Erro ao processar criação de pedido:`, orderCreationError);
          
          // Registrar erro na criação do pedido
          await this.supabase.from('core_processing_logs').insert({
            transaction_id: transaction.id,
            level: 'error',
            message: `Erro ao criar pedido para o pagamento ${paymentId}`,
            metadata: {
              error: orderCreationError instanceof Error ? orderCreationError.message : 'Erro desconhecido',
              payment_id: paymentId
            }
          });
        }
      } else if (mappedStatus === 'approved') {
        console.log(`[PaymentService] Pedido já foi criado anteriormente para o pagamento ${paymentId}`);
      }
      
      return {
        success: true,
        status: mpStatus,
        mappedStatus,
        action: statusChanged ? 'status_updated' : 'status_unchanged',
        data: payment
      };
    } catch (error) {
      console.error('[PaymentService] Erro ao verificar status do pagamento:', error);
      
      // Tentar registrar o erro
      try {
        await this.supabase.from('core_processing_logs').insert({
          level: 'error',
          message: `Erro ao verificar status do pagamento ${paymentId}`,
          metadata: {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            payment_id: paymentId
          }
        });
      } catch (logError) {
        console.error('[PaymentService] Erro ao registrar erro de verificação:', logError);
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao verificar status',
        action: 'check_failed'
      };
    }
  }

  /**
   * Mapeia o status do pagamento do Mercado Pago para o status da transação
   */
  private mapPaymentStatus(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'approved':
      case 'completed':
        return 'approved';
      case 'pending':
      case 'in_process':
      case 'in_mediation':
        return 'pending';
      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        return 'rejected';
      default:
        return 'pending';
    }
  }
} 