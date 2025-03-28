'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SocialIcon } from '@/components/ui/social-icon';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Social {
  id: string;
  name: string;
  icon: string;
  url: string;
  slug: string;
  active: boolean;
  order_position: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  url: string;
  social?: Social;
  social_id?: string;
  order_position: number;
  active: boolean;
}

export function Header() {
  const [socialNetworks, setSocialNetworks] = useState<Social[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const supabase = useSupabase();
  const { language, translations } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100); // Fica sticky após 100px de rolagem
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar se usuário está logado
        const { data: { user } } = await supabase.client.auth.getUser();
        setIsLoggedIn(!!user);

        // Buscar redes sociais ativas
        const { data: socialsData } = await supabase.client
          .from('socials')
          .select('*')
          .eq('active', true)
          .order('order_position', { ascending: true });

        if (socialsData) {
          // Garantir que o link para Instagram seja sempre absoluto
          const processedSocials = socialsData.map(social => {
            if (social.slug === 'instagram') {
              return {
                ...social,
                url: '/instagram' // Garantir que seja um caminho absoluto
              };
            }
            return social;
          });
          setSocialNetworks(processedSocials);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <header 
      className={`
        bg-white border-b transition-all duration-300 z-[9999]
        ${isSticky 
          ? 'fixed top-0 left-0 right-0 shadow-md animate-slide-down' 
          : 'relative'
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/viralizamos-color.png"
              alt="Viralizamos"
              width={150}
              height={50}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="block md:hidden p-2 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-primary">
              {translations.header.home}
            </Link>
            
            <Link href="/instagram" className="text-gray-700 hover:text-gray-900">
              Serviços para Instagram
            </Link>
            
            {/* FAQ Link */}
            <Link href="/faq" className="text-gray-700 hover:text-primary">
              FAQ
            </Link>
            
            {/* Action Buttons */}
            <Button asChild variant="ghost" className="font-medium bg-[#C43582] text-white hover:bg-[#a62c6c]">
              <Link href="/analisar-perfil">
                {translations.header.analyzeProfile}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="font-medium bg-[#C43582] text-white hover:bg-[#a62c6c]">
              <Link href="/acompanhar-pedido">
                {translations.header.trackOrder}
              </Link>
            </Button>
            
            {/* Tickets - só aparece se logado */}
            {isLoggedIn && (
              <div className="relative group">
                <Button asChild variant="ghost" className="font-medium bg-[#C43582] text-white hover:bg-[#a62c6c]">
                  <Link href="/tickets">
                    {translations.header.tickets}
                  </Link>
                </Button>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce">
                  1
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-white z-40 pt-20">
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col space-y-4">
                  <Link 
                    href="/" 
                    className="text-gray-700 hover:text-primary py-2 border-b"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {translations.header.home}
                  </Link>
                  
                  <Link 
                    href="/instagram" 
                    className="text-gray-700 hover:text-gray-900 py-2 border-b"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Serviços para Instagram
                  </Link>
                  
                  <Link 
                    href="/faq" 
                    className="text-gray-700 hover:text-primary py-2 border-b"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  
                  <div className="pt-4">
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full font-medium bg-[#C43582] text-white hover:bg-[#a62c6c] mb-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/analisar-perfil">
                        {translations.header.analyzeProfile}
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="w-full font-medium bg-[#C43582] text-white hover:bg-[#a62c6c] mb-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/acompanhar-pedido">
                        {translations.header.trackOrder}
                      </Link>
                    </Button>
                    
                    {isLoggedIn && (
                      <Button 
                        asChild 
                        variant="ghost" 
                        className="w-full font-medium bg-[#C43582] text-white hover:bg-[#a62c6c]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/tickets">
                          {translations.header.tickets}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
