'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Interface para FAQs
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order_position: number;
}

// Componente de FAQ
const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('active', true)
        .order('order_position', { ascending: true })
        .limit(5);

      if (data) setFaqs(data);
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="border-b border-gray-200 mb-4 pb-4"
            >
              <button 
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left flex justify-between items-center"
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <span>{openFaq === faq.id ? '−' : '+'}</span>
              </button>
              {openFaq === faq.id && (
                <div className="mt-2 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
