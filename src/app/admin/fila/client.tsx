"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowPathIcon as ReloadIcon, 
  ClockIcon as TimerIcon, 
  PlayIcon, 
  StopIcon, 
  ExclamationTriangleIcon as TriangleAlertIcon,
  CheckCircleIcon, 
  InformationCircleIcon as InfoIcon, 
  ArrowUpIcon 
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
interface QueueStats {
  status: string;
  count: number;
  avg_priority: number;
  oldest_item: string;
  newest_item: string;
}

interface QueueItem {
  id: string;
  transaction_id: string;
  transaction_status: string;
  service_name: string;
  provider_name: string;
  post_code: string;
  post_url: string;
  status: string;
  status_display: string;
  priority: number;
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  minutes_waiting: number;
  transaction_customer_name: string | null;
  transaction_customer_email: string | null;
  total_count: number;
}

export default function QueueClient() {
  const supabase = createClient();
  const [stats, setStats] = useState<QueueStats[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Função para carregar estatísticas da fila
  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_queue_stats');
      
      if (error) throw error;
      
      // Se não houver dados, criar um array vazio
      setStats(data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [supabase]);
  
  // Função para carregar itens da fila
  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      
      // Aplicar filtro de status
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Aplicar filtro de busca se tiver pelo menos 3 caracteres
      if (searchTerm && searchTerm.length >= 3) {
        filters.search = searchTerm;
      }
      
      // Verifique se a função admin_get_order_queue existe
      try {
        const { error: functionCheckError } = await supabase
          .rpc('admin_get_order_queue', {
            p_page: 1,
            p_page_size: 1,
            p_status: null,
            p_search: null
          });
          
        if (functionCheckError) {
          console.error('Erro ao verificar função admin_get_order_queue:', functionCheckError.message);
          setQueue([]);
          setTotalItems(0);
          return;
        }
      } catch (functionError) {
        console.error('Função admin_get_order_queue não existe ou não está acessível:', functionError);
        setQueue([]);
        setTotalItems(0);
        return;
      }
      
      const { data, error } = await supabase
        .rpc('admin_get_order_queue', {
          p_page: page,
          p_page_size: pageSize,
          p_status: statusFilter !== 'all' ? statusFilter : null,
          p_search: searchTerm && searchTerm.length >= 3 ? searchTerm : null
        });
      
      if (error) {
        console.error('Erro na chamada RPC admin_get_order_queue:', error.message, error.details);
        throw error;
      }
      
      if (data && data.length > 0) {
        setQueue(data);
        setTotalItems(data[0].total_count);
      } else {
        setQueue([]);
        setTotalItems(0);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar fila:', errorMessage, error);
      // Se a tabela ou função não existir, mostrar mensagem amigável
      setQueue([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, pageSize, statusFilter, searchTerm]);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadStats();
    loadQueue();
  }, [loadStats, loadQueue]);
  
  // Função para atualizar dados
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadStats();
      await loadQueue();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Funções para ações na fila
  const reprocessItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('admin_reprocess_queue_item', { p_queue_id: id });
      
      if (error) throw error;
      
      if (data) {
        refreshData();
      }
    } catch (error) {
      console.error('Erro ao reprocessar item:', error);
    }
  };
  
  const cancelItem = async (id: string, reason: string = 'Cancelado pelo administrador') => {
    try {
      const { data, error } = await supabase
        .rpc('admin_cancel_queue_item', { 
          p_queue_id: id,
          p_reason: reason
        });
      
      if (error) throw error;
      
      if (data) {
        refreshData();
      }
    } catch (error) {
      console.error('Erro ao cancelar item:', error);
    }
  };
  
  const prioritizeItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('admin_prioritize_queue_item', { p_queue_id: id });
      
      if (error) throw error;
      
      if (data) {
        refreshData();
      }
    } catch (error) {
      console.error('Erro ao priorizar item:', error);
    }
  };
  
  // Renderizar componente
  return (
    <div className="flex flex-col gap-4">
      {/* Estatísticas da fila */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <InfoIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((acc, stat) => acc + stat.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens na fila
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">
              Pendentes
            </CardTitle>
            <TimerIcon className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.find(s => s.status === 'pending')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.find(s => s.status === 'pending')?.avg_priority 
                ? `Prioridade média: ${stats.find(s => s.status === 'pending')?.avg_priority}` 
                : 'Nenhum pendente'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">
              Concluídos
            </CardTitle>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.find(s => s.status === 'completed')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.find(s => s.status === 'completed')?.newest_item 
                ? `Último: ${formatDistanceToNow(new Date(stats.find(s => s.status === 'completed')?.newest_item || ''), { 
                    addSuffix: true, locale: ptBR 
                  })}` 
                : 'Nenhum concluído'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-500">
              Falhas
            </CardTitle>
            <TriangleAlertIcon className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.find(s => s.status === 'failed')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.find(s => s.status === 'failed')?.newest_item 
                ? `Último: ${formatDistanceToNow(new Date(stats.find(s => s.status === 'failed')?.newest_item || ''), { 
                    addSuffix: true, locale: ptBR 
                  })}` 
                : 'Nenhuma falha'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar na fila..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadQueue()}
            className="w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="processing">Em Processamento</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="failed">Falhas</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={refreshData} disabled={isRefreshing} className="w-full sm:w-auto">
          {isRefreshing ? (
            <>
              <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <ReloadIcon className="mr-2 h-5 w-5" />
              Atualizar
            </>
          )}
        </Button>
      </div>
      
      {/* Tabela de itens da fila */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Provedor</TableHead>
                <TableHead className="hidden md:table-cell">Post</TableHead>
                <TableHead className="hidden lg:table-cell">Criado</TableHead>
                <TableHead className="hidden lg:table-cell">Programado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <ReloadIcon className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 block text-sm">Carregando...</span>
                  </TableCell>
                </TableRow>
              ) : queue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <p className="text-muted-foreground">Nenhum item encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                queue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.service_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Prioridade: {item.priority}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'pending' ? 'outline' :
                        item.status === 'processing' ? 'secondary' :
                        item.status === 'completed' ? 'default' :
                        'destructive'
                      }>
                        {item.status_display}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.attempts > 0 && `${item.attempts}/${item.max_attempts} tentativas`}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.transaction_customer_name || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.provider_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.post_code ? (
                        <a 
                          href={item.post_url || `https://instagram.com/p/${item.post_code}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {item.post_code}
                        </a>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {format(new Date(item.scheduled_for), 'dd/MM/yyyy HH:mm:ss')}
                      <div className="text-xs font-medium">
                        {item.minutes_waiting > 0 && `Aguardando: ${Math.round(item.minutes_waiting)} min`}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {item.status === 'failed' || item.status === 'pending' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => reprocessItem(item.id)}
                                >
                                  <PlayIcon className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reprocessar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : null}
                        
                        {item.status === 'pending' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => prioritizeItem(item.id)}
                                >
                                  <ArrowUpIcon className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Priorizar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : null}
                        
                        {item.status === 'pending' || item.status === 'processing' ? (
                          <AlertDialog>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                    >
                                      <StopIcon className="h-5 w-5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cancelar</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar Processamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja cancelar este item da fila? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Não</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => cancelItem(item.id)}
                                >
                                  Sim, cancelar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                        
                        {item.error_message && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                >
                                  <InfoIcon className="h-5 w-5 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-words">
                                  {item.error_message}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Paginação */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, totalItems)} de {totalItems} itens
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <div className="text-sm">
              Página {page} de {Math.ceil(totalItems / pageSize)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalItems / pageSize)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 