'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function VisualizacaoStep1Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    }>
      <InstagramStep1
        serviceType="visualizacao"
        step1Title="Verificar Perfil"
        step2Title="Escolher Conteúdo"
        serviceIcon={<FontAwesomeIcon icon={faEye} className="text-purple-600" />}
        quantityLabel="visualizações"
      />
    </Suspense>
  );
}
