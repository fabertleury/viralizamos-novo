import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/core/transactions
 * Cria uma nova transação na tabela core_transactions_v2
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const transactionData = await request.json();
    
    // Gerar UUID para a transação se não fornecido
    const transactionId = transactionData.id || uuidv4();
    
    // Preparar dados para inserção
    const transactionRecord = {
      id: transactionId,
      user_id: transactionData.user_id,
      customer_id: transactionData.customer_id || null,
      service_id: transactionData.service_id,
      payment_method: transactionData.payment_method || 'pix',
      payment_id: transactionData.payment_id || null,
      status: transactionData.status || 'pending',
      total_amount: transactionData.total_amount,
      is_processed: false,
      processing_attempts: 0,
      target_username: transactionData.target_username || transactionData.profile_username,
      metadata: {
        profile_username: transactionData.profile_username || transactionData.target_username,
        customer_name: transactionData.customer_name,
        customer_email: transactionData.customer_email,
        customer_phone: transactionData.customer_phone,
        service_name: transactionData.service_name,
        service_type: transactionData.service_type,
        action: transactionData.action || 'purchase',
        payment_data: transactionData.payment_data || {}
      }
    };

    // Registrar log da tentativa de inserção
    logger.info('Tentando inserir transação na tabela core_transactions_v2', {
      transaction_id: transactionId,
      data: JSON.stringify(transactionRecord)
    });

    // Inserir na tabela core_transactions_v2
    const { data, error } = await supabase
      .from('core_transactions_v2')
      .insert(transactionRecord)
      .select()
      .single();

    if (error) {
      logger.error('Erro ao inserir transação na tabela core_transactions_v2', {
        error: error.message,
        transaction_id: transactionId
      });
      
      return NextResponse.json(
        { error: `Erro ao salvar transação: ${error.message}` },
        { status: 500 }
      );
    }

    // Inserir posts relacionados, se houver
    if (transactionData.posts && Array.isArray(transactionData.posts) && transactionData.posts.length > 0) {
      const postRecords = transactionData.posts.map((post: {
        id: string;
        url?: string;
        media_url?: string;
        type?: string;
        media_type?: string;
        caption?: string;
        permalink?: string;
        thumbnail_url?: string;
        timestamp?: string;
      }) => ({
        transaction_id: transactionId,
        post_id: post.id,
        post_url: post.url || post.media_url,
        post_type: post.type || post.media_type,
        post_data: post
      }));

      const { error: postsError } = await supabase
        .from('core_transaction_posts_v2')
        .insert(postRecords);

      if (postsError) {
        logger.error('Erro ao inserir posts da transação', {
          error: postsError.message,
          transaction_id: transactionId
        });
      }
    }

    // Registrar log de sucesso
    logger.info('Transação criada com sucesso na tabela core_transactions_v2', {
      transaction_id: transactionId
    });

    return NextResponse.json({
      success: true,
      transaction: data,
      message: 'Transação criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    logger.error('Erro ao processar requisição de criação de transação', {
      error: errorMessage
    });
    
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
} 