'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{email: string; password: string} | null>(null);
  const router = useRouter();

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar usuário admin');
      }

      const data = await response.json();
      setSuccess(data.user);
      
      setTimeout(() => {
        router.push('/login');
      }, 5000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/images/logo.png"
          alt="Viralizamos"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Admin User
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Usuário admin criado com sucesso!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Email: {success.email}</p>
                    <p>Senha: {success.password}</p>
                    <p className="mt-2">
                      Redirecionando para o login em 5 segundos...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSetup}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Criando...' : 'Criar Usuário Admin'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
