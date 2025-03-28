import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderProcessor } from '@/lib/transactions/modules/orderProcessor';
import { ProviderManager } from '@/lib/transactions/modules/providerManager';
import { CustomerManager } from '@/lib/transactions/modules/customerManager';

// Ensure the endpoint doesn't use cached data
export const dynamic = 'force-dynamic';

/**
 * Endpoint to force process an order for premium services, regardless of the metadata structure
 * This helps with services like Curtidas Brasileiras Premium that might have unique metadata formats
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const data = await request.json();
    const { transactionId } = data;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    console.log(`🔄 Iniciando processamento forçado para transação: ${transactionId}`);

    // Fetch transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, services:service_id(*)')
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('Erro ao buscar transação:', transactionError);
      return NextResponse.json(
        { error: 'Transação não encontrada', details: transactionError },
        { status: 404 }
      );
    }

    // Check if order is already created
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transactionId);

    if (existingOrders && existingOrders.length > 0) {
      console.log(`⚠️ Transação ${transactionId} já possui ${existingOrders.length} pedidos`);
      return NextResponse.json(
        { message: 'Pedidos já existem para esta transação', orders: existingOrders },
        { status: 200 }
      );
    }

    // Ensure customer exists
    const customerManager = new CustomerManager();
    await customerManager.ensureCustomerExists(transaction, transactionId);

    // Get provider for this service
    const providerManager = new ProviderManager();
    const provider = await providerManager.getProviderForTransaction(transaction);

    if (!provider) {
      console.error('Provedor não encontrado para o serviço:', transaction.services);
      return NextResponse.json(
        { error: 'Provedor não encontrado para este serviço' },
        { status: 400 }
      );
    }

    console.log(`🏢 Usando provedor: ${provider.name}`);

    // Extract username from transaction metadata
    const username = transaction.metadata?.username || 
                     transaction.metadata?.instagramUsername || 
                     transaction.metadata?.data?.username || 
                     transaction.metadata?.contact?.username;

    if (!username && 
        (transaction.services.type === 'followers' || 
         transaction.services.type === 'likes' || 
         transaction.services.type === 'comments')) {
      console.error('Username não encontrado nos metadados da transação');
      return NextResponse.json(
        { error: 'Username não encontrado nos metadados da transação' },
        { status: 400 }
      );
    }

    // Process order based on service type
    const orderProcessor = new OrderProcessor();
    let processingResult;

    console.log(`🔄 Processando serviço do tipo: ${transaction.services.type}`);

    // Process different service types
    switch (transaction.services.type) {
      case 'followers':
        // Para seguidores, usamos o processGenericOrder com link do perfil
        const followerLink = `https://instagram.com/${username}`;
        processingResult = await orderProcessor.processGenericOrder(
          transaction,
          provider,
          followerLink,
          username
        );
        break;
      
      case 'likes':
        // For likes, we need to handle posts
        const posts = transaction.metadata?.posts || [];
        console.log(`📸 Posts encontrados: ${posts.length}`);
        
        if (!posts || posts.length === 0) {
          console.error('Nenhum post encontrado para processamento de curtidas');
          return NextResponse.json(
            { error: 'Nenhum post encontrado para processamento de curtidas' },
            { status: 400 }
          );
        }

        processingResult = await orderProcessor.processLikesOrder(
          transaction,
          provider,
          posts,
          username
        );
        break;
      
      case 'comments':
        const commentPosts = transaction.metadata?.posts || [];
        
        if (!commentPosts || commentPosts.length === 0) {
          console.error('Nenhum post encontrado para processamento de comentários');
          return NextResponse.json(
            { error: 'Nenhum post encontrado para processamento de comentários' },
            { status: 400 }
          );
        }
        
        processingResult = await orderProcessor.processCommentsOrder(
          transaction,
          provider,
          commentPosts,
          username
        );
        break;
      
      default:
        // Generic order processing
        const genericLink = transaction.metadata?.link || 
                           transaction.metadata?.data?.link || 
                           `https://instagram.com/${username}`;
        
        processingResult = await orderProcessor.processGenericOrder(
          transaction,
          provider,
          genericLink,
          username || 'user'
        );
    }

    // Update transaction to indicate order has been created
    await supabase
      .from('transactions')
      .update({ order_created: true })
      .eq('id', transactionId);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Pedido processado com sucesso', 
        result: processingResult 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no processamento forçado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { error: 'Erro ao processar pedido', details: errorMessage },
      { status: 500 }
    );
  }
} 