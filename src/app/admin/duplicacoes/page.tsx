'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '@/lib/transactions/modules/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface PostDuplication {
  id: string;
  transaction_id: string;
  post_code: string;
  original_post: Post;
  duplicate_post: Post;
  created_at: string;
  status: 'detected' | 'resolved';
  resolved_at?: string;
  resolution_note?: string;
}

interface DuplicationLog {
  id: string;
  transaction_id: string;
  level: string;
  message: string;
  metadata: {
    link?: string;
    target_username?: string;
    timestamp?: string;
    duplicate_prevention?: boolean;
    existing_order_id?: string;
  };
  created_at: string;
}

export default function DuplicacoesPage() {
  const [duplicacoes, setDuplicacoes] = useState<PostDuplication[]>([]);
  const [duplicacaoLogs, setDuplicacaoLogs] = useState<DuplicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadDuplicacoes(),
      loadDuplicacaoLogs()
    ]);
    setLoading(false);
  };

  const loadDuplicacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('post_duplications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDuplicacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar duplicações:', error);
    }
  };

  const loadDuplicacaoLogs = async () => {
    try {
      // Primeiro, tentamos buscar usando ilike em campos JSON para evitar erros
      const { data: logs, error } = await supabase
        .from('transaction_logs')
        .select('*')
        .ilike('message', '%duplica%')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.warn('Erro na primeira consulta de logs:', error);
        throw error;
      }
      
      // Se a primeira consulta for bem-sucedida, tentamos enriquecer os resultados
      try {
        // Buscar também logs com outras mensagens relacionadas
        const { data: additionalLogs, error: additionalError } = await supabase
          .from('transaction_logs')
          .select('*')
          .or('message.ilike.%já existe%,message.ilike.%já foi enviado%')
          .order('created_at', { ascending: false })
          .limit(30);
        
        if (!additionalError && additionalLogs) {
          // Combinar os resultados
          const allLogs = [...(logs || []), ...additionalLogs];
          // Remover duplicatas
          const uniqueLogs = allLogs.filter((log, index, self) => 
            index === self.findIndex((l) => l.id === log.id)
          );
          
          setDuplicacaoLogs(uniqueLogs);
          return;
        }
      } catch (enrichError) {
        console.warn('Erro ao enriquecer resultados:', enrichError);
        // Continuar com os logs que já temos
      }
      
      // Se chegamos aqui, usamos apenas os resultados da primeira consulta
      setDuplicacaoLogs(logs || []);
      
    } catch (error) {
      console.error('Erro ao carregar logs de duplicação:', error);
      
      // Abordagem de fallback mais simples e robusta
      try {
        const { data } = await supabase
          .from('transaction_logs')
          .select('id, transaction_id, message, created_at, level')
          .order('created_at', { ascending: false })
          .limit(20);
        
        setDuplicacaoLogs(data || []);
      } catch (fallbackError) {
        console.error('Erro no fallback para carregar logs:', fallbackError);
        setDuplicacaoLogs([]);
      }
    }
  };

  const handleResolveDuplication = async (id: string, note: string) => {
    try {
      const { error } = await supabase
        .from('post_duplications')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_note: note
        })
        .eq('id', id);

      if (error) throw error;
      loadDuplicacoes();
    } catch (error) {
      console.error('Erro ao resolver duplicação:', error);
    }
  };

  const verTransacao = (transactionId: string) => {
    window.open(`/admin/transacoes/${transactionId}`, '_blank');
  };

  const verPedido = (orderId: string | undefined) => {
    if (orderId) {
      window.open(`/admin/pedidos/${orderId}`, '_blank');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Monitoramento de Duplicações</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="posts">Duplicações de Posts</TabsTrigger>
          <TabsTrigger value="logs">Duplicações Evitadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <div className="grid gap-4">
            {duplicacoes.map((dup) => (
              <Card key={dup.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Duplicação #{dup.id.slice(0, 8)}
                    </CardTitle>
                    <Badge variant={dup.status === 'resolved' ? 'default' : 'destructive'}>
                      {dup.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Post Original</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Link:</strong>{' '}
                          <a 
                            href={dup.original_post.postLink || dup.original_post.url || dup.original_post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {dup.original_post.postLink || dup.original_post.url || dup.original_post.link}
                          </a>
                        </p>
                        <p className="text-sm">
                          <strong>Código:</strong> {dup.post_code}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Post Duplicado</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Link:</strong>{' '}
                          <a 
                            href={dup.duplicate_post.postLink || dup.duplicate_post.url || dup.duplicate_post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {dup.duplicate_post.postLink || dup.duplicate_post.url || dup.duplicate_post.link}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>
                        <strong>Data de Detecção:</strong>{' '}
                        {format(new Date(dup.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {dup.resolved_at && (
                        <p>
                          <strong>Data de Resolução:</strong>{' '}
                          {format(new Date(dup.resolved_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                      {dup.resolution_note && (
                        <p>
                          <strong>Nota de Resolução:</strong> {dup.resolution_note}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => verTransacao(dup.transaction_id)}
                      >
                        Ver Transação
                      </Button>
                      
                      {dup.status === 'detected' && (
                        <Button
                          onClick={() => {
                            const note = prompt('Adicione uma nota sobre a resolução:');
                            if (note) {
                              handleResolveDuplication(dup.id, note);
                            }
                          }}
                        >
                          Marcar como Resolvido
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {duplicacoes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma duplicação encontrada
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <div className="grid gap-4">
            {duplicacaoLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Duplicação Evitada
                    </CardTitle>
                    <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">
                      {log.metadata && log.metadata.existing_order_id ? 'Já existe pedido' : 'Já enviado ao provedor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                      <p className="text-sm font-medium text-amber-800">{log.message || 'Duplicação detectada'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Detalhes do Link</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          {log.metadata && log.metadata.link ? (
                            <>
                              <p className="text-sm flex items-center">
                                <LinkIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <a 
                                  href={log.metadata.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate"
                                >
                                  {log.metadata.link}
                                </a>
                                <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                              </p>
                              {log.metadata.target_username && (
                                <p className="text-sm mt-1">
                                  <strong>Username:</strong> {log.metadata.target_username}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Link não disponível nos metadados</p>
                          )}
                          
                          <p className="text-sm mt-1">
                            <strong>Detectado em:</strong>{' '}
                            {log.metadata && log.metadata.timestamp 
                              ? format(new Date(log.metadata.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
                              : format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 text-sm">Ações</h3>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => verTransacao(log.transaction_id)}
                          >
                            Ver Transação
                          </Button>
                          
                          {log.metadata && log.metadata.existing_order_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => verPedido(log.metadata.existing_order_id)}
                            >
                              Ver Pedido Existente
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>
                        <strong>ID do Log:</strong> {log.id}
                      </p>
                      <p>
                        <strong>Criado em:</strong>{' '}
                        {format(new Date(log.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {duplicacaoLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma tentativa de duplicação detectada nos logs
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sobre a Prevenção de Duplicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>Esta página monitora dois tipos de duplicações:</p>
              
              <ul>
                <li>
                  <strong>Duplicações de Posts</strong> - Posts diferentes que apontam para o mesmo conteúdo e poderiam
                  levar a uma duplicação no envio.
                </li>
                <li>
                  <strong>Duplicações Evitadas</strong> - Tentativas de envio do mesmo pedido mais de uma vez para o provedor.
                  Estas são automaticamente bloqueadas pelo sistema.
                </li>
              </ul>
              
              <p>O sistema implementa proteções em múltiplas camadas:</p>
              
              <ol>
                <li>Deduplicação de posts na seleção do cliente</li>
                <li>Verificação em tempo real durante o processamento</li>
                <li>Validação contra registros históricos</li>
                <li>Verificação final no provedor</li>
              </ol>
              
              <p>
                Quando uma duplicação é detectada, o sistema bloqueia automaticamente o envio duplicado e registra
                o evento nos logs. Esta página permite acompanhar essas ocorrências e tomar ações quando necessário.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 