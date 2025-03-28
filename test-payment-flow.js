// Script para testar o fluxo de pagamento e criação de pedidos
import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const famaApiKey = process.env.FAMA_REDES_API_KEY;
const famaApiUrl = process.env.FAMA_REDES_API_URL;

if (!baseUrl || !famaApiKey || !famaApiUrl) {
  console.error('Variáveis de ambiente necessárias não configuradas');
  process.exit(1);
}

async function testPaymentFlow() {
  try {
    console.log('Testando fluxo de pagamento e criação de pedidos...');
    console.log('Configurações:');
    console.log(`- Base URL: ${baseUrl}`);
    console.log(`- Fama API URL: ${famaApiUrl}`);
    console.log(`- Fama API Key configurada: ${famaApiKey ? 'Sim' : 'Não'}`);
    
    // Testar chamada direta para a API da Fama
    console.log('\nTestando conexão com a API da Fama...');
    try {
      const famaResponse = await axios.post(famaApiUrl, {
        key: famaApiKey,
        action: 'services' // Ação para listar serviços disponíveis
      });
      
      console.log('✅ Conexão com a API da Fama bem-sucedida!');
      console.log(`Total de serviços disponíveis: ${famaResponse.data?.length || 0}`);
    } catch (famaError) {
      console.error('❌ Erro ao conectar com a API da Fama:', famaError.message);
      if (famaError.response) {
        console.error('Detalhes da resposta:', famaError.response.data);
      }
    }
    
    // Testar endpoint local de criação de pedidos
    console.log('\nTestando endpoint local de criação de pedidos...');
    const testOrderData = {
      service: '1', // ID do serviço na Fama
      link: 'https://instagram.com/p/test123',
      quantity: 100,
      transaction_id: 'test-transaction-id',
      target_username: 'testuser'
    };
    
    try {
      const orderResponse = await axios.post(`${baseUrl}/api/providers/fama-redes/add-order`, testOrderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Chamada ao endpoint de criação de pedidos bem-sucedida!');
      console.log('Resposta:', orderResponse.data);
    } catch (orderError) {
      console.error('❌ Erro ao chamar endpoint de criação de pedidos:', orderError.message);
      if (orderError.response) {
        console.error('Detalhes da resposta:', orderError.response.data);
      }
    }
  } catch (error) {
    console.error('Erro ao testar fluxo de pagamento:', error);
  }
}

testPaymentFlow();
