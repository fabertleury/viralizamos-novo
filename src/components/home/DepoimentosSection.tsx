'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

// Interface para Depoimentos
interface Depoimento {
  id: string;
  nome: string;
  texto: string;
  avatar?: string;
  estrelas: number;
}

// Componente de Depoimentos
const DepoimentosSection = () => {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchDepoimentos = async () => {
      const { data, error } = await supabase
        .from('depoimentos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) setDepoimentos(data);
    };

    fetchDepoimentos();
  }, []);

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Depoimentos de Clientes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {depoimentos.map((depoimento) => (
            <div 
              key={depoimento.id} 
              className="bg-white p-6 rounded-lg shadow-md relative"
            >
              <FaQuoteLeft className="absolute top-4 left-4 text-gray-200 text-3xl z-0" />
              <p className="text-gray-600 mb-4 italic relative z-10 pl-10">"{depoimento.texto}"</p>
              <div className="flex items-center">
                {depoimento.avatar ? (
                  <img 
                    src={depoimento.avatar} 
                    alt={depoimento.nome} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                    {depoimento.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{depoimento.nome}</h3>
                  <div className="flex text-yellow-500">
                    {[...Array(depoimento.estrelas)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <FaQuoteRight className="absolute bottom-4 right-4 text-gray-200 text-3xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepoimentosSection;
