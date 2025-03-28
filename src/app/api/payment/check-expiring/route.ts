import { NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';
import { createClient } from '@/lib/supabase/server';

/**
 * API para verificar transações que estão próximas de expirar
 * Esta API pode ser chamada por um cron job para verificar periodicamente
 * transações que estão prestes a expirar (30 minutos após o QR code expirar)
 */
export async function GET() {
  try {
    // Iniciar o verificador de pagamentos
    const backgroundChecker = BackgroundPaymentChecker.getInstance();
    
    // Registrar no log a verificação
    const supabase = createClient();
    await supabase.from('transaction_logs').insert({
      event_type: 'check_expiring_request',
      message: 'Verificação de transações prestes a expirar iniciada',
      metadata: { source: 'api', timestamp: new Date().toISOString() }
    });

    // Executar a verificação de transações prestes a expirar
    await backgroundChecker.verifyExpiringTransactions();
    
    // Registrar no log o resultado da verificação
    await supabase.from('transaction_logs').insert({
      event_type: 'check_expiring_completed',
      message: 'Verificação de transações prestes a expirar concluída',
      metadata: { source: 'api', timestamp: new Date().toISOString() }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Verificação de transações prestes a expirar iniciada' 
    });
  } catch (error: Error | unknown) {
    console.error('Erro ao iniciar verificação de transações prestes a expirar:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao iniciar verificação de transações', 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
} 