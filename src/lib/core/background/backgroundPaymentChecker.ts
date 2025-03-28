  async createOrder(transaction: Transaction, mercadoPagoPayment: any): Promise<{ success: boolean, error?: string, order_id?: string }> {
    try {
      const { data: customer } = await this.supabase
        .from('core_customers')
        .select('*')
        .eq('id', transaction.customer_id)
        .single();

      // Obter detalhes do serviço para o pedido
      const { data: service } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', transaction.service_id)
        .single();

      if (!service) {
        logger.error('Serviço não encontrado para criar pedido', {
          transaction_id: transaction.id,
          service_id: transaction.service_id
        });
        return { success: false, error: 'Serviço não encontrado' };
      }

      // Extrair os dados do pagamento do Mercado Pago
      const paymentData = mercadoPagoPayment?.body || {};
      
      // Extrair metadata do cliente da transação
      const customerName = transaction.metadata?.profile_username || 
                          transaction.metadata?.customer_name || 
                          (customer ? customer.name : null);
      
      const customerEmail = transaction.metadata?.customer_email || 
                          (customer ? customer.email : null);
      
      const customerPhone = transaction.metadata?.customer_phone || 
                          (customer ? customer.phone : null);

      // Dados para criar o pedido
      const orderData = {
        transaction_id: transaction.id,
        user_id: transaction.user_id,
        customer_id: transaction.customer_id,
        service_id: transaction.service_id,
        provider_id: service.provider_id,
        status: 'pending',
        amount: transaction.total_amount,
        quantity: service.quantidade || 1000,
        target_username: transaction.target_username,
        target_url: `https://instagram.com/${transaction.target_username}/`,
        payment_method: transaction.payment_method,
        payment_id: transaction.payment_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        metadata: {
          profile_username: transaction.target_username,
          service_name: service.name,
          service_type: service.type || 'instagram',
          payment_details: {
            id: transaction.payment_id,
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            payment_method_id: paymentData.payment_method_id,
            payment_type_id: paymentData.payment_type_id,
            currency_id: paymentData.currency_id,
            payment_data: paymentData
          }
        }
      };

      logger.info('Criando pedido para transação', {
        transaction_id: transaction.id,
        order_data: JSON.stringify(orderData)
      });

      const { data: order, error } = await this.supabase
        .from('core_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar pedido', {
          transaction_id: transaction.id,
          error: error.message
        });
        return { success: false, error: error.message };
      }

      logger.info('Pedido criado com sucesso', {
        transaction_id: transaction.id,
        order_id: order.id
      });

      return { success: true, order_id: order.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logger.error('Exceção ao criar pedido', {
        transaction_id: transaction.id,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  } 