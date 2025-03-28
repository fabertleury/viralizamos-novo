import { generatePixCode } from 'pix-utils';

interface PixQRCodeData {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  serviceName: string;
  serviceType: string;
  providerName?: string;
  providerId?: string;
  serviceId: string;
  quantity: number;
  discountAmount?: number;
  finalAmount?: number;
  metadata: {
    order_id: string;
    service_id: string;
    provider_id?: string;
    quantity: number;
    discount_amount?: number;
    final_amount?: number;
    service_name: string;
    service_type: string;
    provider_name?: string;
    email?: string;
    link?: string;
    username?: string;
    post?: {
      shortcode: string;
      display_url: string;
    };
    provider_status?: {
      status: string;
      start_count: string;
      remains: string;
      updated_at: string;
      charge?: string;
      currency?: string;
    };
  };
}

export async function generatePixQRCode(data: PixQRCodeData) {
  try {
    // Formatar o valor para 2 casas decimais
    const amount = Number(data.amount.toFixed(2));
    
    // Criar descrição do pedido
    const description = `${data.description} - ${data.serviceName}`;
    
    // Criar dados do QR code
    const pixData = {
      pixKey: process.env.PIX_KEY || '', // Chave PIX do vendedor
      description,
      merchantName: process.env.MERCHANT_NAME || 'Viralizai', // Nome do vendedor
      merchantCity: process.env.MERCHANT_CITY || 'SAO PAULO', // Cidade do vendedor
      amount,
      txid: data.orderId, // ID único da transação
      metadata: {
        order_id: data.orderId,
        service_id: data.serviceId,
        provider_id: data.providerId,
        quantity: data.quantity,
        discount_amount: data.discountAmount,
        final_amount: data.finalAmount,
        service_name: data.serviceName,
        service_type: data.serviceType,
        provider_name: data.providerName,
        email: data.customerEmail,
        link: data.metadata.link,
        username: data.metadata.username,
        post: data.metadata.post,
        provider_status: data.metadata.provider_status
      }
    };

    // Gerar código PIX
    const pixCode = generatePixCode(pixData);

    // Gerar QR code base64
    const qrCodeBase64 = await generateQRCodeBase64(pixCode);

    return {
      qr_code: pixCode,
      qr_code_base64: qrCodeBase64
    };
  } catch (error) {
    console.error('Erro ao gerar QR code PIX:', error);
    throw new Error('Erro ao gerar QR code PIX');
  }
}

async function generateQRCodeBase64(pixCode: string): Promise<string> {
  try {
    // Usar a biblioteca qrcode para gerar o QR code
    const QRCode = require('qrcode');
    
    // Gerar QR code como base64
    const qrCodeBase64 = await QRCode.toDataURL(pixCode, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return qrCodeBase64;
  } catch (error) {
    console.error('Erro ao gerar QR code base64:', error);
    throw new Error('Erro ao gerar QR code base64');
  }
} 