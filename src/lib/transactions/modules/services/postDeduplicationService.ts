import { Post } from '../types';
import { LinkFormatter } from '../linkFormatter';
import { createClient } from '@/lib/supabase/server';

/**
 * Serviço para detectar e remover posts/reels duplicados
 */
export class PostDeduplicationService {
  private linkFormatter = new LinkFormatter();
  private supabase = createClient();

  /**
   * Remove posts duplicados com base no código do post e outros identificadores
   * @param posts Lista de posts para processar
   * @param transactionId ID da transação
   * @returns Lista de posts sem duplicações
   */
  async deduplicatePosts(posts: Post[], transactionId?: string): Promise<Post[]> {
    if (!posts || posts.length === 0) {
      console.log('[PostDeduplication] Nenhum post para deduplicar');
      return [];
    }

    console.log(`[PostDeduplication] Iniciando deduplicação de ${posts.length} posts`);
    
    // Criar múltiplos sets para detectar duplicatas por diferentes identificadores
    const uniquePostsMap = new Map<string, Post>();
    const processedCodes = new Set<string>();
    const processedUrls = new Set<string>();
    const processedFormattedLinks = new Set<string>();
    
    const duplicatePostCodes: string[] = [];
    const duplicatePosts: Array<{
      postCode: string;
      originalPost: Post;
      duplicatePost: Post;
      transactionId?: string;
      createdAt: string;
      detectionMethod: string;
    }> = [];
    
    // Processar cada post
    for (const post of posts) {
      try {
        // Extrair o código do post de todas as possíveis fontes
        let postCode = post.postCode || post.code || post.shortcode;
        let postUrl = post.postLink || post.url || post.link;
        let formattedLink = '';
        
        // Se não tiver código, tentar extrair da URL
        if (!postCode && postUrl) {
          postCode = this.linkFormatter.extractPostCode(postUrl);
        }
        
        // Formatar o link para ter um formato padronizado para comparação
        if (postUrl) {
          formattedLink = this.linkFormatter.formatInstagramLink(postUrl);
        }
        
        // Se não conseguiu extrair código, usar a URL como identificador
        if (!postCode) {
          if (!postUrl) {
            console.warn('[PostDeduplication] Post sem código ou URL identificável:', post);
            continue; // Pular este post
          }
          postCode = postUrl;
        }
        
        // Verificar duplicação por código
        let isDuplicate = false;
        let detectionMethod = '';
        let originalPost: Post | undefined;
        
        if (processedCodes.has(postCode)) {
          isDuplicate = true;
          detectionMethod = 'post_code';
          originalPost = uniquePostsMap.get(postCode);
        } 
        // Verificar duplicação por URL
        else if (postUrl && processedUrls.has(postUrl)) {
          isDuplicate = true;
          detectionMethod = 'url';
          
          // Encontrar o post original com esta URL
          for (const [existingCode, existingPost] of uniquePostsMap.entries()) {
            const existingUrl = existingPost.postLink || existingPost.url || existingPost.link;
            if (existingUrl === postUrl) {
              originalPost = existingPost;
              break;
            }
          }
        } 
        // Verificar duplicação por link formatado
        else if (formattedLink && processedFormattedLinks.has(formattedLink)) {
          isDuplicate = true;
          detectionMethod = 'formatted_link';
          
          // Encontrar o post original com este link formatado
          for (const [existingCode, existingPost] of uniquePostsMap.entries()) {
            const existingUrl = existingPost.postLink || existingPost.url || existingPost.link;
            if (existingUrl) {
              const existingFormattedLink = this.linkFormatter.formatInstagramLink(existingUrl);
              
              if (existingFormattedLink === formattedLink) {
                originalPost = existingPost;
                break;
              }
            }
          }
        }
        
        if (isDuplicate && originalPost) {
          duplicatePostCodes.push(postCode);
          
          // Registrar a duplicação
          duplicatePosts.push({
            postCode,
            originalPost,
            duplicatePost: post,
            transactionId,
            createdAt: new Date().toISOString(),
            detectionMethod
          });
          
          console.log(`[PostDeduplication] Post duplicado encontrado: ${postCode} (método: ${detectionMethod})`);
        } else {
          // Adicionar aos conjuntos de processados
          uniquePostsMap.set(postCode, post);
          processedCodes.add(postCode);
          
          if (postUrl) {
            processedUrls.add(postUrl);
          }
          
          if (formattedLink) {
            processedFormattedLinks.add(formattedLink);
          }
        }
      } catch (error) {
        console.error('[PostDeduplication] Erro ao processar post:', error);
      }
    }
    
    const uniquePosts = Array.from(uniquePostsMap.values());
    console.log(`[PostDeduplication] Resultado: ${posts.length} posts originais -> ${uniquePosts.length} posts únicos (${duplicatePostCodes.length} duplicações removidas)`);
    
    // Se encontrou duplicações, salvar no banco de dados
    if (duplicatePosts.length > 0 && transactionId) {
      try {
        const { error } = await this.supabase
          .from('post_duplications')
          .insert(duplicatePosts.map(dup => ({
            transaction_id: dup.transactionId,
            post_code: dup.postCode,
            original_post: dup.originalPost,
            duplicate_post: dup.duplicatePost,
            created_at: dup.createdAt,
            status: 'detected',
            detection_method: dup.detectionMethod
          })));

        if (error) {
          console.error('[PostDeduplication] Erro ao salvar duplicações:', error);
        } else {
          console.log(`[PostDeduplication] ${duplicatePosts.length} duplicações salvas no banco de dados`);
        }
      } catch (error) {
        console.error('[PostDeduplication] Erro ao salvar duplicações:', error);
      }
    }
    
    if (duplicatePostCodes.length > 0) {
      console.log('[PostDeduplication] Códigos de posts duplicados:', duplicatePostCodes);
    }
    
    return uniquePosts;
  }

