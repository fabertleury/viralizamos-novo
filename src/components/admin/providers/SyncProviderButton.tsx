'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SyncProviderButtonProps {
  providerId: string;
  providerName: string;
}

export default function SyncProviderButton({ providerId, providerName }: SyncProviderButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/providers/${providerId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ao sincronizar com ${providerName}`);
      }

      // Mostrar mensagem de sucesso
      alert(`${data.count} serviços sincronizados com sucesso!`);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert(error instanceof Error ? error.message : 'Erro ao sincronizar serviços');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm
        text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <ArrowPathIcon
        className={`-ml-1 mr-2 h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`}
      />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar Serviços'}
    </button>
  );
}
