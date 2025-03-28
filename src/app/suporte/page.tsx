'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  messages: {
    id: string;
    message: string;
    created_at: string;
    user: {
      name: string;
      role: string;
    };
  }[];
}

export default function SupportPage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClientComponentClient();

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    order_id: searchParams.get('order') || '',
    priority: 'normal'
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Você precisa estar logado para ver seus tickets');
          return;
        }

        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            *,
            messages:ticket_messages(
              id,
              message,
              created_at,
              user:profiles(name, role)
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;

        setTickets(ticketsData || []);

        // Se tiver um order_id nos parâmetros, mostra o formulário de novo ticket
        if (searchParams.get('order')) {
          setShowNewTicketForm(true);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [searchParams]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado para criar um ticket');
        return;
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          ...newTicket,
          user_id: session.user.id,
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Ticket criado com sucesso!');
      setTickets(prev => [data, ...prev]);
      setShowNewTicketForm(false);
      setNewTicket({
        title: '',
        description: '',
        order_id: '',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar ticket');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado para enviar mensagens');
        return;
      }

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          user_id: session.user.id,
          message: newMessage
        }])
        .select(`
          id,
          message,
          created_at,
          user:profiles(name, role)
        `)
        .single();

      if (error) throw error;

      setTickets(prev => prev.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            messages: [...ticket.messages, data]
          };
        }
        return ticket;
      }));

      setNewMessage('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Suporte</h1>
        <Button onClick={() => setShowNewTicketForm(true)}>
          Novo Ticket
        </Button>
      </div>

      {showNewTicketForm ? (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Novo Ticket</h2>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <Input
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prioridade
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {newTicket.order_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pedido
                </label>
                <Input
                  value={newTicket.order_id}
                  disabled
                />
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewTicketForm(false);
                  setNewTicket({
                    title: '',
                    description: '',
                    order_id: '',
                    priority: 'normal'
                  });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Criar Ticket
              </Button>
            </div>
          </form>
        </Card>
      ) : selectedTicket ? (
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{selectedTicket.title}</h2>
              <p className="text-sm text-gray-500">
                Criado em {new Date(selectedTicket.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedTicket(null)}
            >
              Voltar
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{selectedTicket.description}</p>
            </div>

            {selectedTicket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.user.role === 'admin' ? 'items-start' : 'items-end'
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.user.role === 'admin'
                      ? 'bg-gray-100'
                      : 'bg-pink-50'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{message.user.name}</p>
                  <p className="text-gray-700">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              required
            />
            <Button type="submit">
              Enviar
            </Button>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(ticket.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ticket.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'closed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ticket.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : ticket.priority === 'normal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{ticket.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                {ticket.messages.length} mensagens
              </div>
            </Card>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Você ainda não tem tickets</p>
              <Button
                className="mt-4"
                onClick={() => setShowNewTicketForm(true)}
              >
                Criar Ticket
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
