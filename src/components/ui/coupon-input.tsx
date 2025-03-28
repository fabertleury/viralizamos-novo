'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import * as Collapsible from '@radix-ui/react-collapsible';

interface CouponInputProps {
  serviceId: string;
  originalAmount: number;
  onCouponApplied: (discountAmount: number, finalAmount: number, code: string | null) => void;
}

export const CouponInput = ({ serviceId, originalAmount, onCouponApplied }: CouponInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(originalAmount);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          serviceId,
          amount: originalAmount,
        }),
      });

      // Verificar se a resposta é bem-sucedida
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        toast.error(`Erro ao validar cupom: ${response.statusText}`);
        setLoading(false);
        return;
      }

      // Verificar se o tipo de conteúdo é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Resposta não é JSON:', contentType);
        toast.error('Erro ao validar cupom: resposta inválida do servidor');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon(couponCode);
        setDiscountAmount(data.discount_amount || 0);
        setFinalAmount(data.final_amount || originalAmount);
        onCouponApplied(
          data.discount_amount || 0,
          data.final_amount || originalAmount,
          couponCode
        );
        toast.success('Cupom aplicado com sucesso!');
        setIsOpen(false);
      } else {
        toast.error(data.message || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      toast.error('Erro ao validar o cupom. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
    setFinalAmount(originalAmount);
    onCouponApplied(0, originalAmount, null);
    toast.info('Cupom removido');
  };

  return (
    <div className="mt-4 border rounded-md p-2">
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 p-2 rounded">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm">
              Cupom <strong>{appliedCoupon}</strong> aplicado
              {discountAmount > 0 && (
                <span className="ml-1 text-green-600">
                  (-R$ {discountAmount.toFixed(2)})
                </span>
              )}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="h-7 px-2 text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-between items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <span className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tem cupom?
              </span>
              <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div className="pt-2 space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite o código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  onClick={validateCoupon}
                  disabled={loading || !couponCode.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Aplicar'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Digite o código do cupom e clique em Aplicar para obter seu desconto.
              </p>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </div>
  );
};
