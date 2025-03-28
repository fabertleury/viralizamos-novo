'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: Provider | null;
}

export function ServiceSelectionModal({ 
  isOpen, 
  onClose, 
  selectedProvider
}: ServiceSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && selectedProvider) {
      console.log('ServiceSelectionModal aberto com provedor:', selectedProvider);
      fetchServices();
    } else if (isOpen && !selectedProvider) {
      console.error('ServiceSelectionModal aberto sem provedor selecionado');
      toast.error('Nenhum provedor selecionado');
      onClose();
    }
  }, [isOpen, selectedProvider]);

  const fetchServices = async () => {
    if (!selectedProvider) {
      toast.error('Nenhum provedor selecionado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setServices([]);

      // Fazer a chamada para a API do provedor para buscar todos os serviços
      const response = await fetch(`/api/providers/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: selectedProvider })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar serviços: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setServices(data.services || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError(`Erro ao buscar serviços: ${error.message}`);
      toast.error(`Erro ao buscar serviços: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: any) => {
    if (!selectedProvider) {
      toast.error('Nenhum provedor selecionado');
      return;
    }

    try {
      // Salvar o serviço selecionado no localStorage
      const serviceData = {
        ...service,
        provider: selectedProvider
      };
      
      localStorage.setItem('selectedService', JSON.stringify(serviceData));
      localStorage.setItem('selectedProvider', JSON.stringify(selectedProvider));
      
      // Fechar o modal e redirecionar para a página de criação
      onClose();
      router.push('/admin/servicos_v1/criar');
      
      toast.success('Serviço selecionado com sucesso!');
    } catch (error) {
      console.error('Erro ao selecionar serviço:', error);
      toast.error(`Erro ao selecionar serviço: ${error.message}`);
    }
  };

  const filteredServices = searchTerm.trim() === '' 
    ? services 
    : services.filter(service => 
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const renderServicesList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2">Carregando serviços...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchServices}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (services.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum serviço encontrado para este provedor.</p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="ml-2">
            <span className="text-sm text-gray-500">{filteredServices.length} serviços</span>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredServices.map((service, index) => (
            <div 
              key={`${service.service}-${index}`}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleSelectService(service)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{service.service}</p>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium text-indigo-600">
                    {service.rate ? `${service.rate} ${service.currency || 'BRL'}` : 'Preço variável'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Min: {service.min} | Max: {service.max}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Selecionar Serviço</DialogTitle>
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
                        : selectedProvider.metadata.balance
                    }
                  </span>
                )}
              </div>
            </div>
          ) : (
            <DialogDescription>
              Selecione um provedor para continuar
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {renderServicesList()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
