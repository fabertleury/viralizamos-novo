'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  PencilIcon, 
  TrashIcon, 
  StarIcon as SolidStarIcon 
} from '@heroicons/react/24/solid';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface Depoimento {
  id: string;
  nome: string;
  texto: string;
  avatar?: string;
  estrelas: number;
  active: boolean;
  created_at: string;
}

export default function DepoimentosPage() {
  const supabase = createClientComponentClient();
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepoimento, setSelectedDepoimento] = useState<Depoimento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    texto: '',
    avatar: '',
    estrelas: 5,
    active: true
  });

  const fetchDepoimentos = async () => {
    try {
      const { data, error } = await supabase
        .from('depoimentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDepoimentos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar depoimentos:', error);
      toast.error(error.message || 'Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        avatar: formData.avatar || null
      };

      const { error } = selectedDepoimento
        ? await supabase
            .from('depoimentos')
            .update(submitData)
            .eq('id', selectedDepoimento.id)
        : await supabase.from('depoimentos').insert(submitData);

      if (error) throw error;
      
      setIsModalOpen(false);
      setSelectedDepoimento(null);
      setFormData({
        nome: '',
        texto: '',
        avatar: '',
        estrelas: 5,
        active: true
      });
      
      toast.success(selectedDepoimento 
        ? 'Depoimento atualizado com sucesso!' 
        : 'Depoimento criado com sucesso!'
      );
      
      await fetchDepoimentos();
    } catch (error: any) {
      console.error('Erro ao salvar depoimento:', error);
      toast.error(error.message || 'Erro ao salvar depoimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('depoimentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Depoimento excluído com sucesso!');
      await fetchDepoimentos();
    } catch (error: any) {
      console.error('Erro ao excluir depoimento:', error);
      toast.error(error.message || 'Erro ao excluir depoimento');
    }
  };

  const handleEdit = (depoimento: Depoimento) => {
    setSelectedDepoimento(depoimento);
    setFormData({
      nome: depoimento.nome,
      texto: depoimento.texto,
      avatar: depoimento.avatar || '',
      estrelas: depoimento.estrelas,
      active: depoimento.active
    });
    setIsModalOpen(true);
  };

  const renderStars = (count: number, setStars?: (stars: number) => void) => {
    return [...Array(5)].map((_, index) => {
      const starProps = setStars ? {
        onClick: () => setStars(index + 1),
        className: 'cursor-pointer hover:text-yellow-500 transition-colors'
      } : {};

      return index < count ? (
        <SolidStarIcon 
          key={index} 
          className="h-6 w-6 text-yellow-500" 
          {...starProps}
        />
      ) : (
        <OutlineStarIcon 
          key={index} 
          className="h-6 w-6 text-gray-300" 
          {...starProps}
        />
      );
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-end items-center mb-6">
          <button 
            onClick={() => {
              setSelectedDepoimento(null);
              setFormData({
                nome: '',
                texto: '',
                avatar: '',
                estrelas: 5,
                active: true
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Novo Depoimento
          </button>
        </div>

        {loading ? (
          <p>Carregando depoimentos...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {depoimentos.map((depoimento) => (
              <div 
                key={depoimento.id} 
                className="bg-white rounded-lg shadow-md p-6 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{depoimento.nome}</h3>
                    <div className="flex mt-1">
                      {renderStars(depoimento.estrelas)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(depoimento)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(depoimento.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{depoimento.texto}"</p>
                {depoimento.avatar && (
                  <img 
                    src={depoimento.avatar} 
                    alt={depoimento.nome} 
                    className="mt-4 w-16 h-16 rounded-full mx-auto object-cover"
                  />
                )}
                <span 
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs ${
                    depoimento.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {depoimento.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">
                {selectedDepoimento ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Depoimento
                  </label>
                  <textarea
                    value={formData.texto}
                    onChange={(e) => setFormData({...formData, texto: e.target.value})}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    URL do Avatar (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Avaliação
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(formData.estrelas, (stars) => 
                      setFormData({...formData, estrelas: stars})
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Depoimento ativo
                    </span>
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
