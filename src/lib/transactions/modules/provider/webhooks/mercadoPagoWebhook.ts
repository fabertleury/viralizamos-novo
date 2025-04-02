import { createClient } from '@/lib/supabase/server';
import type { ProcessTransaction } from '@/lib/transactions/modules/processTransaction';
import { DatabaseService } from '../../services/databaseService';
import type { ProviderManager } from '../providerManager';
import crypto from 'crypto';
import { transactionProcessing } from '@/lib/transactions/utils/transactionProcessing';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import { transactionMonitoring } from '@/lib/monitoring/transactionMonitoring';

type WebhookHeaders = {
  'user-agent'?: string;
  'content-type'?: string;
  'x-signature'?: string;
  'x-request-id'?: string;
  'x-forwarded-for'?: string;
  'x-real-ip'?: string;
  [key: string]: string | undefined;
};

type WebhookResponse = {
  success: boolean;
  message?: string;
  error?: any;
  data?: any;
};

type PaymentData = {
  id: string;
  status: string;
  external_reference: string;
  date_created: string;
  date_approved: string;
  [key: string]: any;
};

// Funções para registrar logs em arquivo para diagnóstico
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

function logToFile(message: string) {
  try {
    const logDir = ensureLogDirectoryExists();
    const date = new Date();
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const logFile = path.join(logDir, `mercado-pago-webhook-${dateStr}.log`);
    
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error('[Logger] Erro ao escrever no arquivo de log:', err);
  }
}

/**
 * Manipulador de webhooks do Mercado Pago
 */
export class MercadoPagoWebhook {
  private databaseService = new DatabaseService();
  private processTransaction: ProcessTransaction;
  private providerManager: ProviderManager;
  private supabase = createClient();
  private notificationSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

  constructor() {
    // Estas importações são carregadas dinamicamente para evitar problemas de dependência circular
    const { ProcessTransaction } = require('@/lib/transactions/modules/processTransaction');
    const { ProviderManager } = require('../providerManager');
    
    this.processTransaction = new ProcessTransaction();
    this.providerManager = new ProviderManager();
  }

