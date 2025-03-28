'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Service } from '@/types';
import ServiceComponent from '@/components/ServiceComponent';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Tipagem para os parâmetros
interface ServicePageProps {
  params: {
    id: string;
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Recuperar o ID de forma segura, garantindo que é uma string
  const serviceId = params?.id as string;

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            category:categories(
              id,
              name,
              icon
            )
          `)
          .eq('id', serviceId)
          .single();

        if (error) throw error;

        if (data) {
          setService(data);
        }
      } catch (error) {
        console.error('Error loading service:', error);
        toast.error('Erro ao carregar serviço');
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      loadService();
    }
  }, [serviceId, supabase]);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity)) {
      if (service) {
        if (newQuantity < (service.min_order || 1)) {
          toast.error(`Quantidade mínima: ${service.min_order || 1}`);
        } else if (newQuantity > (service.max_order || 10000)) {
          toast.error(`Quantidade máxima: ${service.max_order || 10000}`);
        } else {
          setQuantity(newQuantity);
        }
      }
    }
  };

  const calculatePrice = () => {
    if (!service) return 0;
    return (service.preco / service.quantidade) * quantity;
  };

  const handleBuyNow = async () => {
    if (!service) return;

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          service_id: service.id,
          quantity: quantity,
          amount: calculatePrice(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (order) {
        window.location.href = `/checkout/${service.category.name.toLowerCase()}/${order.id}`;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Serviço não encontrado</h1>
        <p className="text-gray-600 mt-2">Verifique o link e tente novamente</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h1>
          
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-2">Descrição:</p>
              <p className="text-gray-800">{service.descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">Tempo de entrega:</p>
                <p className="text-gray-800">{service.delivery_time}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Taxa de sucesso:</p>
                <p className="text-gray-800">{service.success_rate}%</p>
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade
              </label>
              <Input
                id="quantity"
                type="number"
                min={service.min_order || 1}
                max={service.max_order || 10000}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Mínimo: {service.min_order || 1} | Máximo: {service.max_order || 10000}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calculatePrice())}
                </span>
              </div>
            </div>

            <Button
              onClick={handleBuyNow}
              className="w-full"
            >
              Comprar agora
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
