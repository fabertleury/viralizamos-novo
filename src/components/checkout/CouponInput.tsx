'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';

interface CouponInputProps {
  serviceId: string;
  originalAmount: number;
  onCouponApplied: (discountAmount: number, finalAmount: number, couponCode: string) => void;
}

export function CouponInput({ serviceId, originalAmount, onCouponApplied }: CouponInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Por favor, insira um código de cupom');
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
          service_id: serviceId,
          amount: originalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao validar cupom');
      }

      if (data.valid) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: data.discount_amount,
          finalAmount: data.final_amount,
        });
        onCouponApplied(data.discount_amount, data.final_amount, couponCode);
        toast.success('Cupom aplicado com sucesso!');
      } else {
        toast.error(data.message || 'Cupom inválido');
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao aplicar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponApplied(0, originalAmount, '');
    toast.success('Cupom removido');
  };

  return (
    <div className="mt-4 border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center text-sm text-blue-600 p-0 hover:text-blue-800">
            <Tag className="h-4 w-4 mr-1" />
            {appliedCoupon ? 'Cupom aplicado' : 'Tem um cupom?'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
              <div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {appliedCoupon.code}
                </Badge>
                <span className="ml-2 text-sm text-green-700">
                  Desconto: R$ {appliedCoupon.discountAmount.toFixed(2)}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveCoupon}
                className="h-8 w-8 p-0 text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleApplyCoupon} 
                disabled={loading || !couponCode.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
