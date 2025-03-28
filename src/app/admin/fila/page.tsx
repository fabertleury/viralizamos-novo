import { Suspense } from 'react';
import QueueClient from './client';
import { Metadata } from 'next';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Fila de Pedidos | Admin',
  description: 'Gerenciamento da fila de pedidos para processamento'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function QueuePage() {
  return (
    <main className="flex flex-col flex-1 gap-4 py-4 px-4 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Fila de Pedidos</h1>
        <p className="text-muted-foreground">
          Monitore e gerencie a fila de processamento de pedidos.
        </p>
      </div>
      <Suspense fallback={<Loading />}>
        <QueueClient />
      </Suspense>
    </main>
  );
} 