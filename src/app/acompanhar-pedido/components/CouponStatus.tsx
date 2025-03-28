'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TicketIcon, CheckCircle, XCircle } from 'lucide-react';

interface CouponStatusProps {
  orderId: string;
  initialDiscount?: number;
  initialAmount?: number;
  finalAmount?: number;
  onCouponApplied?: (discount: number, finalAmount: number) => void;
  disabled?: boolean;
}

export function CouponStatus({
  orderId,
  initialDiscount = 0,
  initialAmount = 0,
  finalAmount,
  onCouponApplied,
  disabled = false
}: CouponStatusProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(initialDiscount);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(!!initialDiscount);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode,
          order_id: orderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao validar cupom');
      }

      if (!data.valid) {
        setError(data.message || 'Cupom inválido');
        return;
      }

      // Se o cupom for válido, aplicá-lo ao pedido
      await applyCoupon();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar cupom');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    try {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode,
          order_id: orderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aplicar cupom');
      }

      setDiscount(data.discount_amount);
      setSuccess(true);
      toast.success('Cupom aplicado com sucesso!');
      
      if (onCouponApplied) {
        onCouponApplied(data.discount_amount, data.final_amount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aplicar cupom');
    }
  };

  const removeCoupon = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/coupons/apply', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao remover cupom');
      }

      setDiscount(0);
      setCouponCode('');
      setSuccess(false);
      toast.success('Cupom removido com sucesso!');
      
      if (onCouponApplied) {
        onCouponApplied(0, initialAmount);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover cupom');
    } finally {
      setLoading(false);
    }
  };

  // Se já tiver desconto aplicado, mostrar o status
  if (success) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <TicketIcon className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="font-medium">Cupom aplicado</h3>
        </div>
        <div className="flex flex-col space-y-1 mb-3">
          <div className="text-sm text-gray-600">
            Desconto: <span className="font-medium text-green-600">{formatCurrency(discount)}</span>
          </div>
          {finalAmount !== undefined && (
            <div className="text-sm text-gray-600">
              Valor final: <span className="font-medium">{formatCurrency(finalAmount)}</span>
            </div>
          )}
        </div>
        {!disabled && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={removeCoupon} 
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Remover cupom
          </Button>
        )}
      </div>
    );
  }

  // Se não tiver desconto aplicado, mostrar o formulário
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center mb-3">
        <TicketIcon className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="font-medium">Cupom de desconto</h3>
      </div>
      
      {!disabled ? (
        <>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1"
              disabled={loading || disabled}
            />
            <Button 
              onClick={validateCoupon} 
              disabled={loading || disabled || !couponCode.trim()}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Aplicar
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Não é possível aplicar cupons neste momento.
        </p>
      )}
    </div>
  );
}
