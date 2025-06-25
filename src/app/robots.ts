import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/instagram',
          '/instagram/seguidores',
          '/instagram/curtidas',
          '/instagram/visualizacoes',
          '/instagram/comentarios',
          '/faq',
          '/analisar-perfil',
          '/acompanhar-pedido',
          '/termos-de-uso',
          '/politica-de-privacidade',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout/*',
          '/login',
          '/login-admin',
        ]
      }
    ],
    sitemap: 'https://viralizamos.com/sitemap.xml',
  }
} 