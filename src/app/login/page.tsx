'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner'; // Import the toast function

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';
  const errorType = searchParams.get('error');

  useEffect(() => {
    if (errorType === 'unauthorized') {
      toast.error('Você não tem permissão para acessar esta área. Faça login com uma conta de administrador.');
    }
  }, [errorType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile?.role === 'support') {
          router.push('/suporte/dashboard');
        } else if (profile?.role === 'cliente') {
          router.push('/cliente/dashboard');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
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
              Login
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Acesse o painel administrativo
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
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
