'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InstagramStep2Base } from '@/components/checkout/InstagramStep2Base';
import ReelSelector from '@/components/instagram/ReelSelector';
import { Loader2 } from 'lucide-react';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';
import axios from 'axios';

interface Reel {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
  view_count?: number;
}

interface InstagramReelsStep2Props {
  title: string;
}

export function InstagramReelsStep2({ title }: InstagramReelsStep2Props) {
  const router = useRouter();
  const { fetchInstagramReels } = useInstagramAPI();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [selectedReels, setSelectedReels] = useState<Reel[]>([]);
  const [instagramReels, setInstagramReels] = useState<Reel[]>([]);
  const [reelsLoaded, setReelsLoaded] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [hasReels, setHasReels] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const handleReelSelect = useCallback((reels: Reel[]) => {
    setSelectedReels(reels);
  }, []);

  const fetchReels = useCallback(async () => {
    // Carregar dados do perfil do localStorage
    const savedData = localStorage.getItem('checkoutProfileData');
    if (!savedData) {
      toast.error('Dados de perfil não encontrados');
      router.push('/checkout/instagram-v2/reels/step1');
      return;
    }

    const parsedData = JSON.parse(savedData);
    const username = parsedData.profileData?.username;

    if (!username) {
      toast.error('Nome de usuário não encontrado');
      router.push('/checkout/instagram-v2/reels/step1');
      return;
    }

    // Buscar reels
    try {
      setLoadingReels(true);
      setLoadingMessage('Buscando reels...');
      
      // Usar a API de visualização combinada para buscar reels
      const response = await fetch(`/api/instagram/visualizacao/${username}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar reels: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar se o usuário tem reels
      if (!data.hasReels) {
        setHasReels(false);
        toast.warning(data.message || 'Este perfil não possui reels disponíveis.');
        return;
      }
      
      // Obter os reels da resposta
      if (data.reels && Array.isArray(data.reels)) {
        const formattedReels = data.reels.map((reel: any) => {
          const reelCode = reel.code || reel.shortcode || '';
          
          return {
            id: reel.id || '',
            code: reelCode,
            shortcode: reelCode,
            image_url: reel.thumbnail_url || reel.media_url || '',
            caption: reel.caption 
                ? (typeof reel.caption === 'object' 
                  ? reel.caption.text || 'Sem legenda'
                  : String(reel.caption)) 
                : 'Sem legenda',
            like_count: reel.likes_count || reel.like_count || 0,
            comment_count: reel.comments_count || reel.comment_count || 0,
            thumbnail_url: reel.thumbnail_url || reel.media_url || '',
            display_url: reel.media_url || reel.thumbnail_url || '',
            is_reel: true,
            view_count: reel.views_count || reel.view_count || 0
          };
        }).filter((reel: Reel) => reel.image_url);
        
        setInstagramReels(formattedReels);
        setHasReels(formattedReels.length > 0);
        
        if (formattedReels.length === 0) {
          toast.warning('Não encontramos reels com imagens de capa para este perfil.');
        }
      } else {
        setHasReels(false);
        toast.warning('Formato inesperado na resposta da API. Não foi possível carregar os reels.');
      }
      
      setReelsLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar reels:', error);
      toast.error('Erro ao buscar reels');
      setHasReels(false);
    } finally {
      setLoadingReels(false);
      setLoadingMessage('');
    }
  }, [router]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const handleSubmit = async (formData: any) => {
    try {
      // Obter dados do localStorage
      const savedData = localStorage.getItem('checkoutProfileData');
      if (!savedData) {
        throw new Error('Dados de checkout não encontrados');
      }
      
      const parsedData = JSON.parse(savedData);
      const profileData = parsedData.profileData;
      const serviceId = parsedData.serviceId || parsedData.external_id;
      const quantity = parsedData.quantity;
      
      if (!profileData || !serviceId) {
        throw new Error('Dados de checkout incompletos');
      }
      
      // Verificar se há reels selecionados
      if (selectedReels.length === 0) {
        throw new Error('Selecione pelo menos um reel para continuar');
      }
      
      // Preparar dados para o pedido
      const orderData = {
        profileData,
        serviceId,
        quantity,
        selectedReels: selectedReels.map(reel => ({
          id: reel.id,
          code: reel.code,
          shortcode: reel.shortcode,
          image_url: reel.image_url,
          caption: reel.caption,
          is_reel: true
        })),
        customerData: formData,
        serviceType: 'reels'
      };
      
      // Enviar pedido para a API
      const response = await axios.post('/api/orders/instagram', orderData);
      
      if (response.data && response.data.paymentData) {
        setPaymentData(response.data.paymentData);
        
        // Salvar ID do pedido no localStorage para acompanhamento
        localStorage.setItem('lastOrderId', response.data.orderId);
        
        toast.success('Pedido criado com sucesso!');
        return response.data.paymentData;
      } else {
        throw new Error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(`Erro ao finalizar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  };

  // Calcular o número máximo de reels selecionáveis
  const maxSelectableReels = 5; // Máximo de 5 reels

  return (
    <InstagramStep2Base
      serviceType="reels"
      title={title}
      selectedItems={selectedReels}
      hasReels={hasReels}
      loadingReels={loadingReels}
      loadingMessage={loadingMessage}
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
    >
      {loadingReels ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">{loadingMessage || 'Carregando reels...'}</p>
        </div>
      ) : !hasReels ? (
        <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-medium">Nenhum reel encontrado para este perfil.</p>
          <p className="text-yellow-600 mt-2">Verifique se o perfil possui reels públicos ou tente outro perfil.</p>
          <button 
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            onClick={() => router.push('/checkout/instagram-v2/reels/step1')}
          >
            Voltar e tentar outro perfil
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Selecione até {maxSelectableReels} reels para receber visualizações
            </h3>
            <span className="text-sm text-gray-600">
              {selectedReels.length} de {maxSelectableReels} selecionados
            </span>
          </div>
          
          <ReelSelector
            reels={instagramReels}
            loading={false}
            loadingMessage=""
            maxSelectable={maxSelectableReels}
            onSelect={handleReelSelect}
            selectedReels={selectedReels}
            serviceType="reels"
          />
          
          {/* Mensagem de aviso sobre o limite de seleção */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Importante:</strong> Você pode selecionar até {maxSelectableReels} reels.
              Atualmente você selecionou {selectedReels.length} {selectedReels.length === 1 ? 'reel' : 'reels'}.
            </p>
          </div>
        </>
      )}
    </InstagramStep2Base>
  );
}
