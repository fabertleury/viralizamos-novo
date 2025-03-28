import { createClient } from '@/lib/supabase/server';
import { SocialMediaService } from '@/lib/services/socialMediaService';

async function migrateApprovedTransactions() {
  const supabase = createClient();
  const socialMediaService = new SocialMediaService();

  console.log('🔍 Buscando transações aprovadas sem ordem');

  // Buscar transações aprovadas sem ordem correspondente
  const { data: approvedTransactions, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'approved')
    .is('order_created', null);

  if (transactionError) {
    console.error('Erro ao buscar transações:', transactionError);
    return;
  }

  console.log(`📊 Encontradas ${approvedTransactions.length} transações aprovadas`);

  for (const transaction of approvedTransactions) {
    try {
      // Buscar detalhes do serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', transaction.service_id)
        .single();

      if (serviceError || !serviceData) {
        console.error(`❌ Serviço não encontrado para transação ${transaction.id}`);
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
            service_details: serviceData,
            transaction_details: transaction
          }
        })
        .select()
        .single();

      if (orderError) {
        console.error(`❌ Erro ao criar ordem para transação ${transaction.id}:`, orderError);
        continue;
      }

      // Enviar pedido para API de serviços
      const orderResponse = await socialMediaService.createOrder({
        service: serviceData.external_service_id,
        link: transaction.target_profile_link,
        quantity: transaction.quantity,
        username: transaction.target_username
      });

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

      console.log(`✅ Ordem criada para transação ${transaction.id}`);

    } catch (error) {
      console.error(`🚨 Erro ao processar transação ${transaction.id}:`, error);
    }
  }

  console.log('🏁 Migração concluída');
}

// Executar migração
migrateApprovedTransactions().catch(console.error);
