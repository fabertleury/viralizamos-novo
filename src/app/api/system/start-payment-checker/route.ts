import { NextResponse } from 'next/server';
import { BackgroundPaymentChecker } from '@/lib/services/backgroundPaymentChecker';

// Iniciar verificador automaticamente
let checkerStarted = false;

export async function GET() {
  if (!checkerStarted) {
    try {
      const checker = BackgroundPaymentChecker.getInstance();
      await checker.startChecking();
      checkerStarted = true;
      
      console.log('Verificador de pagamentos iniciado automaticamente');
      
      return NextResponse.json({
        success: true,
        message: 'Verificador de pagamentos iniciado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao iniciar verificador de pagamentos:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Falha ao iniciar verificador de pagamentos'
      }, { status: 500 });
    }
  } else {
    return NextResponse.json({
      success: true,
      message: 'Verificador de pagamentos já estava em execução'
    });
  }
}

// Garantir que uma função seja executada apenas uma vez no início do servidor
let initialized = false;

// Função auto-executável para iniciar o verificador
if (typeof window === 'undefined' && !initialized) {
  initialized = true;
  
  // Esperar 5 segundos para garantir que o servidor está completamente inicializado
  setTimeout(async () => {
    try {
      const checker = BackgroundPaymentChecker.getInstance();
      await checker.startChecking();
      checkerStarted = true;
      console.log('Verificador de pagamentos iniciado automaticamente durante inicialização do servidor');
    } catch (error) {
      console.error('Erro ao iniciar verificador de pagamentos durante inicialização:', error);
    }
  }, 5000);
}

// Configurar como rota dinâmica para executar a cada requisição
export const dynamic = 'force-dynamic'; 