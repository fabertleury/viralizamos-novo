'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  user_id: string;
  assigned_to: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    email: string;
  };
  assigned_user?: {
    name: string;
  };
}

interface Message {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user: {
    name: string;
  };
}

export default function TicketsPage() {
  const supabase = createClientComponentClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Array<{ id: string; name: string }>>([]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          user:user_id (name, email),
          assigned_user:assigned_to (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'admin');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Erro ao carregar staff:', error);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          user:user_id (name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: selectedTicket.id,
        message: newMessage,
      });

      if (error) throw error;
      setNewMessage('');
      await fetchMessages(selectedTicket.id);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: assignedTo })
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Lista de Tickets */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Tickets</h2>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className={`hover:bg-gray-50 cursor-pointer ${
                selectedTicket?.id === ticket.id ? 'bg-gray-50' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {ticket.user.name}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Detalhes do Ticket */}
      {selectedTicket ? (
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{selectedTicket.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedTicket.description}</p>
              </div>
              <div className="flex space-x-4">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  className="rounded-md border-gray-300 text-sm"
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="closed">Fechado</option>
                </select>
                <select
                  value={selectedTicket.assigned_to || ''}
                  onChange={(e) => assignTicket(selectedTicket.id, e.target.value)}
                  className="rounded-md border-gray-300 text-sm"
                >
                  <option value="">Atribuir para...</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                {selectedTicket.priority}
              </span>
              {selectedTicket.assigned_user && (
                <span className="text-sm text-gray-500">
                  Atribuído para: {selectedTicket.assigned_user.name}
                </span>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
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
          </div>

          {/* Input de Mensagem */}
          <div className="border-t border-gray-200 px-6 py-4">
            <form onSubmit={handleSendMessage}>
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Selecione um ticket para ver os detalhes</p>
        </div>
      )}
    </div>
  );
}
