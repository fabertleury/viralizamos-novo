'use client';

import React, { useState, useEffect } from 'react';
import SocialFormModal from './components/SocialFormModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { SocialIcon } from '@/components/ui/social-icon';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface Social {
  id: string;
  name: string;
  icon: string;
  url: string;
  icon_url?: string;
  active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

export default function SocialsPage() {
  const supabase = createClientComponentClient();
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<Social | undefined>();
  const [uploading, setUploading] = useState(false);

  const fetchSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('socials')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setSocials(data || []);
    } catch (error) {
      console.error('Erro ao carregar redes sociais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const handleEdit = (social: Social) => {
    setSelectedSocial(social);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rede social?')) return;

    try {
      const { error } = await supabase
        .from('socials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Rede social excluída com sucesso');
      fetchSocials();
    } catch (error) {
      console.error('Erro ao excluir rede social:', error);
      toast.error('Erro ao excluir rede social');
    }
  };

  const handleUpdate = async (social: Social) => {
    try {
      const { error } = await supabase
        .from('socials')
        .update({
          name: social.name,
          url: social.url,
          active: social.active
        })
        .eq('id', social.id);

      if (error) throw error;

      toast.success('Rede social atualizada com sucesso');
      setIsModalOpen(false);
      fetchSocials();
    } catch (error) {
      console.error('Erro ao atualizar rede social:', error);
      toast.error('Erro ao atualizar rede social');
    }
  };

  const handleRemoveIcon = async (socialId: string) => {
    try {
      const { error } = await supabase
        .from('socials')
        .update({ icon_url: null })
        .eq('id', socialId);
      
      if (error) throw error;

      // Atualiza o estado local sem causar erro de renderização
      const updatedSocials = socials.map(s => 
        s.id === socialId ? { ...s, icon_url: undefined } : s
      );
      setSocials(updatedSocials);
      
      if (selectedSocial && selectedSocial.id === socialId) {
        setSelectedSocial({ ...selectedSocial, icon_url: undefined });
      }

      toast.success('Ícone removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover ícone:', error);
      toast.error('Erro ao remover ícone');
    }
  };

  const handleMoveUp = async (id: string) => {
    const social = socials.find(s => s.id === id);
    if (!social) return;

    const currentIndex = socials.findIndex(s => s.id === id);
    if (currentIndex === 0) return;

    const newPosition = social.order_position - 1;

    const otherSocial = socials.find(s => s.order_position === newPosition);
    if (!otherSocial) return;

    try {
      // Atualiza a posição da rede social atual
      const { error: error1 } = await supabase
        .from('socials')
        .update({ order_position: newPosition })
        .eq('id', social.id);

      if (error1) throw error1;

      // Atualiza a posição da outra rede social
      const { error: error2 } = await supabase
        .from('socials')
        .update({ order_position: social.order_position })
        .eq('id', otherSocial.id);

      if (error2) throw error2;

      await fetchSocials();
    } catch (error) {
      console.error('Erro ao alterar posição:', error);
    }
  };

  const handleMoveDown = async (id: string) => {
    const social = socials.find(s => s.id === id);
    if (!social) return;

    const currentIndex = socials.findIndex(s => s.id === id);
    if (currentIndex === socials.length - 1) return;

    const newPosition = social.order_position + 1;

    const otherSocial = socials.find(s => s.order_position === newPosition);
    if (!otherSocial) return;

    try {
      // Atualiza a posição da rede social atual
      const { error: error1 } = await supabase
        .from('socials')
        .update({ order_position: newPosition })
        .eq('id', social.id);

      if (error1) throw error1;

      // Atualiza a posição da outra rede social
      const { error: error2 } = await supabase
        .from('socials')
        .update({ order_position: social.order_position })
        .eq('id', otherSocial.id);

      if (error2) throw error2;

      await fetchSocials();
    } catch (error) {
      console.error('Erro ao alterar posição:', error);
    }
  };

  const handleIconUpload = async (file: File, socialId: string) => {
    try {
      setUploading(true);
      
      // Verifica o tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione uma imagem');
      }

      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `social-icons/${fileName}`;

      // Faz o upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pega a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Atualiza o registro no banco
      const { error: updateError } = await supabase
        .from('socials')
        .update({ icon_url: publicUrl })
        .eq('id', socialId);

      if (updateError) throw updateError;

      toast.success('Ícone atualizado com sucesso');
      fetchSocials();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload do ícone');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Redes Sociais</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie as redes sociais disponíveis no sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedSocial(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Adicionar Rede Social
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      URL
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ícone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ordem
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {socials.map((social) => (
                    <tr key={social.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {social.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{social.url}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {social.icon_url ? (
                          <img 
                            src={social.icon_url} 
                            alt={social.name} 
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-gray-400">Sem ícone</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          social.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {social.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {social.order_position}
                        <div className="inline-flex ml-2">
                          <button
                            onClick={() => handleMoveUp(social.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(social.id)}
                            className="text-gray-400 hover:text-gray-500 ml-1"
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedSocial(social);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(social.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedSocial && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-4">Editar Rede Social</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={selectedSocial.name}
                  onChange={(e) => setSelectedSocial({ ...selectedSocial, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="text"
                  value={selectedSocial.url}
                  onChange={(e) => setSelectedSocial({ ...selectedSocial, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ícone Atual</label>
                {selectedSocial.icon_url ? (
                  <div className="mt-2 flex items-center">
                    <img 
                      src={selectedSocial.icon_url} 
                      alt={selectedSocial.name} 
                      className="w-12 h-12 object-contain"
                    />
                    <button
                      onClick={() => handleRemoveIcon(selectedSocial.id)}
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">Nenhum ícone definido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload de Novo Ícone
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleIconUpload(file, selectedSocial.id);
                      }
                    }}
                    disabled={uploading}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedSocial.active ? 'true' : 'false'}
                  onChange={(e) => setSelectedSocial({ ...selectedSocial, active: e.target.value === 'true' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdate(selectedSocial)}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