  /**
   * Processa uma notificação de webhook do Mercado Pago
   * @param body Corpo da requisição
   * @param headers Cabeçalhos da requisição
   * @returns Resultado do processamento
   */
  async processWebhook(body: any, headers: WebhookHeaders): Promise<WebhookResponse> {
    logger.info('[MercadoPagoWebhook] Recebendo notificação');
    logToFile('[MercadoPagoWebhook] Recebendo notificação de webhook');
    
    try {
      // Registrar webhook recebido no sistema de monitoramento
      const webhookId = await transactionMonitoring.logWebhook(
        'mercadopago',
        'payment_webhook',
        body
      );
      
      // Log dos cabeçalhos importantes
      logger.info('[MercadoPagoWebhook] User-Agent:', headers['user-agent']);
      logger.info('[MercadoPagoWebhook] Content-Type:', headers['content-type']);
      logger.info('[MercadoPagoWebhook] X-Signature:', headers['x-signature']);
      logger.info('[MercadoPagoWebhook] X-Request-ID:', headers['x-request-id']);
      
      // Log do corpo da requisição
      const bodyText = typeof body === 'string' ? body : JSON.stringify(body);
      logger.info('[MercadoPagoWebhook] Corpo da requisição (texto):', bodyText);
      logToFile(`[MercadoPagoWebhook] Corpo da requisição: ${bodyText}`);
      
      const requestBody = typeof body === 'string' ? JSON.parse(body) : body;
      logger.info('[MercadoPagoWebhook] Corpo da requisição (JSON):', requestBody);
      
      // Verificar a assinatura (se disponível)
      let signatureValid = true;
      if (headers['x-signature'] && this.notificationSecret) {
        signatureValid = this.verifySignature(
          headers['x-signature'],
          requestBody.data?.id || '',
          headers['x-request-id'],
          bodyText
        );
        
        logger.info('[MercadoPagoWebhook] Assinatura válida:', signatureValid);
        
        // Verificar origem do IP (como medida adicional de segurança)
        const clientIp = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';
        const isValidIp = await this.isValidMercadoPagoIP(clientIp);
        
        logger.info('[MercadoPagoWebhook] IP do cliente:', clientIp);
        logger.info('[MercadoPagoWebhook] IP válido do Mercado Pago:', isValidIp);
        
        // Se nem a assinatura nem o IP são válidos, rejeitar a requisição
        if (!signatureValid && !isValidIp) {
          logger.error('[MercadoPagoWebhook] Assinatura inválida e IP não reconhecido como do Mercado Pago. Possível tentativa de fraude.');
          await this.logWebhookAttempt(headers, bodyText, 'rejected_invalid_signature_and_ip');
          return { success: false, error: 'Assinatura inválida e IP não reconhecido' };
        }
        
        // Registrar tentativa mesmo que continuemos o processamento
        if (!signatureValid) {
          await this.logWebhookAttempt(headers, bodyText, 'processed_invalid_signature');
        }
      }
      
      // Extrair informações básicas
      const { paymentId, action } = this.extractIdAndAction(requestBody);
      logger.info('[MercadoPagoWebhook] Ação:', action);
      logger.info('[MercadoPagoWebhook] ID do pagamento:', paymentId);
      
      if (!paymentId) {
        return { success: false, error: 'ID do pagamento não encontrado' };
      }
      
      // Verificar o status do pagamento
      const paymentData = await this.getPaymentDetails(paymentId);
      const paymentStatus = paymentData?.status || 'unknown';
      
      logger.info('[MercadoPagoWebhook] Status do pagamento:', paymentStatus);
      logToFile(`[MercadoPagoWebhook] Status do pagamento: ${paymentStatus}, ID: ${paymentId}`);
      
      // Processar de acordo com o status
      if (paymentStatus === 'approved') {
        logToFile(`[MercadoPagoWebhook] Pagamento APROVADO, ID: ${paymentId}. Iniciando processamento...`);
        return await this.handleApprovedPayment(paymentId, paymentData);
      } else if (['rejected', 'cancelled'].includes(paymentStatus)) {
        // Atualizar o status da transação para o status correspondente
        const transaction = await this.databaseService.getTransactionByPaymentId(paymentId);
        if (transaction) {
          logToFile(`[MercadoPagoWebhook] Pagamento ${paymentStatus}. Atualizando transação ${transaction.id} para mesmo status.`);
          await this.databaseService.updateTransactionStatus(transaction.id, paymentStatus);
          return { success: true, message: `Transação atualizada para ${paymentStatus}` };
        }
      }
      
      logToFile(`[MercadoPagoWebhook] Webhook processado sem ações necessárias. Status: ${paymentStatus}`);
      return { success: true, message: 'Notificação processada, mas sem ações necessárias' };
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao processar webhook:', error);
      return { success: false, error };
    } finally {
      // Atualizar status do webhook no monitoramento
      if (webhookId) {
        await transactionMonitoring.updateWebhookProcessed(
          webhookId,
          true,
          500,
          { error: error?.message || 'Erro desconhecido' },
          Date.now() - startTime
        );
      }
    }
  }
  
  /**
   * Extrai o ID do pagamento e a ação da notificação
   */
  private extractIdAndAction(notification: any): { paymentId: string; action: string } {
    let paymentId = '';
    let action = '';
    
    try {
      // Verificar se é uma notificação de pagamento
      if (notification.type === 'payment') {
        paymentId = notification.data?.id || '';
        action = 'payment.created';
      }
      // Verificar se é uma notificação de atualização
      else if (notification.action) {
        action = notification.action;
        paymentId = notification.data?.id || '';
      }
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao extrair ID:', error);
    }
    
    return { paymentId, action };
  }
  
