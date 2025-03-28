'use client';

import { useEffect } from 'react';
import { LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro na página de locks:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">API Não Disponível</h2>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-2xl">
        <h3 className="font-medium text-amber-800 mb-2">Possíveis causas:</h3>
        <ul className="text-amber-700 text-left list-disc pl-5 space-y-1">
          <li>Os arquivos de API não foram implantados corretamente</li>
          <li>As migrações do banco de dados não foram executadas</li>
          <li>Erro de conexão com o servidor Supabase</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg border p-6 mb-6 max-w-2xl text-left">
        <h3 className="font-medium mb-3 flex items-center">
          <LockClosedIcon className="h-5 w-5 mr-2 text-gray-500" />
          Instruções para Correção
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Verifique se os arquivos <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/admin/locks/route.ts</code> e <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/admin/maintenance/route.ts</code> foram implantados</li>
          <li>Execute as migrações SQL que criam as funções e gatilhos no banco de dados</li>
          <li>Verifique se a conexão com o Supabase está funcionando corretamente</li>
        </ol>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Tentar Novamente
      </button>
    </div>
  );
} 