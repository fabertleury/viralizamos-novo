import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDateToBrasilia } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: any;
  checkingStatus: Record<string, boolean>;
  handleCheckStatus: (orderId: string) => void;
  handleRequestRefill: (orderId: string) => void;
  isWithin30Days: (dateString: string) => boolean;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  requestingRefill: Record<string, boolean>;
}

export function OrderCard({
  order,
  checkingStatus,
  handleCheckStatus,
  handleRequestRefill,
  isWithin30Days,
  getStatusColor,
  getStatusText,
  requestingRefill
}: OrderCardProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <div className="flex justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Pedido #{order.id.substring(0, 8)}</h3>
            <p className="text-xs text-gray-500">{formatDateToBrasilia(order.created_at)}</p>
          </div>
          <Badge className={`${order.status === 'needs_retry' ? 'bg-red-500 hover:bg-red-600' : getStatusColor(order.status)}`}>
            {order.status === 'needs_retry' ? 'Aguardando Reprocessamento' : getStatusText(order.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Serviço</p>
            <p className="text-sm font-medium">{order.service?.name || 'Serviço não especificado'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Quantidade</p>
            <p className="text-sm font-medium">{order.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Valor</p>
            <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Link</p>
            <a 
              href={order.metadata.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              {order.service?.type === 'followers' ? 'Ver Instagram' : (order.metadata.post ? 'Ver Post' : 'Ver Perfil')}
            </a>
          </div>
        </div>
        
        {/* Barra de progresso para todos os pedidos */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">Progresso:</span>
            <span className="text-xs font-medium">
              {order.metadata.provider_status ? 
                `${order.metadata.provider_status.remains} restantes` : 
                'Aguardando atualização'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ 
                width: order.metadata.provider_status ? 
                  `${Math.max(0, Math.min(100, 100 - (parseInt(order.metadata.provider_status.remains) / order.quantity * 100)))}%` :
                  '0%'
              }}
            ></div>
          </div>
          
          {order.metadata.provider_status && (
            <>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {order.metadata.provider_status.start_count && (
                  <div>
                    <span className="text-xs text-gray-500">Contagem inicial:</span>
                    <span className="text-xs font-medium ml-1">{order.metadata.provider_status.start_count}</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                Atualizado: {new Date(order.metadata.provider_status.updated_at).toLocaleString('pt-BR')}
              </div>
            </>
          )}
        </div>
        
        {order.refills && order.refills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Reposições</h4>
            <div className="space-y-2">
              {order.refills.map((refill: any) => (
                <div 
                  key={refill.id} 
                  className="bg-gray-50 p-2 rounded-md text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="text-gray-500">
                      {formatDateToBrasilia(refill.created_at)}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(refill.status)}`}>
                    {getStatusText(refill.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            onClick={() => handleCheckStatus(order.id)}
            disabled={checkingStatus[order.id]}
            variant="outline"
            size="sm"
          >
            {checkingStatus[order.id] ? 'Atualizando...' : 'Atualizar Status'}
          </Button>
          
          {isWithin30Days(order.created_at) && (!order.refills || order.refills.length === 0) && 
           order.status === 'completed' && order.service?.service_details?.refill && (
            <Button
              onClick={() => handleRequestRefill(order.id)}
              disabled={requestingRefill[order.id]}
              variant="outline"
              size="sm"
            >
              {requestingRefill[order.id] ? 'Solicitando...' : 'Solicitar Reposição'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
