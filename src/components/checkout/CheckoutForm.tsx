'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  quantidade?: number;
  type?: string;
  category: {
    id: string;
    name: string;
    icon: string;
    social: {
      id: string;
      name: string;
      icon: string;
    };
  };
}

interface CheckoutFormProps {
  service: Service;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormData {
  instagram_username: string;
  quantity: number;
}

export function CheckoutForm({ service, onSubmit }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    instagram_username: '',
    quantity: service.quantidade || 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!formData.instagram_username) {
        toast.error('Por favor, insira seu nome de usuário do Instagram');
        return;
      }

      if (formData.quantity < (service.quantidade || 1)) {
        toast.error(`A quantidade mínima é ${service.quantidade || 1}`);
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Erro ao processar formulário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return service.price * formData.quantity;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="instagram_username" className="block text-sm font-medium text-gray-700">
          Nome de usuário do Instagram
        </label>
        <Input
          id="instagram_username"
          type="text"
          placeholder="@seuperfil"
          value={formData.instagram_username}
          onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Quantidade
        </label>
        <Input
          id="quantity"
          type="number"
          min={service.quantidade || 1}
          step={1}
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          className="mt-1"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Quantidade mínima: {service.quantidade || 1}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Resumo do pedido</h3>
        <dl className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Serviço</dt>
            <dd className="text-sm font-medium text-gray-900">{service.name}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Quantidade</dt>
            <dd className="text-sm font-medium text-gray-900">{formData.quantity}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">Total</dt>
            <dd className="text-base font-medium text-gray-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(calculateTotalPrice())}
            </dd>
          </div>
        </dl>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Continuar para pagamento'}
      </Button>
    </form>
  );
}
