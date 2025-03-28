import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

// Criar cliente do Supabase com a chave de serviço para ter permissões elevadas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

async function registerMissingOrder() {
  try {
    // Informações do pedido perdido (baseado nos logs fornecidos)
    const missingOrder = {
      transaction_id: '6760e48c-fd28-48bc-90d0-efd5a051e9a6',
      external_order_id: '54207169',
      status: 'pending',
      amount: 0.01, // Valor reportado nos logs
      quantity: 101, // Quantidade reportada nos logs
      target_username: 'devpressapp',
      link: 'https://instagram.com/p/DGwLv0EPrJU',
      needs_admin_attention: false, // Nova coluna que foi adicionada
      metadata: {
        provider_response: { 
          order: 54207169,
          orderId: 54207169,
          status: 'pending'
        },
        provider_request: {
          service: 720,
          link: 'https://instagram.com/p/DGwLv0EPrJU',
          quantity: 101,
          transaction_id: '6760e48c-fd28-48bc-90d0-efd5a051e9a6',
          target_username: 'devpressapp',
          key: '109cbfef0a87d4952c8b07ff08424620', // Chave fornecida nos logs
          action: 'add'
        },
        post: {
          id: '3580413367992365652_64636473391',
          url: 'https://instagram.com/p/DGwLv0EPrJU',
          code: 'DGwLv0EPrJU',
          caption: 'Teste',
          username: 'devpressapp'
        },
        manually_registered: true,
        registered_at: new Date().toISOString()
      }
    };

    console.log('Verificando se o pedido já existe...');
    
    // Verificar se o pedido já existe para evitar duplicação
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, external_order_id')
      .eq('external_order_id', missingOrder.external_order_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erro ao verificar pedido existente:', checkError);
      return;
    }
    
    if (existingOrder) {
      console.log('Pedido já existe no banco de dados:', existingOrder);
      return;
    }
    
    console.log('Registrando pedido perdido...');
    console.log('Detalhes do pedido:', missingOrder);
    
    // Inserir o pedido no banco de dados
    const { data: order, error } = await supabase
      .from('orders')
      .insert(missingOrder)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao inserir pedido:', error);
      return;
    }
    
    console.log('Pedido registrado com sucesso!');
    console.log('ID do pedido:', order.id);
    
    // Verificar se a transação está marcada como tendo pedidos criados
    console.log('Verificando status da transação...');
    
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('id, order_created')
      .eq('id', missingOrder.transaction_id)
      .single();
    
    if (transactionError) {
      console.error('Erro ao buscar transação:', transactionError);
      return;
    }
    
    if (!transaction.order_created) {
      console.log('Atualizando status da transação para order_created = true');
      
      // Atualizar o status da transação
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ order_created: true })
        .eq('id', missingOrder.transaction_id);
      
      if (updateError) {
        console.error('Erro ao atualizar status da transação:', updateError);
        return;
      }
      
      console.log('Status da transação atualizado com sucesso!');
    } else {
      console.log('Transação já está marcada como tendo pedidos criados.');
    }
    
  } catch (error) {
    console.error('Erro ao registrar pedido perdido:', error);
  }
}

// Executar o script
registerMissingOrder().catch(console.error); 