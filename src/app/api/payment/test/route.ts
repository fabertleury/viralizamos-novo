import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { payment_id } = await request.json();

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Atualizar status da transação para approved
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment_id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      status: 'approved',
      status_detail: 'accredited',
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    return NextResponse.json(
      { message: 'Error approving payment', error },
      { status: 500 }
    );
  }
}
