'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
    // para evitar problemas de interpolação no script
    window.__PAYMENT_SERVICE_URL = paymentServiceUrl;
    
    // Script de redirecionamento executado uma única vez após a montagem do componente
    const script = document.createElement('script');
    script.innerHTML = `
      // Recuperar todos os dados necessários
      try {
        // 1. Verificar dados da URL
        const params = new URLSearchParams(window.location.search);
        
        // 2. Ou recuperar do localStorage se não estiver na URL
        const storedData = localStorage.getItem('checkoutProfileData');
        const parsedData = storedData ? JSON.parse(storedData) : {};
        
        // Função auxiliar para manipular os elementos do DOM com segurança
        function showError(message) {
          // Verificar se os elementos existem antes de manipulá-los
          const errorMessage = document.getElementById('error-message');
          const errorContainer = document.getElementById('error-container');
          const loadingContainer = document.getElementById('loading-container');
          
          if (errorMessage) {
            errorMessage.textContent = message;
          }
          
          if (errorContainer) {
            errorContainer.style.display = 'block';
          }
          
          if (loadingContainer) {
            loadingContainer.style.display = 'none';
          }
          
          console.error(message);
        }
        
        // 3. Combinar dados da URL e localStorage
        const serviceId = params.get('service_id') || parsedData.serviceId || '';
        const username = params.get('username') || (parsedData.profileData ? parsedData.profileData.username : '');
        const amount = params.get('amount') || parsedData.amount || '0';
        
        // 4. Recuperar dados dos posts/reels selecionados
        const selectedPostsJSON = localStorage.getItem('selectedPosts');
        const selectedReelsJSON = localStorage.getItem('selectedReels');
        
        const selectedPosts = selectedPostsJSON ? JSON.parse(selectedPostsJSON) : [];
        const selectedReels = selectedReelsJSON ? JSON.parse(selectedReelsJSON) : [];
        
        // 5. Informações do cliente
        const customerName = params.get('customer_name') || parsedData.name || '';
        const customerEmail = params.get('customer_email') || parsedData.email || '';
        const customerPhone = params.get('customer_phone') || parsedData.phone || '';
        
        // 6. Outras informações importantes
        const serviceName = params.get('service_name') || parsedData.serviceName || '';
        const quantity = params.get('quantity') || parsedData.quantity || '0';
        
        // 7. Log detalhado para debugging
        console.log("Dados recuperados:", {
          url: {
            serviceId: params.get('service_id'),
            username: params.get('username'),
            amount: params.get('amount'),
            customerName: params.get('customer_name'),
            customerEmail: params.get('customer_email'),
            serviceName: params.get('service_name')
          },
          localStorage: {
            serviceId: parsedData.serviceId,
            username: parsedData.profileData?.username,
            amount: parsedData.amount,
            customerName: parsedData.name,
            customerEmail: parsedData.email,
            serviceName: parsedData.serviceName
          },
          selectedPosts: selectedPosts.length,
          selectedReels: selectedReels.length
        });
        
        // Construir objeto completo de dados
        const paymentData = {
          service_id: serviceId,
          service_name: serviceName,
          profile_username: username,
          amount: parseFloat(amount),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          quantity: parseInt(quantity),
          return_url: '/agradecimento',
          
          // Adicionar todos os posts e reels selecionados
          posts: [
            ...selectedPosts.map(post => {
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
            ...selectedReels.map(reel => {
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
        
        // Converter para JSON e codificar
        const jsonData = JSON.stringify(paymentData);
        
        // Criar um ID simplificado para o pedido usando o timestamp + primeiros 6 caracteres do username
        const timestamp = Date.now().toString(36); // timestamp como base 36
        const userFragment = (username || 'user').substring(0, 6).toLowerCase();
        const orderId = \`\${timestamp}-\${userFragment}\`;
        
        // Armazenar o payload completo no localStorage com esse ID
        localStorage.setItem(\`payment_data_\${orderId}\`, jsonData);
        
        // URL do microserviço - usar a variável global definida pelo React
        const microserviceUrl = window.__PAYMENT_SERVICE_URL;
        
        // URL final para redirecionamento - muito mais simples e curta
        const redirectUrl = \`\${microserviceUrl}/pagamento/pix?orderId=\${orderId}\`;
        
        console.log("Redirecionando para:", redirectUrl);
        console.log("ID do pedido:", orderId);
        
        // Redirecionar automaticamente
        window.location.href = redirectUrl;
      } catch (error) {
        console.error("Erro no redirecionamento:", error);
        showError("Erro ao processar redirecionamento: " + (error.message || "Erro desconhecido"));
      }
    `;
    
    // Adicionar script ao corpo do documento
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      document.body.removeChild(script);
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