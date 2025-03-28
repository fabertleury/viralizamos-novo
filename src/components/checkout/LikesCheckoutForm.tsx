'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingProfileModal } from '@/components/modals/LoadingProfileModal';
import { toast } from 'sonner';

interface FormInputs {
  instagram_username: string;
  whatsapp: string;
  email: string;
}

interface Props {
  onSubmit: (data: any) => void;
}

export function LikesCheckoutForm({ onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const handleFormSubmit = async (data: FormInputs) => {
    try {
      setIsLoading(true);
      setShowModal(true);
      setCurrentMessage(0);
      setFormData(data);

      // Limpar @ se houver
      const username = data.instagram_username.replace('@', '');

      // Buscar dados do perfil
      setCurrentMessage(0);
      const response = await fetch(`/api/instagram/info/${username}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Erro ao buscar perfil');
      }

      setCurrentMessage(1);
      const profile = json.data;

      if (profile.is_private) {
        setProfileData({
          ...profile,
          is_private: true
        });
        return;
      }

      setCurrentMessage(2);
      setProfileData({
        username: profile.username,
        full_name: profile.full_name,
        profile_pic_url: profile.profile_pic_url,
        follower_count: profile.follower_count,
        media_count: profile.media_count,
        is_private: false
      });

    } catch (error: any) {
      console.error('Erro ao verificar perfil:', error);
      toast.error('Erro ao verificar perfil. Por favor, tente novamente.');
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    onSubmit({ ...formData, profile: profileData });
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="instagram_username" className="block text-sm font-medium text-gray-700">
            Perfil do Instagram
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="instagram_username"
              {...register('instagram_username', { required: 'Informe seu usuário do Instagram' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              placeholder="@seu.perfil"
            />
            {errors.instagram_username && (
              <p className="mt-1 text-sm text-red-600">{errors.instagram_username.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="whatsapp"
              {...register('whatsapp', { required: 'Informe seu WhatsApp' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              placeholder="(00) 00000-0000"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Informe seu e-mail',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido'
                }
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            {isLoading ? 'Verificando...' : 'Continuar'}
          </button>
        </div>
      </form>

      <LoadingProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        currentMessage={currentMessage}
        profileData={profileData}
        formData={formData}
      />
    </>
  );
}
