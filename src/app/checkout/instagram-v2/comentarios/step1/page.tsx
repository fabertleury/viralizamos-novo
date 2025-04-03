'use client';

import { Suspense } from 'react';
import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { Loader2 } from 'lucide-react';

export default function ComentariosStep1Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <span className="ml-2 text-purple-600">Carregando...</span>
      </div>
    }>
      <InstagramStep1
        serviceType="comentarios"
        step1Title="Verificar Perfil"
        step2Title="Escolher Conteúdo"
        serviceIcon={<FontAwesomeIcon icon={faComment} className="text-purple-600" />}
        quantityLabel="comentários"
      />
    </Suspense>
  );
}
