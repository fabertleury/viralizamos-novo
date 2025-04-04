'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentData, PostData } from '@/types/payment';

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

/**
 * Página simples que redireciona diretamente para o microserviço de pagamento
 * enviando todos os dados necessários.
 * 
 * Esta abordagem remove completamente qualquer dependência do React,
 * garantindo que não haja problemas com o ciclo de renderização.
 */
function PagamentoDiretoContent() {
  const searchParams = useSearchParams();
  
  // Definir a URL do serviço de pagamento para uso no script
  const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'https://pagamentos.viralizamos.com';

  useEffect(() => {
    // Adicionar a URL do serviço de pagamento como variável global
    window.__PAYMENT_SERVICE_URL = paymentServiceUrl;
    
    // Função para processar o redirecionamento
    const processRedirection = () => {
      try {
        // 1. Verificar dados da URL
        const params = new URLSearchParams(window.location.search);
        const serviceId = params.get('sid') || params.get('service_id') || '';
        const amount = params.get('a') || params.get('amount') || '0';
        
        // 2. Recuperar dados do localStorage
        const storedData = localStorage.getItem('checkoutProfileData');
        if (!storedData) {
          throw new Error('Dados do serviço não encontrados');
        }
        
        const parsedData = JSON.parse(storedData);
        
        // 3. Recuperar dados dos posts/reels selecionados
        const selectedPostsJSON = localStorage.getItem('selectedPosts');
        const selectedReelsJSON = localStorage.getItem('selectedReels');
        
        const selectedPosts = selectedPostsJSON ? JSON.parse(selectedPostsJSON) : [];
        const selectedReels = selectedReelsJSON ? JSON.parse(selectedReelsJSON) : [];
        
        // 4. Extrair informações relevantes
        const username = parsedData.profileData?.username || parsedData.profile_username || '';
        const customerName = parsedData.name || parsedData.customer_name || '';
        const customerEmail = parsedData.email || parsedData.customer_email || '';
        const customerPhone = parsedData.phone || parsedData.customer_phone || '';
        const serviceName = parsedData.serviceName || parsedData.service_name || '';
        const quantity = parsedData.quantity || '0';
        
        // Log detalhado para debugging
        console.log("Dados recuperados:", {
          url: { serviceId, amount },
          localStorage: { ...parsedData },
          selectedPosts: selectedPosts.length,
          selectedReels: selectedReels.length
        });
        
        // Construir objeto completo de dados
        const paymentData: PaymentData = {
          service_id: serviceId,
          service_name: serviceName,
          profile_username: username,
          amount: parseFloat(amount || parsedData.amount || '0'),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          quantity: parseInt(quantity),
          return_url: '/agradecimento',
          
          // Adicionar todos os posts e reels selecionados
          posts: [
            ...selectedPosts.map((post: any): PostData => {
              // Garantir que temos valores de string para cada campo
              const postId = typeof post.id === 'undefined' ? '' : 
                              (typeof post.id === 'string' ? post.id.substring(0, 20) : post.id.toString().substring(0, 20));
              const postCode = typeof post.code === 'string' ? post.code : 
                              (typeof post.shortcode === 'string' ? post.shortcode : '');
              
              return {
                id: postCode || postId,
                code: postCode,
                type: 'post',
                url: postCode ? 'https://instagram.com/p/' + postCode : ''
              };
            }),
            ...selectedReels.map((reel: any): PostData => {
              // Garantir que temos valores de string para cada campo
              const reelId = typeof reel.id === 'undefined' ? '' : 
                              (typeof reel.id === 'string' ? reel.id.substring(0, 20) : reel.id.toString().substring(0, 20));
              const reelCode = typeof reel.code === 'string' ? reel.code : 
                              (typeof reel.shortcode === 'string' ? reel.shortcode : '');
              
              return {
                id: reelCode || reelId,
                code: reelCode,
                type: 'reel',
                url: reelCode ? 'https://instagram.com/reel/' + reelCode : ''
              };
            })
          ]
        };
        
        console.log("Dados de pagamento completos:", paymentData);
        
        // Converter para JSON
        const jsonData = JSON.stringify(paymentData);
        
        // Criar um ID simplificado para o pedido - somente letras e números
        const timestamp = Date.now().toString(36);
        // Limpeza adicional: remover todos os caracteres especiais do ID
        const cleanServiceId = serviceId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
        // Criar um ID único e seguro para o pedido
        const orderId = `${timestamp}-${cleanServiceId}`;
        
        // Armazenar o payload completo no localStorage 
        // Importante: armazenar em localStorage com a chave exata esperada pelo microserviço
        const storageKey = `payment_data_${orderId}`;
        localStorage.setItem(storageKey, jsonData);
        
        console.log("Ordem de pagamento criada:", { orderId, storageKey });
        
        // Transmitir os dados para o domínio do pagamento usando sessionStorage
        // Isso permite que os dados estejam disponíveis mesmo quando o localStorage não é compartilhado
        try {
          // Criar um iframe com o domínio de pagamento para sincronizar os dados
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = `${paymentServiceUrl}/sync-payment-data?oid=${orderId}&key=${storageKey}&data=${encodeURIComponent(jsonData)}`;
          document.body.appendChild(iframe);
          
          console.log("Dados de pagamento sincronizados com o serviço de pagamento");
          
          // Remover o iframe após alguns segundos
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 3000);
        } catch (syncError) {
          console.warn("Não foi possível sincronizar os dados via iframe: ", syncError);
        }
        
        // URL final para redirecionamento (apenas com o ID da ordem)
        const redirectUrl = `${paymentServiceUrl}/pagamento/pix?oid=${orderId}`;
        
        console.log("Redirecionando para:", redirectUrl);
        
        // Redirecionar automaticamente após um pequeno delay para permitir a sincronização
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } catch (error: any) {
        // Mostrar erro na UI
        const errorMessage = document.getElementById('error-message');
        const errorContainer = document.getElementById('error-container');
        const loadingContainer = document.getElementById('loading-container');
        
        if (errorMessage) {
          errorMessage.textContent = "Erro ao processar redirecionamento: " + (error.message || "Erro desconhecido");
        }
        
        if (errorContainer) {
          errorContainer.style.display = 'block';
        }
        
        if (loadingContainer) {
          loadingContainer.style.display = 'none';
        }
        
        console.error("Erro no redirecionamento:", error);
      }
    };
    
    // Executar o processamento após um pequeno delay para garantir que o DOM esteja pronto
    setTimeout(processRedirection, 300);
    
    return () => {
      // Limpar a variável global de forma segura
      window.__PAYMENT_SERVICE_URL = '';
    };
  }, [paymentServiceUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Container de carregamento */}
      <div id="loading-container" className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Processando Pagamento</h1>
        <p className="text-gray-600 mb-2">Estamos preparando seu pagamento...</p>
        <p className="text-gray-500 text-sm">Você será redirecionado automaticamente.</p>
      </div>
      
      {/* Container de erro (inicialmente oculto) */}
      <div id="error-container" className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center hidden">
        <div className="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Erro no Processamento</h1>
        <p id="error-message" className="text-gray-600 mb-4">Ocorreu um erro ao processar o pagamento.</p>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

// Componente principal com Suspense boundary
export default function PagamentoDireto() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Carregando</h1>
          <p className="text-gray-500 text-sm">Aguarde um momento...</p>
        </div>
      </div>
    }>
      <PagamentoDiretoContent />
    </Suspense>
  );
}

// Adicionar a declaração de tipos para a propriedade global
declare global {
  interface Window {
    __PAYMENT_SERVICE_URL: string;
  }
} 