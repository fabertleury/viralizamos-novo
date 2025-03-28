import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CookieConsentProps {
  className?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="relative p-6">
          <button 
            onClick={handleClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center mb-4">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-pink-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Este site usa cookies</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Ao clicar em "Aceitar todos os cookies", concorda com o armazenamento de cookies no seu dispositivo para melhorar a navegação no site, analisar a utilização do site e ajudar nas nossas iniciativas de marketing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handleAccept} 
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Aceitar todos os cookies
            </button>
            <button 
              onClick={handleReject} 
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition-colors"
            >
              Recusar cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
