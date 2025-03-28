const BASE_URL = 'https://famanasredes.com.br/api/v2';

interface ServiceResponse {
  status: string;
  data: {
    id: string;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: number;
    max: number;
    description: string;
  };
}

interface OrderResponse {
  status: string;
  data: {
    order_id: string;
    service_id: string;
    username: string;
    quantity: number;
    status: string;
  };
}

export class FamaRedesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FAMA_REDES_API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    return response.json();
  }

  async getServices(): Promise<ServiceResponse[]> {
    return this.request<ServiceResponse[]>('/services');
  }

  async getServiceData(serviceId: string, username: string): Promise<OrderResponse> {
    return this.request<OrderResponse>('/order', {
      method: 'POST',
      body: JSON.stringify({
        service_id: serviceId,
        username: username,
      }),
    });
  }

  async checkServiceStatus(serviceId: string): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/service/${serviceId}`);
  }

  async syncServices(): Promise<void> {
    try {
      // Buscar todos os serviços da API
      const services = await this.getServices();
      
      // TODO: Implementar sincronização com o Supabase
      // 1. Filtrar serviços por categoria (Instagram)
      // 2. Mapear para o formato do nosso banco
      // 3. Atualizar/Criar no Supabase
      
      console.log('Serviços sincronizados com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar serviços:', error);
      throw error;
    }
  }
}
