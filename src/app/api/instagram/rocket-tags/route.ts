import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Interfaces para tipagem das respostas da API
interface PhotoEdge {
  node?: {
    edge_media_to_caption?: {
      edges?: Array<{
        node: {
          text: string;
        };
      }>;
    };
  };
}

export async function GET(request: NextRequest) {
  // Extrair o username dos parâmetros da URL
  const username = request.nextUrl.searchParams.get('username');
  
  // Verificar se o username foi fornecido
  if (!username) {
    return NextResponse.json(
      { error: 'Username não fornecido' },
      { status: 400 }
    );
  }
  
  console.log(`Buscando tags para o usuário: ${username}`);

  try {
    // Definir as chaves da API
    const ROCKET_API_KEY = process.env.RAPIDAPI_KEY || '';
    const ROCKET_API_HOST = 'rocketapi-for-developers.p.rapidapi.com';
    
    // Verificar se a chave da API está configurada
    if (!ROCKET_API_KEY) {
      console.error('Chave da API RocketAPI não configurada');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      );
    }
    
    // Primeiro, buscar o ID do usuário
    try {
      console.log('Buscando ID do usuário...');
      const userResponse = await axios.request({
        method: 'POST',
        url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info',
        headers: {
          'x-rapidapi-key': ROCKET_API_KEY,
          'x-rapidapi-host': ROCKET_API_HOST,
          'Content-Type': 'application/json'
        },
        data: { username },
        timeout: 15000 // 15 segundos timeout
      });
      
      // Verificar se a resposta contém os dados do usuário
      if (!userResponse.data || 
          !userResponse.data.response || 
          !userResponse.data.response.body || 
          !userResponse.data.response.body.data || 
          !userResponse.data.response.body.data.user) {
        console.error('Resposta inválida da RocketAPI (get_info):', JSON.stringify(userResponse.data).substring(0, 500));
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      
      // Extrair o ID do usuário
      const userData = userResponse.data.response.body.data.user;
      const userId = parseInt(userData.id, 10);
      
      console.log(`ID do usuário encontrado: ${userId}`);
      
      // Buscar as tags do usuário
      const tagsResponse = await axios.request({
        method: 'POST',
        url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_tags',
        headers: {
          'x-rapidapi-key': ROCKET_API_KEY,
          'x-rapidapi-host': ROCKET_API_HOST,
          'Content-Type': 'application/json'
        },
        data: {
          id: userId,
          count: 20,
          max_id: null
        },
        timeout: 15000 // 15 segundos timeout
      });
      
      // Debug da resposta
      console.log(`Resposta de tags recebida: ${JSON.stringify(tagsResponse.data).substring(0, 200)}...`);
      
      // Verificar a estrutura da resposta contém dados válidos
      if (!tagsResponse.data || 
          !tagsResponse.data.response || 
          !tagsResponse.data.response.body || 
          !tagsResponse.data.response.body.data ||
          !tagsResponse.data.response.body.data.user ||
          !tagsResponse.data.response.body.data.user.edge_user_to_photos_of_you) {
        console.error('Resposta inválida da RocketAPI (get_tags):', JSON.stringify(tagsResponse.data).substring(0, 500));
        return NextResponse.json(
          { error: 'Não foi possível obter as tags' },
          { status: 500 }
        );
      }
      
      // Extrair e processar as informações de tags do novo formato
      const photosTags = tagsResponse.data.response.body.data.user.edge_user_to_photos_of_you;
      
      // Estrutura de retorno
      const result: {
        recent_tags: Array<{ tag: string; count: number }>;
        popular_tags: Array<{ tag: string; count: number }>;
      } = {
        recent_tags: [],
        popular_tags: []
      };
      
      // Processar os edges para extrair tags das legendas
      if (photosTags.edges && Array.isArray(photosTags.edges)) {
        // Mapeamento para contar tags
        const tagCounts: Record<string, number> = {};
        
        // Processar cada edge para extrair hashtags das legendas
        photosTags.edges.forEach((edge: PhotoEdge) => {
          if (edge.node && 
              edge.node.edge_media_to_caption && 
              edge.node.edge_media_to_caption.edges && 
              edge.node.edge_media_to_caption.edges.length > 0) {
            
            const caption = edge.node.edge_media_to_caption.edges[0].node.text || '';
            
            // Extrair hashtags usando expressão regular
            const hashtags = caption.match(/#[\w-]+/g) || [];
            
            // Incrementar contagem para cada hashtag
            hashtags.forEach((tag: string) => {
              const cleanTag = tag.replace('#', '').toLowerCase();
              if (cleanTag) {
                if (!tagCounts[cleanTag]) {
                  tagCounts[cleanTag] = 0;
                }
                tagCounts[cleanTag]++;
              }
            });
          }
        });
        
        // Converter o objeto de contagem para um array
        const tagsArray = Object.entries(tagCounts).map(([tag, count]) => ({
          tag,
          count
        }));
        
        // Ordenar por contagem (do maior para o menor)
        tagsArray.sort((a, b) => b.count - a.count);
        
        // Dividir em tags populares (top 10) e recentes (as restantes, até 10)
        result.popular_tags = tagsArray.slice(0, 10);
        
        // Para as tags recentes, usamos o mesmo array mas ordenado por timestamp se possível
        // Como não temos o timestamp diretamente associado à tag, usamos apenas as restantes
        result.recent_tags = tagsArray.slice(10, 20);
      }
      
      return NextResponse.json(result);
      
    } catch (error: unknown) {
      console.error('Erro ao buscar dados da RocketAPI:', error);
      
      // Retornar uma resposta de erro apropriada
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return NextResponse.json(
        { error: `Falha ao buscar tags: ${errorMessage}` },
        { status: 500 }
      );
    }
    
  } catch (error: unknown) {
    console.error('Erro geral na rota de tags:', error);
    
    // Retornar uma resposta de erro apropriada
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro interno do servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
} 