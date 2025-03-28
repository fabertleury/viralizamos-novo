import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateToBrasilia } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils';
import { getStatusColor, getStatusText } from '../services/orderService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function OrderDetailsModal({ isOpen, onOpenChange, order }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Pedido #{order.id.substring(0, 8)}</h3>
            <Badge className={`${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Data do Pedido</p>
              <p className="text-sm font-medium">{formatDateToBrasilia(order.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Serviço</p>
              <p className="text-sm font-medium">{order.service?.name || 'Serviço não especificado'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantidade</p>
              <p className="text-sm font-medium">{order.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Valor</p>
              <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
            </div>
          </div>
          
          {order.discount_amount && order.discount_amount > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Desconto</p>
                <p className="text-sm font-medium text-green-600">
                  -{formatCurrency(order.discount_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valor Final</p>
                <p className="text-sm font-medium">
                  {formatCurrency(order.final_amount || order.amount - order.discount_amount)}
                </p>
              </div>
            </div>
          )}
          
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
          
          {order.metadata.provider_status && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Progresso:</span>
                <span className="text-xs font-medium">{order.metadata.provider_status.remains} restantes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - (parseInt(order.metadata.provider_status.remains) / order.quantity * 100)))}%` 
                  }}
                ></div>
              </div>
              
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
            </div>
          )}
          
          {order.refills && order.refills.length > 0 && (
            <div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
