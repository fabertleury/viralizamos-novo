'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

// Interfaces para os tipos de dados
interface Provider {
  id: string;
  name: string;
  slug: string;
  api_key?: string;
  api_url?: string;
  status: boolean;
}

interface Service {
  id: string;
  name: string;
  type: string;
  preco: number;
  quantidade: number;
  provider_id: string;
}

export default function PaymentDebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    service_id: '',
    provider_id: '',
    target_username: 'viralizei.ia',
    type: 'comentarios'
  });
  
  const supabase = createClient();
  
  // Carregar provedores e serviços ao iniciar a página
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar serviços
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');

        console.log('Services Data:', servicesData); // Log para verificar dados dos serviços

        if (servicesError) {
          console.error('Erro ao carregar serviços:', servicesError);
          toast.error('Erro ao carregar serviços');
          return;
        }

        setServices(servicesData || []);

        // Se houver serviços, selecionar o primeiro por padrão
        if (servicesData && servicesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            service_id: servicesData[0].id,
            amount: servicesData[0].preco.toString()
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };
    
    fetchData();
  }, []);
  
  // Atualizar serviços filtrados quando o provedor ou tipo mudar
  useEffect(() => {
    if (formData.type) {
      const filtered = services.filter(service => 
        service.type === formData.type
      );
      
      setFilteredServices(filtered);
      
      // Se houver serviços filtrados, selecionar o primeiro por padrão
      if (filtered.length > 0 && !filtered.some(s => s.id === formData.service_id)) {
        setFormData(prev => ({
          ...prev,
          service_id: filtered[0].id,
          amount: filtered[0].preco.toString()
        }));
      }
    }
  }, [formData.type, services]);
  
  // Atualizar o valor amount quando o serviço mudar
  useEffect(() => {
    if (formData.service_id) {
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          amount: selectedService.preco.toString()
        }));
      }
    }
  }, [formData.service_id, services]);

  // Função para gerar dados de teste completos
  const generateTestData = () => {
    const paymentId = `test_${Date.now()}`;
    const selectedService = services.find(s => s.id === formData.service_id);
    
    return {
      user_id: 'test_user',
      order_id: paymentId,
      type: formData.type,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      status: 'pending',
      payment_method: 'pix',
      payment_id: paymentId,
      metadata: {
        posts: [
          {
            postId: 'test_post_1',
            postCode: 'test123',
            postLink: 'https://instagram.com/p/test123',
            comentarios: 50,
            type: 'post'
          },
          {
            postId: 'test_post_2',
            postCode: 'test456',
            postLink: 'https://instagram.com/reel/test456',
            comentarios: 50,
            type: 'reel'
          }
        ],
        serviceDetails: {
          id: formData.service_id || 'test_service',
          name: selectedService?.name || 'Serviço de Teste',
          preco: formData.amount ? parseFloat(formData.amount) : 0,
          quantidade: selectedService?.quantidade || 100,
          type: formData.type
        }
      },
      customer_name: 'Usuário de Teste',
      customer_email: 'teste@exemplo.com',
      customer_phone: '11999999999',
      target_username: formData.target_username,
      target_full_name: 'Usuário de Teste',
      payment_qr_code: 'test_qr_code',
      payment_external_reference: paymentId,
      service_id: formData.service_id || 'test_service',
      target_profile_link: `https://www.instagram.com/${formData.target_username}/`
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const testData = generateTestData();
      
      // Log dos dados que serão enviados
      console.log('Enviando dados de teste:', testData);
      
      // Adicionar a URL e a Key para a requisição
      const apiUrl = 'URL_DO_PROVEDOR'; // Substitua pela URL real
      const apiKey = 'SUA_API_KEY'; // Substitua pela chave real
      
      // Estrutura dos dados a serem enviados
      const requestData = {
        method: 'POST',
        action: 'add',
        service: testData.service_id,
        link: testData.metadata.posts[0].postLink, // Exemplo de como pegar o link do primeiro post
        quantidade: testData.metadata.serviceDetails.quantidade,
        key: apiKey
      };
      
      // Log dos dados que serão enviados
      console.log('Dados da requisição:', requestData);
      
      // Enviar para a URL do provedor
      const response = await axios.post(apiUrl, requestData);
      console.log('Resposta do provedor:', response.data);
      
      // Adicionar campo para armazenar a resposta do servidor
      const serverResponse = response.data;
      const serverName = 'Nome do Provedor'; // Substitua pelo nome real do provedor
      setResult({ ...serverResponse, serverName });
      
      // Adicionar a resposta do provedor ao resultado
      const detailedResult = {
        ...serverResponse,
        requestData: testData,
        serverName: serverName,
      };
      setResult(detailedResult);
      
      // Adicionar campos separados para envio e resposta
      const requestDetails = {
        sentData: testData,
        providerResponse: serverResponse.message
      };
      setRequestDetails(requestDetails);
      
      // Adicionar a lógica para garantir que o valor amount seja enviado corretamente
      const orderData = {
        user_id: testData.user_id,
        order_id: testData.order_id,
        service_id: testData.service_id,
        amount: testData.amount, // Certifique-se de que este valor está sendo passado corretamente
        status: 'pending',
        // Outros campos necessários para a criação do pedido
      };
      
      // Verificar se o amount está definido
      if (!orderData.amount) {
        console.error('Valor amount não está definido:', orderData);
        toast.error('Valor amount é necessário para criar o pedido.');
        return;
      }
      
      // Enviar para a tabela orders
      const orderResponse = await axios.post('/api/orders', { orderData });
      console.log('Ordens salvas:', orderResponse.data);
      
    } catch (error: any) {
      console.error('Erro ao testar pagamento:', error);
      toast.error(error.response?.data?.error || 'Erro ao testar pagamento');
      setResult(error.response?.data || { error: 'Erro desconhecido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Debug de Pagamento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configuração do Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de serviço</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="curtidas">Curtidas</option>
                <option value="seguidores">Seguidores</option>
                <option value="comentarios">Comentários</option>
                <option value="visualizacoes">Visualizações</option>
                <option value="reels">Reels</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Serviço</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              >
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.preco.toFixed(2)} - {service.quantidade} {formData.type}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhum serviço disponível</option>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Valor (amount)</label>
              <Input
                type="number"
                placeholder="Ex: 99.90"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Este valor é preenchido automaticamente com base no serviço selecionado
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome de usuário alvo</label>
              <Input
                placeholder="Ex: viralizei.ia"
                value={formData.target_username}
                onChange={(e) => setFormData({ ...formData, target_username: e.target.value })}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </span>
              ) : (
                'Testar Pagamento'
              )}
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Resultado do Teste</h2>
          
          {result ? (
            <div>
              <div className={`p-3 mb-4 rounded-md ${result.amountStatus === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-medium">Status do valor amount: {result.amountStatus}</p>
                <p>Valor: {result.amountValue !== null && result.amountValue !== undefined ? result.amountValue : 'NULO'}</p>
              </div>
              
              <Textarea
                className="w-full h-[400px] font-mono text-sm"
                value={JSON.stringify(result, null, 2)}
                readOnly
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">Execute o teste para ver os resultados aqui.</p>
          )}
          
          {requestDetails ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes da Requisição</h3>
              <Textarea
                className="w-full h-[200px] font-mono text-sm"
                value={JSON.stringify(requestDetails, null, 2)}
                readOnly
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">Execute o teste para ver os detalhes da requisição aqui.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
