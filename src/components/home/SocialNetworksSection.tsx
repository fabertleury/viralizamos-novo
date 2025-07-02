'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FaInstagram } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';

// Interface para as redes sociais
interface SocialNetwork {
  id: string;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  url: string;
  icon_url?: string;
}

const SocialNetworksSection = () => {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSocialNetworks = async () => {
      try {
        const { data: socialsData, error } = await supabase
          .from('socials')
          .select('*')
          .eq('active', true)
          .order('order_position');

        if (error) {
          throw error;
        }

        if (socialsData) {
          setSocialNetworks(socialsData);
        }
      } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        toast.error('Erro ao carregar redes sociais');
      }
    };

    fetchSocialNetworks();
  }, []);

  return (
    <section className="choose-social">
      <div className="container">
        <div className="section-header text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Turbine seus seguidores, curtidas, comentários e muito mais...</h2>
          <p className="text-xl text-gray-600">Escolha a rede social que você deseja impulsionar</p>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
          {socialNetworks.map((social) => (
            <div key={social.id} className="col">
              <div className={`social-card ${social.active ? 'active' : 'disabled'}`}>
                <div className="icon">
                  {social.icon_url ? (
                    <img src={social.icon_url} alt={social.name} className="custom-icon" />
                  ) : (
                    <FaInstagram />
                  )}
                </div>
                <h3>{social.name}</h3>
                <Link 
                  href={social.active ? `/${social.url}` : '#'} 
                  className="btn-choose"
                >
                  COMPRAR AGORA
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialNetworksSection;