  /**
   * Detecta e retorna links duplicados em uma lista de posts
   * @param posts Lista de posts para verificar
   * @returns Lista de códigos de posts duplicados e seus links
   */
  findDuplicatePosts(posts: Post[]): {
    duplicateCount: number;
    duplicates: Array<{
      postCode: string;
      links: string[];
      posts: Post[];
    }>;
  } {
    if (!posts || posts.length === 0) {
      return { duplicateCount: 0, duplicates: [] };
    }
    
    // Criar um mapa para agrupar posts pelo código
    const postGroups = new Map<string, Post[]>();
    
    // Agrupar posts por código
    for (const post of posts) {
      try {
        // Extrair o código do post
        let postCode = post.postCode || post.code || post.shortcode;
        
        // Se não tiver código, tentar extrair da URL
        if (!postCode) {
          if (post.postLink) {
            postCode = this.linkFormatter.extractPostCode(post.postLink);
          } else if (post.url) {
            postCode = this.linkFormatter.extractPostCode(post.url);
          } else if (post.link) {
            postCode = this.linkFormatter.extractPostCode(post.link);
          }
        }
        
        // Se não conseguiu extrair código, usar a URL como identificador
        if (!postCode) {
          const url = post.postLink || post.url || post.link;
          if (!url) continue;
          postCode = url;
        }
        
        // Adicionar ao grupo de posts com o mesmo código
        if (!postGroups.has(postCode)) {
          postGroups.set(postCode, []);
        }
        
        postGroups.get(postCode)!.push(post);
      } catch (error) {
        console.error('[PostDeduplication] Erro ao agrupar post:', error);
      }
    }
    
    // Encontrar grupos que contêm mais de um post (duplicados)
    const duplicates: Array<{
      postCode: string;
      links: string[];
      posts: Post[];
    }> = [];
    
    let totalDuplicates = 0;
    
    for (const [postCode, postsGroup] of postGroups.entries()) {
      if (postsGroup.length > 1) {
        // Extrair links únicos deste grupo
        const links = postsGroup.map(post => post.postLink || post.url || post.link || '')
                               .filter(link => !!link);
        
        duplicates.push({
          postCode,
          links: [...new Set(links)], // Remover duplicados de links
          posts: postsGroup
        });
        
        totalDuplicates += postsGroup.length - 1;
      }
    }
    
    return {
      duplicateCount: totalDuplicates,
      duplicates
    };
  }
  
  /**
   * Verifica se há posts duplicados em uma lista
   * @param posts Lista de posts para verificar
   * @returns Verdadeiro se houver duplicados
   */
  hasDuplicatePosts(posts: Post[]): boolean {
    const { duplicateCount } = this.findDuplicatePosts(posts);
    return duplicateCount > 0;
  }
  
  /**
   * Gera um relatório sobre posts duplicados
   * @param posts Lista de posts para analisar
   * @returns Texto com o relatório de duplicações
   */
  generateDuplicateReport(posts: Post[]): string {
    const { duplicateCount, duplicates } = this.findDuplicatePosts(posts);
    
    if (duplicateCount === 0) {
      return 'Não foram encontrados links duplicados.';
    }
    
    let report = `Encontrados ${duplicateCount} posts duplicados em ${duplicates.length} grupos:\n\n`;
    
    duplicates.forEach((group, index) => {
      report += `Grupo ${index + 1} - Código: ${group.postCode}\n`;
      report += `Posts: ${group.posts.length}\n`;
      report += `Links:\n`;
      group.links.forEach(link => {
        report += `- ${link}\n`;
      });
      report += '\n';
    });
    
    return report;
  }
} 