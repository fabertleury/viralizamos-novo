'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ClientsPage() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'customers'>('customers');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar usuários registrados (profiles)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
        throw usersError;
      }

      // Filtrar apenas os dados que têm email (usuários reais)
      const validUsers = (usersData || []).filter(user => user.email);
      setUsers(validUsers);

      // Buscar clientes da tabela customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Erro ao carregar clientes:', customersError);
        throw customersError;
      }

      setCustomers(customersData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados dos clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar status do cliente:', error);
      toast.error(error.message || 'Erro ao atualizar status do cliente');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-';
    // Formatar número de telefone (xx) xxxxx-xxxx
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const viewMetadata = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowMetadataModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os clientes cadastrados na plataforma.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('customers')}
            className={`${
              activeTab === 'customers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Clientes (Customers) ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Usuários Registrados ({users.length})
          </button>
        </nav>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {activeTab === 'users' ? (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Nome
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Data de Cadastro
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {user.name || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.email || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => handleToggleStatus(user.id, user.active)}
                              className={`px-2 py-1 rounded ${
                                user.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.active ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Nome
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Telefone
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Data de Cadastro
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Última Atualização
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {customer.name || customer.metadata?.customer?.name || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {customer.email || customer.metadata?.customer?.email || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatPhoneNumber(customer.phone || customer.metadata?.customer?.phone || '')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(customer.updated_at)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => viewMetadata(customer)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalhes"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para exibir metadados */}
      {showMetadataModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detalhes do Cliente</h3>
              <button
                onClick={() => setShowMetadataModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700">Informações Básicas</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">ID:</span> {selectedCustomer.id}</p>
                  <p><span className="font-medium">Nome:</span> {selectedCustomer.name || selectedCustomer.metadata?.customer?.name || '-'}</p>
                  <p><span className="font-medium">Email:</span> {selectedCustomer.email || selectedCustomer.metadata?.customer?.email || '-'}</p>
                  <p><span className="font-medium">Telefone:</span> {formatPhoneNumber(selectedCustomer.phone || selectedCustomer.metadata?.customer?.phone || '')}</p>
                  <p><span className="font-medium">Criado em:</span> {formatDate(selectedCustomer.created_at)}</p>
                  <p><span className="font-medium">Atualizado em:</span> {formatDate(selectedCustomer.updated_at)}</p>
                </div>
              </div>
              
              {selectedCustomer.metadata?.payment && (
                <div>
                  <h4 className="font-medium text-gray-700">Informações de Pagamento</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">ID do Pagamento:</span> {selectedCustomer.metadata.payment.id}</p>
                    {selectedCustomer.metadata.payment.qr_code && (
                      <div>
                        <p className="font-medium">QR Code:</p>
                        <div className="mt-1">
                          <img 
                            src={`data:image/png;base64,${selectedCustomer.metadata.payment.qr_code_base64}`} 
                            alt="QR Code de Pagamento" 
                            className="w-32 h-32"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {selectedCustomer.metadata?.profile && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Perfil</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Username:</span> {selectedCustomer.metadata.profile.username || '-'}</p>
                  <p><span className="font-medium">Link:</span> <a href={selectedCustomer.metadata.profile.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedCustomer.metadata.profile.link}</a></p>
                </div>
              </div>
            )}
            
            {selectedCustomer.metadata?.service && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Serviço</h4>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">ID do Serviço:</span> {selectedCustomer.metadata.service.id}</p>
                  <p><span className="font-medium">Nome:</span> {selectedCustomer.metadata.service.name}</p>
                  <p><span className="font-medium">Quantidade:</span> {selectedCustomer.metadata.service.quantity}</p>
                  <p><span className="font-medium">ID do Provedor:</span> {selectedCustomer.metadata.service.provider_id}</p>
                </div>
              </div>
            )}
            
            {selectedCustomer.metadata?.checkout_type && (
              <div className="mb-4">
                <p><span className="font-medium">Tipo de Checkout:</span> {selectedCustomer.metadata.checkout_type}</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMetadataModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
