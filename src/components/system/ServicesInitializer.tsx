'use client';

import { useEffect, useRef } from 'react';
import { BackgroundServices } from '@/lib/services/backgroundServices';

/**
 * Componente que inicializa serviços de background
 * Deve ser usado no layout principal
 */
export default function ServicesInitializer() {
  // Usar uma ref para controlar se já inicializamos os serviços
  const servicesInitializedRef = useRef(false);
  
  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      return; // Não executar no lado do servidor
    }
    
    // Verificar se já inicializamos os serviços nesta sessão
    if (servicesInitializedRef.current) {
      console.log('Serviços de background já foram inicializados, ignorando chamada duplicada');
      return;
    }
    
    // Marcar que já inicializamos
    servicesInitializedRef.current = true;
    
    // Executar apenas em produção ou quando estiver em desenvolvimento com flag específica
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_BACKGROUND_SERVICES === 'true') {
      try {
        console.log('Inicializando serviços de background no cliente...');
        const backgroundServices = BackgroundServices.getInstance();
        backgroundServices.init();
        
        // Retorna função de cleanup para parar os serviços quando o componente for desmontado
        return () => {
          console.log('Parando serviços de background...');
          backgroundServices.stop();
        };
      } catch (error) {
        console.error('Erro ao inicializar serviços de background:', error);
      }
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
} 