'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SocialNetwork {
  id: string;
  name: string;
  icon: string;
  url: string;
  active: boolean;
  order_position: number;
}

interface SocialNetworksGridProps {
  socials: SocialNetwork[];
}

export function SocialNetworksGrid({ socials }: SocialNetworksGridProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">Os melhores preços para você</h3>
        <p className="text-lg text-gray-600">Escolha a sua plataforma:</p>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 pl-4">
            {socials.map((social) => (
              <div key={social.id} className="flex-[0_0_300px] min-w-0">
                <Link href={social.url} className="block group">
                  <Card className="w-full p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <i className={`fab fa-${social.icon} text-4xl text-white`}></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{social.name}</h3>
                    <p className="text-gray-600">
                      Confira nossos serviços para {social.name}
                    </p>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
