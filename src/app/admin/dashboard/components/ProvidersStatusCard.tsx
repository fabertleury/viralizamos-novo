'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Provider {
  id: string;
  name: string;
  slug: string;
  api_url: string;
  api_key: string;
  status: boolean;
  metadata: {
    last_check?: string;
    balance?: number;
    currency?: string;
    api_status?: 'active' | 'inactive' | 'error';
    api_error?: string;
  };
}

export const ProvidersStatusCard = () => {
  const supabase = createClientComponentClient();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});

  // Buscar todos os provedores
  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao buscar provedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status de um provedor específico
  const checkProviderStatus = async (provider: Provider) => {
    try {
      setRefreshing(prev => ({ ...prev, [provider.id]: true }));
      
      // Faz a requisição através da API route
      const response = await fetch('/api/providers/check-status', {
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
      
      // Atualiza o status no banco
      const { error } = await supabase
        .from('providers')
        .update({
          metadata: {
            ...provider.metadata,
            last_check: new Date().toISOString(),
            api_status: data.success ? 'active' : 'error',
            api_error: data.error,
            balance: typeof data.balance === 'number' ? data.balance : parseFloat(data.balance) || provider.metadata?.balance || 0,
            currency: data.currency || 'BRL'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', provider.id);

      if (error) throw error;
      
      // Atualiza a lista de provedores
      fetchProviders();
    } catch (error) {
      console.error('Erro ao verificar status do provedor:', error);
    } finally {
      setRefreshing(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  // Verificar status de todos os provedores
  const checkAllProviders = async () => {
    for (const provider of providers) {
      await checkProviderStatus(provider);
    }
  };

  useEffect(() => {
    fetchProviders();
    
    // Verificar status a cada 5 minutos
    const intervalId = setInterval(() => {
      checkAllProviders();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusIcon = (provider: Provider) => {
    const status = provider.metadata?.api_status;
    
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getLastChecked = (provider: Provider) => {
    if (!provider.metadata?.last_check) return 'Nunca verificado';
    
    try {
      const date = new Date(provider.metadata.last_check);
      // Formatar para horário de Brasília (UTC-3)
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }).format(date);
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Status dos Provedores de API
        </h3>
        <button 
          onClick={checkAllProviders}
          className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Verificar Todos
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">Nenhum provedor cadastrado</div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {providers.map(provider => (
            <div key={provider.id} className="border rounded-md p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {getStatusIcon(provider)}
                  <span className="ml-2 font-medium">{provider.name}</span>
                </div>
                <button
                  onClick={() => checkProviderStatus(provider)}
                  disabled={refreshing[provider.id]}
                  className={`text-xs ${refreshing[provider.id] ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-900'}`}
                >
                  {refreshing[provider.id] ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
              <div className="mt-2 text-sm">
                <div className="flex flex-col md:flex-row md:justify-between text-gray-500">
                  <span>Saldo: {provider.metadata?.currency || 'BRL'} {typeof provider.metadata?.balance === 'number' ? provider.metadata.balance.toFixed(2) : '0.00'}</span>
                  <span className="text-xs mt-1 md:mt-0">Última verificação: {getLastChecked(provider)}</span>
                </div>
                {provider.metadata?.api_error && (
                  <div className="mt-1 text-red-500 text-xs">
                    Erro: {provider.metadata.api_error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
