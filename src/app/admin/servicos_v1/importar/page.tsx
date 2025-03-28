'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface FamaService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
}

export default function ImportarServicoPage() {
  const router = useRouter();
  const [services, setServices] = useState<FamaService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<FamaService | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de serviços');
      console.log('Fazendo requisição para /api/fama-services');
      
      const response = await axios.post('/api/fama-services', {
        action: 'services'
      });

      console.group('Fama Redes Services Debug');
      console.log('Services Response:', response.data);
      console.groupEnd();

      setServices(response.data);
    } catch (error) {
      console.error('Erro completo ao buscar serviços:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro Axios:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          message: error.message
        });

        toast.error(`Erro na API: ${error.response?.data?.error || error.message}`)
      } else {
        toast.error('Erro desconhecido ao buscar serviços');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSelect = (service: FamaService) => {
    setSelectedService(service);
  };

  const handleImportService = () => {
    if (!selectedService) {
      toast.warning('Selecione um serviço para importar');
      return;
    }

    // Redirecionar para página de edição com o ID do serviço
    router.push(`/admin/servicos_v1/importar/editar/${selectedService.service}`);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Importar Serviços - Fama Redes</h1>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <span>Carregando serviços...</span>
        </div>
      ) : (
        <div>
          {services.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 w-12">Sel.</th>
                      <th className="border p-2 w-48">Nome</th>
                      <th className="border p-2 w-24">Tipo</th>
                      <th className="border p-2 w-36">Categoria</th>
                      <th className="border p-2 w-24">Preço</th>
                      <th className="border p-2 w-36">Min/Max</th>
                      <th className="border p-2 w-24">Refilável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr 
                        key={service.service} 
                        className={`cursor-pointer hover:bg-blue-50 ${
                          selectedService?.service === service.service 
                            ? 'bg-blue-100' 
                            : ''
                        }`}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <td className="border p-2 text-center">
                          <input 
                            type="radio" 
                            name="serviceSelect"
                            checked={selectedService?.service === service.service}
                            onChange={() => handleServiceSelect(service)}
                          />
                        </td>
                        <td className="border p-2">{service.name}</td>
                        <td className="border p-2">{service.type}</td>
                        <td className="border p-2">{service.category}</td>
                        <td className="border p-2">R$ {service.rate}</td>
                        <td className="border p-2">{service.min} - {service.max}</td>
                        <td className="border p-2 text-center">
                          {service.refill ? '✅' : '❌'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={handleImportService}
                disabled={!selectedService}
                className={`w-full p-2 rounded transition ${
                  selectedService 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedService 
                  ? `Importar Serviço: ${selectedService.name}` 
                  : 'Selecione um Serviço'}
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Nenhum serviço encontrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
