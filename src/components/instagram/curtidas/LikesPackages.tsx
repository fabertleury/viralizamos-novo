'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
  category: {
    id: string;
    name: string;
    subcategories: {
      id: string;
      name: string;
    }[];
  } | null;
  subcategory_id: string;
}

export function LikesPackages() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedType, setSelectedType] = useState('brasil');
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            preco,
            quantidade,
            subcategory_id,
            category:categories(
              id,
              name,
              subcategories(id, name)
            )
          `)
          .eq('status', true)
          .order('quantidade');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const brasilServices = services.filter(
    (service) =>
      service.category?.subcategories?.find(
        (sub) => sub.id === service.subcategory_id
      )?.name.toLowerCase().includes('brasil')
  );

  const globalServices = services.filter(
    (service) =>
      service.category?.subcategories?.find(
        (sub) => sub.id === service.subcategory_id
      )?.name.toLowerCase().includes('mundial')
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBuyNow = () => {
    if (!selectedService) return;
    router.push(`/checkout/instagram-v2/curtidas/step1?service_id=${selectedService.id}`);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Comprar Curtidas no Instagram</h1>
          <p className="text-base md:text-lg text-gray-600">
            Curtidas de alta qualidade para aumentar seu engajamento
          </p>
        </div>

        <Tabs defaultValue="brasil" className="w-full" onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8">
            <TabsTrigger value="brasil" className="text-sm md:text-lg py-3">
              <span className="flex items-center gap-2">
                🇧🇷 <span className="hidden md:inline">Curtidas</span> Brasileiras
              </span>
            </TabsTrigger>
            <TabsTrigger value="global" className="text-sm md:text-lg py-3">
              <span className="flex items-center gap-2">
                🌎 <span className="hidden md:inline">Curtidas</span> Mundiais
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brasil">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {brasilServices.map((service) => (
                <Card
                  key={service.id}
                  className={`p-2 md:p-3 cursor-pointer transition-all hover:shadow-lg ${
                    selectedService?.id === service.id
                      ? 'ring-2 ring-pink-500 bg-pink-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold mb-0.5 md:mb-1">{service.quantidade}</div>
                    <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Curtidas</div>
                    <div className="text-base md:text-lg font-bold text-pink-600">
                      R$ {service.preco.toFixed(2)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="global">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {globalServices.map((service) => (
                <Card
                  key={service.id}
                  className={`p-2 md:p-3 cursor-pointer transition-all hover:shadow-lg ${
                    selectedService?.id === service.id
                      ? 'ring-2 ring-pink-500 bg-pink-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold mb-0.5 md:mb-1">{service.quantidade}</div>
                    <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Curtidas</div>
                    <div className="text-base md:text-lg font-bold text-pink-600">
                      R$ {service.preco.toFixed(2)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedService && (
          <div className="mt-6 md:mt-8 text-center">
            <Button 
              size="lg" 
              onClick={handleBuyNow}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 md:px-8 py-2 rounded-full text-sm md:text-base w-full md:w-auto"
            >
              Comprar Agora
            </Button>
          </div>
        )}

        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Por que escolher nossas curtidas?</h2>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                <span className="text-pink-500">✓</span> Entrega instantânea
              </li>
              <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                <span className="text-pink-500">✓</span> Curtidas de contas reais
              </li>
              <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                <span className="text-pink-500">✓</span> Sem necessidade de senha
              </li>
              <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                <span className="text-pink-500">✓</span> Suporte 24/7
              </li>
            </ul>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Como funciona?</h2>
            <ol className="space-y-2 md:space-y-3 list-decimal list-inside text-sm md:text-base text-gray-700">
              <li>Escolha o pacote de curtidas desejado</li>
              <li>Informe o link do seu post do Instagram</li>
              <li>Faça o pagamento de forma segura</li>
              <li>Receba suas curtidas instantaneamente</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
