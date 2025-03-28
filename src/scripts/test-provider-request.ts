import { createClient } from '@/lib/supabase/server'
import { ProviderService } from '@/lib/transactions/modules/provider/providerService'
import { linkFormatter } from '@/lib/transactions/utils/linkFormatter'
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing'
import fs from 'fs'
import path from 'path'

/**
 * Script para testar requisições a provedores e verificar duplicação de envios
 * 
 * Como usar:
 * 1. Execute o script com: npx ts-node -r tsconfig-paths/register src/scripts/test-provider-request.ts <transaction_id> [dry_run]
 * 2. O script irá verificar os posts da transação e simular o envio para o provedor
 * 3. Use a opção 'dry_run' para não realizar o envio real (apenas simular)
 * 
 * Um log detalhado será salvo para análise na pasta logs/
 */

interface Post {
  postId?: string
  postCode?: string
  postLink?: string
  quantity?: number
  type?: string
  imageUrl?: string
  [key: string]: any
}

class RequestLogger {
  private logDir: string
  private logFile: string
  private entries: any[] = []
  
  constructor(transactionId: string) {
    // Criar diretório de logs se não existir
    this.logDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
    
    // Nome do arquivo de log
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.logFile = path.join(this.logDir, `provider-request-${transactionId}-${timestamp}.json`)
  }
  
  log(entry: any) {
    this.entries.push({
      timestamp: new Date().toISOString(),
      ...entry
    })
    
    // Imprimir no console também
    console.log(JSON.stringify(entry, null, 2))
    
    // Salvar imediatamente no arquivo
    this.save()
  }
  
  save() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.entries, null, 2))
  }
}

