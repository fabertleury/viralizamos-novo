/**
 * Serviço para integração entre Microsoft Clarity e o banco de dados PostgreSQL
 * 
 * Este serviço captura eventos do Microsoft Clarity e os envia para o banco de dados
 * para análise posterior no painel administrativo.
 */

// Função para enviar eventos do Clarity para a API
export async function sendClarityEventToDatabase(eventType: string, eventData: any) {
  try {
    const response = await fetch('/api/analytics/clarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        data: eventData,
        url: window.location.href,
        user_agent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      console.error('Erro ao enviar evento do Clarity para o banco de dados');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar evento do Clarity:', error);
    return false;
  }
}

// Função para inicializar o rastreamento do Clarity
export function initClarityTracking() {
  if (typeof window === 'undefined') return;

  // Verificar se o Clarity está disponível
  if (typeof (window as any).clarity === 'function') {
    // Sobrescrever a função clarity para capturar eventos
    const originalClarity = (window as any).clarity;
    
    (window as any).clarity = function(...args: any[]) {
      // Chamar a função original do Clarity
      originalClarity.apply(this, args);
      
      // Se for um evento, enviar para o banco de dados
      if (args.length >= 2 && (args[0] === 'event' || args[0] === 'set')) {
        const eventType = args[0];
        const eventName = args[1];
        const eventData = args.length >= 3 ? args[2] : {};
        
        // Enviar para o banco de dados
        sendClarityEventToDatabase(`${eventType}_${eventName}`, eventData);
      }
    };
    
    // Configurar listener para eventos de abandono de carrinho
    if (window.location.pathname.includes('/pagamento') || 
        window.location.pathname.includes('/checkout')) {
      
      // Rastrear abandono de carrinho
      window.addEventListener('beforeunload', function() {
        // Verificar se o checkout foi concluído
        const checkoutCompleted = sessionStorage.getItem('checkout_completed') === 'true';
        
        if (!checkoutCompleted) {
          // Obter dados do carrinho
          const cartData = {
            url: window.location.href,
            time_on_page: Math.floor((Date.now() - (parseInt(sessionStorage.getItem('cart_start_time') || '0'))) / 1000),
          };
          
          // Enviar evento de abandono de carrinho
          sendClarityEventToDatabase('cart_abandoned', cartData);
        }
      });
    }
    
    console.log('Clarity tracking inicializado com integração ao banco de dados');
  } else {
    console.warn('Microsoft Clarity não encontrado. A integração com o banco de dados não será ativada.');
  }
}

// Função para obter dados de analytics do Clarity
export async function getClarityAnalytics(filters: {
  eventType?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    // Construir a URL com os filtros
    let url = '/api/analytics/clarity?';
    
    if (filters.eventType) {
      url += `event_type=${encodeURIComponent(filters.eventType)}&`;
    }
    
    if (filters.startDate) {
      url += `start_date=${encodeURIComponent(filters.startDate)}&`;
    }
    
    if (filters.endDate) {
      url += `end_date=${encodeURIComponent(filters.endDate)}&`;
    }
    
    // Fazer a requisição
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados de analytics');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter dados de analytics do Clarity:', error);
    throw error;
  }
}
