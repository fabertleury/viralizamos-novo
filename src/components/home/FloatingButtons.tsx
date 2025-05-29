'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTicketAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FloatingButtons = () => {
  const [configurations, setConfigurations] = useState<{[key: string]: string}>({
    whatsapp_numero: '+5562999915390',
    whatsapp_ativo: 'true',
    ticket_link: 'https://suporte.viralizamos.com',
    ticket_ativo: 'true'
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const { data, error } = await supabase
          .from('configurations')
          .select('key, value')
          .in('key', [
            'whatsapp_numero', 
            'whatsapp_ativo', 
            'ticket_link', 
            'ticket_ativo'
          ]);

        if (error) throw error;

        const configMap = data.reduce((acc, config) => {
          acc[config.key] = config.value;
          return acc;
        }, {});

        setConfigurations(prev => ({
          ...prev,
          ...configMap
        }));
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };

    fetchConfigurations();
  }, []);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
      {configurations['whatsapp_ativo'] === 'true' && (
        <a 
          href={`https://wa.me/${configurations['whatsapp_numero']?.replace(/\D/g, '')}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition"
        >
          <FaWhatsapp size={24} />
        </a>
      )}
      
      {configurations['ticket_ativo'] === 'true' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href={configurations['ticket_link'] || '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-500 text-white p-4 rounded-full shadow-xl hover:bg-blue-600 transition"
              >
                <FaTicketAlt size={24} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir Ticket</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default FloatingButtons;
