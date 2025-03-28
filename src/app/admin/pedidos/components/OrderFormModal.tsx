'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Provider {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
}

interface Category {
  id: string;
  name: string;
  social_id: string;
}

interface Service {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
}

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: {
    id: string;
    provider_id: string;
    category_id: string;
    service_id: string;
    name: string;
    type: string;
    rate: number;
    min: number;
    max: number;
    refill: boolean;
  };
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSuccess,
  order
}: OrderFormModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [apiServices, setApiServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [formData, setFormData] = useState({
    provider_id: order?.provider_id || '',
    category_id: order?.category_id || '',
    service_id: order?.service_id || '',
    name: order?.name || '',
    type: order?.type || '',
    rate: order?.rate || 0,
    min: order?.min || 0,
    max: order?.max || 0,
    refill: order?.refill || false,
    is_api_service: false
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('status', true)
          .order('name');
        
        if (error) throw error;
        setProviders(data || []);
      } catch (err) {
        console.error('Erro ao carregar provedores:', err);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    };

    fetchCategories();
  }, []);

  const fetchApiServices = async (provider: Provider) => {
    setLoadingServices(true);
    setApiServices([]);
    try {
      const response = await fetch('/api/providers/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_url: provider.api_url,
          api_key: provider.api_key
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setApiServices(data.services || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value;
    setFormData(prev => ({
      ...prev,
      provider_id: providerId,
      service_id: '', // Reset service when provider changes
      name: '',
      type: '',
      rate: 0,
      min: 0,
      max: 0,
      refill: false
    }));

    if (providerId && formData.is_api_service) {
      const provider = providers.find(p => p.id === providerId);
      if (provider) {
        await fetchApiServices(provider);
      }
    }
  };

  const handleServiceSelect = (service: Service) => {
    setFormData(prev => ({
      ...prev,
      service_id: service.service.toString(),
      name: service.name,
      type: service.type,
      rate: parseFloat(service.rate),
      min: parseInt(service.min),
      max: parseInt(service.max),
      refill: service.refill
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (order) {
        // Atualizar pedido existente
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo pedido
        const { error: insertError } = await supabase
          .from('orders')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  {order ? 'Editar Pedido' : 'Novo Pedido'}
                </h3>

                <div className="mt-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="provider_id" className="block text-sm font-medium leading-6 text-gray-900">
                        Provedor
                      </label>
                      <select
                        id="provider_id"
                        name="provider_id"
                        value={formData.provider_id}
                        onChange={handleProviderChange}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Selecione um provedor</option>
                        {providers.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium leading-6 text-gray-900">
                        Categoria
                      </label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="is_api_service"
                          name="is_api_service"
                          type="checkbox"
                          checked={formData.is_api_service}
                          onChange={(e) => {
                            const isApi = e.target.checked;
                            setFormData(prev => ({ 
                              ...prev, 
                              is_api_service: isApi,
                              service_id: '',
                              name: '',
                              type: '',
                              rate: 0,
                              min: 0,
                              max: 0,
                              refill: false
                            }));
                            if (isApi && formData.provider_id) {
                              const provider = providers.find(p => p.id === formData.provider_id);
                              if (provider) {
                                fetchApiServices(provider);
                              }
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor="is_api_service" className="font-medium text-gray-900">
                          Buscar serviços da API
                        </label>
                      </div>
                    </div>

                    {formData.is_api_service ? (
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Serviços Disponíveis
                        </label>
                        <div className="mt-2 border rounded-md divide-y">
                          {loadingServices ? (
                            <div className="p-4 text-center text-gray-500">
                              Carregando serviços...
                            </div>
                          ) : apiServices.length > 0 ? (
                            apiServices.map(service => (
                              <div
                                key={service.service}
                                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                  formData.service_id === service.service.toString()
                                    ? 'bg-indigo-50'
                                    : ''
                                }`}
                                onClick={() => handleServiceSelect(service)}
                              >
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-gray-500">
                                  Tipo: {service.type} | Preço: ${service.rate} |
                                  Min: {service.min} | Max: {service.max} |
                                  Reposição: {service.refill ? 'Sim' : 'Não'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              {formData.provider_id
                                ? 'Nenhum serviço encontrado'
                                : 'Selecione um provedor para ver os serviços'}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Nome do Serviço
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div>
                          <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">
                            Tipo
                          </label>
                          <input
                            type="text"
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="rate" className="block text-sm font-medium leading-6 text-gray-900">
                              Preço
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              name="rate"
                              id="rate"
                              value={formData.rate}
                              onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                              required
                              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>

                          <div>
                            <label htmlFor="min" className="block text-sm font-medium leading-6 text-gray-900">
                              Mínimo
                            </label>
                            <input
                              type="number"
                              name="min"
                              id="min"
                              value={formData.min}
                              onChange={(e) => setFormData(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                              required
                              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>

                          <div>
                            <label htmlFor="max" className="block text-sm font-medium leading-6 text-gray-900">
                              Máximo
                            </label>
                            <input
                              type="number"
                              name="max"
                              id="max"
                              value={formData.max}
                              onChange={(e) => setFormData(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                              required
                              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="relative flex items-start">
                          <div className="flex h-6 items-center">
                            <input
                              id="refill"
                              name="refill"
                              type="checkbox"
                              checked={formData.refill}
                              onChange={(e) => setFormData(prev => ({ ...prev, refill: e.target.checked }))}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                          </div>
                          <div className="ml-3 text-sm leading-6">
                            <label htmlFor="refill" className="font-medium text-gray-900">
                              Permite Reposição
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
