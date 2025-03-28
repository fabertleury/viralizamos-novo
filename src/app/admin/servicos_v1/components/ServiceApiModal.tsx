'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ServiceApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedProvider: Provider | null;
}

export function ServiceApiModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  selectedProvider
}: ServiceApiModalProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen && selectedProvider) {
      console.log('ServiceApiModal aberto com provedor:', selectedProvider);
      fetchCategories();
    } else if (isOpen && !selectedProvider) {
      console.error('ServiceApiModal aberto sem provedor selecionado');
      toast.error('Nenhum provedor selecionado');
      onClose();
    }
  }, [isOpen, selectedProvider]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedProvider) {
        setError('Nenhum provedor selecionado');
        return;
      }
      
      console.log('Buscando serviços do provedor:', selectedProvider);
      
      // Verificar se o provedor tem API URL e API Key
      if (!selectedProvider.api_url) {
        setError('URL da API não configurada para este provedor');
        return;
      }
      
      const response = await fetch('/api/providers/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: selectedProvider })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro na resposta da API:', data);
        setError(data.error || 'Erro ao buscar serviços');
        return;
      }
      
      if (!data.services || !Array.isArray(data.services)) {
        console.error('Resposta inválida da API:', data);
        setError('Formato de resposta inválido');
        return;
      }
      
      console.log(`${data.services.length} serviços encontrados`);
      
      // Mapear os serviços para o formato esperado
      const mappedServices = data.services.map((service: any) => {
        // Tentar extrair os campos comuns
        const id = service.service || service.id || service.ID || '';
        const name = service.name || service.service_name || service.title || '';
        const category = service.category || service.type || '';
        const rate = service.rate || service.price || service.cost || 0;
        const min = service.min || service.minimum || 0;
        const max = service.max || service.maximum || 0;
        
        return {
          id,
          name,
          category,
          rate: parseFloat(rate),
          min: parseInt(min),
          max: parseInt(max),
          original: service // Manter os dados originais
        };
      });
      
      setServices(mappedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError(`Erro ao buscar serviços: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportService = async (service: any) => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (!selectedProvider) {
      toast.error('Nenhum provedor selecionado');
      return;
    }

    try {
      // Extrair os campos do serviço com fallbacks para diferentes formatos de API
      const serviceId = service.id || service.service || service.service_id;
      const serviceName = service.name || service.service_name || service.title || `Serviço ${serviceId}`;
      const serviceDescription = service.description || service.details || '';
      const servicePrice = parseFloat(service.price || service.rate || service.cost || 0);
      const serviceMin = parseInt(service.min || service.minimum || service.min_order || 1);
      const serviceMax = parseInt(service.max || service.maximum || service.max_order || 10000);
      const serviceType = service.type || service.category || 'default';
      
      // Criar o serviço no Supabase
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            name: serviceName,
            descricao: serviceDescription,
            type: serviceType,
            categoria: selectedCategory,
            preco: servicePrice,
            quantidade: serviceMin,
            min_order: serviceMin,
            max_order: serviceMax,
            status: true,
            provider_id: selectedProvider.id,
            external_id: serviceId,
            metadata: {
              original_data: service,
              provider_slug: selectedProvider.slug,
              imported_at: new Date().toISOString()
            }
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao importar serviço:', error);
        throw error;
      }

      toast.success(`Serviço "${serviceName}" importado com sucesso!`);
      
      // Remover o serviço da lista para evitar duplicação
      setServices(services.filter((s: any) => 
        (s.id || s.service || s.service_id) !== serviceId
      ));
      
      return data;
    } catch (error) {
      console.error('Erro ao importar serviço:', error);
      toast.error(`Erro ao importar serviço: ${error.message}`);
      return null;
    }
  };

  const handleImportAllServices = async () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (!selectedProvider) {
      toast.error('Nenhum provedor selecionado');
      return;
    }

    if (services.length === 0) {
      toast.error('Não há serviços para importar');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Mostrar toast de início
      toast.info(`Iniciando importação de ${services.length} serviços...`);
      
      // Processar em lotes de 10 para não sobrecarregar
      const batchSize = 10;
      const totalBatches = Math.ceil(services.length / batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, services.length);
        const batch = services.slice(start, end);
        
        // Importar serviços em paralelo
        const results = await Promise.all(
          batch.map(service => handleImportService(service).catch(() => null))
        );
        
        // Contar sucessos e erros
        const batchSuccesses = results.filter(result => result !== null).length;
        successCount += batchSuccesses;
        errorCount += (batch.length - batchSuccesses);
        
        // Atualizar progresso
        toast.info(`Importados ${successCount} de ${services.length} serviços...`);
      }
      
      // Mostrar resultado final
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} serviços importados com sucesso!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} serviços importados com sucesso, ${errorCount} falhas.`);
      } else {
        toast.error(`Falha ao importar serviços. Nenhum serviço importado.`);
      }
      
      // Fechar o modal se tudo foi importado com sucesso
      if (errorCount === 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao importar todos os serviços:', error);
      toast.error(`Erro ao importar serviços: ${error.message}`);
    }
  };

  const renderServiceList = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Carregando serviços...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Erro ao buscar serviços</p>
          <p className="mt-1 text-gray-600">{error}</p>
          <Button 
            onClick={fetchServices} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum serviço encontrado. Clique no botão abaixo para buscar serviços.</p>
          <Button 
            onClick={fetchServices} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Buscar Serviços
          </Button>
        </div>
      );
    }

    return (
      <div className="max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {services.map((service: any, index: number) => {
            // Tentar extrair os campos mais comuns
            const id = service.id || service.service || service.service_id || index;
            const name = service.name || service.service_name || service.title || service.description || `Serviço ${id}`;
            const description = service.description || service.details || '';
            const price = service.price || service.rate || service.cost || 0;
            const min = service.min || service.minimum || service.min_order || 1;
            const max = service.max || service.maximum || service.max_order || 1000;
            
            return (
              <div 
                key={id}
                className="border p-3 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => handleImportService(service)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{name}</h3>
                    {description && (
                      <p className="text-xs text-gray-500 mt-1">{description}</p>
                    )}
                    <div className="flex space-x-4 mt-2 text-xs text-gray-600">
                      <span>Min: {min}</span>
                      <span>Max: {max}</span>
                      {price > 0 && <span>Preço: {price}</span>}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImportService(service);
                    }}
                  >
                    Importar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Importar Serviços via API</DialogTitle>
          {selectedProvider ? (
            <div className="mt-2">
              <p className="font-medium text-indigo-600">{selectedProvider.name}</p>
              <p className="text-sm text-gray-500">{selectedProvider.api_url}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex rounded-full h-2 w-2 mr-2 ${
                  selectedProvider.metadata?.api_status === 'active' || 
                  selectedProvider.metadata?.api_status === 'online'
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}></span>
                <span className="text-xs text-gray-500">
                  {selectedProvider.metadata?.api_status === 'active' || 
                   selectedProvider.metadata?.api_status === 'online'
                    ? 'API Online'
                    : 'Status da API desconhecido'}
                </span>
                {selectedProvider.metadata?.balance !== undefined && (
                  <span className="text-xs text-gray-500 ml-4">
                    Saldo: {selectedProvider.metadata.currency || 'BRL'} {
                      typeof selectedProvider.metadata.balance === 'number' 
                        ? selectedProvider.metadata.balance.toFixed(2) 
                        : '0.00'
                    }
                  </span>
                )}
              </div>
            </div>
          ) : (
            <DialogDescription>
              Selecione um provedor para importar serviços.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Categoria</Label>
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={fetchServices}
              disabled={loading || !selectedProvider}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Buscar Serviços'
              )}
            </Button>
          </div>

          {services.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Serviços Disponíveis ({services.length})</h3>
                <Button 
                  onClick={handleImportAllServices}
                  disabled={loading || !selectedCategory}
                >
                  Importar Todos
                </Button>
              </div>
              {renderServiceList()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
