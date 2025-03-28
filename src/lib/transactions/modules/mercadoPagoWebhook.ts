  async handleApprovedPayment(data: MercadoPagoData, existingTransaction: any): Promise<ProcessOrderResult> {
    console.log('[MercadoPagoWebhook] Processando pagamento aprovado:', data);
    const externalReference = data.external_reference;
    
    if (!externalReference) {
      console.error('[MercadoPagoWebhook] Referência externa não encontrada');
      return {
        success: false,
        error: 'Referência externa não encontrada'
      };
    }
    
    const transactionId = externalReference;
    
    try {
      // Verificar se a transação já está sendo processada por outro webhook
      const { data: existingLock, error: lockError } = await this.supabase
        .from('order_locks')
        .select('transaction_id, locked_at, expires_at')
        .eq('transaction_id', transactionId)
        .maybeSingle();
      
      if (lockError) {
        console.error('[MercadoPagoWebhook] Erro ao verificar lock:', lockError);
      }
      
      if (existingLock) {
        // Verificar se o lock expirou
        const expiresAt = new Date(existingLock.expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          console.log(`[MercadoPagoWebhook] Transação ${transactionId} já está sendo processada (bloqueada até ${expiresAt.toISOString()})`);
          return {
            success: false,
            error: 'Transação já está sendo processada'
          };
        } else {
          console.log(`[MercadoPagoWebhook] Lock encontrado mas expirado. Removendo e continuando.`);
          
          // Remover o lock expirado
          await this.supabase
            .from('order_locks')
            .delete()
            .eq('transaction_id', transactionId);
        }
      }
      
      // Criar um lock para esta transação
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutos
      
      const { error: insertLockError } = await this.supabase
        .from('order_locks')
        .insert({
          transaction_id: transactionId,
          locked_at: new Date().toISOString(),
          locked_by: 'mercadopago_webhook',
          expires_at: expiresAt.toISOString(),
          metadata: {
            payment_id: data.id,
            external_reference: externalReference
          }
        });
      
      if (insertLockError) {
        console.error('[MercadoPagoWebhook] Erro ao criar lock:', insertLockError);
        
        // Se não conseguir criar o lock, verificar novamente se outro processo criou um lock
        const { data: recheck, error: recheckError } = await this.supabase
          .from('order_locks')
          .select('transaction_id')
          .eq('transaction_id', transactionId)
          .maybeSingle();
        
        if (recheck) {
          console.log(`[MercadoPagoWebhook] Lock criado por outro processo para ${transactionId}`);
          return {
            success: false,
            error: 'Transação já está sendo processada (concorrência)'
          };
        }
      }

      // Buscar a transação no banco de dados
      const transaction = await this.databaseService.getTransactionById(transactionId);

      if (!transaction) {
        console.error(`[MercadoPagoWebhook] Transação ${transactionId} não encontrada`);
        return {
          success: false,
          error: 'Transação não encontrada'
        };
      }

      // Verificar se já existem pedidos para esta transação
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transactionId);
      if (existingOrders && existingOrders.length > 0) {
        console.log(`[MercadoPagoWebhook] Já existem ${existingOrders.length} pedidos para esta transação`);
        return {
          success: true,
          data: {
            orders: existingOrders
          }
        };
      }

      // Remover o lock ao finalizar
      try {
        await this.supabase
          .from('order_locks')
          .delete()
          .eq('transaction_id', transactionId);
      } catch (error) {
        console.error('[MercadoPagoWebhook] Erro ao remover lock:', error);
      }
    } catch (error) {
      console.error('[MercadoPagoWebhook] Erro ao processar webhook:', error);
      return {
        success: false,
        error: 'Erro ao processar webhook'
      };
    }
  }

  private async isTransactionLocked(transactionId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('order_locks')
        .select('transaction_id, expires_at')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (error) {
        console.error('[MercadoPagoWebhook] Erro ao verificar bloqueio:', error);
        return false;
      }

      if (!data) {
        return false;
      }

      // Verificar se o bloqueio expirou
      const expiresAt = new Date(data.expires_at);
      const now = new Date();

      if (expiresAt < now) {
        console.log(`[MercadoPagoWebhook] Bloqueio da transação ${transactionId} expirou em ${expiresAt.toISOString()}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[MercadoPagoWebhook] Erro ao verificar bloqueio:', error);
      return false;
    }
  }

  private async lockTransaction(transactionId: string, expiresInMinutes: number = 15): Promise<boolean> {
    try {
      // Verificar se já existe um bloqueio
      const isLocked = await this.isTransactionLocked(transactionId);
      if (isLocked) {
        console.log(`[MercadoPagoWebhook] Transação ${transactionId} já está bloqueada`);
        return false;
      }

      // Criar bloqueio
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      const { error } = await this.supabase
        .from('order_locks')
        .insert({
          transaction_id: transactionId,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('[MercadoPagoWebhook] Erro ao criar bloqueio:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[MercadoPagoWebhook] Erro ao criar bloqueio:', error);
      return false;
    }
  }

  private async unlockTransaction(transactionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('order_locks')
        .delete()
        .eq('transaction_id', transactionId);

      if (error) {
        console.error('[MercadoPagoWebhook] Erro ao remover bloqueio:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[MercadoPagoWebhook] Erro ao remover bloqueio:', error);
      return false;
    }
  }

  async processWebhook(data: any, headers: WebhookHeaders): Promise<WebhookResponse> {
    try {
      // Validar a assinatura do webhook
      const isValid = await this.validateSignature(data, headers);
      if (!isValid) {
        logger.error('[MercadoPagoWebhook] Assinatura inválida no webhook');
        return {
          success: false,
          status: 401,
          message: 'Assinatura inválida'
        };
      }

      // Verificar se é uma notificação de pagamento
      if (!data || !data.data || !data.data.id) {
        logger.error('[MercadoPagoWebhook] Dados inválidos no webhook', { data });
        return {
          success: false,
          status: 400,
          message: 'Dados inválidos'
        };
      }

      const paymentId = data.data.id;
      logger.info(`[MercadoPagoWebhook] Processando webhook para pagamento ${paymentId}`);

      // Verificar se o pagamento já foi processado anteriormente
      const supabase = createClient();
      const { data: existingTransaction, error: searchError } = await supabase
        .from('transactions')
        .select('id, status, order_created')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (searchError) {
        logger.error('[MercadoPagoWebhook] Erro ao verificar pagamento existente:', searchError);
      }

      // Se o pagamento já foi processado e tem pedido criado, retornamos para evitar duplicação
      if (existingTransaction && existingTransaction.order_created === true) {
        logger.info(`[MercadoPagoWebhook] Pagamento ${paymentId} já foi processado anteriormente (transação ${existingTransaction.id}). Ignorando.`);
        return {
          success: true,
          status: 200,
          message: 'Pagamento já processado anteriormente'
        };
      }
      
      // Se encontrou transação mas não tem pedido criado, vamos atualizar
      if (existingTransaction) {
        logger.info(`[MercadoPagoWebhook] Pagamento ${paymentId} encontrado (transação ${existingTransaction.id}), mas sem pedido criado. Processando.`);
      }

      // Obter dados do pagamento do Mercado Pago
      const payment = await this.fetchPaymentData(paymentId);
      if (!payment) {
        logger.error(`[MercadoPagoWebhook] Não foi possível obter dados do pagamento ${paymentId}`);
        return {
          success: false,
          status: 404,
          message: 'Pagamento não encontrado'
        };
      }

      // Processar o pagamento de acordo com o status
      if (payment.status === 'approved') {
        return await this.handleApprovedPayment(payment, existingTransaction);
      } else {
        // Atualizar status da transação se já existe
        if (existingTransaction) {
          await this.updateTransactionStatus(existingTransaction.id, payment.status);
          logger.info(`[MercadoPagoWebhook] Status da transação ${existingTransaction.id} atualizado para ${payment.status}`);
        }
        
        return {
          success: true,
          status: 200,
          message: `Status do pagamento: ${payment.status}`,
          paymentId: paymentId
        };
      }
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao processar webhook:', error);
      return {
        success: false,
        status: 500,
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  } 