import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  user_id?: string;
  service_id: string;
  amount: number;
  status: string;
  payment_id: string;
  created_at: string;
}

export interface CreateTransactionParams {
  userId?: string;
  serviceId: string;
  serviceName?: string;
  serviceType?: string;
  providerId?: string;
  amount: number;
  profile: {
    username: string;
    full_name?: string;
    link?: string;
  };
  customer: {
    name?: string;
    email: string;
    phone?: string;
  };
  paymentId: string;
  paymentMethod?: string;
  paymentProvider?: string;
  paymentStatus?: string;
  paymentQrCode?: string;
  paymentQrCodeBase64?: string;
  targetUsername?: string;
  targetProfileLink?: string;
  actionType?: string;
  serviceQuantity?: number;
  checkoutType?: string;
  posts?: Array<{
    id?: string;
    code?: string;
    url?: string;
    caption?: string;
    link?: string;
    quantity?: number;
    selected?: boolean;
  }>;
  quantity?: number;
}

/**
 * Serviço responsável por gerenciar transações
 */
export class TransactionService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Verifica se um cliente existe ou cria um novo
   * @param customerId ID do cliente
   * @param customerName Nome do cliente
   * @param customerEmail E-mail do cliente 
   * @param customerPhone Telefone do cliente
   * @returns true se o cliente existe ou foi criado com sucesso
   */
  async verifyOrCreateCustomer(customerId: string, customerName?: string, customerEmail?: string, customerPhone?: string): Promise<boolean> {
    try {
      // Verificar se o cliente já existe
      const { data: existingCustomer, error: searchError } = await this.supabase
        .from('customers')
        .select('id')
        .eq('id', customerId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('[TransactionService] Erro ao buscar cliente:', searchError);
        return false;
      }

      // Se o cliente já existe, retornar
      if (existingCustomer) {
        return true;
      }

      // Se não existe, criar um novo cliente
      const { error: insertError } = await this.supabase
        .from('customers')
        .insert({
          id: customerId,
          name: customerName || 'Cliente',
          email: customerEmail || '',
          phone: customerPhone || ''
        });

      if (insertError) {
        console.error('[TransactionService] Erro ao criar cliente:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[TransactionService] Erro ao verificar/criar cliente:', error);
      return false;
    }
  }

  /**
   * Cria uma nova transação
   * @param params Parâmetros para criação da transação
   * @returns Objeto com o resultado da criação
   */
  async createTransaction(params: CreateTransactionParams): Promise<{
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction?: any;
    transactionId?: string;
    paymentId?: string;
    error?: string;
  }> {
    const {
      userId,
      serviceId,
      serviceName,
      serviceType,
      providerId,
      amount,
      profile = { username: '' },
      customer = { email: '', name: '' },
      paymentId,
      paymentMethod = 'pix',
      paymentProvider = 'mercadopago',
      paymentStatus = 'pending',
      paymentQrCode,
      paymentQrCodeBase64,
      targetUsername,
      targetProfileLink,
      actionType = 'payment',
      serviceQuantity = 0,
      checkoutType = 'mostrar-posts',
      posts = []
    } = params;

    const effectiveUsername = targetUsername || profile.username;
    const effectiveProfileLink = targetProfileLink || profile.link || `https://instagram.com/${effectiveUsername}`;

    // Gerar um ID único para a transação
    const transactionId = uuidv4();
    console.log(`[TransactionService] Criando transação ${transactionId} para pagamento ${paymentId}`);

    // Verificar e adicionar provider_id nos metadados
    console.log(`[TransactionService] Provider ID obtido do serviço: ${providerId}`);

    // Verificar quantidade do serviço
    let finalQuantity = serviceQuantity;
    
    // Se temos uma quantidade vinda do serviço, usar essa
    if (params.quantity) {
      finalQuantity = params.quantity;
      console.log(`[TransactionService] Usando quantidade fornecida explicitamente: ${finalQuantity}`);
    } 
    // Se não, mas temos posts, calcular a quantidade total dos posts
    else if (posts.length > 0 && posts.some(post => typeof post.quantity === 'number')) {
      // Calcular a soma das quantidades de todos os posts
      const totalFromPosts = posts.reduce((total, post) => {
        return total + (typeof post.quantity === 'number' ? post.quantity : 0);
      }, 0);
      
      if (totalFromPosts > 0) {
        finalQuantity = totalFromPosts;
        console.log(`[TransactionService] Quantidade total calculada dos posts: ${finalQuantity}`);
      }
    }
    
    // Metadados adicionais da transação
    const transactionMetadata = {
      profile: {
        username: effectiveUsername,
        link: effectiveProfileLink
      },
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || ''
      },
      payment_id: paymentId,
      payment_provider: paymentProvider,
      payment_method: paymentMethod,
      payment_qr_code: paymentQrCode,
      payment_qr_code_base64: paymentQrCodeBase64,
      provider_id: providerId, // Adicionar provider_id nos metadados para referência
      created_at: new Date().toISOString(),
      quantity: finalQuantity, // Incluir a quantidade total na transação
      service: {
        quantity: finalQuantity // Adicionar a quantidade do serviço nos metadados
      }
    };
    
    try {
      console.log('[TransactionService] Inserindo transação na nova tabela core_transactions_v2');
      
      // Log para depuração
      console.log('[TransactionService] Dados da transação:', JSON.stringify({
        id: transactionId,
        payment_id: paymentId,
        status: 'pending',
        provider_id: providerId,
        quantity: finalQuantity
      }));
      
      // Inserção direta na tabela nova core_transactions_v2 usando o método insert do Supabase
      const { data: insertedTransaction, error: insertError } = await this.supabase
        .from('core_transactions_v2')
        .insert({
          id: transactionId,
          user_id: userId,
          service_id: serviceId,
          provider_id: providerId, // Adicionar o provider_id aqui
          amount: Number(amount),
          status: 'pending',
          payment_method: paymentMethod,
          payment_id: paymentId,
          payment_external_reference: paymentId,
          external_id: paymentId,
          payment_status: paymentStatus,
          payment_provider: paymentProvider,
          target_username: effectiveUsername,
          target_url: effectiveProfileLink,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone || '',
          metadata: transactionMetadata,
          order_created: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          action_type: actionType,
          quantity: finalQuantity // Adicionar a quantidade total do serviço
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('[TransactionService] Erro ao inserir transação:', insertError);
        throw new Error(`Erro ao inserir transação: ${insertError.message}`);
      }
      
      console.log(`[TransactionService] Transação ${transactionId} criada com sucesso!`);
      
      // Inserir posts na tabela de core_transaction_posts_v2
      if (posts.length > 0) {
        console.log('[TransactionService] Salvando posts da transação...');
        
        // Verificar primeiro se os posts já têm quantidades específicas definidas
        const postsHaveQuantities = posts.some(post => typeof post.quantity === 'number');
        
        console.log('[TransactionService] Verificando posts:', posts.map(post => ({
          id: post.id,
          code: post.code,
          quantity: post.quantity,
          has_quantity: typeof post.quantity === 'number',
          selected: post.selected
        })));
        
        // Mapear os posts com suas quantidades específicas
        let postsToInsert;
        
        if (postsHaveQuantities) {
          // Se os posts já têm quantidades definidas, usá-las diretamente
          console.log('[TransactionService] Posts já têm quantidades específicas definidas');
          postsToInsert = posts.map(post => {
            // Verificar e registrar a quantidade para depuração
            console.log(`[TransactionService] Post ${post.code || post.id}: quantidade ${post.quantity}`);
            
            return {
              transaction_id: transactionId,
              post_code: post.code || '',
              post_url: post.url || post.link || '',
              post_caption: post.caption || '',
              post_type: (post.url || post.link || '').includes('/reel/') ? 'reel' : 'post',
              username: effectiveUsername,
              quantity: post.quantity || finalQuantity, // Usar a quantidade específica ou fallback para quantidade total
              selected: post.selected === true || post.selected === 'true' || post.selected === 1 || post.selected === '1'
            };
          });
        } else {
          // Se não, calcular a distribuição de quantidades
          console.log('[TransactionService] Calculando distribuição de quantidades');
          const totalPosts = posts.length;
          const quantityPerPost = Math.floor(finalQuantity / totalPosts);
          const remainder = finalQuantity % totalPosts;
          
          // Criar um array com as quantidades exatas por post
          const quantitiesByPost = Array(totalPosts).fill(quantityPerPost);
          
          // Distribuir o resto entre os primeiros posts
          for (let i = 0; i < remainder; i++) {
            quantitiesByPost[i]++;
          }
          
          // Mapear os posts com suas quantidades específicas
          postsToInsert = posts.map((post, index) => {
            return {
              transaction_id: transactionId,
              post_code: post.code || '',
              post_url: post.url || post.link || '',
              post_caption: post.caption || '',
              post_type: (post.url || post.link || '').includes('/reel/') ? 'reel' : 'post',
              username: effectiveUsername,
              quantity: quantitiesByPost[index], // Usar a quantidade calculada
              selected: post.selected === true || post.selected === 'true' || post.selected === 1 || post.selected === '1'
            };
          });
        }

        // Log para depuração
        console.log('[TransactionService] Posts com quantidades:', postsToInsert.map(p => ({
          post_code: p.post_code,
          quantity: p.quantity,
          selected: p.selected
        })));

        const { error: postsError } = await this.supabase
          .from('core_transaction_posts_v2')
          .insert(postsToInsert);

        if (postsError) {
          console.error('[TransactionService] Erro ao salvar posts da transação:', {
            error: postsError,
            transaction_id: transactionId
          });
          // Não falharemos aqui, pois a transação já foi criada
        }
      }
      
      // Tentar registrar o log de criação de transação, mas não falhar se houver erro
      try {
        await this.supabase.from('core_processing_logs').insert({
          transaction_id: transactionId,
          level: 'info',
          message: 'Transação criada com sucesso',
          metadata: {
            payment_id: paymentId,
            amount: amount,
            posts_count: posts.length,
            quantity: finalQuantity,
            created_at: new Date().toISOString()
          }
        });
      } catch (logError) {
        // Apenas logar o erro, mas não falhar a transação por causa disso
        console.warn('[TransactionService] Erro ao registrar log de transação (ignorando):', logError);
      }
      
      return {
        success: true,
        transaction: insertedTransaction || {
          id: transactionId,
          payment_id: paymentId,
          status: 'pending',
          service_id: serviceId,
          quantity: finalQuantity
        },
        transactionId,
        paymentId
      };
    } catch (error) {
      console.error('[TransactionService] Erro ao criar transação:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar transação'
      };
    }
  }
} 