'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SocialIcon } from '@/components/ui/social-icon';
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaTwitter, FaTwitch, FaLinkedin, FaWhatsapp, FaTelegram } from 'react-icons/fa';

interface SocialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  social?: {
    id: string;
    name: string;
    icon: string;
    url: string;
    active: boolean;
    order_position: number;
  };
}

export default function SocialFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  social 
}: SocialFormModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    url: '',
    active: true,
    order_position: 0
  });

  // Atualizar dados do formulário quando o social mudar
  useEffect(() => {
    if (social) {
      setFormData({
        name: social.name,
        icon: social.icon,
        url: social.url,
        active: social.active,
        order_position: social.order_position
      });
    } else {
      // Resetar formulário quando não houver social selecionado
      setFormData({
        name: '',
        icon: '',
        url: '',
        active: true,
        order_position: 0
      });
    }
  }, [social]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'order_position' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (social) {
        // Atualizar rede social existente
        const { error: updateError } = await supabase
          .from('socials')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', social.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova rede social
        const { error: insertError } = await supabase
          .from('socials')
          .insert([{
            ...formData,
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

  const iconOptions = [
    { value: 'instagram', label: 'Instagram', icon: FaInstagram },
    { value: 'tiktok', label: 'TikTok', icon: FaTiktok },
    { value: 'youtube', label: 'YouTube', icon: FaYoutube },
    { value: 'facebook', label: 'Facebook', icon: FaFacebook },
    { value: 'twitter', label: 'Twitter', icon: FaTwitter },
    { value: 'twitch', label: 'Twitch', icon: FaTwitch },
    { value: 'linkedin', label: 'LinkedIn', icon: FaLinkedin },
    { value: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp },
    { value: 'telegram', label: 'Telegram', icon: FaTelegram },
  ];

  if (!isOpen) return null;

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
                  {social ? 'Editar Rede Social' : 'Nova Rede Social'}
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
                      <label htmlFor="icon" className="block text-sm font-medium leading-6 text-gray-900">
                        Ícone
                      </label>
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {iconOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                            className={`p-2 rounded-md flex flex-col items-center justify-center gap-1 ${
                              formData.icon === option.value
                                ? 'bg-indigo-100 ring-2 ring-indigo-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <SocialIcon name={option.name} className="w-6 h-6" />
                            <span className="text-xs">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="url" className="block text-sm font-medium leading-6 text-gray-900">
                        Identificador
                      </label>
                      <input
                        type="text"
                        name="url"
                        id="url"
                        value={formData.url}
                        onChange={handleChange}
                        required
                        placeholder="instagram"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Identificador único da rede social (ex: instagram, facebook, twitter)
                      </p>
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
