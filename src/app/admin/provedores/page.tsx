'use client';

import React, { useState, useEffect } from 'react';
import ProviderFormModal from './components/ProviderFormModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowPathIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  api_key: string;
  api_url: string;
  status: boolean;
  metadata: {
    last_check?: string;
    balance?: number;
    currency?: string;
    api_status?: 'online' | 'inactive' | 'error' | 'checking' | 'active';
    api_error?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ProvidersPage() {
  const supabase = createClientComponentClient();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este provedor?')) return;

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProviders();
    } catch (error) {
      console.error('Erro ao excluir provedor:', error);
    }
  };

  const checkProviderApi = async (provider: Provider) => {
    try {
      // Atualizar o status da API para 'checking'
      await supabase
        .from('providers')
        .update({
          metadata: {
            ...provider.metadata,
            api_status: 'checking',
            last_check: new Date().toISOString()
          }
        })
        .eq('id', provider.id);
      
      // Fazer uma requisição para a API do provedor
      const formData = new URLSearchParams();
      formData.append('key', provider.api_key);
      formData.append('action', 'balance'); // Muitos provedores suportam 'balance' para verificar o saldo
      
      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
      }
      
      // Tentar processar a resposta
      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('Resposta não é um JSON válido');
      }
      
      // Verificar se a resposta contém informações de saldo
      let balance = null;
      let currency = null;
      
      if (data.balance) {
        balance = parseFloat(data.balance);
        currency = data.currency || 'USD';
      } else if (typeof data === 'object' && data !== null) {
        // Tentar encontrar um campo que pareça ser o saldo
        const possibleBalanceFields = ['balance', 'funds', 'credit', 'credits', 'amount'];
        for (const field of possibleBalanceFields) {
          if (data[field] !== undefined) {
            balance = parseFloat(data[field]);
            break;
          }
        }
      }
      
      // Atualizar o status da API para 'active' (mantendo compatibilidade com registros existentes)
      await supabase
        .from('providers')
        .update({
          metadata: {
            ...provider.metadata,
            api_status: 'active',
            balance,
            currency,
            last_check: new Date().toISOString(),
            api_error: null
          }
        })
        .eq('id', provider.id);
      
      // Atualizar a lista de provedores
      fetchProviders();
      
    } catch (error) {
      console.error('Erro ao verificar API:', error);
      
      // Atualizar o status da API para 'error'
      await supabase
        .from('providers')
        .update({
          metadata: {
            ...provider.metadata,
            api_status: 'error',
            last_check: new Date().toISOString(),
            api_error: error.message
          }
        })
        .eq('id', provider.id);
      
      // Atualizar a lista de provedores
      fetchProviders();
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Provedores</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os provedores de serviços e suas APIs.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedProvider(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Adicionar Provedor
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      URL
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Saldo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status API
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {providers.map((provider) => (
                    <tr key={provider.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {provider.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {provider.api_url}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {provider.metadata?.currency || 'BRL'} {typeof provider.metadata?.balance === 'number' ? provider.metadata.balance.toFixed(2) : '0.00'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          provider.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          provider.metadata?.api_status === 'online' || provider.metadata?.api_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : provider.metadata?.api_status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : provider.metadata?.api_status === 'checking'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.metadata?.api_status === 'online' || provider.metadata?.api_status === 'active'
                            ? 'Online'
                            : provider.metadata?.api_status === 'error'
                            ? 'Erro'
                            : provider.metadata?.api_status === 'checking'
                            ? 'Verificando'
                            : 'Inativo'}
                        </span>
                        {provider.metadata?.api_error && (
                          <span className="block text-xs text-red-500 mt-1" title={provider.metadata.api_error}>
                            {provider.metadata.api_error.length > 30
                              ? provider.metadata.api_error.substring(0, 30) + '...'
                              : provider.metadata.api_error}
                          </span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(provider)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => checkProviderApi(provider)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Verificar API"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ProviderFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProvider(undefined);
        }}
        onSuccess={fetchProviders}
        provider={selectedProvider}
      />
    </div>
  );
}
