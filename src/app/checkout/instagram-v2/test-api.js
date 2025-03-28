// Script para testar as APIs do Instagram
const axios = require('axios');

// Usuário de teste do Instagram
const username = 'cristiano'; // Um perfil popular para teste

// Função para testar todas as APIs
async function testAllApis() {
  console.log('Iniciando testes das APIs do Instagram com ScapeCreators...\n');
  
  try {
    // Teste da API de perfil (seguidores)
    console.log('1. Testando API de perfil...');
    const profileResponse = await axios.get(`http://localhost:3000/checkout/instagram-v2/seguidores?username=${username}`);
    console.log(`✅ API de perfil funcionando! Seguidores: ${profileResponse.data.profile?.followers_count}`);
    console.log('-----------------------------------');
    
    // Teste da API de posts
    console.log('2. Testando API de posts...');
    const postsResponse = await axios.get(`http://localhost:3000/checkout/instagram-v2/curtidas?username=${username}`);
    console.log(`✅ API de posts funcionando! Posts encontrados: ${postsResponse.data.posts?.length || 0}`);
    console.log('-----------------------------------');
    
    // Teste da API de reels
    console.log('3. Testando API de reels...');
    const reelsResponse = await axios.get(`http://localhost:3000/checkout/instagram-v2/reels?username=${username}`);
    console.log(`✅ API de reels funcionando! Reels encontrados: ${reelsResponse.data.reels?.length || 0}`);
    console.log('-----------------------------------');
    
    // Teste da API de comentários
    console.log('4. Testando API de comentários (posts)...');
    const commentsResponse = await axios.get(`http://localhost:3000/checkout/instagram-v2/comentarios?username=${username}`);
    console.log(`✅ API de comentários funcionando! Posts encontrados: ${commentsResponse.data.posts?.length || 0}`);
    console.log('-----------------------------------');
    
    // Teste da API de visualização
    console.log('5. Testando API de visualização...');
    const viewsResponse = await axios.get(`http://localhost:3000/checkout/instagram-v2/visualizacao?username=${username}`);
    console.log(`✅ API de visualização funcionando! Posts/reels encontrados: ${viewsResponse.data.posts?.length || 0}`);
    console.log('-----------------------------------');
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// Executar os testes
testAllApis();
