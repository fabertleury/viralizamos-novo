import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço dedicado a criação de transações
 */
export interface CreateTransactionParams {
  userId?: string;
  serviceId: string;
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
  qrCode?: string;
  qrCodeBase64?: string;
  posts?: Array<{
    id?: string;
    code?: string;
    url?: string;
    caption?: string;
    quantity?: number;
  }>;
  quantity?: number;
}

export class TransactionService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Função para verificar se o cliente existe e criá-lo caso necessário
   */
  async verifyOrCreateCustomer(customerId: string, customerName?: string, customerEmail?: string, customerPhone?: string): Promise<boolean> {
    try {
      // Verificar se o cliente existe
      const { data: existingCustomer, error: checkError } = await this.supabase
        .from('core_customers')
        .select('id')
        .eq('id', customerId)
        .single();
      
      // Se o cliente não existe e temos dados, criar um novo
      if (checkError && !existingCustomer && (customerName || customerEmail)) {
        const { error: insertError } = await this.supabase
          .from('core_customers')
          .insert({
            id: customerId,
            name: customerName || `Cliente ${customerId.substring(0, 8)}`,
            email: customerEmail,
            phone: customerPhone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`[TransactionService] Erro ao criar cliente ${customerId}:`, insertError);
          return false;
        }
        
        console.log(`[TransactionService] Cliente ${customerId} criado com sucesso!`);
        return true;
      }
      
      return !checkError;
    } catch (error) {
      console.error(`[TransactionService] Erro ao verificar/criar cliente ${customerId}:`, error);
      return false;
    }
  }

  /**
   * Cria uma nova transação no sistema
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
      userId = null,
      serviceId,
      amount,
      profile,
      customer,
      paymentId,
      paymentMethod = 'pix',
      paymentProvider = 'mercadopago',
      qrCode = '',
      qrCodeBase64 = '',
      posts = [],
      quantity = 0
    } = params;
    
    if (!serviceId) {
      throw new Error('ID do serviço não fornecido');
    }
    
    if (!profile || !profile.username) {
      throw new Error('Dados do perfil não fornecidos ou incompletos');
    }
    
    if (!customer || !customer.email) {
      throw new Error('Dados do cliente não fornecidos ou incompletos');
    }
    
    if (!paymentId) {
      throw new Error('ID do pagamento não fornecido');
    }
    
    // Gerar um ID para a transação
    const transactionId = uuidv4();
    console.log(`[TransactionService] Criando transação ${transactionId} para pagamento ${paymentId}`);
    
    // Buscar o provider_id associado ao serviço
    let providerId = null;
    try {
      const { data: serviceData, error: serviceError } = await this.supabase
        .from('services')
        .select('provider_id, quantidade')
        .eq('id', serviceId)
        .single();
      
      if (serviceError) {
        console.error(`[TransactionService] Erro ao buscar provider_id do serviço ${serviceId}:`, serviceError);
      } else if (serviceData && serviceData.provider_id) {
        providerId = serviceData.provider_id;
        console.log(`[TransactionService] Provider ID obtido do serviço: ${providerId}`);
      }
      
      // Se não conseguir obter o provider_id do serviço, buscar um provider padrão
      if (!providerId) {
        const { data: defaultProvider, error: providerError } = await this.supabase
          .from('providers')
          .select('id')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        if (!providerError && defaultProvider) {
          providerId = defaultProvider.id;
          console.log(`[TransactionService] Provider ID padrão obtido: ${providerId}`);
        } else {
          console.error('[TransactionService] Erro ao buscar provider padrão:', providerError);
        }
      }
      
      // Determinar a quantidade total do serviço
      const serviceQuantity = serviceData?.quantidade || 0;
      const totalQuantity = quantity || serviceQuantity;
      console.log(`[TransactionService] Quantidade total do serviço: ${totalQuantity}`);
      
    } catch (error) {
      console.error('[TransactionService] Erro ao buscar provider_id:', error);
    }
    
    // Buscar a quantidade do serviço se não fornecida
    let serviceQuantity = quantity;
    if (!serviceQuantity) {
      try {
        const { data: service, error: serviceError } = await this.supabase
          .from('services')
          .select('quantidade')
          .eq('id', serviceId)
          .single();
        
        if (!serviceError && service) {
          serviceQuantity = service.quantidade;
          console.log(`[TransactionService] Quantidade obtida do serviço: ${serviceQuantity}`);
        }
      } catch (error) {
        console.error('[TransactionService] Erro ao buscar quantidade do serviço:', error);
      }
    } else {
      console.log(`[TransactionService] Usando quantidade fornecida explicitamente: ${serviceQuantity}`);
    }
    
    // Criar metadados da transação - formato simplificado sem propriedades que possam gerar conflito
    const transactionMetadata = {
      profile_username: profile.username,
      profile_full_name: profile.full_name || '',
      profile_link: profile.link || `https://instagram.com/${profile.username}`,
      customer_name: customer.name || '',
      customer_email: customer.email,
      customer_phone: customer.phone || '',
      payment_id: paymentId,
      payment_provider: paymentProvider,
      payment_method: paymentMethod,
      payment_qr_code: qrCode,
      payment_qr_code_base64: qrCodeBase64,
      provider_id: providerId, // Adicionar provider_id nos metadados para referência
      created_at: new Date().toISOString(),
      quantity: serviceQuantity, // Incluir a quantidade total na transação
      service: {
        quantity: serviceQuantity // Adicionar a quantidade do serviço nos metadados
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
        quantity: serviceQuantity
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
          payment_status: 'pending',
          payment_provider: paymentProvider,
          target_username: profile.username,
          target_url: profile.link || `https://instagram.com/${profile.username}`,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone || '',
          metadata: transactionMetadata,
          order_created: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          action_type: 'payment_created',
          quantity: serviceQuantity // Adicionar a quantidade total do serviço
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
          has_quantity: typeof post.quantity === 'number'
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
              post_url: post.url || '',
              post_caption: post.caption || '',
              post_type: post.url?.includes('/reel/') ? 'reel' : 'post',
              username: profile.username,
              quantity: post.quantity || serviceQuantity // Usar a quantidade específica ou fallback para quantidade total
            };
          });
        } else {
          // Se não, calcular a distribuição de quantidades
          console.log('[TransactionService] Calculando distribuição de quantidades');
          const totalPosts = posts.length;
          const quantityPerPost = Math.floor(serviceQuantity / totalPosts);
          const remainder = serviceQuantity % totalPosts;
          
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
              post_url: post.url || '',
              post_caption: post.caption || '',
              post_type: post.url?.includes('/reel/') ? 'reel' : 'post',
              username: profile.username,
              quantity: quantitiesByPost[index] // Usar a quantidade calculada
            };
          });
        }

        // Log para depuração
        console.log('[TransactionService] Posts com quantidades:', postsToInsert.map(p => ({
          post_code: p.post_code,
          quantity: p.quantity
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
      
      // Registrar log de criação de transação
      await this.supabase.from('core_processing_logs').insert({
        transaction_id: transactionId,
        level: 'info',
        message: 'Transação criada com sucesso',
        metadata: {
          payment_id: paymentId,
          amount: amount,
          posts_count: posts.length,
          quantity: serviceQuantity,
          created_at: new Date().toISOString()
        }
      });
      
      return {
        success: true,
        transaction: insertedTransaction || {
          id: transactionId,
          payment_id: paymentId,
          status: 'pending',
          service_id: serviceId,
          quantity: serviceQuantity
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