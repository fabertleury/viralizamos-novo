import { Suspense } from 'react';
import TransactionDetailsClient from './client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageProps {
  params: {
    id: string;
  };
}

// Página do servidor
export default async function TransactionDetailsPage({ params }: PageProps) {
  // Aguardar a resolução dos parâmetros de forma assíncrona
  const id = params.id;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <TransactionDetailsClient id={id} />
      </Suspense>
    </div>
  );
} 