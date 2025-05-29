'use client';

import React from 'react';
import { FaClock, FaWhatsapp, FaRocket, FaShieldAlt } from 'react-icons/fa';

// Componente de Serviços
const ServicosSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Serviços de qualidade, Sigilo total!</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaClock className="mx-auto text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Resultados rápidos</h3>
            <p className="text-gray-600">
              Geralmente iniciamos em minutos e finalizamos em poucas horas
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaWhatsapp className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Suporte via WhatsApp</h3>
            <p className="text-gray-600">
              Suporte Online das 8h as 23h todos os dias, para dúvidas e reclamações
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaRocket className="mx-auto text-4xl text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Barato e acessível</h3>
            <p className="text-gray-600">
              Orgulhamos de nossa alta qualidade, velocidade e preços
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaShieldAlt className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pagamentos seguros</h3>
            <p className="text-gray-600">
              Temos métodos populares como MERCADO PAGO para processar seus pedidos
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/instagram"
            className="bg-[#C43582] text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-[#a62c6c] transition"
          >
            Clique aqui e Comece agora
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicosSection;
