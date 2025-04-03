import mercadopago from 'mercadopago';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { addToQueue } from '../queue/redis';

/**
 * Serviço para integração com o Mercado Pago
 */
export class MercadoPagoService {
  private static initialized = false;
  
  /**
   * Inicializa a configuração do Mercado Pago
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('Token do Mercado Pago não configurado');
    }
    
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);
    this.initialized = true;
    console.log('Mercado Pago inicializado com sucesso');
  }
  
  /**
   * Cria um pagamento PIX no Mercado Pago
   */
  static async createPixPayment(
    amount: number,
    description: string,
    customer: {
      email: string;
      name?: string;
      phone?: string;
    },
    metadata: Record<string, unknown>,
    options: {
      expirationMinutes?: number;
      notificationUrl?: string;
      externalReference?: string;
    } = {}
  ): Promise<{
    payment_id: string;
    qr_code: string;
    qr_code_base64: string;
    status: string;
    external_reference: string;
  }> {
    this.initialize();
    
    // Definir valores padrão
    const expirationMinutes = options.expirationMinutes || 30;
    const notificationUrl = options.notificationUrl || 
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://viralizamos.com'}/api/payment-service/webhook/mercadopago`;
    const externalReference = options.externalReference || uuidv4();
    
    // Calcular data de expiração
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes);
    const expirationISOString = expirationDate.toISOString();
    
    console.log(`Criando pagamento PIX de R$ ${amount} para ${customer.email}`);
    
    try {
      // Criar pagamento no Mercado Pago
      const result = await mercadopago.payment.create({
        transaction_amount: Number(amount),
        description,
        payment_method_id: 'pix',
        notification_url: notificationUrl,
        date_of_expiration: expirationISOString,
        external_reference: externalReference,
        payer: {
          email: customer.email,
          first_name: customer.name?.split(' ')[0] || 'Cliente',
          last_name: customer.name?.split(' ').slice(1).join(' ') || 'Anônimo'
        },
        metadata
      });
      
      // Gerar QR Code em base64
      const qrCodeText = result.body.point_of_interaction.transaction_data.qr_code;
      let qrCodeBase64 = '';
      
      try {
        qrCodeBase64 = await QRCode.toDataURL(qrCodeText);
        qrCodeBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
      } catch (qrError) {
        console.error('Erro ao gerar QR Code:', qrError);
      }
      
      // Agendar verificação de status
      await this.scheduleStatusCheck(result.body.id.toString());
      
      return {
        payment_id: result.body.id.toString(),
        qr_code: result.body.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: qrCodeBase64,
        status: result.body.status,
        external_reference: externalReference
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX no Mercado Pago:', error);
      throw error;
    }
  }
  
  /**
   * Verifica o status de um pagamento
   */
  static async checkPaymentStatus(paymentId: string): Promise<{
    status: string;
    status_detail: string;
    updated: boolean;
  }> {
    this.initialize();
    
    try {
      const result = await mercadopago.payment.get(Number(paymentId));
      
      return {
        status: result.body.status,
        status_detail: result.body.status_detail,
        updated: true
      };
    } catch (error) {
      console.error(`Erro ao verificar status do pagamento ${paymentId}:`, error);
      
      return {
        status: 'error',
        status_detail: error instanceof Error ? error.message : String(error),
        updated: false
      };
    }
  }
  
  /**
   * Agenda verificações periódicas de status do pagamento
   */
  private static async scheduleStatusCheck(paymentId: string): Promise<void> {
    // Verificar em 1 minuto
    await addToQueue('checkPaymentStatus', { paymentId }, {
      delay: 60 * 1000,
      priority: 1
    });
    
    // Verificar em 5 minutos
    await addToQueue('checkPaymentStatus', { paymentId }, {
      delay: 5 * 60 * 1000,
      priority: 1
    });
    
    // Verificar em 15 minutos
    await addToQueue('checkPaymentStatus', { paymentId }, {
      delay: 15 * 60 * 1000,
      priority: 1
    });
    
    // Verificar em 30 minutos (próximo à expiração)
    await addToQueue('checkPaymentStatus', { paymentId }, {
      delay: 30 * 60 * 1000,
      priority: 2
    });
  }
} 