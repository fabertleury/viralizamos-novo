'use client';

import React from 'react';
import Link from 'next/link';
import { FaClock, FaWhatsapp, FaRocket, FaShieldAlt } from 'react-icons/fa';

// Componente de Serviços
const ServicosSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaClock className="mx-auto text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Resultados rápidos</h3>
            <p className="text-gray-600">
              Seguidores e curtidas entregues em minutos - Mais de 98% dos pedidos são finalizados em menos de 24 horas
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaWhatsapp className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Suporte via WhatsApp</h3>
            <p className="text-gray-600">
              Suporte Online das 8h as 23h todos os dias, para dúvidas e reclamações sobre seus pedidos de seguidores
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaRocket className="mx-auto text-4xl text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Barato e acessível</h3>
            <p className="text-gray-600">
              Os melhores preços do mercado para comprar seguidores brasileiros reais e curtidas de qualidade para Instagram
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
            <FaShieldAlt className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pagamentos seguros</h3>
            <p className="text-gray-600">
              Métodos de pagamento seguros como MERCADO PAGO para comprar seguidores, curtidas e visualizações com segurança
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/instagram"
            className="bg-[#C43582] text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-[#a62c6c] transition"
          >
            Comprar Seguidores e Curtidas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicosSection;