  /**
   * Busca os detalhes de um pagamento
   */
  private async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      logger.info('[MercadoPagoWebhook] Consultando detalhes do pagamento:', paymentId);
      
      // Buscar os dados do pagamento do banco de dados
      const { data, error } = await this.supabase
        .from('mercadopago_payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      
      if (error) {
        logger.error('[MercadoPagoWebhook] Erro ao buscar detalhes do pagamento:', error);
        return null;
      }
      
      // Simplificar o retorno para os dados essenciais
      const paymentDetails = {
        id: data.id,
        status: data.status,
        external_reference: data.external_reference,
        date_created: data.date_created,
        date_approved: data.date_approved
      };
      
      logger.info('[MercadoPagoWebhook] Detalhes do pagamento:', paymentDetails);
      return paymentDetails;
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao buscar detalhes do pagamento:', error);
      return null;
    }
  }
  
  /**
   * Processa um pagamento aprovado
   */
  private async handleApprovedPayment(paymentId: string, paymentData: PaymentData): Promise<WebhookResponse> {
    logger.info('[MercadoPagoWebhook] Pagamento aprovado, verificando se podemos processar automaticamente');
    logToFile(`[MercadoPagoWebhook] Pagamento aprovado, ID: ${paymentId}, verificando processamento automático`);
    
    try {
      // Registrar transação no sistema de monitoramento
      const transaction = await this.databaseService.getTransactionByPaymentId(paymentId);
      await transactionMonitoring.logTransaction(transaction);
      
      if (!transaction) {
        logger.error(`[MercadoPagoWebhook] Pagamento ${paymentId} não possui transação associada`);
        logToFile(`[MercadoPagoWebhook] ERRO: Pagamento ${paymentId} não possui transação associada`);
        return { 
          success: false, 
          error: 'Transação não encontrada para o pagamento' 
        };
      }
      
      logger.info(`[MercadoPagoWebhook] Transação encontrada: ${transaction.id}, status atual: ${transaction.status}`);
      logToFile(`[MercadoPagoWebhook] Transação encontrada: ${transaction.id}, status atual: ${transaction.status}`);
      
      // Verificar se a transação já foi processada antes
      // Isso previne duplicação de pedidos caso o webhook seja recebido mais de uma vez
      const existingOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
      
      if (existingOrders && existingOrders.length > 0) {
        logger.info(`[MercadoPagoWebhook] Transação ${transaction.id} já foi processada (${existingOrders.length} pedidos)`);
        logToFile(`[MercadoPagoWebhook] Transação ${transaction.id} já foi processada (${existingOrders.length} pedidos). Ignorando para evitar duplicação.`);
        return { 
          success: true, 
          message: 'Transação já processada anteriormente, ignorando para evitar duplicação',
          data: {
            orders: existingOrders,
            count: existingOrders.length
          }
        };
      }
      
      // Verificar se já existe um lock para esta transação usando o novo serviço
      const isLocked = await transactionProcessing.isLocked(transaction.id);
      if (isLocked) {
        logger.info(`[MercadoPagoWebhook] Transação ${transaction.id} já está sendo processada por outra instância. Ignorando.`);
        return { success: true, message: 'Transação está sendo processada em outra instância' };
      }
      
      // Atualizar o status da transação
      await this.databaseService.updateTransactionStatus(transaction.id, 'approved');
      logger.info('[MercadoPagoWebhook] Transação atualizada com status: approved');
      logToFile(`[MercadoPagoWebhook] Transação ${transaction.id} atualizada com status: approved`);
      
      // Usar o serviço de processamento com lock para processar a transação
      const processId = `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      logToFile(`[MercadoPagoWebhook] Iniciando processamento com lock para transação ${transaction.id}, processId: ${processId}`);
      
      const { success, result, error } = await transactionProcessing.processWithLock(
        transaction.id,
        processId,
        async () => {
          // Verificar novamente se existem pedidos (caso tenham sido criados entre as verificações)
          const doubleCheckOrders = await this.databaseService.getExistingOrdersForTransaction(transaction.id);
          if (doubleCheckOrders && doubleCheckOrders.length > 0) {
            logger.info(`[MercadoPagoWebhook] Pedidos foram criados entre as verificações. Transação já processada.`);
            logToFile(`[MercadoPagoWebhook] Pedidos foram criados entre as verificações (${doubleCheckOrders.length}). Transação já processada.`);
            return { 
              alreadyProcessed: true,
              orders: doubleCheckOrders,
              count: doubleCheckOrders.length
            };
          }
          
          // Processar a transação automaticamente
          logger.info('[MercadoPagoWebhook] Processando transação automaticamente:', transaction.id);
          logToFile(`[MercadoPagoWebhook] PROCESSANDO TRANSAÇÃO ${transaction.id} automaticamente após confirmação do pagamento`);
          const result = await this.processTransaction.executeStrategy(transaction);
          
          // Registrar resultado da integração no monitoramento
          await transactionMonitoring.logIntegration(
            transaction.id,
            transaction.id,
            null,
            transaction,
            result,
            result.success ? 'success' : 'failed',
            result.success ? undefined : result.error
          );
          
          logger.info('[MercadoPagoWebhook] Resultado do processamento automático:', result);
          logToFile(`[MercadoPagoWebhook] Resultado do processamento automático: ${JSON.stringify(result)}`);
          return result;
        }
      );
      
      if (!success) {
        logger.error('[MercadoPagoWebhook] Erro ao processar transação:', error);
        logToFile(`[MercadoPagoWebhook] ERRO ao processar transação ${transaction.id}: ${error?.message || 'Erro desconhecido'}`);
        return { 
          success: false, 
          error: error?.message || 'Erro desconhecido no processamento' 
        };
      }
      
      if (result?.alreadyProcessed) {
        return { 
          success: true, 
          message: 'Transação já processada entre verificações, ignorando para evitar duplicação',
          data: {
            orders: result.orders,
            count: result.count
          }
        };
      }
      
      logger.info('[MercadoPagoWebhook] Processamento automático concluído com sucesso');
      return { success: true, data: result };
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao processar pagamento aprovado:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Verifica se uma transação está bloqueada
   * @deprecated Use transactionProcessing.isLocked instead
   */
  private async isTransactionLocked(transactionId: string): Promise<boolean> {
    // Usar o novo serviço de processamento
    return await transactionProcessing.isLocked(transactionId);
  }
  
  /**
   * Cria um lock para uma transação
   * @deprecated Use transactionProcessing.acquireLock instead
   */
  private async lockTransaction(transactionId: string, expiresInMinutes: number = 15): Promise<boolean> {
    // Usar o novo serviço de processamento
    const processId = `legacy_webhook_${Date.now()}`;
    const lock = await transactionProcessing.acquireLock(
      transactionId, 
      processId, 
      expiresInMinutes * 60
    );
    return !!lock;
  }
  
  /**
   * Remove um lock de transação
   * @deprecated Use transactionProcessing.releaseLock instead
   */
  private async removeTransactionLock(transactionId: string): Promise<void> {
    // Esta função continua sendo chamada em alguns lugares do código
    // Como não temos acesso ao objeto lock completo aqui, vamos apenas registrar
    // que houve uma tentativa de remoção de lock, mas não faremos nada
    // O lock será expirado automaticamente pelo banco de dados
    logger.info(`[MercadoPagoWebhook] Tentativa de remoção manual de lock (função legada) para transação ${transactionId}`);
    logger.info('[MercadoPagoWebhook] Esta função está descontinuada. Locks serão liberados automaticamente.');
  }
  
  /**
   * Verifica a assinatura do webhook
   */
  private verifySignature(signature: string, paymentId: string, requestId: string, bodyText: string): boolean {
    if (!this.notificationSecret) {
      logger.info('[MercadoPagoWebhook] Chave secreta não configurada, pulando verificação de assinatura');
      return true; // Sem chave, não podemos verificar, então assumimos válido
    }
    
    try {
      // Extrair dados da assinatura
      const signatureParts = signature.split(',');
      const timestampPart = signatureParts.find(part => part.startsWith('ts='));
      const v1Part = signatureParts.find(part => part.startsWith('v1='));
      
      if (!timestampPart || !v1Part) {
        logger.error('[MercadoPagoWebhook] Formato de assinatura inválido:', signature);
        logger.info('[MercadoPagoWebhook] Assinatura inválida, mas continuando processamento');
        logger.info('[MercadoPagoWebhook] NOTA: Este comportamento é temporário para garantir que não percamos pagamentos');
        return false;
      }
      
      const timestamp = timestampPart.substring(3);
      const receivedSignature = v1Part.substring(3);
      
      logger.info('[MercadoPagoWebhook] Timestamp da assinatura:', timestamp);
      logger.info('[MercadoPagoWebhook] Assinatura v1:', receivedSignature);
      
      // IMPORTANTE: Normalizar o ID para minúsculas (se for alfanumérico)
      const normalizedId = String(paymentId).toLowerCase();
      
      // Construir o template conforme documentação do Mercado Pago
      // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
      const signatureTemplate = `id:${normalizedId};request-id:${requestId};ts:${timestamp};`;
      
      logger.info('[MercadoPagoWebhook] Template de assinatura:', signatureTemplate);
      
      // Calcular HMAC SHA-256 em formato hexadecimal
      const calculatedSignature = crypto
        .createHmac('sha256', this.notificationSecret)
        .update(signatureTemplate)
        .digest('hex');
      
      logger.info('[MercadoPagoWebhook] Assinatura calculada:', calculatedSignature);
      logger.info('[MercadoPagoWebhook] Assinatura recebida:', receivedSignature);
      
      const isValid = calculatedSignature === receivedSignature;
      
      if (!isValid) {
        logger.warn('[MercadoPagoWebhook] ❌ A assinatura calculada não corresponde à recebida.');
        
        // Tentar verificar alternativas
        const alternativeTemplates = [
          // 1. Sem o ponto-e-vírgula no final
          `id:${normalizedId};request-id:${requestId};ts:${timestamp}`,
          // 2. ID com URL completa
          `id:/v1/payments/${normalizedId};request-id:${requestId};ts:${timestamp};`,
          // 3. ID como número literal (sem aspas ou conversão) se for numérico
          paymentId.match(/^\d+$/) ? `id:${paymentId};request-id:${requestId};ts:${timestamp};` : null,
        ].filter(Boolean) as string[];
        
        let alternativeValid = false;
        
        for (const template of alternativeTemplates) {
          const altSignature = crypto
            .createHmac('sha256', this.notificationSecret)
            .update(template)
            .digest('hex');
            
          if (altSignature === receivedSignature) {
            alternativeValid = true;
            logger.info('[MercadoPagoWebhook] ✅ Assinatura válida usando template alternativo:', template);
            break;
          }
        }
        
        // Se também não encontramos match com as alternativas, registrar para investigação futura
        if (!alternativeValid) {
          logger.warn('[MercadoPagoWebhook] Continuando processamento mesmo com assinatura inválida');
          logger.warn('[MercadoPagoWebhook] NOTA: Este comportamento é temporário para garantir que não percamos pagamentos');
          
          // Registrar informações detalhadas para análise posterior
          this.logInvalidSignature(normalizedId, signature, bodyText, requestId, timestamp);
          
          // Retornar falso, mas continuamos o processamento (verificação de IP será realizada)
          return false;
        }
        
        // Se encontramos uma assinatura válida usando uma alternativa
        return true;
      }
      
      logger.info('[MercadoPagoWebhook] ✅ Assinatura válida!');
      return true;
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao verificar assinatura:', error);
      logger.warn('[MercadoPagoWebhook] Continuando processamento apesar do erro na verificação');
      return false; // Em caso de erro na verificação, retornar inválido (mas continuamos o processamento)
    }
  }
  
  /**
   * Registra assinatura inválida para investigação posterior
   */
  private async logInvalidSignature(
    resourceId: string,
    signature: string,
    bodyText: string,
    requestId: string,
    timestamp: string
  ): Promise<void> {
    try {
      // Calcular assinatura com o template correto
      const signatureTemplate = `id:${resourceId};request-id:${requestId};ts:${timestamp};`;
      const calculatedSignature = crypto
        .createHmac('sha256', this.notificationSecret)
        .update(signatureTemplate)
        .digest('hex');
      
      // Calcular também algumas variações para diagnóstico
      const variations = [
        {
          name: "ID original",
          template: `id:${resourceId};request-id:${requestId};ts:${timestamp};`,
          signature: calculatedSignature
        },
        {
          name: "Sem ponto-e-vírgula no final",
          template: `id:${resourceId};request-id:${requestId};ts:${timestamp}`,
          signature: crypto
            .createHmac('sha256', this.notificationSecret)
            .update(`id:${resourceId};request-id:${requestId};ts:${timestamp}`)
            .digest('hex')
        },
        {
          name: "Usando URL completa",
          template: `id:/v1/payments/${resourceId};request-id:${requestId};ts:${timestamp};`,
          signature: crypto
            .createHmac('sha256', this.notificationSecret)
            .update(`id:/v1/payments/${resourceId};request-id:${requestId};ts:${timestamp};`)
            .digest('hex')
        }
      ];
      
      // Registrar no banco de dados para análise
      await this.supabase
        .from('webhook_logs')
        .insert({
          provider: 'mercadopago',
          event_type: 'invalid_signature',
          payment_id: resourceId,
          payload: bodyText.substring(0, 500), // Limitar tamanho
          metadata: {
            resource_id: resourceId,
            received_signature: signature,
            request_id: requestId,
            timestamp: timestamp,
            template_usado: signatureTemplate,
            calculated_signature: calculatedSignature,
            variations: variations,
            recorded_at: new Date().toISOString()
          },
          message: 'Assinatura inválida do Mercado Pago'
        });
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao registrar assinatura inválida:', error);
    }
  }

  /**
   * Verifica se um IP pertence ao Mercado Pago
   * Lista de IPs de https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
   */
  private async isValidMercadoPagoIP(ip: string): Promise<boolean> {
    // IPs oficiais do Mercado Pago
    const mercadoPagoIPs = [
      '34.195.252.65',
      '34.195.88.102',
      '52.3.254.199',
      '34.200.77.170'
    ];
    
    // Verificar se o IP está na lista oficial
    return mercadoPagoIPs.includes(ip);
  }

  /**
   * Registra uma tentativa de webhook para auditoria
   */
  private async logWebhookAttempt(headers: any, bodyText: string, status: string): Promise<void> {
    try {
      await this.supabase
        .from('webhook_logs')
        .insert({
          provider: 'mercadopago',
          event_type: status,
          headers: {
            'user-agent': headers['user-agent'],
            'content-type': headers['content-type'],
            'x-signature': headers['x-signature'],
            'x-request-id': headers['x-request-id'],
            'x-forwarded-for': headers['x-forwarded-for'],
            'x-real-ip': headers['x-real-ip']
          },
          payload: bodyText.substring(0, 1000), // Limitar tamanho
          recorded_at: new Date().toISOString()
        });
    } catch (error) {
      logger.error('[MercadoPagoWebhook] Erro ao registrar tentativa de webhook:', error);
    }
  }
} 