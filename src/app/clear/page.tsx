'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearPage() {
  const router = useRouter();

  useEffect(() => {
    const clearData = async () => {
      try {
        // Limpar dados do servidor
        await fetch('/api/auth/clear', { method: 'POST' });

        // Limpar localStorage
        localStorage.clear();

        // Limpar sessionStorage
        sessionStorage.clear();

        // Recarregar a página para aplicar limpeza
        window.location.href = '/login';
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    };

    clearData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Limpando dados...
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Aguarde enquanto limpamos os dados da sua sessão.
        </p>
      </div>
    </div>
  );
}
