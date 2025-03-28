import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mercadopago from 'mercadopago';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, amount, service_name } = body;

    if (!order_id || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar o pedido para verificar se existe
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        service:service_id (*),
        customer:customer_id (*)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verificar se o token do Mercado Pago está configurado
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Configuração incompleta' },
        { status: 500 }
      );
    }

    // Configurar o cliente do Mercado Pago
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN || '');

    // Criar o pagamento no Mercado Pago
    const result = await mercadopago.payment.create({
      transaction_amount: Number(amount),
      description: `Pedido #${order.external_order_id || order_id} - ${service_name}`,
      payment_method_id: 'pix',
      payer: {
        email: order.customer?.email || order.metadata?.email,
        first_name: order.customer?.name?.split(' ')[0] || 'Cliente',
        last_name: order.customer?.name?.split(' ').slice(1).join(' ') || 'Anônimo'
      },
      metadata: {
        order_id: order_id,
        service_id: order.service?.id,
        service_name: service_name,
        customer_email: order.customer?.email || order.metadata?.email,
        customer_name: order.customer?.name || order.metadata?.customer?.name
      }
    });

    // Gerar QR Code em base64
    const qrCodeText = result.body.point_of_interaction.transaction_data.qr_code;
    let qrCodeBase64 = '';
    
    try {
      qrCodeBase64 = await QRCode.toDataURL(qrCodeText);
      qrCodeBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
    } catch (qrError) {
      console.error('Erro ao gerar QR Code:', qrError);
    }

    // Atualizar o pedido com o novo QR code
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        metadata: {
          ...order.metadata,
          payment: {
            status: 'pending',
            qr_code: result.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: qrCodeBase64,
            amount,
            payment_id: result.body.id.toString(),
            updated_at: new Date().toISOString()
          }
        }
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Erro ao atualizar pedido com QR code:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order with QR code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      qr_code: result.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: qrCodeBase64
    });
  } catch (error) {
    console.error('Erro ao gerar QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
} 