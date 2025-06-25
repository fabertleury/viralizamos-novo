import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://viralizamos.com';
  
  // Data de atualização padrão
  const currentDate = new Date().toISOString();
  
  return [
    // Páginas principais - Alta prioridade
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/instagram`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Serviços principais de Instagram - Prioridade alta
    {
      url: `${baseUrl}/instagram/seguidores`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instagram/curtidas`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instagram/visualizacoes`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instagram/comentarios`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    
    // Páginas secundárias
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/analisar-perfil`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/acompanhar-pedido`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
} 