'use client';

import { useState } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentSectionProps {
  selectedPosts: string[];
  service: {
    quantidade: number;
    preco: number;
  };
  onPayment: (method: 'pix' | 'credit_card') => void;
  isLoading: boolean;
}

export default function PaymentSection({ selectedPosts, service, onPayment, isLoading }: PaymentSectionProps) {
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-[260px]">
      {/* Informações do serviço */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalhes do pedido:</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Serviço:</span>
              <span className="font-medium">{service.quantidade.toLocaleString()} curtidas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium text-green-600">
                R$ {service.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">Posts selecionados:</span>
              <span className="font-medium">{selectedPosts.length}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Curtidas por post:</span>
              <span className="font-medium">{(service.quantidade / 5).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados do comprador */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Dados do comprador:</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* Opções de pagamento */}
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Forma de pagamento:</h3>
        
        {/* Botão PIX */}
        <button
          onClick={() => onPayment('pix')}
          disabled={selectedPosts.length === 0 || isLoading}
          className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
            selectedPosts.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Pagar com PIX</span>
        </button>

        {/* Botão Cartão de Crédito */}
        <button
          onClick={() => onPayment('credit_card')}
          disabled={selectedPosts.length === 0 || isLoading}
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
            selectedPosts.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <CreditCardIcon className="w-6 h-6" />
          <span>Pagar com Cartão</span>
        </button>
      </div>
    </div>
  );
}
