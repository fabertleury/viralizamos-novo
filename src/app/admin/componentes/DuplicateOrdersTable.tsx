'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Eye, Filter, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  type: string;
  reference_id: string;
  transaction_id: string;
  metadata: any;
};

export default function DuplicateOrdersTable() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const supabase = createClient();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('type', 'duplicate_order')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao processar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Escutar por mudanças em tempo real
    const channel = supabase
      .channel('admin_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
          filter: 'type=eq.duplicate_order',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar como resolvido:', error);
        return;
      }

      loadNotifications();
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.status === filter);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Pedidos Duplicados Bloqueados</CardTitle>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-background text-sm border rounded px-2 py-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="resolved">Resolvidos</option>
            </select>
          </div>
          <Button size="sm" variant="outline" onClick={loadNotifications}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido duplicado encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {notification.metadata?.post_code ? (
                        <a 
                          href={`https://instagram.com/p/${notification.metadata.post_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          {notification.metadata.post_code}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem código</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/admin/pedidos?transaction=${notification.transaction_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {notification.transaction_id.substring(0, 8)}...
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.status === 'pending' ? 'default' : 'outline'}>
                        {notification.status === 'pending' ? 'Pendente' : 'Resolvido'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/pedidos/${notification.reference_id}`}
                          className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver pedido
                        </Link>
                        {notification.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs px-2 py-1 h-auto text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => markAsResolved(notification.id)}
                          >
                            Marcar resolvido
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 