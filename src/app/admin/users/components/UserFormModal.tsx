'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: 'admin' | 'support' | 'user';
    active: boolean;
  };
  onSuccess: () => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
    active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Não preenchemos a senha ao editar
        name: user.name || '',
        role: user.role,
        active: user.active,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'user',
        active: true,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            role: formData.role,
            active: formData.active,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo usuário
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Criar o perfil manualmente após o signup
        if (authData?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              role: formData.role,
              active: formData.active,
              updated_at: new Date().toISOString(),
            });

          if (profileError) throw profileError;
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
              <HeadlessDialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <HeadlessDialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {user ? 'Editar Usuário' : 'Novo Usuário'}
                    </HeadlessDialog.Title>
                    <div className="mt-4">
                      {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-4">
                          <div className="flex">
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Erro</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email
                          </label>
                          <div className="mt-2">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              disabled={!!user}
                              required
                            />
                          </div>
                        </div>

                        {!user && (
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                              Senha
                            </label>
                            <div className="mt-2">
                              <input
                                type="password"
                                name="password"
                                id="password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!user}
                                minLength={6}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Nome
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                            Role
                          </label>
                          <div className="mt-2">
                            <select
                              id="role"
                              name="role"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'support' | 'user' })}
                            >
                              <option value="user">Usuário</option>
                              <option value="support">Suporte</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </div>
                        </div>

                        <div className="relative flex items-start">
                          <div className="flex h-6 items-center">
                            <input
                              id="active"
                              name="active"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              checked={formData.active}
                              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
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
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                            disabled={loading}
                          >
                            {loading ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition.Root>
  );
}
