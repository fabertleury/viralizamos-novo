import { Post } from '../types';
import { LinkFormatter } from '../linkFormatter';

/**
 * Serviço para manipulação e formatação de links
 */
export class LinkService {
  private linkFormatter = new LinkFormatter();

  /**
   * Verifica se um post é um reel baseado em suas propriedades
   * @param post Post para verificar
   * @returns Verdadeiro se for um reel
   */
  isReel(post: any): boolean {
    // Verificar os identificadores mais comuns de reels
    if (!post) {
      console.log('[LinkService] isReel: post é null ou undefined');
      return false;
    }
    
    // Verificar explicitamente cada propriedade para evitar problemas com undefined
    if (post.type === 'reel') {
      console.log('[LinkService] isReel: identificado como reel pelo type');
      return true;
    }
    
    if (post.url && typeof post.url === 'string' && post.url.includes('/reel/')) {
      console.log('[LinkService] isReel: identificado como reel pela URL');
      return true;
    }
    
    if (post.permalink && typeof post.permalink === 'string' && post.permalink.includes('/reel/')) {
      console.log('[LinkService] isReel: identificado como reel pelo permalink');
      return true;
    }
    
    if (post.is_video === true) {
      console.log('[LinkService] isReel: identificado como reel por ser vídeo');
      return true;
    }
    
    console.log('[LinkService] isReel: não identificado como reel, considerando post normal');
    // Default: considerar como post normal
    return false;
  }

  /**
   * Formata um link de post para o formato aceito pelo provedor
   * @param post Post ou objeto contendo informações do post
   * @returns Link formatado
   */
  formatPostLinkForProvider(post: any): string {
    try {
      console.log('[LinkService] Formatando link para o provedor:', post);
      
      // Usar o formatPostLink do LinkFormatter para garantir compatibilidade
      if (post instanceof Object) {
        const postObj = post as Post;
        return this.linkFormatter.formatPostLink(postObj);
      }
      
      // Caso seja apenas uma string, tentar formatá-la como URL de Instagram
      if (typeof post === 'string') {
        const formattedLink = this.linkFormatter.formatInstagramLink(post);
        return formattedLink || post;
      }
      
      // Se for outra coisa, tratar como objeto Post
      const postCode = post.postCode || post.code || post.shortcode;
      
      if (!postCode) {
        console.error('[LinkService] Nenhum código de post encontrado:', post);
        // Se não tiver código, tentar usar a URL diretamente
        if (post.url) {
          console.log('[LinkService] Usando URL direta:', post.url);
          return post.url;
        }
        throw new Error('Código do post não encontrado');
      }
      
      console.log('[LinkService] Código do post identificado:', postCode);
      
      // Verificar se é um reel baseado nas propriedades disponíveis
      const isReel = this.isReel(post);
      
      // Formatar o link com base no tipo (post ou reel)
      const postType = isReel ? 'reel' : 'p';
      const formattedLink = `https://instagram.com/${postType}/${postCode}`;
      
      console.log(`[LinkService] Link formatado: ${formattedLink} (isReel=${isReel}, postType=${postType})`);
      
      return formattedLink;
    } catch (error) {
      console.error('[LinkService] Erro ao formatar link para o provedor:', error);
      
      // Em caso de erro, tentar retornar a URL original
      if (post.url) {
        return post.url;
      }
      
      throw error;
    }
  }

  /**
   * Formata o link de um perfil para o formato adequado para o provedor
   * @param profileLink Link do perfil
   * @param username Nome de usuário alternativo
   * @param isFollowersOrder Se é um pedido de seguidores
   * @returns Username formatado para o provedor
   */
  formatProfileLinkForProvider(profileLink: string, username?: string, isFollowersOrder: boolean = false): string {
    // Para seguidores, extrair apenas o username sem URL
    const extractedUsername = this.linkFormatter.extractUsername(profileLink);
    
    // Se for um pedido de seguidores, retornar apenas o username sem URL
    if (isFollowersOrder) {
      console.log('[LinkService] Pedido de seguidores, retornando apenas o username');
      if (extractedUsername) {
        return extractedUsername;
      } else if (username) {
        return username.replace('@', '');
      }
      // Se não conseguir extrair, tentar extrair da URL diretamente
      return profileLink.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').replace(/\?.*$/, '');
    }
    
    // Para outros tipos de pedidos, retornar a URL completa
    if (extractedUsername) {
      // Retornar o link completo com https para o provedor
      return `https://instagram.com/${extractedUsername}`;
    } else if (username) {
      // Se não conseguir extrair o username, usar o que já temos
      const cleanUsername = username.replace('@', '');
      return `https://instagram.com/${cleanUsername}`;
    }
    
    // Se não conseguir extrair o username, retornar o link original
    // Garantir que o link tenha https://
    if (!profileLink.startsWith('https://')) {
      return profileLink.startsWith('http://') 
        ? profileLink.replace('http://', 'https://') 
        : `https://${profileLink}`;
    }
    
    return profileLink;
  }

  /**
   * Determina se um link é para um pedido de seguidores
   * @param transaction Transação
   * @returns Verdadeiro se for um pedido de seguidores
   */
  isFollowersLink(checkoutType?: string, serviceType?: string, serviceName?: string): boolean {
    return (
      checkoutType === 'Apenas Link do Usuário' || 
      serviceType === 'followers' ||
      (serviceName && serviceName.toLowerCase().includes('seguidor'))
    );
  }

  /**
   * Extrai o código de um link do Instagram
   * @param link Link do Instagram
   * @returns Código do post ou null se não encontrado
   */
  extractPostCode(link: string): string | null {
    try {
      if (!link || typeof link !== 'string') {
        return null;
      }
      
      // Para links diretos de posts ou reels
      const match = link.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
      if (match && match[2]) {
        return match[2];
      }
      
      // Para links que podem conter apenas o código
      if (link.length >= 6 && link.length <= 12 && !link.includes('/') && !link.includes(' ')) {
        return link;
      }
      
      return null;
    } catch (error) {
      console.error('[LinkService] Erro ao extrair código do post:', error);
      return null;
    }
  }
}
