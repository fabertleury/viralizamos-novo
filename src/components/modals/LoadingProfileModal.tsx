'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { getProxiedImageUrl } from '../../app/checkout/instagram/utils/proxy-image';

interface LoadingProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingStage: 'checking' | 'success' | 'error';
  error?: string;
  profileData: any;
  serviceId: string;
  checkoutSlug: string;
}

// Mensagens padrão para cada estágio
const defaultMessages = {
  checking: "Verificando seu perfil...",
  success: "Perfil verificado com sucesso!",
  error: "Não foi possível verificar seu perfil"
};

export function LoadingProfileModal({
  open,
  onOpenChange,
  loadingStage,
  error,
  profileData,
  serviceId,
  checkoutSlug
}: LoadingProfileModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onOpenChange(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  {/* Loading State */}
                  {loadingStage === 'checking' && (
                    <div className="mx-auto flex flex-col items-center">
                      <div className="mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
                      </div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        {defaultMessages.checking}
                      </Dialog.Title>
                    </div>
                  )}

                  {/* Error State */}
                  {loadingStage === 'error' && (
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg
                          className="h-6 w-6 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                      </div>
                      <Dialog.Title as="h3" className="mt-3 text-lg font-medium leading-6 text-gray-900">
                        {error || defaultMessages.error}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Verifique se o perfil existe e está configurado como público.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {loadingStage === 'success' && profileData && (
                    <div className="mx-auto flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4">
                        <Image
                          src={getProxiedImageUrl(profileData.profile_pic_url)}
                          alt={profileData.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        @{profileData.username}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {profileData.full_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {profileData.follower_count?.toLocaleString('pt-BR') || '0'} seguidores
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  {loadingStage === 'success' && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 sm:col-start-2"
                      onClick={() => {
                        onOpenChange(false);
                      }}
                    >
                      Continuar
                    </button>
                  )}
                  <button
                    type="button"
                    className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${loadingStage === 'success' ? 'sm:col-start-1' : 'sm:col-span-2'} sm:mt-0`}
                    onClick={() => onOpenChange(false)}
                  >
                    {loadingStage === 'error' ? 'Tentar novamente' : 'Cancelar'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
