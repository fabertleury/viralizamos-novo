import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Versão simplificada do serviço que não depende de funções RPC
class SimpleLockMaintenance {
  private supabase;
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private intervalMinutes = 30;

  constructor() {
    this.supabase = createClient();
  }

  public start(intervalMinutes = 30): void {
    if (this.isRunning) {
      return;
    }

    this.intervalMinutes = intervalMinutes;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Executa limpeza imediatamente
    this.clearExpiredLocks().catch(console.error);

    // Configura execução periódica
    this.interval = setInterval(() => {
      this.clearExpiredLocks().catch(console.error);
    }, intervalMs);

    this.isRunning = true;
    console.info(`[Maintenance] Serviço iniciado - intervalo: ${intervalMinutes} minutos`);
  }

  public stop(): void {
    if (!this.isRunning || !this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;
    console.info('[Maintenance] Serviço parado');
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public async clearExpiredLocks(): Promise<number> {
    try {
      // Verificar se a tabela transaction_locks existe
      const { data: tables, error: checkError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'transaction_locks')
        .single();
      
      if (checkError || !tables) {
        console.warn('[Maintenance] Tabela transaction_locks não existe');
        return 0;
      }

      // Remover locks expirados
      const { data: clearedLocks, error } = await this.supabase
        .from('transaction_locks')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('count');
      
      if (error) {
        console.error('[Maintenance] Erro ao limpar locks expirados:', error);
        return 0;
      }

      const count = clearedLocks?.[0]?.count || 0;
      
      if (count > 0) {
        console.info(`[Maintenance] ${count} locks expirados removidos`);
      }
      
      return count;
    } catch (error) {
      console.error('[Maintenance] Erro na limpeza de locks:', error);
      return 0;
    }
  }

  public async getLocksStatus(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    try {
      // Verificar se a tabela transaction_locks existe
      const { data: tables, error: checkError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'transaction_locks')
        .single();
      
      if (checkError || !tables) {
        return { total: 0, active: 0, expired: 0 };
      }

      // Busca todos os locks
      const { data: locks, error: listError } = await this.supabase
        .from('transaction_locks')
        .select('*');
      
      if (listError || !locks) {
        console.error('[Maintenance] Erro ao listar locks:', listError);
        return { total: 0, active: 0, expired: 0 };
      }
      
      // Verifica locks expirados
      const now = new Date();
      const activeLocks = locks.filter(lock => new Date(lock.expires_at) > now);
      const expiredLocks = locks.filter(lock => new Date(lock.expires_at) <= now);
      
      return {
        total: locks.length,
        active: activeLocks.length,
        expired: expiredLocks.length
      };
    } catch (error) {
      console.error('[Maintenance] Erro ao verificar status dos locks:', error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
}

// Instância singleton do serviço de manutenção
const lockMaintenanceService = new SimpleLockMaintenance();

/**
 * Endpoint para gerenciar os serviços de manutenção
 * Somente para uso administrativo
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização adequada (implementar conforme necessário)
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'status';
    
    // Executar ação solicitada
    if (action === 'start') {
      // Iniciar serviço de manutenção
      const interval = parseInt(searchParams.get('interval') || '30', 10);
      
      if (!lockMaintenanceService.isActive()) {
        lockMaintenanceService.start(interval);
      }
      
      return NextResponse.json({
        success: true,
        message: `Serviço de manutenção iniciado - intervalo: ${interval} minutos`,
        active: lockMaintenanceService.isActive()
      });
    } else if (action === 'stop') {
      // Parar serviço de manutenção
      if (lockMaintenanceService.isActive()) {
        lockMaintenanceService.stop();
      }
      
      return NextResponse.json({
        success: true,
        message: 'Serviço de manutenção parado',
        active: lockMaintenanceService.isActive()
      });
    } else if (action === 'clean') {
      // Executar limpeza imediata
      const count = await lockMaintenanceService.clearExpiredLocks();
      
      return NextResponse.json({
        success: true,
        message: `${count} locks expirados removidos`,
        active: lockMaintenanceService.isActive()
      });
    } else {
      // Status dos serviços
      const locksStatus = await lockMaintenanceService.getLocksStatus();
      
      return NextResponse.json({
        success: true,
        services: {
          lockMaintenance: {
            active: lockMaintenanceService.isActive(),
            status: locksStatus
          }
        },
        usage: {
          start: `${request.nextUrl.pathname}?action=start&interval=30`,
          stop: `${request.nextUrl.pathname}?action=stop`,
          clean: `${request.nextUrl.pathname}?action=clean`
        }
      });
    }
  } catch (error) {
    console.error('[API] Erro no gerenciamento de serviços:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro no gerenciamento de serviços',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 