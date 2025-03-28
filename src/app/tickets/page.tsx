'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  user: {
    name: string;
  };
}

export default function TicketsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'low'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          messages:ticket_messages (
            id,
            message,
            created_at,
            user:user_id (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...newTicket,
          user_id: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setTickets([data, ...tickets]);
      setShowNewTicketForm(false);
      setNewTicket({ title: '', description: '', priority: 'low' });
      toast.success('Ticket criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast.error('Erro ao criar ticket');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: newMessage
        });

      if (error) throw error;

      setNewMessage('');
      await fetchTickets();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meus Tickets</h1>
        <button
          onClick={() => setShowNewTicketForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Novo Ticket
        </button>
      </div>

      {showNewTicketForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium mb-4">Criar Novo Ticket</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Prioridade
                  </label>
                  <select
                    id="priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Criar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <div
                className={`block hover:bg-gray-50 cursor-pointer ${
                  selectedTicket?.id === ticket.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {ticket.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Aberto' :
                         ticket.status === 'in_progress' ? 'Em Andamento' :
                         ticket.status === 'closed' ? 'Fechado' : ticket.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {ticket.messages?.length || 0} mensagens
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTicket?.id === ticket.id && (
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <div className="space-y-4">
                    {ticket.messages?.map((message) => (
                      <div key={message.id} className="flex space-x-3">
                        <div className="flex-1">
                          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm font-medium text-gray-900">
                                {message.user.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} className="mt-4">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Enviar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
