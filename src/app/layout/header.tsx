import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';

const Header = () => {
  const [user, setUser] = useState(null);
  const supabase = useSupabase();

  useEffect(() => {
    console.log('Supabase instance:', supabase);
    const fetchData = async () => {
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Fetched user:', user);
        setUser(user);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <header className="bg-gray-800 text-white p-4">
      <img src="/images/viralizamos-color.png" alt="Logo" className="h-10" />
      <h1>Bem-vindo, {user ? user.email : 'Visitante'}</h1>
    </header>
  );
};

export default Header;
