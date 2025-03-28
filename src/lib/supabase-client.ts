import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Cria uma única instância do cliente Supabase com chave anônima
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook personalizado para usar o cliente Supabase com verificação de autenticação
export function useSupabaseWithAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário tem permissão de administrador
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) {
          setIsAuthenticated(true);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setIsAdmin(profileData.role === 'admin');
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { 
    supabase: supabaseClient, 
    isAuthenticated, 
    isAdmin, 
    isLoading 
  };
}
