'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  min_quantity: number;
  max_quantity: number;
  slug: string;
  categoria: string;
  status: boolean;
  discount_price?: number;
  quantidade_preco: { quantidade: number; preco: number; preco_original?: number }[];
  metadata?: {
    service_details?: {
      global_reach?: boolean;
      fast_delivery?: boolean;
      guaranteed_security?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };
  type: string;
  isbestseller?: string;
}

export default function CurtidasPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<{[key: string]: number}>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Log para debug
        console.log('Buscando serviços de curtidas...');

        // Buscar todos os serviços ativos e depois filtrar
        const { data, error } = await supabase
          .from('services')
          .select(`
            id, 
            name, 
            descricao, 
            preco, 
            min_order, 
            max_order,
            categoria,
            status,
            metadata,
            service_variations,
            checkout_type_id,
            type,
            isbestseller
          `)
          .eq('status', true)
          .order('preco', { ascending: true });

        // Log adicional para verificar dados
        console.log('Dados retornados:', data);
        console.log('Erro retornado:', error);

        if (error) throw error;

        // Transformar os dados para o formato esperado
        const formattedServices: Service[] = (data || [])
          .filter(service => {
            const categoria = service.categoria?.toLowerCase() || '';
            const nome = service.name?.toLowerCase() || '';
            
            return (
              categoria.includes('curtida') || 
              nome.includes('curtida') || 
              nome.includes('like') ||
              service.type === 'curtidas'
            );
          })
          .map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.descricao,
            price: service.preco,
            min_quantity: service.min_order || 50,
            max_quantity: service.max_order || 10000,
            slug: service.name.toLowerCase().replace(/\s+/g, '-'),
            categoria: service.categoria,
            status: service.status,
            quantidade_preco: service.service_variations || (service.metadata?.quantidade_preco as any[]) || [],
            metadata: service.metadata,
            type: service.type,
            isbestseller: service.isbestseller
          }));

        setServices(formattedServices);
      } catch (error) {
        console.error('Erro detalhado ao buscar serviços:', error);
        toast.error('Não foi possível carregar os serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Reordenar os serviços na ordem desejada
  const ordenarServicos = (servicos: Service[]) => {
    // Cria uma cópia para não modificar o estado original
    const servicosOrdenados = [...servicos];
    
    // Define a ordem de prioridade pelo nome
    const ordemPrioridade = [
      "Curtidas Brasileiras BR", 
      "Curtidas Brasileiras PREMIUM", 
      "Curtidas Mundiais"
    ];
    
    // Ordena os serviços baseado na ordem de prioridade
    servicosOrdenados.sort((a, b) => {
      const indexA = ordemPrioridade.findIndex(nome => 
        a.name.toLowerCase().includes(nome.toLowerCase()));
      const indexB = ordemPrioridade.findIndex(nome => 
        b.name.toLowerCase().includes(nome.toLowerCase()));
      
      // Se ambos os serviços não estiverem na lista de prioridade, manter a ordem original
      if (indexA === -1 && indexB === -1) return 0;
      
      // Se apenas um deles estiver na lista, priorizar o que está
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      // Se ambos estiverem na lista, ordenar conforme a prioridade
      return indexA - indexB;
    });
    
    return servicosOrdenados;
  };

  // Usar os serviços ordenados
  const servicosOrdenados = ordenarServicos(services);

  useEffect(() => {
    const initialSelectedServices = services.reduce((acc, service) => {
      const minQuantity = Math.min(...service.quantidade_preco.map(variation => variation.quantidade));
      acc[service.id] = minQuantity;
      return acc;
    }, {});
    setSelectedServices(initialSelectedServices);
  }, [services]);

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: quantity
    }));
  };

  const calculateTotalPrice = (service: Service) => {
    const quantity = selectedServices[service.id] || 0;
    const variation = service.quantidade_preco.find(variation => variation.quantidade === quantity);
    const price = variation ? variation.preco : service.price;

    return price.toFixed(2);
  };

  const getOriginalPrice = (service: Service) => {
    if (service.discount_price !== undefined) return service.price;
    
    // Obter preço original da variação selecionada
    const quantity = selectedServices[service.id];
    const variation = service.quantidade_preco.find(v => v.quantidade === quantity);
    
    return variation && variation.preco_original ? variation.preco_original : service.price;
  };

  const hasDiscount = (service: Service) => {
    if (service.discount_price !== undefined) return true;
    
    // Verificar se existe preço promocional nas variações
    const quantity = selectedServices[service.id];
    const variation = service.quantidade_preco.find(v => v.quantidade === quantity);
    
    return variation && variation.preco_original && variation.preco_original > variation.preco;
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices[serviceId] && selectedServices[serviceId] > 0;
  };

  const getServiceDetails = (service: Service) => {
    const details = [
      { 
        icon: '🌍', 
        label: 'Alcance Global', 
        active: service.metadata?.service_details?.global_reach ?? false 
      },
      { 
        icon: '⚡', 
        label: 'Entrega Rápida', 
        active: service.metadata?.service_details?.fast_delivery ?? false 
      },
      { 
        icon: '🔒', 
        label: 'Segurança Garantida', 
        active: service.metadata?.service_details?.guaranteed_security ?? false 
      }
    ];

    return details.filter(detail => detail.active);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="w-full">
          <div className="container mx-auto px-4 mb-12">
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden shadow-xl animate-gradient-x">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10 flex items-center justify-center p-12 text-center">
                <div className="text-white max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Curtidas para Instagram
                  </h2>
                  <p className="text-xl md:text-2xl mb-0">
                    Aumente a credibilidade do seu perfil com curtidas de alta qualidade
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="container mx-auto px-4 md:px-8 lg:px-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse h-full">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {servicosOrdenados.map((service) => (
                      <Card 
                        key={service.id} 
                        className="flex flex-col p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out relative"
                      >
                        {/* Badge de Mais Vendido */}
                        {(service.isbestseller === 'TRUE' || service.isbestseller === 'true') && (
                          <div className="absolute top-0 right-0 m-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md z-10">
                            Mais Vendido
                          </div>
                        )}

                        <div className="flex-grow flex flex-col">
                          {/* Título do Serviço */}
                          <div className="mb-4 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 break-words">
                              {service.name}
                            </h3>
                            <p className="text-purple-600">Divida a quantidade em até 05 posts.</p>
                          </div>

                          {/* Detalhes adicionais do serviço */}
                          <div className="flex justify-between mb-4">
                            {getServiceDetails(service).map((detail, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center text-sm text-gray-600"
                              >
                                <span className="mr-2">{detail.icon}</span>
                                {detail.label}
                              </div>
                            ))}
                          </div>

                          <div className="mb-4">
                            <p className="text-center text-gray-600 mb-2 font-semibold">
                              Escolha a quantidade
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                              {service.quantidade_preco.map((variation) => (
                                <Button
                                  key={variation.quantidade}
                                  variant={selectedServices[service.id] === variation.quantidade ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateServiceQuantity(service.id, variation.quantidade)}
                                  className={`min-w-[80px] transition-all duration-300 ease-in-out ${
                                    selectedServices[service.id] === variation.quantidade 
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform scale-105' 
                                      : 'hover:bg-purple-100'
                                  }`}
                                >
                                  {variation.quantidade}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {isServiceSelected(service.id) && (
                            <div className="text-center mb-4">
                              {hasDiscount(service) ? (
                                <>
                                  <p className="text-gray-500 line-through text-lg">
                                    De: R$ {getOriginalPrice(service)}
                                  </p>
                                  <p className="text-2xl font-bold text-purple-600">
                                    Por: R$ {calculateTotalPrice(service)}
                                  </p>
                                  <p className="text-xs text-green-600 font-medium mt-1 bg-green-50 py-1 px-2 rounded-md inline-block">
                                    Promoção!
                                  </p>
                                </>
                              ) : (
                                <p className="text-2xl font-bold text-purple-600">
                                  Por: R$ {calculateTotalPrice(service)}
                                </p>
                              )}
                            </div>
                          )}

                          {isServiceSelected(service.id) && (
                            <Link 
                              href={`/checkout/instagram-v2/curtidas/step1?service_id=${service.id}&quantity=${selectedServices[service.id]}`}
                              className="w-full mt-auto"
                            >
                              <Button 
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                                size="lg"
                              >
                                COMPRAR AGORA
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Seção de legenda e instruções */}
          <div className="container mx-auto px-4 md:px-8 lg:px-12 mt-16">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">☘️ Como realizar o pedido?</h4>
              <ol className="list-decimal pl-5 space-y-3">
                <li className="text-gray-700">Selecione o serviço do seu interesse.</li>
                <li className="text-gray-700">Informe o nome de usuário do seu perfil.</li>
                <li className="text-gray-700">Vamos fazer uma busca pelo perfil e você vai selecionar os posts aos quais deseja os serviços.</li>
                <li className="text-gray-700">Clique em (Turbinar).</li>
                <li className="text-gray-700">Envie serviços para o mesmo perfil apenas após o pedido anterior ser concluído.</li>
              </ol>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-gray-700 font-medium">Informe o nome de usuário sem o @.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
