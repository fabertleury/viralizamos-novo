'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { CreditCardIcon } from '@heroicons/react/24/solid';

interface ScrapAPIBalanceCardProps {
  className?: string;
}

export const ScrapAPIBalanceCard: React.FC<ScrapAPIBalanceCardProps> = ({ className = '' }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch('/api/scrapecreators/credit-balance');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar saldo da ScrapAPI');
      }
      
      const now = new Date();
      setBalance(data.creditCount);
      setLastUpdated(now);
      
      // Salvar no localStorage
      localStorage.setItem('scrapAPIBalanceData', JSON.stringify({
        balance: data.creditCount,
        lastUpdated: now.toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar saldo da ScrapAPI:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Verificar se já temos dados no localStorage
    const storedData = localStorage.getItem('scrapAPIBalanceData');
    let shouldFetch = true;
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const lastChecked = new Date(parsedData.lastUpdated);
        const now = new Date();
        
        // Diferença em milissegundos
        const diffTime = Math.abs(now.getTime() - lastChecked.getTime());
        // Diferença em dias
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Se foi atualizado há menos de 2 dias, usar o valor armazenado
        if (diffDays < 2) {
          console.log('Usando dados do cache (menos de 2 dias)');
          setBalance(parsedData.balance);
          setLastUpdated(new Date(parsedData.lastUpdated));
          setLoading(false);
          shouldFetch = false;
        }
      } catch (e) {
        console.error('Erro ao parsear dados do localStorage:', e);
      }
    }
    
    // Se não temos dados ou eles estão desatualizados, buscar novos
    if (shouldFetch) {
      fetchBalance();
    }
  }, []);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(date);
  };

  return (
    <Card className={`bg-white shadow-md p-5 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Créditos ScrapAPI
        </h3>
        <button 
          onClick={fetchBalance}
          disabled={refreshing}
          className={`text-sm flex items-center ${refreshing ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-900'}`}
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      
      {loading && !refreshing ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm mt-2">
          <p>Erro ao buscar saldo: {error}</p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-indigo-700">{balance}</span>
              <span className="ml-2 text-gray-500 text-sm">créditos disponíveis</span>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-gray-500 mt-3">
                Última atualização: {formatDate(lastUpdated)}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}; 