import axios from 'axios';

/**
 * Interface para os resultados da verificação de perfil
 */
export interface ProfileCheckResult {
  isPublic: boolean;
  username: string;
  profilePicUrl?: string | null;
  fullName?: string | null;
  error?: string | null;
  foundIndicators?: string[];
  htmlSnippet?: string;
  privateTextContext?: string;
}

/**
 * Classe para fazer scraping de perfis do Instagram
 * Verifica se um perfil é público ou privado sem depender de APIs externas
 */
export class InstagramProfileScraper {
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  /**
   * Verifica se um perfil do Instagram é público ou privado
   * @param username Nome de usuário do Instagram
   * @returns Resultado da verificação
   */
  public async checkProfile(username: string): Promise<ProfileCheckResult> {
    try {
      console.log(`[ProfileScraper] Verificando perfil: ${username}`);
      
      // Limpar o username (remover @ e espaços)
      const cleanUsername = username.trim().replace(/^@/, '');
      
      // Usar o endpoint de API do servidor para fazer o scraping
      const response = await axios.get(`/api/instagram/scraper?username=${cleanUsername}`);
      
      // Garantir que o username esteja no resultado
      const result = {
        ...response.data,
        username: cleanUsername
      };
      
      // Retornar o resultado do scraping
      return result;
    } catch (error: any) {
      console.error(`[ProfileScraper] Erro ao verificar perfil ${username}:`, error);
      
      // Retornar erro
      return {
        isPublic: false,
        username,
        profilePicUrl: null,
        fullName: null,
        error: error.message || 'Erro desconhecido ao verificar perfil',
        foundIndicators: [],
        htmlSnippet: null
      };
    }
  }
  
  /**
   * Verifica se um perfil é privado com base no HTML da página
   * @param html HTML da página do perfil
   * @returns true se o perfil for privado, false caso contrário
   */
  private checkIfProfileIsPrivate(html: string): boolean {
    // Indicadores de perfil privado no HTML
    const privateIndicators = [
      'Esta conta é privada',
      'This account is private',
      'Conta privada',
      'Private account',
      '"is_private":true',
      '"isPrivate":true',
      'Siga esta conta para ver suas fotos e vídeos',
      'Follow this account to see their photos and videos'
    ];
    
    // Verificar cada indicador
    for (const indicator of privateIndicators) {
      if (html.includes(indicator)) {
        console.log(`[ProfileScraper] Indicador de perfil privado encontrado: "${indicator}"`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Extrai informações básicas do perfil a partir do HTML
   * @param html HTML da página do perfil
   * @param username Nome de usuário do perfil
   * @returns Informações básicas do perfil
   */
  private extractProfileInfo(html: string, username: string): { profilePicUrl?: string | null, fullName?: string | null } {
    const result: { profilePicUrl?: string | null, fullName?: string | null } = {};
    
    try {
      // Tentar extrair a URL da foto de perfil
      const profilePicRegex = /"profile_pic_url":"([^"]+)"/;
      const profilePicMatch = html.match(profilePicRegex);
      if (profilePicMatch && profilePicMatch[1]) {
        result.profilePicUrl = profilePicMatch[1].replace(/\\u0026/g, '&');
      }
      
      // Tentar extrair o nome completo
      const fullNameRegex = /"full_name":"([^"]+)"/;
      const fullNameMatch = html.match(fullNameRegex);
      if (fullNameMatch && fullNameMatch[1]) {
        result.fullName = fullNameMatch[1];
      }
    } catch (error) {
      console.error('[ProfileScraper] Erro ao extrair informações do perfil:', error);
    }
    
    return result;
  }
}

/**
 * Função auxiliar para verificar se um perfil do Instagram é público
 * Usa o endpoint de API do servidor para evitar problemas de CORS
 * @param username Nome de usuário do Instagram
 * @returns Promise com o resultado da verificação
 */
export async function checkInstagramProfilePublic(username: string): Promise<ProfileCheckResult> {
  try {
    console.log(`[ProfileScraper] Verificando perfil: ${username}`);
    
    // Limpar o username (remover @ e espaços)
    const cleanUsername = username.trim().replace(/^@/, '');
    
    // Usar o endpoint de API do servidor para fazer o scraping
    const response = await axios.get(`/api/instagram/scraper?username=${cleanUsername}`);
    
    // Garantir que o username esteja no resultado
    const result = {
      ...response.data,
      username: cleanUsername
    };
    
    return result;
  } catch (error: any) {
    console.error(`[ProfileScraper] Erro ao verificar perfil ${username}:`, error);
    
    // Retornar erro
    return {
      isPublic: false,
      username,
      profilePicUrl: null,
      fullName: null,
      error: error.message || 'Erro desconhecido ao verificar perfil',
      foundIndicators: [],
      htmlSnippet: null
    };
  }
}
