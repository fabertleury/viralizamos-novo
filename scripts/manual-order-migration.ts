import { createClient } from '@/lib/supabase/server';
import { SocialMediaService } from '@/lib/services/socialMediaService';

async function manualOrderMigration() {
  const supabase = createClient();
  const socialMediaService = new SocialMediaService();

  console.log('🔍 Iniciando migração manual de ordens');

  // Buscar transações que precisam ter ordens criadas
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('*, service:service_id(*)')
    .eq('status', 'approved')
    .is('order_created', null);

  if (transactionError) {
    console.error('❌ Erro ao buscar transações:', transactionError);
    return;
  }

  console.log(`📊 Transações aprovadas encontradas: ${transactions.length}`);

  for (const transaction of transactions) {
    try {
      console.log(`\n🔎 Processando transação: ${transaction.id}`);

      // Verificar se já existe uma ordem para esta transação
      const { data: existingOrders, error: existingOrderError } = await supabase
        .from('orders')
        .select('*')
        .eq('transaction_id', transaction.id);

      if (existingOrderError) {
        console.error('❌ Erro ao verificar ordens existentes:', existingOrderError);
        continue;
      }

      if (existingOrders && existingOrders.length > 0) {
        console.log(`⚠️ Ordem já existe para transação ${transaction.id}`);
        continue;
      }

      // Criar ordem no Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: transaction.user_id,
          service_id: transaction.service_id,
          status: 'pending',
          quantity: transaction.quantity,
          amount: transaction.amount,
          target_username: transaction.target_username,
          payment_status: 'approved',
          payment_method: 'pix',
          payment_id: transaction.payment_id,
          transaction_id: transaction.id,
          metadata: {
            service_details: transaction.service,
            transaction_details: transaction
          }
        })
        .select()
        .single();

      if (orderError) {
        console.error(`❌ Erro ao criar ordem para transação ${transaction.id}:`, orderError);
        continue;
      }

      console.log(`✅ Ordem criada: ${orderData.id}`);

      // Enviar pedido para API de serviços
      const orderResponse = await socialMediaService.createOrder({
        service: transaction.service?.external_service_id,
        link: transaction.target_profile_link,
        quantity: transaction.quantity,
        username: transaction.target_username
      });

      console.log('📡 Resposta da API de Serviços:', orderResponse);

      // Atualizar ordem com ID externo
      await supabase
        .from('orders')
        .update({ 
          external_order_id: orderResponse.order,
          status: 'processing'
        })
        .eq('id', orderData.id);

      // Marcar transação como processada
      await supabase
        .from('transactions')
        .update({ order_created: true })
        .eq('id', transaction.id);

      console.log(`🎉 Transação ${transaction.id} processada com sucesso`);

    } catch (error) {
      console.error(`🚨 Erro ao processar transação ${transaction.id}:`, error);
    }
  }

  console.log('🏁 Migração manual concluída');
}

// Executar migração
manualOrderMigration().catch(console.error);
