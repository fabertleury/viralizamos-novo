'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations as ptTranslations } from '@/translations/pt';
import { translations as enTranslations } from '@/translations/en';
import { translations as esTranslations } from '@/translations/es';

// Definir tipos para o contexto
type Language = 'pt' | 'en' | 'es';
type Translations = typeof ptTranslations;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  translations: ptTranslations,
  changeLanguage: () => {}
});

// Hook para usar o contexto de idioma
export const useLanguage = () => useContext(LanguageContext);

// Provedor de contexto de idioma
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [translations, setTranslations] = useState<Translations>(ptTranslations);

  // Função para detectar idioma do navegador ou IP
  const detectLanguage = async () => {
    try {
      // Primeiro, tenta obter o idioma do navegador
      const browserLanguage = navigator.language.split('-')[0] as Language;
      if (['pt', 'en', 'es'].includes(browserLanguage)) {
        setLanguage(browserLanguage);
        setTranslations(getTranslations(browserLanguage));
        return;
      }

      // Se não encontrar, busca geolocalização por IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryLanguageMap: Record<string, Language> = {
        'BR': 'pt',
        'PT': 'pt',
        'US': 'en',
        'GB': 'en',
        'ES': 'es',
        'AR': 'es',
        'MX': 'es'
      };

      const detectedLang = countryLanguageMap[data.country_code] || 'pt';
      setLanguage(detectedLang);
      setTranslations(getTranslations(detectedLang));
    } catch (error) {
      console.error('Erro ao detectar idioma:', error);
      // Fallback para português
      setLanguage('pt');
      setTranslations(ptTranslations);
    }
  };

  // Função para obter traduções com base no idioma
  const getTranslations = (lang: Language): Translations => {
    switch (lang) {
      case 'en': return enTranslations;
      case 'es': return esTranslations;
      default: return ptTranslations;
    }
  };

  // Função para alterar o idioma
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setTranslations(getTranslations(lang));
  };

  // Detecta o idioma quando o componente é montado
  useEffect(() => {
    // Verificar se estamos no navegador antes de tentar acessar o objeto navigator
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('preferred_language') as Language;
        if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
          setLanguage(savedLang);
          setTranslations(getTranslations(savedLang));
        } else {
          // Se não tem preferência salva, então detecta
          detectLanguage();
        }
      } catch (e) {
        console.error('Erro ao acessar localStorage:', e);
        detectLanguage();
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