async function main() {
  try {
    // Obter parâmetros da linha de comando
    const transactionId = process.argv[2]
    const dryRun = process.argv[3] === 'dry_run'
    
    if (!transactionId) {
      console.error('❌ ID da transação não fornecido. Use: npx ts-node ... <transaction_id> [dry_run]')
      process.exit(1)
    }
    
    // Inicializar logger
    const logger = new RequestLogger(transactionId)
    logger.log({ message: '🚀 Iniciando teste de envio para provedor', transactionId, dryRun })
    
    // Inicializar clientes
    const supabase = createClient()
    const providerService = new ProviderService()
    
    // Verificar se a transação existe
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    
    if (error || !transaction) {
      logger.log({ 
        error: true, 
        message: `Transação ${transactionId} não encontrada`,
        errorDetails: error?.message 
      })
      process.exit(1)
    }
    
    logger.log({ message: '✅ Transação encontrada', transaction: {
      id: transaction.id,
      status: transaction.status,
      payment_status: transaction.payment_status,
      service_id: transaction.service_id
    }})
    
    // Verificar pedidos existentes
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transactionId)
    
    if (existingOrders && existingOrders.length > 0) {
      logger.log({ 
        message: `⚠️ Transação já possui ${existingOrders.length} pedidos`,
        orders: existingOrders.map(o => ({
          id: o.id,
          provider_order_id: o.provider_order_id,
          link: o.link,
          created_at: o.created_at
        }))
      })
    } else {
      logger.log({ message: '✅ Nenhum pedido existente para esta transação' })
    }
    
    // Verificar se a transação possui metadados com posts
    if (!transaction.metadata?.posts || transaction.metadata.posts.length === 0) {
      logger.log({ 
        error: true, 
        message: 'Transação não possui posts para processar',
        metadata: transaction.metadata
      })
      process.exit(1)
    }
    
    const posts: Post[] = transaction.metadata.posts
    logger.log({ 
      message: `📦 Transação possui ${posts.length} posts para processar`,
      posts: posts.map(p => ({
        postId: p.postId,
        postCode: p.postCode,
        postLink: p.postLink,
        quantity: p.quantity,
        type: p.type
      }))
    })
    
    // Verificar serviço
    if (!transaction.service_id) {
      logger.log({ 
        error: true, 
        message: 'Transação não possui service_id', 
      })
      process.exit(1)
    }
    
    // Buscar serviço e provedor
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, provider:providers(*)')
      .eq('id', transaction.service_id)
      .single()
    
    if (serviceError || !service) {
      logger.log({ 
        error: true, 
        message: `Erro ao buscar serviço ${transaction.service_id}`,
        errorDetails: serviceError?.message
      })
      process.exit(1)
    }
    
    logger.log({ 
      message: '✅ Serviço encontrado', 
      service: {
        id: service.id,
        name: service.name,
        provider_id: service.provider_id,
        external_id: service.external_id
      },
      provider: service.provider ? {
        id: service.provider.id,
        name: service.provider.name,
        api_url: service.provider.api_url
      } : null
    })
    
    // Verificar se o serviço tem um provedor associado
    if (!service.provider_id || !service.provider) {
      logger.log({ 
        error: true, 
        message: 'Serviço não possui provedor associado',
        serviceId: service.id
      })
      process.exit(1)
    }
    
    // Registrar tentativas para cada post
    for (const [index, post] of posts.entries()) {
      logger.log({ 
        message: `🔄 Processando post ${index + 1}/${posts.length}`,
        post: {
          postId: post.postId,
          postCode: post.postCode,
          postLink: post.postLink,
          quantity: post.quantity,
          type: post.type
        }
      })
      
      // Formatar o link do post para o formato aceito pelo provedor
      const formattedLink = linkFormatter.formatPostLinkForProvider(
        post.postLink || '', 
        service.provider_id
      )
      
      logger.log({ 
        message: `🔄 Link formatado para provedor`,
        original: post.postLink,
        formatted: formattedLink
      })
      
      // Preparar os dados para o provedor
      const providerRequestData = {
        service: service.external_id?.toString() || service.id,
        link: formattedLink,
        quantity: (post.quantity || 1000).toString(),
        transaction_id: transaction.id,
        username: transaction.metadata?.profile?.username || 
                  transaction.metadata?.username ||
                  'unknown'
      }
      
      logger.log({ 
        message: `📡 Dados preparados para envio ao provedor`,
        request: providerRequestData
      })
      
      // Verificar se deve executar realmente ou apenas simular
      if (dryRun) {
        logger.log({ 
          message: `🔍 DRY RUN - Simulando envio para o provedor sem executar realmente`,
          request: providerRequestData
        })
      } else {
        try {
          // Verificar novamente pedidos existentes para este post específico
          const { data: existingPost } = await supabase
            .from('orders')
            .select('*')
            .eq('transaction_id', transactionId)
            .eq('link', formattedLink)
          
          if (existingPost && existingPost.length > 0) {
            logger.log({ 
              message: `⚠️ PEDIDO DUPLICADO EVITADO - Link específico já possui pedido`,
              existingOrder: {
                id: existingPost[0].id,
                provider_order_id: existingPost[0].provider_order_id,
                link: existingPost[0].link,
                created_at: existingPost[0].created_at
              }
            })
            continue
          }
          
          // Enviar pedido para o provedor
          logger.log({ message: `📡 Enviando pedido para o provedor...` })
          const orderResponse = await providerService.sendOrderToProvider(
            service.provider, 
            providerRequestData
          )
          
          logger.log({ 
            message: `📡 Resposta recebida do provedor`,
            response: orderResponse
          })
          
          // Verificar se houve erro na resposta
          if (orderResponse.error || orderResponse.status === 'error') {
            logger.log({ 
              error: true,
              message: `Erro ao enviar pedido: ${orderResponse.error || 'Falha no provedor'}`,
              response: orderResponse
            })
            continue
          }
          
          // Registrar o pedido no banco de dados
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              transaction_id: transaction.id,
              service_id: transaction.service_id,
              provider_id: service.provider_id,
              provider_order_id: orderResponse.order?.toString() || orderResponse.orderId?.toString(),
              provider_status: orderResponse.status || 'pending',
              quantity: post.quantity || 1000,
              link: formattedLink,
              metadata: {
                post_data: post,
                provider_response: orderResponse,
                post_type: post.type || 'post',
                test_script: true
              }
            })
            .select()
            .single()
          
          if (orderError) {
            logger.log({ 
              error: true,
              message: `Erro ao registrar pedido para post ${post.postCode}`,
              errorDetails: orderError.message
            })
            continue
          }
          
          logger.log({ 
            message: `✅ Pedido enviado e registrado com sucesso`,
            order: {
              id: order.id,
              provider_order_id: order.provider_order_id,
              provider_status: order.provider_status
            }
          })
          
          // Aguardar um pequeno intervalo entre requisições para não sobrecarregar o provedor
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          logger.log({ 
            error: true,
            message: `Erro ao processar post ${post.postCode}`,
            errorDetails: error instanceof Error ? error.message : String(error)
          })
        }
      }
    }
    
    logger.log({ message: '✅ Teste de envio concluído' })
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro não tratado no script:', error)
    process.exit(1)
  }
}

// Executar o script
main()
  .catch(error => {
    console.error('❌ Erro ao executar script:', error)
    process.exit(1)
  }) 