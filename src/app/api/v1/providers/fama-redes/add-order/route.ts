import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { service, link, quantity, transaction_id, target_username } = await request.json();
    
    console.log('Enviando pedido para o provedor Fama nas Redes:', {
      service,
      link,
      quantity,
      transaction_id,
      target_username
    });

    if (!service || !link || !quantity) {
      return NextResponse.json({
        error: 'Missing required fields',
        status: 'error'
      }, { status: 400 });
    }

    const apiKey = process.env.FAMA_REDES_API_KEY;
    const apiUrl = process.env.FAMA_REDES_API_URL || 'https://famanasredes.com.br/api/v2';
    
    if (!apiKey) {
      console.error('API Key do Fama nas Redes não configurada');
      return NextResponse.json({
        error: 'Provider API key not configured',
        status: 'error'
      }, { status: 500 });
    }

    // Enviar pedido para o provedor
    const response = await axios.post(apiUrl, {
      key: apiKey,
      action: 'add',
      service,
      link,
      quantity
    });

    console.log('Resposta do provedor:', response.data);

    if (!response.data || !response.data.order) {
      return NextResponse.json({
        error: 'Invalid response from provider',
        response: response.data,
        status: 'error'
      }, { status: 500 });
    }

    const supabase = createClient();

    // Buscar a transação para obter detalhes adicionais
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (transactionError) {
      console.error('Erro ao buscar transação:', transactionError);
      return NextResponse.json({
        error: 'Transaction not found',
        status: 'error'
      }, { status: 404 });
    }

    // Salvar o pedido no banco de dados usando a estrutura existente
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        service_id: service,
        quantity,
        target_username,
        status: 'processing', // Alterado de 'pending' para 'processing' para indicar que foi enviado
        payment_status: 'approved',
        payment_method: 'pix',
        payment_id: transaction.payment_external_reference,
        external_order_id: response.data.order.toString(),
        transaction_id,
        user_id: transaction.user_id, // Adicionado user_id para rastreabilidade
        metadata: {
          provider: 'fama_redes',
          link,
          order_details: response.data,
          email: transaction.metadata?.email || transaction.metadata?.contact?.email || transaction.metadata?.profile?.email // Armazenar email para consulta futura
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar pedido no banco de dados:', error);
      return NextResponse.json({
        error: 'Failed to save order',
        provider_response: response.data,
        status: 'error'
      }, { status: 500 });
    }

    // Salvar ou atualizar o perfil do usuário
    const email = transaction.metadata?.email || 
                 transaction.metadata?.contact?.email || 
                 transaction.metadata?.profile?.email;
    
    if (email) {
      // Verificar se o usuário já existe
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        // Extrair nome do usuário
        const userName = transaction.metadata?.profile?.full_name || 
                        transaction.metadata?.profile?.username || 
                        target_username;
        
        // Usuário não existe, criar novo
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            name: userName || email.split('@')[0],
            role: 'user',
            active: true
          });
        
        if (createError) {
          console.error('Erro ao criar perfil do usuário:', createError);
        } else {
          console.log('Perfil do usuário criado com sucesso');
        }
      } else {
        console.log('Usuário já existe no sistema:', existingUser);
      }
    }

    // Atualizar a transação com o ID do pedido
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'enviado',
        metadata: {
          ...transaction.metadata,
          order_id: order.id,
          external_order_id: response.data.order
        }
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Erro ao atualizar transação:', updateError);
    }

    return NextResponse.json({
      success: true,
      order: order,
      provider_response: response.data,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Erro ao processar pedido:', error);
    
    return NextResponse.json({
      error: error.message || 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}
