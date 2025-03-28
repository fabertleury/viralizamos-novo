import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProviderOrderService } from '@/lib/core/services/providerOrderService';

export async function POST(request: NextRequest) {
  try {
    // Obter o ID da transação do corpo da requisição
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID da transação não informado' },
        { status: 400 }
      );
    }
    
    console.log('[ForceSendToProvider] Forçando envio da transação ao provedor:', transactionId);
    
    const supabase = createClient();
    
    // Verificar se a transação existe nas duas tabelas possíveis
    let transaction = null;
    let transactionError = null;
    let transactionTable = '';
    
    // Tentar encontrar na tabela core_transactions_v2 primeiro
    const { data: transactionV2, error: errorV2 } = await supabase
      .from('core_transactions_v2')
      .select(`
        *,
        service:service_id (
          id,
          name,
          external_id,
          provider_id,
          type,
          quantidade
        )
      `)
      .eq('id', transactionId)
      .maybeSingle();
    
    if (!errorV2 && transactionV2) {
      transaction = transactionV2;
      transactionTable = 'core_transactions_v2';
    } else {
      // Se não encontrar, tentar na tabela core_transactions
      const { data: transactionOld, error: errorOld } = await supabase
        .from('core_transactions')
        .select(`
          *,
          service:service_id (
            id,
            name,
            external_id,
            provider_id,
            type,
            quantidade
          )
        `)
        .eq('id', transactionId)
        .maybeSingle();
      
      if (!errorOld && transactionOld) {
        transaction = transactionOld;
        transactionTable = 'core_transactions';
      } else {
        transactionError = errorV2 || errorOld;
      }
    }
    
    if (!transaction) {
      console.error('[ForceSendToProvider] Erro ao buscar transação:', transactionError);
      return NextResponse.json(
        { error: `Transação não encontrada: ${transactionError?.message || 'ID não encontrado'}` },
        { status: 404 }
      );
    }
    
    // Registrar no log da transação que estamos forçando o envio ao provedor
    await supabase
      .from('core_processing_logs')
      .insert({
        transaction_id: transactionId,
        level: 'info',
        message: 'Envio forçado da transação ao provedor via API admin',
        metadata: {
          forced_at: new Date().toISOString(),
          previous_status: transaction.status,
          transaction_table: transactionTable
        }
      });
    
    // Para permitir reprocessamento mesmo se já tiver pedidos, definimos order_created como false
    if (transaction.order_created) {
      console.log('[ForceSendToProvider] Redefinindo flag order_created para permitir reprocessamento');
      
      await supabase
        .from(transactionTable)
        .update({
          order_created: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
    }
    
    // Verificar se a transação tem os dados necessários para processamento
    if (!transaction.service || !transaction.service.provider_id) {
      return NextResponse.json(
        { error: 'Transação não possui informações de serviço ou provedor' },
        { status: 400 }
      );
    }
    
    // Buscar posts associados à transação
    const { data: posts, error: postsError } = await supabase
      .from(transactionTable === 'core_transactions_v2' ? 'core_transaction_posts_v2' : 'core_transaction_posts')
      .select('*')
      .eq('transaction_id', transactionId);
    
    if (postsError) {
      console.warn('[ForceSendToProvider] Erro ao buscar posts da transação:', postsError);
    }
    
    // Inicializar o serviço de envio para o provedor
    const providerOrderService = new ProviderOrderService();
    
    // Enviar para o provedor
    const result = await providerOrderService.sendOrders({
      transactionId: transaction.id,
      serviceId: transaction.service_id,
      serviceType: transaction.service.type || 'desconhecido',
      providerId: transaction.service.provider_id,
      posts: posts || [],
      quantity: transaction.service.quantidade || 1,
      externalServiceId: transaction.service.external_id
    });
    
    // Marcar a transação como processada
    await supabase
      .from(transactionTable)
      .update({
        order_created: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    // Registrar o resultado no log
    await supabase
      .from('core_processing_logs')
      .insert({
        transaction_id: transactionId,
        level: result.success ? 'info' : 'error',
        message: result.success 
          ? 'Pedido enviado com sucesso para o provedor' 
          : 'Erro ao enviar pedido para o provedor',
        metadata: {
          result: result,
          processed_at: new Date().toISOString()
        }
      });
    
    // Verificar e retornar os resultados
    if (result.success) {
      console.log(`[ForceSendToProvider] Processamento bem-sucedido!`);
      
      // Extrair informações relevantes dos resultados de forma segura
      let orderResults = [];
      
      if ('orders' in result && Array.isArray(result.orders)) {
        orderResults = result.orders;
      } else if ('orderId' in result && result.orderId) {
        orderResults = [{ id: result.orderId }];
      }
      
      return NextResponse.json({
        success: true,
        message: `Transação enviada para o provedor com sucesso!`,
        orders: orderResults
      });
    } else {
      console.error('[ForceSendToProvider] Erro ao enviar para o provedor:', result.error);
      
      return NextResponse.json({
        success: false,
        message: 'Erro ao enviar transação para o provedor',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[ForceSendToProvider] Erro ao processar transação:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar transação',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 