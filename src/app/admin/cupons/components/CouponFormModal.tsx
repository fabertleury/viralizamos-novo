'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  service_restrictions?: { service_id: string; service: { name: string } }[];
  customer_assignments?: { customer_id: string; customer: { email: string } }[];
};

type Service = {
  id: string;
  name: string;
};

type CouponFormModalProps = {
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CouponFormModal({ coupon, onClose, onSuccess }: CouponFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    is_active: true
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchServices();
    
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_purchase_amount: coupon.min_purchase_amount?.toString() || '',
        max_discount_amount: coupon.max_discount_amount?.toString() || '',
        start_date: new Date(coupon.start_date).toISOString().split('T')[0],
        end_date: new Date(coupon.end_date).toISOString().split('T')[0],
        usage_limit: coupon.usage_limit?.toString() || '',
        is_active: coupon.is_active
      });
      
      if (coupon.service_restrictions?.length) {
        setSelectedServices(coupon.service_restrictions.map(sr => sr.service_id));
      }
    } else {
      // Valores padrão para novo cupom
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        ...formData,
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0]
      });
    }
  }, [coupon]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: formData.code,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date + 'T23:59:59').toISOString(),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        is_active: formData.is_active
      };

      let couponId = coupon?.id;

      if (coupon) {
        // Atualizar cupom existente
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', coupon.id);

        if (error) throw error;
      } else {
        // Criar novo cupom
        const { data, error } = await supabase
          .from('coupons')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        couponId = data.id;
      }

      // Gerenciar restrições de serviço
      if (couponId) {
        // Primeiro remover todas as restrições existentes
        await supabase
          .from('coupon_service_restrictions')
          .delete()
          .eq('coupon_id', couponId);

        // Adicionar novas restrições
        if (selectedServices.length > 0) {
          const serviceRestrictions = selectedServices.map(serviceId => ({
            coupon_id: couponId,
            service_id: serviceId
          }));

          const { error } = await supabase
            .from('coupon_service_restrictions')
            .insert(serviceRestrictions);

          if (error) throw error;
        }
      }

      toast.success(`Cupom ${coupon ? 'atualizado' : 'criado'} com sucesso`);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast.error(`Erro ao ${coupon ? 'atualizar' : 'criar'} cupom`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {coupon ? 'Editar Cupom' : 'Novo Cupom'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="code">Código do Cupom*</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: PROMO10"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_type">Tipo de Desconto*</Label>
              <select
                id="discount_type"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mt-1"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed_amount">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                {formData.discount_type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}*
              </Label>
              <Input
                id="discount_value"
                name="discount_value"
                type="number"
                step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="max_discount_amount">Valor Máximo de Desconto (R$)</Label>
              <Input
                id="max_discount_amount"
                name="max_discount_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.max_discount_amount}
                onChange={handleChange}
                placeholder="Opcional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="min_purchase_amount">Valor Mínimo de Compra (R$)</Label>
              <Input
                id="min_purchase_amount"
                name="min_purchase_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase_amount}
                onChange={handleChange}
                placeholder="Opcional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="usage_limit">Limite de Usos</Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={handleChange}
                placeholder="Ilimitado se vazio"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="start_date">Data de Início*</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data de Término*</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o cupom e suas condições"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="services">Restringir a Serviços Específicos</Label>
            <div className="mt-1">
              <select
                id="services"
                multiple
                value={selectedServices}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedServices(options);
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                size={5}
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se nenhum serviço for selecionado, o cupom será válido para todos os serviços.
                Segure Ctrl para selecionar múltiplos serviços.
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
            />
            <Label htmlFor="is_active" className="ml-2">
              Ativo
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : coupon ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
