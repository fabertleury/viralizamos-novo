// Script para diagnóstico de pedidos duplicados
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateOrders() {
  console.log('Iniciando diagnóstico de pedidos duplicados...');
  
  try {
    // 1. Buscar as transações mais recentes
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('id, created_at, status, metadata, service_id, user_id')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transactionError) {
      throw new Error(`Erro ao buscar transações: ${transactionError.message}`);
    }
    
    console.log(`Encontradas ${transactions.length} transações recentes`);
    
    // 2. Para cada transação, buscar os pedidos relacionados
    for (const transaction of transactions) {
      console.log(`\n========== Transação: ${transaction.id} (${transaction.created_at}) ==========`);
      console.log('Metadados:', JSON.stringify(transaction.metadata, null, 2));
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, external_order_id, target_link, status, metadata, quantity')
        .eq('transaction_id', transaction.id)
        .order('created_at', { ascending: true });
      
      if (ordersError) {
        console.error(`Erro ao buscar pedidos para transação ${transaction.id}: ${ordersError.message}`);
        continue;
      }
      
      console.log(`Encontrados ${orders.length} pedidos para esta transação`);
      
      // 3. Verificar se há pedidos duplicados (mesmo link de destino)
      const targetLinks = new Map();
      
      // Agrupar pedidos por link de destino
      for (const order of orders) {
        const linkKey = order.target_link || 'unknown';
        
        if (!targetLinks.has(linkKey)) {
          targetLinks.set(linkKey, []);
        }
        
        targetLinks.get(linkKey).push(order);
      }
      
      // Identificar e reportar duplicações
      let hasDuplicates = false;
      
      for (const [link, linkOrders] of targetLinks.entries()) {
        if (linkOrders.length > 1) {
          hasDuplicates = true;
          console.log(`\n⚠️ DUPLICAÇÃO DETECTADA para link: ${link}`);
          console.log(`Total de pedidos para este link: ${linkOrders.length}`);
          
          // Mostrar detalhes de cada pedido duplicado
          for (const order of linkOrders) {
            console.log(`- Pedido ID: ${order.id}, Criado em: ${order.created_at}`);
            console.log(`  Quantidade: ${order.quantity}, Status: ${order.status}`);
            console.log(`  External Order ID: ${order.external_order_id}`);
          }
        }
      }
      
      if (!hasDuplicates) {
        console.log('✅ Nenhuma duplicação detectada para esta transação');
      }
      
      // 4. Verificar distribuição de quantidades
      if (orders.length > 1) {
        const totalQuantity = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);
        const originalQuantity = transaction.metadata?.service?.quantity || 0;
        
        console.log(`\nAnálise de distribuição de quantidades:`);
        console.log(`- Quantidade original na transação: ${originalQuantity}`);
        console.log(`- Soma total das quantidades nos pedidos: ${totalQuantity}`);
        
        if (totalQuantity > originalQuantity) {
          console.log(`⚠️ ALERTA: A soma das quantidades (${totalQuantity}) é maior que a quantidade original (${originalQuantity})`);
        } else if (totalQuantity < originalQuantity) {
          console.log(`⚠️ ALERTA: A soma das quantidades (${totalQuantity}) é menor que a quantidade original (${originalQuantity})`);
        } else {
          console.log(`✅ A distribuição de quantidades está correta`);
        }
        
        // Mostrar a distribuição detalhada
        console.log('\nDetalhamento das quantidades por pedido:');
        for (const order of orders) {
          console.log(`- Pedido ID: ${order.id}, Quantidade: ${order.quantity}, Link: ${order.target_link}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Erro durante o diagnóstico:', error);
  }
}

// Executar o diagnóstico
checkDuplicateOrders()
  .then(() => {
    console.log('\nDiagnóstico concluído');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  }); 