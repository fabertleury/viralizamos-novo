'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransactionDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  
  useEffect(() => {
    console.error('Erro na página de detalhes da transação:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg bg-white shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold">Erro ao carregar detalhes da transação</h2>
        <p className="text-center max-w-md text-muted-foreground">
          Não foi possível carregar os detalhes desta transação. O problema pode ser temporário ou relacionado ao ID fornecido.
        </p>
        <div className="flex gap-4 mt-4">
          <Button onClick={reset} variant="default">
            Tentar novamente
          </Button>
          <Button 
            onClick={() => router.push('/admin/transacoes')} 
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Transações
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
        </div>
      </div>
    </div>
  );
} 