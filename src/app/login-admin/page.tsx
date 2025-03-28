'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Se chegar aqui, é porque a autenticação foi bem-sucedida
      // e o usuário é um administrador

      // Armazenar token na localStorage
      localStorage.setItem('admin_token', data.session.access_token);
      localStorage.setItem('admin_expires_at', data.session.expires_at.toString());
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      // Redirecionar para o dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <Image
        src="/images/bg_login.webp"
        alt="Background"
        fill
        className="object-cover"
        quality={100}
        priority
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Login Form */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src="/images/viralizamos-color.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Login de Administrador
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Acesso exclusivo para administradores do sistema
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Autenticando...' : 'Acessar Painel Admin'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm">
              Voltar para a página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 