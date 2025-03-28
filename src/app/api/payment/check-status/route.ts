import { NextRequest, NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';

// Configuração do Mercado Pago
mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');

export async function POST(request: NextRequest) {
  try {
    const { payment_id } = await request.json();

    if (!payment_id) {
      return NextResponse.json({
        error: 'Payment ID is required',
        status: 'error'
      }, { status: 400 });
    }

    const checker = BackgroundPaymentChecker.getInstance();
    const status = await checker.checkPaymentStatus(payment_id);

    return NextResponse.json({
      status,
      payment_id
    });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json({
      error: 'Failed to check payment status',
      details: String(error)
    }, { status: 500 });
  }
}

/**
 * Endpoint para verificar o status de um pagamento/transação
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID não especificado' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Tentar buscar como transaction id (UUID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      // Se for UUID, buscar diretamente pelo ID da transação
      const { data, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar transação:', error);
        return NextResponse.json({ error: 'Erro ao buscar transação' }, { status: 500 });
      }
      
      if (!data) {
        return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
      }
      
      return NextResponse.json({
        status: data.status,
        transaction_id: data.id,
        payment_id: data.payment_id,
        external_id: data.external_id,
        amount: data.amount,
        created_at: data.created_at,
        updated_at: data.updated_at,
        order_created: data.order_created
      });
    } else {
      // Se não for UUID, tentar buscar pelo payment_id ou outras referências
      // Usando aspas para evitar problemas com tipos de dados
      const { data, error } = await supabase
        .from('core_transactions_v2')
        .select('*')
        .or(`payment_id.eq."${id}",payment_external_reference.eq."${id}",external_id.eq."${id}"`)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar transação pelo payment_id:', error);
        return NextResponse.json({ error: 'Erro ao buscar transação' }, { status: 500 });
      }
      
      if (!data) {
        return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
      }
      
      return NextResponse.json({
        status: data.status,
        transaction_id: data.id,
        payment_id: data.payment_id,
        external_id: data.external_id,
        amount: data.amount,
        created_at: data.created_at,
        updated_at: data.updated_at,
        order_created: data.order_created
      });
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
