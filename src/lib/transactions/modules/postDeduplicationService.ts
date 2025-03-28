import { Post } from './types';
import { LinkFormatter } from './linkFormatter';
import fs from 'fs';
import path from 'path';

// Função para garantir que o diretório log existe
function ensureLogDirectoryExists() {
  const logDir = path.join(process.cwd(), 'log');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
      console.log('[Logger] Diretório de log criado:', logDir);
    } catch (err) {
      console.error('[Logger] Erro ao criar diretório de log:', err);
    }
  }
  return logDir;
}

// Função para registrar log em arquivo
function logToFile(message: string) {
  try {
    const logDir = ensureLogDirectoryExists();
    const date = new Date();
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const logFile = path.join(logDir, `post-deduplication-${dateStr}.log`);
    
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('[Logger] Erro ao escrever no arquivo de log:', err);
  }
}

/**
 * Serviço para garantir que não haja duplicatas de posts sendo processados
 */
export class PostDeduplicationService {
  private linkFormatter = new LinkFormatter();

  /**
   * Formata um link de post para normalização e comparação
   * @param post Objeto do post contendo o link
   * @returns Link formatado
   */
  private formatPostLinkForProvider(post: Post): string {
    let formattedLink = '';
    try {
      if (post.link || post.url) {
        const postUrl = post.link || post.url;
        // Formatar o link para ter um formato padronizado para comparação
        if (postUrl) {
          formattedLink = this.linkFormatter.formatInstagramLink(postUrl);
        }
      } else if (post.code) {
        formattedLink = this.linkFormatter.formatInstagramLink(`https://instagram.com/p/${post.code}`);
      }
    } catch (error) {
      console.error('[PostDeduplication] Erro ao formatar link:', error);
    }
    return formattedLink;
  }

  /**
   * Normaliza uma URL de post
   * @param url URL a ser normalizada
   * @returns URL normalizada
   */
  normalizePostUrl(url: string): string {
    if (!url) return '';
    
    try {
      // Remover https:// e parâmetros
      let normalizedUrl = url.replace(/^https?:\/\//, '')
                            .replace(/\?.*$/, '')
                            .replace(/\/$/, '');
      
      // Se for uma URL do Instagram, tentar extrair o código do post
      if (normalizedUrl.includes('instagram.com')) {
        const postCode = this.linkFormatter.extractPostCode(url);
        if (postCode) {
          return `instagram.com/p/${postCode}`;
        }
      }
      
      return normalizedUrl;
    } catch (error) {
      console.error('[PostDeduplicationService] Erro ao normalizar URL:', error);
      return url;
    }
  }

  /**
   * Deduplica uma lista de posts usando o código (shortcode) como identificador único
   * @param posts Lista de posts para remover duplicatas
   * @returns Lista de posts sem duplicatas
   */
  deduplicatePosts(posts: Post[]): Post[] {
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      console.log('[PostDeduplicationService] Lista de posts vazia ou indefinida');
      logToFile('[PostDeduplicationService] Lista de posts vazia ou indefinida');
      return [];
    }

    console.log(`[PostDeduplication] Iniciando deduplicação de ${posts.length} posts`);
    logToFile(`[PostDeduplication] Iniciando deduplicação de ${posts.length} posts`);
    
    try {
      // Mapa para armazenar posts únicos por código
      const uniquePostsByCode = new Map<string, Post>();
      
      // Mapa para armazenar posts únicos por URL
      const uniquePostsByUrl = new Map<string, Post>();
      
      // Mapa para armazenar posts únicos por ID
      const uniquePostsById = new Map<string, Post>();
      
      // Primeiro, agrupar por código para maior precisão
      for (const post of posts) {
        try {
          // Log do post original para depuração
          const postDetails = JSON.stringify({
            code: post.postCode || post.code || post.shortcode,
            link: post.link || post.url,
            id: post.id
          });
          logToFile(`[PostDeduplication] Processando post: ${postDetails}`);
          
          // Tentar formatar o link para extrair o código
          const code = post.postCode || post.code || post.shortcode;
          const url = post.link || post.url;
          const id = post.id;
          
          let normalizedCode: string | null = null;
          
          if (url) {
            try {
              // Tenta formatar o link para extrair o código
              const result = this.linkFormatter.formatInstagramLink(url);
              normalizedCode = result.postCode;
              logToFile(`[PostDeduplication] Extraído código '${normalizedCode}' do link: ${url}`);
            } catch (error) {
              console.error(`[PostDeduplication] Erro ao formatar link: ${url}`, error);
              logToFile(`[PostDeduplication] Erro ao formatar link: ${url}, Erro: ${error}`);
              // Se não conseguir extrair o código, continua com o código original
              normalizedCode = code;
            }
          } else {
            normalizedCode = code;
          }
          
          let isDuplicate = false;
          let existingPost: Post | undefined;
          let duplicateReason = '';
          
          // Verificar duplicação por código
          if (normalizedCode && uniquePostsByCode.has(normalizedCode)) {
            isDuplicate = true;
            existingPost = uniquePostsByCode.get(normalizedCode);
            duplicateReason = `