'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TransacoesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar o erro no sistema de logs
    console.error('Erro na página de transações:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg bg-white shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold">Ocorreu um erro ao carregar as transações</h2>
        <p className="text-center max-w-md text-muted-foreground">
          Não foi possível carregar a página de transações. Por favor, tente novamente ou entre em contato com o suporte técnico se o problema persistir.
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={reset} variant="default">
            Tentar novamente
          </Button>
          <Button onClick={() => window.location.href = '/admin'} variant="outline">
            Voltar para o Dashboard
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-md w-full max-w-2xl">
          <h3 className="font-medium mb-2">Detalhes do erro (para suporte técnico):</h3>
          <pre className="overflow-auto text-xs bg-gray-100 p-3 rounded">{error.message}</pre>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              ID do erro: <code>{error.digest}</code>
            </p>
          )}
          <p className="text-sm mt-4">
            Se o problema persistir, acesse <Link href="/admin/transacoes" className="text-blue-600 hover:underline">diretamente a página de transações</Link> ou verifique as configurações do seu perfil de administrador.
          </p>
        </div>
      </div>
    </div>
  );
} 