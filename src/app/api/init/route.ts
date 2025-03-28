import { TransactionLockMaintenance } from '@/lib/transactions/modules/maintenance/transactionLockMaintenance';
import { NextResponse } from 'next/server';

// Instância singleton do serviço de manutenção
const lockMaintenanceService = new TransactionLockMaintenance();

/**
 * Inicialização de serviços em background
 * Este endpoint é chamado durante inicialização do servidor
 */
export async function GET() {
  try {
    // Inicia o serviço de manutenção de locks de transação se não estiver ativo
    if (!lockMaintenanceService.isActive()) {
      lockMaintenanceService.start(30); // Executa a cada 30 minutos
    }

    // Status inicial
    const locksStatus = await lockMaintenanceService.getLocksStatus();
    
    return NextResponse.json({
      success: true,
      initialized: true,
      services: {
        lockMaintenance: {
          active: lockMaintenanceService.isActive(),
          status: locksStatus
        }
      }
    });
  } catch (error) {
    console.error('[API] Erro na inicialização:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro na inicialização dos serviços',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 