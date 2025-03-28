import { logger } from '@/lib/logger'

/**
 * Classe utilitária para formatação de links para diferentes provedores
 */
export class LinkFormatter {
  /**
   * Formata um link de post para o formato aceito pelo provedor
   * @param link Link original do post
   * @param providerId ID do provedor 
   * @returns Link formatado para o provedor
   */
  formatPostLinkForProvider(link: string, providerId: string): string {
    try {
      // Remover possíveis caracteres de escape ou aspas
      const cleanLink = this.cleanLink(link)
      
      // Extrair código do post do Instagram
      const postCode = this.extractInstagramPostCode(cleanLink)
      
      if (!postCode) {
        logger.warn('Não foi possível extrair código do post', { link })
        return cleanLink
      }
      
      // Para o provedor de redes sociais, formatamos como código puro
      if (providerId === '153eb018-772e-47ff-890f-4f05b924e9ad') {
        return postCode
      }
      
      // Para outros provedores, retornar o link limpo
      return cleanLink
    } catch (error) {
      logger.error('Erro ao formatar link para provedor', { error, link, providerId })
      return link
    }
  }
  
  /**
   * Limpa um link removendo caracteres indesejados
   */
  private cleanLink(link: string): string {
    if (!link) return ''
    
    return link.trim()
      .replace(/^["';]|["';]$/g, '') // Remove aspas ou ponto-e-vírgula do início e fim
      .replace(/\\"/g, '"') // Substitui \" por "
  }
  
  /**
   * Extrai o código de um post do Instagram a partir da URL
   */
  extractInstagramPostCode(link: string): string | null {
    if (!link) return null
    
    try {
      // https://instagram.com/p/ABC123/
      // https://www.instagram.com/p/ABC123
      // https://www.instagram.com/reel/ABC123
      const regexPatterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/
      ]
      
      for (const regex of regexPatterns) {
        const match = link.match(regex)
        if (match && match[1]) {
          return match[1]
        }
      }
      
      // Se o link já for apenas o código, retorná-lo
      if (/^[A-Za-z0-9_-]{10,12}$/.test(link)) {
        return link
      }
      
      return null
    } catch (error) {
      logger.error('Erro ao extrair código do post', { error, link })
      return null
    }
  }
}

// Instância singleton para uso em toda a aplicação
export const linkFormatter = new LinkFormatter() 