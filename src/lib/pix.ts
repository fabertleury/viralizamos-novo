import { encode } from 'qrcode';

interface PixQRCodeParams {
  amount: number;
  description: string;
  orderId: string;
}

export async function generatePixQRCode({ amount, description, orderId }: PixQRCodeParams) {
  try {
    // Criar o payload do PIX
    const pixPayload = {
      pixKey: process.env.PIX_KEY || 'sua_chave_pix_aqui',
      description,
      merchantName: process.env.MERCHANT_NAME || 'Viralizai',
      merchantCity: process.env.MERCHANT_CITY || 'SAO PAULO',
      amount: amount.toFixed(2),
      txid: orderId,
      merchantCategoryCode: '0000'
    };

    // Gerar o código PIX
    const pixCode = generatePixCode(pixPayload);

    // Gerar o QR code
    const qrCode = await encode(pixCode, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Retornar tanto o código PIX quanto o QR code em base64
    return {
      pix_code: pixCode,
      qr_code: qrCode,
      qr_code_base64: `data:image/png;base64,${Buffer.from(qrCode).toString('base64')}`
    };
  } catch (error) {
    console.error('Erro ao gerar QR code PIX:', error);
    throw new Error('Failed to generate PIX QR code');
  }
}

function generatePixCode(payload: any): string {
  const {
    pixKey,
    description,
    merchantName,
    merchantCity,
    amount,
    txid,
    merchantCategoryCode
  } = payload;

  // Criar o payload do PIX seguindo o padrão EMV
  const pixCode = [
    '000201', // Payload Format Indicator
    '010212', // Merchant Account Information
    '2666', // Merchant Account Information - GUI
    '01', // Key
    pixKey.length.toString().padStart(2, '0') + pixKey,
    '52040000', // Merchant Category Code
    '5303986', // Transaction Currency (986 = BRL)
    '54' + amount.length.toString().padStart(2, '0') + amount, // Transaction Amount
    '5802BR', // Country Code
    '59' + merchantName.length.toString().padStart(2, '0') + merchantName, // Merchant Name
    '60' + merchantCity.length.toString().padStart(2, '0') + merchantCity, // Merchant City
    '62' + (description.length + 4).toString().padStart(2, '0') + '05' + description.length.toString().padStart(2, '0') + description, // Additional Data Field Template
    '6304' // CRC16
  ].join('');

  // Calcular o CRC16
  const crc16 = calculateCRC16(pixCode);
  
  // Retornar o código PIX completo
  return pixCode + crc16;
}

function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
} 