'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TermosDeUsoPage() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const { data, error } = await supabase
          .from('configurations')
          .select('value')
          .eq('key', 'terms_of_use')
          .single();

        if (error) {
          console.error('Erro ao buscar termos de uso:', error);
          return;
        }

        if (data) {
          setContent(data.value);
        }
      } catch (error) {
        console.error('Erro ao buscar termos de uso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
      
      <div className="prose max-w-none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="mb-4">
            Os termos de uso estão sendo atualizados. Por favor, volte em breve.
          </p>
        )}
      </div>
    </div>
  );
}
