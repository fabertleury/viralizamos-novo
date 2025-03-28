import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderProcessor } from '@/lib/transactions/modules/orderProcessor';
import { ProviderService } from '@/lib/transactions/modules/provider/providerService';
import { z } from 'zod';

// Schema de validação para processar transação manual
const processManualTransactionSchema = z.object({
  transactionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    console.log(`[ProcessManualTransaction] Iniciando processamento manual`);
    
    // Verificar autenticação (Admin)
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Permissão negada' },
        { status: 403 }
      );
    }
    
    // Obter dados da requisição
    const body = await request.json();
    
    // Validar dados da requisição
    const validationResult = processManualTransactionSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Dados inválidos: ${errorMessage}` },
        { status: 400 }
      );
    }
    
    const { transactionId } = validationResult.data;
    
    // Buscar a transação pelo ID
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada' },
        { status: 404 }
      );
    }
    
    console.log(`[ProcessManualTransaction] Transação encontrada: ${transaction.id}`);
    
    // Verificar se já existem pedidos para esta transação
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('transaction_id', transaction.id);
    
    if (existingOrders && existingOrders.length > 0) {
      console.log(`[ProcessManualTransaction] Já existem ${existingOrders.length} pedidos para esta transação`);
      return NextResponse.json(
        { success: false, error: 'Esta transação já foi processada' },
        { status: 400 }
      );
    }
    
    // Registrar log de início de processamento
    await supabase
      .from('transaction_logs')
      .insert({
        transaction_id: transaction.id,
        level: 'info',
        message: 'Iniciando processamento manual de transação',
        metadata: {
          admin_id: session.user.id,
          created_at: currentTime
        }
      });
    
    // Obter o provedor pelo ID do serviço
    const providerService = new ProviderService();
    const provider = await providerService.getProviderByServiceId(transaction.service_id);
    
    if (!provider) {
      console.error(`[ProcessManualTransaction] Provedor não encontrado para o serviço ${transaction.service_id}`);
      
      // Registrar erro no log da transação
      await supabase
        .from('transaction_logs')
        .insert({
          transaction_id: transaction.id,
          level: 'error',
          message: `Erro ao processar pedido manualmente: Provedor não encontrado para o serviço ${transaction.service_id}`,
          metadata: {
            service_id: transaction.service_id,
            created_at: currentTime
          }
        });
        
      return NextResponse.json(
        { success: false, error: 'Provedor não encontrado' },
        { status: 500 }
      );
    }
    
    // Instanciar o processador de pedidos
    const orderProcessor = new OrderProcessor();
    
    // Determinar o tipo de checkout com base nos metadados da transação
    const checkoutType = transaction.metadata?.checkout_type || '';
    console.log(`[ProcessManualTransaction] Tipo de checkout: ${checkoutType}`);
    
    let result;
    
    // Processar o pedido de acordo com o tipo
    if (checkoutType.includes('curtidas') || transaction.metadata?.posts) {
      console.log(`[ProcessManualTransaction] Processando pedido de curtidas`);
      const posts = transaction.metadata?.posts || transaction.metadata?.selectedPosts || [];
      const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
      
      result = await orderProcessor.processLikesOrder(transaction, provider, posts, username);
    } 
    else if (checkoutType.includes('reels') || transaction.metadata?.reels) {
      console.log(`[ProcessManualTransaction] Processando pedido de reels`);
      const reels = transaction.metadata?.reels || transaction.metadata?.selectedReels || [];
      const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
      
      result = await orderProcessor.processReelsOrder(transaction, provider, reels, username);
    }
    else {
      // Processar pedido genérico (único link/username)
      console.log(`[ProcessManualTransaction] Processando pedido genérico`);
      const targetLink = transaction.metadata?.target_link || transaction.metadata?.link;
      const username = transaction.metadata?.username || transaction.metadata?.profile?.username;
      
      if (!targetLink && !username) {
        console.error(`[ProcessManualTransaction] Link alvo ou username não encontrado nos metadados da transação`);
        
        // Registrar erro no log da transação
        await supabase
          .from('transaction_logs')
          .insert({
            transaction_id: transaction.id,
            level: 'error',
            message: 'Erro ao processar pedido manualmente: Link alvo ou username não encontrado',
            metadata: {
              transaction_metadata: transaction.metadata,
              created_at: currentTime
            }
          });
          
        return NextResponse.json(
          { success: false, error: 'Link alvo ou username não encontrado' },
          { status: 400 }
        );
      }
      
      result = await orderProcessor.processOrderGeneric(transaction, provider, targetLink, username);
    }
    
    // Registrar resultado no log da transação
    await supabase
      .from('transaction_logs')
      .insert({
        transaction_id: transaction.id,
        level: 'info',
        message: 'Pedido processado manualmente',
        metadata: {
          result: result,
          admin_id: session.user.id,
          created_at: currentTime
        }
      });
      
    // Atualizar o status da transação para 'processed'
    await supabase
      .from('transactions')
      .update({ 
        status: 'processed',
        updated_at: currentTime,
        metadata: {
          ...transaction.metadata,
          processing_status: 'success',
          processing_completed_at: currentTime,
          processed_manually: true,
          processed_by: session.user.id
        }
      })
      .eq('id', transaction.id);
      
    console.log(`[ProcessManualTransaction] Pedido processado manualmente com sucesso`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pedido processado manualmente',
      result
    });
  } catch (error) {
    console.error(`[ProcessManualTransaction] Erro geral: ${error}`);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 