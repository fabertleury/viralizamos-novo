import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import { z } from 'zod';

// Configuração do MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  sandbox: process.env.MERCADOPAGO_SANDBOX === 'true',
});

// Schema de validação
const PaymentSchema = z.object({
  transaction_amount: z.number().positive(),
  description: z.string(),
  payment_method_id: z.string(),
  payer: z.object({
    email: z.string().email(),
    identification: z.object({
      type: z.string(),
      number: z.string()
    }).optional(),
  })
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = PaymentSchema.parse(body);

    const payment = await mercadopago.payment.create(validatedData);

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      payment_method_id: payment.payment_method_id,
      external_reference: payment.external_reference
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados de pagamento inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}