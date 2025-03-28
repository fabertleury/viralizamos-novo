import { Post } from './types';

/**
 * Classe para formatação de links do Instagram
 */
export class LinkFormatter {
  /**
   * Extrai o código do post do Instagram de uma URL
   * @param url URL do post do Instagram
   * @returns Código do post
   */
  extractPostCode(url: string): string | null {
    if (!url) return null;
    
    // Verificar se a URL contém instagram.com
    if (!url.includes('instagram.com')) return null;
    
    try {
      console.log('[LinkFormatter] Extraindo código do post de:', url);
      
      // Tentar diferentes padrões para extrair o código
      
      // Padrão 1: instagram.com/p/{code}
      let match = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      
      // Padrão 2: www.instagram.com/p/{code}
      if (!match || !match[1]) {
        match = url.match(/www\.instagram\.com\/p\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      }
      
      // Padrão 3: instagram.com/reel/{code}
      if (!match || !match[1]) {
        match = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      }
      
      // Padrão 4: www.instagram.com/reel/{code}
      if (!match || !match[1]) {
        match = url.match(/www\.instagram\.com\/reel\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      }
      
      // Padrão 5: Tentar extrair qualquer código após /p/ ou /reel/
      if (!match || !match[1]) {
        match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
        if (match && match[2]) {
          return match[2];
        }
      }
      
      if (match && match[1]) {
        console.log('[LinkFormatter] Código extraído:', match[1]);
        return match[1];
      } else {
        console.warn('[LinkFormatter] Não foi possível extrair o código do post:', url);
      }
    } catch (error) {
      console.error('[LinkFormatter] Erro ao extrair código do post:', error);
    }
    
    return null;
  }

  /**
   * Verifica se a URL é de um reel
   * @param url URL do post do Instagram
   * @returns true se for um reel, false caso contrário
   */
  isReelUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('/reel/');
  }

  /**
   * Formata um link do Instagram para o formato padrão
   * @param url URL original
   * @param includeHttps Se deve incluir o protocolo https:// no link
   * @returns Link formatado ou null se não for possível formatar
   */
  formatInstagramLink(url: string, includeHttps: boolean = true): string | null {
    if (!url) return null;
    
    console.log('[LinkFormatter] Formatando link do Instagram:', url);
    
    // Extrair o código do post
    const postCode = this.extractPostCode(url);
    if (!postCode) {
      console.error('[LinkFormatter] Não foi possível extrair o código do post:', url);
      return null;
    }
    
    console.log('[LinkFormatter] Código extraído:', postCode);
    
    // Verificar se é um reel ou post normal
    const isReel = this.isReelUrl(url);
    const postType = isReel ? 'reel' : 'p';
    
    // Formatar o link com ou sem https:// conforme necessário
    const formattedLink = includeHttps
      ? `https://instagram.com/${postType}/${postCode}`
      : `instagram.com/${postType}/${postCode}`;
    
    console.log('[LinkFormatter] Link formatado:', formattedLink);
    
    return formattedLink;
  }

  /**
   * Extrai o username do Instagram de uma URL
   * @param url URL do perfil do Instagram
   * @returns Username extraído ou null se não for possível extrair
   */
  extractUsername(url: string): string | null {
    if (!url) return null;
    
    try {
      console.log('[LinkFormatter] Extraindo username de:', url);
      
      // Remover http:// ou https:// e www.
      let cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Padrão: instagram.com/username
      const match = cleanUrl.match(/^instagram\.com\/([A-Za-z0-9._]+)(?:\/|\?|$)/);
      
      if (match && match[1]) {
        // Verificar se não é um caminho especial como /p/ ou /reel/
        if (['p', 'reel', 'explore', 'about', 'developer'].includes(match[1])) {
          return null;
        }
        
        console.log('[LinkFormatter] Username extraído:', match[1]);
        return match[1];
      }
    } catch (error) {
      console.error('[LinkFormatter] Erro ao extrair username:', error);
    }
    
    return null;
  }

  /**
   * Formata um link de perfil do Instagram para o formato padrão
   * @param username Username do Instagram
   * @param includeHttps Se deve incluir o protocolo https:// no link
   * @returns Link formatado
   */
  formatProfileLink(username: string, includeHttps: boolean = true): string {
    if (!username) return '';
    
    // Remover @ se existir
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
    // Remover https://instagram.com/ se existir
    const finalUsername = cleanUsername.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
    
    return includeHttps
      ? `https://instagram.com/${finalUsername}`
      : `instagram.com/${finalUsername}`;
  }

  /**
   * Formata o link de um post para o formato padrão
   * @param post Dados do post
   * @param includeHttps Se deve incluir o protocolo https:// no link
   * @returns Link formatado
   */
  formatPostLink(post: Post, includeHttps: boolean = true): string {
    try {
      console.log('[LinkFormatter] Formatando post:', post);
      
      // Verificar se é um reel baseado em múltiplos indicadores
      const isReel = 
        post.type === 'reel' || 
        (post.url && post.url.includes('/reel/')) || 
        (post.link && post.link.includes('/reel/'));
      
      const postType = isReel ? 'reel' : 'p';
      console.log('[LinkFormatter] Tipo de post detectado:', isReel ? 'REEL' : 'POST');
      
      // Se o post não tiver código, tentar extrair de url ou link
      if (!post.code && (post.url || post.link)) {
        const url = post.url || post.link;
        const postCode = this.extractPostCode(url);
        
        if (postCode) {
          console.log('[LinkFormatter] Link formatado a partir do código:', includeHttps ? `https://instagram.com/${postType}/${postCode}` : `instagram.com/${postType}/${postCode}`);
          return includeHttps 
            ? `https://instagram.com/${postType}/${postCode}` 
            : `instagram.com/${postType}/${postCode}`;
        }
      }
      
      // Se tiver código, usar diretamente
      if (post.code) {
        console.log('[LinkFormatter] Link formatado a partir do código:', includeHttps ? `https://instagram.com/${postType}/${post.code}` : `instagram.com/${postType}/${post.code}`);
        return includeHttps 
          ? `https://instagram.com/${postType}/${post.code}` 
          : `instagram.com/${postType}/${post.code}`;
      }
      
      // Fallback para url ou link original
      return post.url || post.link || '';
    } catch (error) {
      console.error('[LinkFormatter] Erro ao formatar link do post:', error);
      return post.url || post.link || '';
    }
  }
}
