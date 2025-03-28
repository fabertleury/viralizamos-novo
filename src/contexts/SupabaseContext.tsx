import React, { createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
