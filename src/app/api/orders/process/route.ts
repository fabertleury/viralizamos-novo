import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { processTransaction } from '@/lib/transactions/transactionProcessor';

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    // Verificar se o usuário está autenticado
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Error getting session' },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é um administrador
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile data error:', profileError);
      return NextResponse.json(
        { error: 'Error getting profile data' },
        { status: 500 }
      );
    }

    if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'support')) {
      return NextResponse.json(
        { error: 'Forbidden - User is not admin or support' },
        { status: 403 }
      );
    }

    // Buscar a transação primeiro
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Processar a transação
    const result = await processTransaction(transactionId);

    // Atualizar status da transação
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'processing',
        metadata: {
          ...transaction.metadata,
          processed_at: new Date().toISOString(),
          processed_by: session.user.id
        }
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Erro ao atualizar status da transação:', updateError);
      return NextResponse.json({
        error: 'Erro ao atualizar status da transação',
        details: updateError.message
      }, { status: 500 });
    }

    // Redirecionar para a página de pedidos
    return NextResponse.json({
      success: true,
      message: 'Pedidos processados com sucesso',
      orders: result,
      redirect: '/admin/pedidos'
    });
  } catch (error: any) {
    console.error('Process order error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
