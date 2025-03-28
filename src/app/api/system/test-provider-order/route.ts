import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ProviderService } from '@/lib/transactions/modules/provider/providerService'
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing'
import { linkFormatter } from '@/lib/transactions/utils/linkFormatter'
import { Provider } from '@/lib/transactions/modules/types'

// Chave de API para autenticação simples
const API_KEY = process.env.TRANSACTION_PROCESSING_API_KEY || ''

/**
 * Verifica se a chave de API é válida
 */
function verifyApiKey(request: NextRequest): { success: boolean } {
  const apiKey = request.headers.get('x-api-key')
  return { success: apiKey === API_KEY && API_KEY !== '' }
}

/**
 * Endpoint para testar o envio de pedidos para provedores
 * Útil para diagnóstico e testes de integração
 */
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const authResult = verifyApiKey(request)
  if (!authResult.success) {
    return NextResponse.json(
      { error: 'Acesso não autorizado' },
      { status: 401 }
    )
  }

  try {
    const supabase = createClient()
    const body = await request.json()
    
    // Parâmetros obrigatórios
    const transactionId = body.transactionId
    const serviceId = body.serviceId
    const link = body.link
    const quantity = body.quantity || 1000
    const dryRun = body.dryRun === true
    
    if (!transactionId || !serviceId || !link) {
      return NextResponse.json(
        { 
          error: 'Parâmetros insuficientes',
          required: ['transactionId', 'serviceId', 'link'],
          received: Object.keys(body)
        },
        { status: 400 }
      )
    }
    
    // Gerar ID de processamento único
    const processId = `test_provider_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Inicializar serviços necessários
    const providerService = new ProviderService()
    
    // Buscar dados da transação
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    
    if (transactionError || !transaction) {
      return NextResponse.json(
        { 
          error: 'Transação não encontrada',
          details: transactionError
        },
        { status: 404 }
      )
    }
    
    // Verificar se a transação está bloqueada
    const isLocked = await transactionProcessing.isLocked(transactionId)
    if (isLocked) {
      return NextResponse.json(
        { 
          error: 'A transação está atualmente bloqueada para processamento',
          transactionId
        },
        { status: 409 } // Conflict
      )
    }
    
    // Buscar o serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, provider:providers(*)')
      .eq('id', serviceId)
      .single()
    
    if (serviceError || !service) {
      return NextResponse.json(
        { 
          error: 'Serviço não encontrado',
          details: serviceError
        },
        { status: 404 }
      )
    }
    
    // Verificar se o serviço tem um provedor associado
    if (!service.provider_id || !service.provider) {
      return NextResponse.json(
        { 
          error: 'Serviço não possui um provedor associado',
          serviceId
        },
        { status: 400 }
      )
    }
    
    // Preparar os dados para envio
    const formattedLink = linkFormatter.formatPostLinkForProvider(link, service.provider_id)
    
    logger.info('Preparando envio de pedido para provedor', {
      transactionId,
      serviceId,
      providerId: service.provider_id,
      link: formattedLink
    })
    
    // Se for dry run, não enviar para o provedor
    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: 'Simulação de pedido (dry run)',
        data: {
          transaction: {
            id: transaction.id,
            status: transaction.status
          },
          service: {
            id: service.id,
            name: service.name,
            providerId: service.provider_id
          },
          provider: {
            id: service.provider.id,
            name: service.provider.name
          },
          order: {
            link: formattedLink,
            quantity,
            serviceId: service.external_id || service.id
          }
        }
      })
    }
    
    // Processar com lock para garantir exclusividade
    const result = await transactionProcessing.processWithLock(
      transactionId,
      processId,
      async () => {
        // Preparar dados do provedor
        const providerRequestData = {
          service: service.external_id?.toString() || serviceId,
          link: formattedLink,
          quantity: quantity.toString(),
          transaction_id: transactionId,
          username: transaction.metadata?.profile?.username || transaction.metadata?.customer_name || 'unknown'
        }
        
        // Enviar pedido para o provedor
        const orderResponse = await providerService.sendOrderToProvider(
          service.provider as Provider, 
          providerRequestData
        )
        
        // Verificar se a resposta contém erro
        if (orderResponse.error || orderResponse.status === 'error') {
          throw new Error(`Erro ao enviar pedido: ${orderResponse.error || 'Falha no provedor'}`)
        }
        
        // Registrar o pedido no banco de dados
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            transaction_id: transactionId,
            service_id: serviceId,
            provider_id: service.provider_id,
            provider_order_id: orderResponse.order?.toString() || orderResponse.orderId?.toString(),
            provider_status: orderResponse.status || 'pending',
            quantity: parseInt(quantity.toString()),
            link: formattedLink,
            metadata: {
              provider_response: orderResponse,
              test_order: true
            }
          })
          .select()
          .single()
        
        if (orderError) {
          logger.error('Erro ao registrar pedido no banco de dados', { orderError })
          throw new Error(`Erro ao registrar pedido: ${orderError.message}`)
        }
        
        return {
          orderResponse,
          order
        }
      }
    )
    
    if (!result.success) {
      logger.error('Falha ao processar pedido com lock', { error: result.error })
      return NextResponse.json(
        { 
          error: 'Falha ao processar pedido',
          details: result.error?.message || 'Erro desconhecido'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pedido enviado com sucesso para o provedor',
      data: {
        transaction: {
          id: transaction.id,
          status: transaction.status
        },
        service: {
          id: service.id,
          name: service.name,
          providerId: service.provider_id
        },
        provider: {
          id: service.provider.id,
          name: service.provider.name
        },
        order: result.result?.order,
        providerResponse: result.result?.orderResponse
      }
    })
  } catch (error) {
    logger.error('Erro ao processar teste de envio para provedor', { error })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 