import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transactionMonitoring } from '@/lib/monitoring/transactionMonitoring';

export async function POST() {
  try {
    // Criar cliente Supabase
    const supabase = createClient();
    
    // Buscar todas as transações do Supabase, incluindo todas com status diferentes
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000); // Aumentar limite para 1000 transações para garantir
    
    if (error) {
      console.error('Erro ao buscar transações do Supabase:', error);
      return NextResponse.json({ error: 'Erro ao buscar transações' }, { status: 500 });
    }
    
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ message: 'Nenhuma transação encontrada para sincronizar', synced: 0 });
    }
    
    console.log(`Sincronizando ${transactions.length} transações...`);
    
    // Contadores
    let syncedCount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let cancelledCount = 0;
    let errorCount = 0;
    let otherCount = 0;
    
    // Sincronizar cada transação
    for (const transaction of transactions) {
      try {
        // Garantir que o status seja mantido corretamente - normalizar status para o formato do monitoramento
        let status = transaction.status || 'unknown';
        
        // Normalizar status cancelado (pode ser canceled ou cancelled)
        if (status === 'canceled' || status === 'cancelled') {
          status = 'cancelled';
        }
        
        const transactionData = {
          ...transaction,
          status: status
        };
        
        // Registrar no sistema de monitoramento
        const success = await transactionMonitoring.logTransaction(transactionData);
        
        if (success) {
          syncedCount++;
          
          // Contar por tipo
          if (status === 'pending') pendingCount++;
          else if (status === 'approved') approvedCount++;
          else if (status === 'cancelled') cancelledCount++;
          else if (status === 'error') errorCount++;
          else otherCount++;
          
          console.log(`Transação ${transaction.id} sincronizada com status: ${status}`);
        }
      } catch (transactionError) {
        console.error(`Erro ao sincronizar transação ${transaction.id}:`, transactionError);
        // Continuar com as próximas transações mesmo que uma falhe
      }
    }
    
    return NextResponse.json({
      message: `${syncedCount} transações foram sincronizadas com sucesso`,
      total: transactions.length,
      synced: syncedCount,
      details: {
        pending: pendingCount,
        approved: approvedCount,
        cancelled: cancelledCount,
        error: errorCount,
        other: otherCount
      }
    });
    
  } catch (error) {
    console.error('Erro na sincronização de transações:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar transações' },
      { status: 500 }
    );
  }
} 