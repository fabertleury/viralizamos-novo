export interface Service {
  id: string;
  name: string;
  type: 'curtidas' | 'seguidores' | 'visualizacoes' | 'comentarios' | 'reels';
  quantidade: number;
  preco: number;
  descricao: string;
  categoria: string;
  status: 'active' | 'inactive' | 'maintenance';
  delivery_time: number; // tempo médio de entrega em horas
  min_order: number; // quantidade mínima por pedido
  max_order: number; // quantidade máxima por pedido
  provider_id: string; // ID do provedor do serviço
  success_rate: number; // taxa de sucesso (0-100)
  created_at: string;
  updated_at: string;
  metadata?: {
    requires_login?: boolean;
    requires_public_profile?: boolean;
    quality_score?: number;
    tags?: string[];
    service_details?: {
      global_reach?: boolean;
      fast_delivery?: boolean;
      guaranteed_security?: boolean;
    };
  };
}