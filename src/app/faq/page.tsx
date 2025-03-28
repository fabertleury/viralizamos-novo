'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { createClient } from '@/lib/supabase/client';
import { FaQuestionCircle } from 'react-icons/fa';

// Interface para FAQs
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order_position: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('active', true)
        .order('order_position', { ascending: true });

      if (error) {
        console.error('Erro ao buscar FAQs:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setFaqs(data);
        
        // Extrair categorias únicas
        const uniqueCategories = Array.from(new Set(data.map(faq => faq.category)));
        setCategories(uniqueCategories);
      }
      
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <>
      <Header />
      
      <div className="bg-gradient-to-r from-[#C43582] to-[#FF00CE] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-white text-lg max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Filtro de categorias */}
          {categories.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#C43582] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#C43582] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C43582]"></div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="border rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button 
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left flex justify-between items-center p-4 bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FaQuestionCircle className="text-[#C43582] mr-3 flex-shrink-0" />
                        <h3 className="text-lg font-semibold">{faq.question}</h3>
                      </div>
                      <span className="text-xl font-bold text-[#C43582]">
                        {openFaq === faq.id ? '−' : '+'}
                      </span>
                    </button>
                    
                    {openFaq === faq.id && (
                      <div className="p-4 bg-gray-50 border-t">
                        <p className="text-gray-700 whitespace-pre-line">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaQuestionCircle className="text-gray-400 text-5xl mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedCategory === 'all' 
                      ? 'Nenhuma pergunta frequente encontrada.' 
                      : `Nenhuma pergunta encontrada na categoria "${selectedCategory}".`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Ainda tem dúvidas?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Se você não encontrou a resposta que procurava, entre em contato com nossa equipe de suporte. Estamos sempre prontos para ajudar!
          </p>
          <a 
            href="https://wa.me/5562999915390" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-[#C43582] text-white font-medium rounded-lg hover:bg-[#a62c6c] transition-colors"
          >
            Falar com o Suporte
          </a>
        </div>
      </section>
    </>
  );
}
