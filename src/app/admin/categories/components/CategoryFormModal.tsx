'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SocialIcon } from '@/components/ui/social-icon';
import { FaFolder, FaImage, FaVideo, FaMusic, FaHeart, FaStar, FaShoppingCart, FaUsers, FaComment, FaThumbsUp } from 'react-icons/fa';

interface Social {
  id: string;
  name: string;
  icon: string;
  url: string;
  active: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    active: boolean;
    order_position: number;
    social_id?: string;
  };
}

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  category 
}: CategoryFormModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socials, setSocials] = useState<Social[]>([]);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '',
    active: category?.active ?? true,
    order_position: category?.order_position || 0,
    social_id: category?.social_id || ''
  });

  // Atualizar dados do formulário quando a categoria mudar
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        active: category.active,
        order_position: category.order_position,
        social_id: category.social_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '',
        active: true,
        order_position: 0,
        social_id: ''
      });
    }
  }, [category]);

  // Carregar redes sociais
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const { data, error } = await supabase
          .from('socials')
          .select('*')
          .eq('active', true)
          .order('name');
        
        if (error) throw error;
        setSocials(data || []);
      } catch (err) {
        console.error('Erro ao carregar redes sociais:', err);
      }
    };

    if (isOpen) {
      fetchSocials();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Se estiver mudando a rede social, atualizar também o ícone
    if (name === 'social_id') {
      const selectedSocial = socials.find(s => s.id === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        icon: selectedSocial ? selectedSocial.icon : prev.icon
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                name === 'order_position' ? parseInt(value) || 0 : value
      }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        slug: generateSlug(formData.name)
      };

      if (category) {
        // Atualizar categoria existente
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova categoria
        const { error: insertError } = await supabase
          .from('categories')
          .insert([{
            ...dataToSave,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Encontrar a rede social selecionada
  const selectedSocial = socials.find(s => s.id === formData.social_id);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  {category ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>

                <div className="mt-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div>
                      <label htmlFor="social_id" className="block text-sm font-medium leading-6 text-gray-900">
                        Rede Social
                      </label>
                      <div className="mt-2">
                        <select
                          id="social_id"
                          name="social_id"
                          value={formData.social_id}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="">Selecione uma rede social</option>
                          {socials.map(social => (
                            <option key={social.id} value={social.id}>
                              {social.name}
                            </option>
                          ))}
                        </select>
                        {selectedSocial && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <SocialIcon name={selectedSocial.icon} className="w-5 h-5" />
                            <span>Ícone da categoria será o mesmo da rede social: {selectedSocial.icon}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div>
                      <label htmlFor="order_position" className="block text-sm font-medium leading-6 text-gray-900">
                        Posição na Ordem
                      </label>
                      <input
                        type="number"
                        name="order_position"
                        id="order_position"
                        value={formData.order_position}
                        onChange={handleChange}
                        min="0"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          id="active"
                          name="active"
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor="active" className="font-medium text-gray-900">
                          Ativo
                        </label>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
