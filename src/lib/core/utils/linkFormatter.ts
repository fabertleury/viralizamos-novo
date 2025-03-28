/**
 * Utilitário para formatação e análise de links
 */
export class LinkFormatter {
  /**
   * Extrai o código do post do Instagram de uma URL
   * @param url URL do post do Instagram
   * @returns Código do post ou null se não for possível extrair
   */
  extractPostCode(url: string): string | null {
    if (!url) return null;
    
    try {
      // Verificar se a URL contém instagram.com
      if (!url.includes('instagram.com')) return null;
      
      // Vários padrões para extrair códigos de posts ou reels do Instagram
      
      // Padrão 1: instagram.com/p/{code}
      let match = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      
      // Padrão 2: instagram.com/reel/{code}
      if (!match || !match[1]) {
        match = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
      }
      
      // Padrão 3: cualquier otro formato después de /p/ o /reel/
      if (!match || !match[1]) {
        match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)(?:\/|\?|$)/);
        if (match && match[2]) {
          return match[2];
        }
      }
      
      if (match && match[1]) {
        return match[1];
      }
    } catch (error) {
      console.error('[LinkFormatter] Erro ao extrair código do post:', error);
    }
    
    return null;
  }

  /**
   * Verifica se um link é de um reel
   * @param url URL para analisar
   * @returns true se for um reel, false caso contrário
   */
  isReelUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('/reel/');
  }

  /**
   * Formata um link do Instagram para o formato padrão
   * @param link Link do Instagram
   * @returns Link formatado
   */
  formatInstagramLink(link: string): string | null {
    try {
      if (!link) return null;
      
      // Remover parâmetros de URL
      link = link.split('?')[0];
      
      // Remover / final se existir
      link = link.endsWith('/') ? link.slice(0, -1) : link;
      
      // Verificar se é um link do Instagram
      if (!link.includes('instagram.com')) {
        // Tentar adicionar o domínio se for apenas um username
        if (link.startsWith('@')) {
          return `https://instagram.com/${link.substring(1)}`;
        }
        
        // Se não tiver http/https, adicionar
        if (!link.startsWith('http')) {
          if (link.includes('instagram.com')) {
            return `https://${link}`;
          } else {
            return `https://instagram.com/${link}`;
          }
        }
      }
      
      // Se for um link de reel, garantir o formato correto
      if (link.includes('/reel/')) {
        const reelCode = this.extractInstagramCode(link);
        if (reelCode) {
          return `https://instagram.com/reel/${reelCode}`;
        }
      }
      
      // Se for um link de post, garantir o formato correto
      if (link.includes('/p/')) {
        const postCode = this.extractInstagramCode(link);
        if (postCode) {
          return `https://instagram.com/p/${postCode}`;
        }
      }
      
      return link;
    } catch (error) {
      console.error('[LinkFormatter] Erro ao formatar link do Instagram:', error);
      return link;
    }
  }
  
  /**
   * Extrai o código de um link do Instagram (post ou reel)
   * @param link Link do Instagram
   * @returns Código do post ou reel
   */
  extractInstagramCode(link: string): string | null {
    try {
      if (!link) return null;
      
      // Remover parâmetros de URL
      link = link.split('?')[0];
      
      // Remover / final se existir
      link = link.endsWith('/') ? link.slice(0, -1) : link;
      
      // Extrair código de post
      if (link.includes('/p/')) {
        const matches = link.match(/\/p\/([^\/]+)/);
        return matches ? matches[1] : null;
      }
      
      // Extrair código de reel
      if (link.includes('/reel/')) {
        const matches = link.match(/\/reel\/([^\/]+)/);
        return matches ? matches[1] : null;
      }
      
      // Extrair código de história (story)
      if (link.includes('/stories/')) {
        const matches = link.match(/\/stories\/([^\/]+)/);
        return matches ? matches[1] : null;
      }
      
      // Se for apenas o código
      if (/^[a-zA-Z0-9_-]+$/.test(link) && link.length >= 6 && link.length <= 15) {
        return link;
      }
      
      return null;
    } catch (error) {
      console.error('[LinkFormatter] Erro ao extrair código do Instagram:', error);
      return null;
    }
  }

  /**
   * Extrai o username do Instagram de uma URL
   * @param url URL do perfil do Instagram
   * @returns Username extraído ou null se não for possível extrair
   */
  extractUsername(url: string): string | null {
    if (!url) return null;
    
    try {
      // Remover http:// ou https:// e www.
      let cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Padrão: instagram.com/username
      const match = cleanUrl.match(/^instagram\.com\/([A-Za-z0-9._]+)(?:\/|\?|$)/);
      
      if (match && match[1]) {
        // Verificar se não é um caminho especial
        if (['p', 'reel', 'explore', 'about', 'developer'].includes(match[1])) {
          return null;
        }
        
        return match[1];
      }
    } catch (error) {
      console.error('[LinkFormatter] Erro ao extrair username:', error);
    }
    
    return null;
  }

  /**
   * Formata um link de perfil do Instagram
   * @param username Username do Instagram
   * @returns Link formatado para o perfil
   */
  formatProfileLink(username: string): string {
    if (!username) return '';
    
    // Remover @ se existir
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
    // Remover https://instagram.com/ se existir
    const finalUsername = cleanUsername.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
    
    return `https://instagram.com/${finalUsername}`;
  }
} 