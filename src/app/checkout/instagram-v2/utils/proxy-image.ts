export function getProxiedImageUrl(originalUrl: string) {
  // Se não tiver URL, retornar uma imagem padrão
  if (!originalUrl) {
    return '/images/placeholder-post.svg';
  }

  // Se a URL já estiver usando o proxy, retorná-la diretamente
  if (originalUrl.startsWith('/api/proxy-image') || originalUrl.startsWith('/api/proxy/image')) {
    return originalUrl;
  }

  // Usar a URL diretamente se já tivermos ela da API
  if (originalUrl.includes('cdninstagram.com') || originalUrl.includes('fbcdn.net')) {
    return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // Se não for uma URL do CDN, retornar a URL original
  return originalUrl;
}
