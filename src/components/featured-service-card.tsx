'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SocialIcon } from '@/components/ui/social-icon';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  external_id: string;
  name: string;
  descricao: string;
  quantidade: number;
  preco: number;
  category: {
    id: string;
    name: string;
    icon: string;
    slug: string;
    social: {
      id: string;
      name: string;
      icon: string;
    };
  };
  checkout: {
    id: string;
    slug: string;
  };
}

interface GroupedService {
  external_id: string;
  name: string;
  descricao: string;
  category: Service['category'];
  checkout: Service['checkout'];
  options: {
    quantidade: number;
    preco: number;
    id: string;
  }[];
}

interface FeaturedServiceCardProps {
  services: Service[];
  gridCols?: 'three' | 'four';
}

function ServiceCard({ group }: { group: GroupedService }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedOption = group.options[selectedIndex];

  const getDiscount = (index: number) => {
    if (index === 0) return 0;
    const basePrice = group.options[0].preco / group.options[0].quantidade;
    const currentPrice = group.options[index].preco / group.options[index].quantidade;
    const discount = ((basePrice - currentPrice) / basePrice) * 100;
    return Math.round(discount);
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      {/* Cabeçalho do Card */}
      <div className="flex items-center gap-2 mb-4">
        <SocialIcon name={group.category.social.icon} className="w-6 h-6" />
        <span className="text-sm text-gray-500">{group.category.name}</span>
      </div>

      {/* Título e Descrição */}
      <div className="mb-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{group.name}</h3>
        <p className="text-gray-600 line-clamp-3">{group.descricao}</p>
      </div>

      {/* Seleção de quantidade */}
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Escolha a quantidade que deseja:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {group.options.map((option, index) => (
            <button
              key={option.quantidade}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative p-3 rounded-lg transition-all
                ${index === selectedIndex 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <div className="text-sm font-semibold">
                {option.quantidade.toLocaleString()}
              </div>
              {getDiscount(index) > 0 && (
                <div className={`text-xs mt-1 ${index === selectedIndex ? 'text-white' : 'text-pink-600'}`}>
                  -{getDiscount(index)}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preço e Botão */}
      <div className="mt-6">
        <p className="text-2xl font-bold text-gray-900 mb-4">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(selectedOption?.preco || group.options[0].preco)}
        </p>
        <Link 
          href={`/checkout/instagram/${group.checkout.slug}/step1?service_id=${selectedOption?.id || group.options[0].id}`}
          className="block w-full"
        >
          <Button className="w-full">
            Comprar Agora
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function FeaturedServiceCard({ services, gridCols = 'three' }: FeaturedServiceCardProps) {
  const [groupedServices, setGroupedServices] = useState<GroupedService[]>([]);

  useEffect(() => {
    if (!services?.length) return;

    // Agrupar serviços com mesmo external_id
    const groups: { [key: string]: GroupedService } = {};

    services.forEach((service) => {
      const existingGroup = groups[service.external_id];

      if (existingGroup) {
        existingGroup.options.push({
          quantidade: service.quantidade,
          preco: service.preco,
          id: service.id
        });
        // Ordenar opções por quantidade
        existingGroup.options.sort((a, b) => a.quantidade - b.quantidade);
      } else {
        groups[service.external_id] = {
          external_id: service.external_id,
          name: service.name,
          descricao: service.descricao,
          category: service.category,
          checkout: service.checkout,
          options: [{
            quantidade: service.quantidade,
            preco: service.preco,
            id: service.id
          }]
        };
      }
    });

    const groupedArray = Object.values(groups);
    setGroupedServices(groupedArray);
  }, [services]);

  if (!services?.length) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${
      gridCols === 'four' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
    } gap-6`}>
      {groupedServices.map((group) => (
        <ServiceCard key={group.external_id} group={group} />
      ))}
    </div>
  );
}
