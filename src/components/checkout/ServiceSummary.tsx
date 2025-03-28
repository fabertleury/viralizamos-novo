'use client';

import { Service } from '@/app/checkout/instagram/types';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface ServiceSummaryProps {
  service: Service;
  finalAmount: number | null;
  originalAmount: number;
  discountAmount: number;
  appliedCoupon: string | null;
  className?: string;
}

export function ServiceSummary({
  service,
  finalAmount,
  originalAmount,
  discountAmount,
  appliedCoupon,
  className = ''
}: ServiceSummaryProps) {
  const serviceDetails = service.service_details || [
    { icon: '⚡', title: 'Entrega Rápida' },
    { icon: '🔒', title: 'Segurança Garantida' },
    { icon: '🌎', title: 'Alcance Global' }
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <h2 className="text-lg font-bold mb-2">Resumo do Serviço</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Serviço:</span>
          <span className="font-medium">{service.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Quantidade:</span>
          <span className="font-medium">{service.quantidade} curtidas</span>
        </div>
        <div className="flex justify-between">
          <span>Valor:</span>
          <span className="font-medium">{formatCurrency(originalAmount)}</span>
        </div>
        
        {appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Desconto ({appliedCoupon}):</span>
            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        {finalAmount !== null && finalAmount !== originalAmount && (
          <div className="flex justify-between font-bold mt-2 text-lg">
            <span>Total:</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        )}
      </div>
      
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold mb-2">Benefícios</h3>
        <div className="grid grid-cols-1 gap-2">
          {serviceDetails.map((detail, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-lg">{detail.icon}</span>
              <span className="text-sm">{detail.title}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
