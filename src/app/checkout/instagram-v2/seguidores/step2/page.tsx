'use client';

import { useSearchParams } from 'next/navigation';
import { InstagramSeguidoresStep2 } from '@/components/checkout/InstagramSeguidoresStep2';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function SeguidoresStep2Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Carregando...</h2>
        </div>
      </div>
    }>
      <SeguidoresStep2Content />
    </Suspense>
  );
}

function SeguidoresStep2Content() {
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('username');
  const serviceIdParam = searchParams.get('service_id');
  const [localServiceId, setLocalServiceId] = useState<string | null>(null);
  
  useEffect(() => {
    // Durante o desenvolvimento, fornecer um ID de serviço padrão se estiver faltando
    if (!serviceIdParam && process.env.NODE_ENV === 'development') {
      console.warn('Service ID não fornecido, usando ID padrão para desenvolvimento');
      setLocalServiceId('1'); // ID padrão para desenvolvimento
    } else {
      setLocalServiceId(serviceIdParam);
    }
  }, [serviceIdParam]);

  if (!usernameParam) {
    return <div className="text-center p-8">Nome de usuário não fornecido</div>;
  }

  // Só renderizar o componente quando tivermos um serviceId (real ou padrão)
  if (!localServiceId) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <InstagramSeguidoresStep2
      title="Turbine seu perfil do Instagram 🚀"
    />
  );
}
