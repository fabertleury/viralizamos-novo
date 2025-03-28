'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function FAQsPage() {
  const supabase = createClientComponentClient();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    active: true
  });

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }
      
      setFaqs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar FAQs:', error);
      toast.error(error.message || 'Erro ao carregar FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFaq = {
        ...formData,
        order_position: selectedFaq ? selectedFaq.order_position : (faqs.length + 1)
      };

      const { error } = selectedFaq
        ? await supabase.from('faqs').update(newFaq).eq('id', selectedFaq.id)
        : await supabase.from('faqs').insert(newFaq);

      if (error) throw error;
      
      setIsModalOpen(false);
      setSelectedFaq(null);
      setFormData({ question: '', answer: '', category: '', active: true });
      toast.success(selectedFaq ? 'FAQ atualizada com sucesso!' : 'FAQ criada com sucesso!');
      await fetchFaqs();
    } catch (error: any) {
      console.error('Erro ao salvar FAQ:', error);
      toast.error(error.message || 'Erro ao salvar FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta FAQ?')) return;

    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      toast.success('FAQ excluída com sucesso!');
      await fetchFaqs();
    } catch (error: any) {
      console.error('Erro ao excluir FAQ:', error);
      toast.error(error.message || 'Erro ao excluir FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      active: faq.active
    });
    setIsModalOpen(true);
  };

  const handleMovePosition = async (faq: FAQ, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === faqs.length - 1)
    ) {
      return;
    }

    const newPosition = direction === 'up' 
      ? faq.order_position - 1 
      : faq.order_position + 1;

    const otherFaq = faqs.find(f => f.order_position === newPosition);
    if (!otherFaq) return;

    try {
      const { error: error1 } = await supabase
        .from('faqs')
        .update({ order_position: newPosition })
        .eq('id', faq.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('faqs')
        .update({ order_position: faq.order_position })
        .eq('id', otherFaq.id);

      if (error2) throw error2;

      toast.success('Posição atualizada com sucesso!');
      await fetchFaqs();
    } catch (error: any) {
      console.error('Erro ao mover FAQ:', error);
      toast.error(error.message || 'Erro ao mover FAQ');
    }
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
          <h1 className="text-xl font-semibold text-gray-900">FAQ's</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie as perguntas frequentes que aparecem na página inicial.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setSelectedFaq(null);
              setFormData({ question: '', answer: '', category: '', active: true });
              setIsModalOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Adicionar FAQ
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Ordem
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Pergunta
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Categoria
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMovePosition(faq, 'up')}
                            disabled={faq.order_position === 1}
                            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                          >
                            <ArrowUpIcon className="h-5 w-5" />
                          </button>
                          <span>{faq.order_position}</span>
                          <button
                            onClick={() => handleMovePosition(faq, 'down')}
                            disabled={faq.order_position === faqs.length}
                            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                          >
                            <ArrowDownIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {faq.question}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {faq.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            faq.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {faq.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                      Pergunta
                    </label>
                    <input
                      type="text"
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                      Resposta
                    </label>
                    <textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Categoria
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Ex: Geral, Pagamentos, Serviços, etc."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Ativo
                    </label>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    >
                      {selectedFaq ? 'Atualizar' : 'Criar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
