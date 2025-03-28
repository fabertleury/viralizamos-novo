import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { SocialMediaService } from '../src/lib/services/socialMediaService';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

const socialMediaService = new SocialMediaService();

// Função para mapear dados do metadata para colunas de transação
function mapMetadataToTransactionColumns(metadata: any) {
  const serviceData = metadata?.service || {};
  const profileData = metadata?.profile || {};
  const customerData = metadata?.customer || {};
  const paymentDetails = metadata?.payment_details || {};
  const postLinks = metadata?.posts 
    ? metadata.posts.map((post: any) => post.link) 
    : [];

  return {
    // Campos para popular na tabela transactions
    user_email: customerData.email,
    target_username: profileData.username,
    target_full_name: profileData.full_name,
    service_id: serviceData.id,
    service_name: serviceData.name,
    service_quantity: serviceData.quantity,
    service_fama_id: serviceData.fama_id,
    
    // Campos de pagamento
    payment_id: paymentDetails.id,
    payment_method: paymentDetails.payment_method?.id || 'pix',
    payment_status: paymentDetails.status,
    
    // Dados de posts
    post_links: JSON.stringify(postLinks),
    post_count: postLinks.length,

    // Metadados adicionais
    metadata: JSON.stringify(metadata)
  };
}

async function reprocessPendingTransactions() {
  const { data: pendingTransactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'approved')
    .eq('order_created', false);

  if (error) {
    console.error('Erro ao buscar transações pendentes:', error);
    return;
  }

  console.log(`Encontradas ${pendingTransactions.length} transações para reprocessar`);

  for (const transaction of pendingTransactions) {
    try {
      // Parsing seguro do metadata
      const metadata = transaction.metadata && typeof transaction.metadata === 'string' 
        ? JSON.parse(transaction.metadata) 
        : transaction.metadata || {};

      // Extrair dados importantes do metadata
      const serviceData = metadata?.service || {};
      const profileData = metadata?.profile || {};
      const postLinks = metadata?.posts 
        ? metadata.posts.map((post: any) => post.link) 
        : [];

      // Verificar se há serviços e links de posts
      if (!serviceData.id || !postLinks || postLinks.length === 0) {
        console.warn(`Transação ${transaction.id} sem serviços ou links de posts`);
        continue;
      }

      // Criar ordens para cada post
      const postsCount = Math.min(postLinks.length, 5);
      const quantityPerPost = Math.floor(serviceData.quantity / postsCount);
      const remainderQuantity = serviceData.quantity % postsCount;

      for (let i = 0; i < postsCount; i++) {
        const postQuantity = quantityPerPost + (i < remainderQuantity ? 1 : 0);
        
        const orderResponse = await socialMediaService.createOrder({
          service: serviceData.id,
          link: postLinks[i],
          quantity: postQuantity,
          username: profileData.username
        });

        await supabase.from('orders').insert({
          service_id: serviceData.id,
          status: 'processing',
          quantity: postQuantity,
          amount: transaction.amount ? 
            (transaction.amount || 0) * (postQuantity / serviceData.quantity) : 
            0,
          transaction_id: transaction.id,
          external_order_id: orderResponse.order,
          metadata: {
            service_details: serviceData,
            post_link: postLinks[i],
            external_order_response: orderResponse
          }
        });
      }

      // Marcar transação como processada
      const { error: finalUpdateError } = await supabase
        .from('transactions')
        .update({ order_created: true })
        .eq('id', transaction.id);

      if (finalUpdateError) {
        console.error(`Erro ao atualizar status final da transação ${transaction.id}:`, finalUpdateError);
      } else {
        console.log(`Transação ${transaction.id} reprocessada com sucesso`);
      }
    } catch (error) {
      console.error(`Erro ao processar transação ${transaction.id}:`, error);
    }
  }
}

// Executar o script
reprocessPendingTransactions().catch(console.error);
