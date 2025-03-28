'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PoliticaDePrivacidadePage() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from('configurations')
          .select('value')
          .eq('key', 'privacy_policy')
          .single();

        if (error) {
          console.error('Erro ao buscar política de privacidade:', error);
          return;
        }

        if (data) {
          setContent(data.value);
        }
      } catch (error) {
        console.error('Erro ao buscar política de privacidade:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      
      <div className="prose max-w-none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="mb-4">
            A política de privacidade está sendo atualizada. Por favor, volte em breve.
          </p>
        )}
      </div>
    </div>
  );
}
