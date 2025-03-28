'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface Lock {
  resource_id: string;
  acquired_at: string;
  expires_at: string;
  metadata?: any;
}

export default function CheckLocksPage() {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaningExpired, setCleaningExpired] = useState(false);
  const supabase = createClient();

  const fetchLocks = async () => {
    setLoading(true);
    try {
      // Tentar buscar os locks diretamente, com tratamento de erro robusto
      try {
        const { data, error } = await supabase
          .from('locks')
          .select('*')
          .order('acquired_at', { ascending: false });

        if (error) {
          // Se o erro for que a tabela não existe
          if (error.code === '42P01') { // código PostgreSQL para relação não existe
            console.warn('Tabela locks não existe:', error);
            setLocks([]);
            toast.warning('A tabela de locks ainda não foi criada. Execute a migração primeiro.');
          } else {
            console.error('Erro ao buscar locks:', error);
            toast.error('Erro ao buscar locks');
          }
          return;
        }

        setLocks(data || []);
      } catch (error) {
        console.error('Erro ao buscar locks:', error);
        setLocks([]);
        toast.error('Erro ao buscar informações de locks');
      }
    } finally {
      setLoading(false);
    }
  };

  const cleanExpiredLocks = async () => {
    setCleaningExpired(true);
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_locks');

      if (error) {
        console.error('Erro ao limpar locks expirados:', error);
        toast.error('Erro ao limpar locks expirados');
        return;
      }

      toast.success(`${data} locks expirados foram removidos`);
      fetchLocks();
    } catch (error) {
      console.error('Erro inesperado ao limpar locks:', error);
      toast.error('Erro inesperado ao limpar locks expirados');
    } finally {
      setCleaningExpired(false);
    }
  };

  const deleteLock = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('locks')
        .delete()
        .eq('resource_id', resourceId);

      if (error) {
        console.error('Erro ao excluir lock:', error);
        toast.error('Erro ao excluir lock');
        return;
      }

      toast.success('Lock removido com sucesso');
      fetchLocks();
    } catch (error) {
      console.error('Erro inesperado ao excluir lock:', error);
      toast.error('Erro inesperado ao excluir lock');
    }
  };

  useEffect(() => {
    fetchLocks();

    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchLocks, 10000);
    return () => clearInterval(interval);
  }, []);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  // Verifica se um lock está expirado
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de Locks</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie locks de transações para evitar processamento concorrente
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLocks} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={cleanExpiredLocks}
            disabled={cleaningExpired}
          >
            <Trash className="h-4 w-4 mr-2" />
            Limpar Expirados
          </Button>
        </div>
      </div>

      {locks.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">Nenhum lock encontrado no sistema</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {locks.map((lock) => (
            <Card 
              key={lock.resource_id} 
              className={isExpired(lock.expires_at) ? 'border-amber-200' : ''}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    Lock: {lock.resource_id}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteLock(lock.resource_id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Adquirido em</p>
                    <p className="text-sm">{formatDate(lock.acquired_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expira em</p>
                    <p className={`text-sm ${isExpired(lock.expires_at) ? 'text-amber-600 font-medium' : ''}`}>
                      {formatDate(lock.expires_at)}
                      {isExpired(lock.expires_at) && ' (Expirado)'}
                    </p>
                  </div>
                </div>
                
                {lock.metadata && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Metadados</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                      {JSON.stringify(lock.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 