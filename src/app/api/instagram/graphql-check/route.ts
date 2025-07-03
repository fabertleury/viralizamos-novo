import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Pool, QueryResult } from 'pg';

// Configurar conexão com o PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:zacEqGceWerpWpBZZqttjamDOCcdhRbO@shinkansen.proxy.rlwy.net:29036/railway'
});

// Interface para a ordem das APIs
interface ApiOrder {
  id: number;
  name: string;
  enabled: boolean;
  order: number;
  max_requests: number;
  current_requests: number;
}

// Interface para o histórico de verificação
interface VerificationHistory {
  id: number;
  username: string;
  api_name: string;
  verified_at: string;
}

// Função para verificar se um perfil está bloqueado
async function isProfileBlocked(username: string): Promise<{ isBlocked: boolean; reason?: string }> {
  try {
    // Normalizar o nome de usuário (remover @ e converter para minúsculas)
    const normalizedUsername = username.replace('@', '').toLowerCase();
    
    // Verificar na tabela de perfis bloqueados
    const result = await pool.query(
      'SELECT * FROM instagram_blocked_profiles WHERE username = $1',
      [normalizedUsername]
    );
    
    // Se não encontrou dados, não está bloqueado
    if (result.rows.length === 0) {
      return { isBlocked: false };
    }
    
    const data = result.rows[0];
    
    // Verificar se o bloqueio tem data de expiração e se já passou
    if (data.blocked_until) {
      const now = new Date();
      const expirationDate = new Date(data.blocked_until);
      
      if (now > expirationDate) {
        // O bloqueio expirou, remover da lista
        await pool.query(
          'DELETE FROM instagram_blocked_profiles WHERE username = $1',
          [normalizedUsername]
        );
        return { isBlocked: false };
      }
    }
    
    // Perfil está bloqueado
    return { 
      isBlocked: true, 
      reason: data.reason || 'Perfil bloqueado pelo sistema'
    };
  } catch (error) {
    console.error('Erro ao verificar bloqueio de perfil:', error);
    return { isBlocked: false };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const quickCheck = searchParams.get('quick_check') === 'true';

  if (!username) {
    return NextResponse.json(
      { message: 'Nome de usuário não fornecido' },
      { status: 400 }
    );
  }

  // Verificar se é um link de post ou reel
  if (username.includes('/p/') || username.includes('/reel/')) {
    return NextResponse.json(
      { message: 'Por favor, insira o link do perfil do Instagram, não de um post ou reel' },
      { status: 400 }
    );
  }

  // Extrair o nome de usuário do link se for um link de perfil
  let usernameToCheck = username;
  if (username.includes('instagram.com/')) {
    usernameToCheck = username.split('instagram.com/')[1].split('/')[0].split('?')[0];
  }

  // Remover @ se presente
  usernameToCheck = usernameToCheck.replace('@', '');
  
  // Verificar se o perfil está bloqueado
  const blockStatus = await isProfileBlocked(usernameToCheck);
  if (blockStatus.isBlocked) {
    console.log(`Perfil bloqueado: ${usernameToCheck} - Motivo: ${blockStatus.reason}`);
    return NextResponse.json(
      { 
        message: 'Este perfil está bloqueado e não pode ser verificado', 
        reason: blockStatus.reason,
        username: usernameToCheck
      },
      { status: 403 }
    );
  }

  // Obter a ordem das APIs do banco de dados
  let apiOrder: ApiOrder[] = [
    { id: 1, name: 'rocketapi_get_info', enabled: true, order: 1, max_requests: 100, current_requests: 0 },
    { id: 2, name: 'instagram_scraper', enabled: true, order: 2, max_requests: 50, current_requests: 0 },
    { id: 4, name: 'instagram230', enabled: true, order: 3, max_requests: 100, current_requests: 0 },
    { id: 5, name: 'instagram_statistics', enabled: true, order: 4, max_requests: 50, current_requests: 0 },
    { id: 6, name: 'instagram_looter', enabled: true, order: 5, max_requests: 100, current_requests: 0 },
    { id: 7, name: 'instagram_best_experience', enabled: true, order: 6, max_requests: 100, current_requests: 0 }
  ];

  try {
    // Tentar obter a ordem das APIs do banco de dados
    const result = await pool.query(
      'SELECT * FROM api_order ORDER BY "order" ASC'
    );

    if (result.rows.length > 0) {
      apiOrder = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        enabled: row.enabled,
        order: row.order,
        max_requests: row.max_requests,
        current_requests: row.current_requests
      }));
    }
  } catch (error) {
    console.error('Erro ao acessar o PostgreSQL:', error);
  }

  // Se for uma verificação rápida, verificar se já temos esse perfil em cache
  if (quickCheck) {
    try {
      // Tentar buscar o perfil mais recente do banco de dados
      const result = await pool.query(
        'SELECT * FROM instagram_verification_history WHERE username = $1 ORDER BY verified_at DESC LIMIT 1',
        [username]
      );

      if (result.rows.length > 0) {
        const lastCheck = result.rows[0];
        const lastApiName = lastCheck.api_name;
        
        console.log(`Última API usada para ${username}: ${lastApiName}`);
        
        // Para verificação rápida, usar uma API diferente da última usada
        // para ter mais chances de obter dados atualizados
        
        // Filtrar apenas APIs habilitadas
        const enabledApis = apiOrder.filter(api => api.enabled);
        
        // Remover a última API usada da lista para não usá-la novamente
        const apisToTry = enabledApis.filter(api => api.name !== lastApiName);
        
        if (apisToTry.length > 0) {
          // Ordenar pelo número de ordem para priorizar as mais confiáveis
          apisToTry.sort((a, b) => a.order - b.order);
          
          console.log(`Verificação rápida: Tentando API ${apisToTry[0].name} (diferente da última usada)`);
          
          // Tentar usar a primeira API da lista filtrada
          try {
            let response;
            if (apisToTry[0].name === 'rocketapi_get_info') {
              response = await checkRocketAPI(username, true);
              if (response) return response;
            } else if (apisToTry[0].name === 'instagram_scraper') {
              response = await checkInstagramScraper(username, true);
              if (response) return response;
            } else if (apisToTry[0].name === 'instagram230') {
              response = await checkInstagram230(username, true);
              if (response) return response;
            } else if (apisToTry[0].name === 'instagram_statistics') {
              response = await checkInstagramStatistics(username, true);
              if (response) return response;
            } else if (apisToTry[0].name === 'instagram_looter') {
              response = await checkInstagramLooter(username, true);
              if (response) return response;
            } else if (apisToTry[0].name === 'instagram_best_experience') {
              response = await checkInstagramBestExperience(username, true);
              if (response) return response;
            }
          } catch (error) {
            console.error(`Erro na verificação rápida (API alternativa) para ${username}:`, error);
            // Se falhar, continuar com a verificação normal
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de verificação:', error);
      // Prosseguir com a verificação normal em caso de erro
    }
  }

  // Obter a última API usada para este usuário
  let lastUsedApi = null;
  try {
    const result = await pool.query(
      'SELECT api_name FROM instagram_verification_history WHERE username = $1 ORDER BY verified_at DESC LIMIT 1',
      [username]
    );

    if (result.rows.length > 0) {
      lastUsedApi = result.rows[0].api_name;
      console.log(`Última API usada para ${username}: ${lastUsedApi}`);
    }
  } catch (error) {
    console.error('Erro ao verificar histórico de APIs:', error);
  }

  // Filtrar apenas APIs habilitadas
  const enabledApis = apiOrder.filter(api => api.enabled);

  // Se houver uma última API usada, reordene para evitar usá-la primeiro
  if (lastUsedApi) {
    // Remover a última API usada da lista
    const lastApiIndex = enabledApis.findIndex(api => api.name === lastUsedApi);
    if (lastApiIndex !== -1) {
      const lastApi = enabledApis.splice(lastApiIndex, 1)[0];
      // Adicionar a última API usada ao final da lista
      enabledApis.push(lastApi);
    }
  } else {
    // Ordenar APIs pela ordem definida se não houver histórico
    enabledApis.sort((a, b) => a.order - b.order);
  }

  // Função para atualizar o contador de requisições
  const updateRequestCount = async (apiName: string) => {
    try {
      const apiToUpdate = apiOrder.find(api => api.name === apiName);
      if (apiToUpdate) {
        await pool.query(
          'UPDATE api_order SET current_requests = current_requests + 1 WHERE id = $1',
          [apiToUpdate.id]
        );
      }
    } catch (error) {
      console.error(`Erro ao atualizar contador para ${apiName}:`, error);
    }
  };

  // Função para registrar a API usada no histórico
  const updateVerificationHistory = async (apiName: string) => {
    try {
      // Primeiro, excluir qualquer registro existente para este usuário e API
      await pool.query(
        'DELETE FROM instagram_verification_history WHERE username = $1 AND api_name = $2',
        [username, apiName]
      );

      // Inserir o novo registro
      await pool.query(
        'INSERT INTO instagram_verification_history (username, api_name, verified_at) VALUES ($1, $2, $3)',
        [username, apiName, new Date().toISOString()]
      );
    } catch (error) {
      console.error(`Erro ao registrar verificação para ${apiName}:`, error);
    }
  };

  // Funções de verificação para cada API
  async function checkRocketAPI(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'POST',
        url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_info',
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'rocketapi-for-developers.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          username: username
        },
        timeout: 8000 // Adicionar timeout para evitar que a requisição fique pendente por muito tempo
      });

      // Verificar se temos uma resposta
      if (!response.data) {
        console.log(`[API] API RocketAPI retornou resposta vazia para ${username}`);
        return null;
      }

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.status === 'done' && 
          response.data.response && 
          response.data.response.body && 
          response.data.response.body.data && 
          response.data.response.body.data.user) {
        
        const userData = response.data.response.body.data.user;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('rocketapi_get_info');
          
          // Registrar no histórico
          await updateVerificationHistory('rocketapi_get_info');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name,
          is_private: userData.is_private,
          is_verified: userData.is_verified,
          follower_count: userData.edge_followed_by?.count,
          following_count: userData.edge_follow?.count,
          media_count: userData.edge_owner_to_timeline_media?.count || 0,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url,
          source: 'rocketapi_get_info'
        });
      }
      
      console.log(`[API] API RocketAPI não encontrou perfil válido para ${username}`);
      return null;
    } catch (error) {
      // Log mais detalhado do erro
      if (axios.isAxiosError(error)) {
        console.error('[API] Erro na API RocketAPI Get Info:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          url: error.config?.url
        });
      } else {
        console.error('[API] Erro não-Axios na API RocketAPI Get Info:', error);
      }
      return null;
    }
  }

  async function checkInstagramScraper(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram-scraper-2022.p.rapidapi.com/ig/info_username/',
        params: {
          user: username
        },
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'instagram-scraper-2022.p.rapidapi.com'
        }
      });

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.user && 
          response.data.user.pk) {
        
        const userData = response.data.user;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('instagram_scraper');
          
          // Registrar no histórico
          await updateVerificationHistory('instagram_scraper');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name,
          is_private: userData.is_private,
          is_verified: userData.is_verified,
          follower_count: userData.follower_count,
          following_count: userData.following_count,
          media_count: userData.media_count,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url,
          source: 'instagram_scraper'
        });
      }
      return null;
    } catch (error) {
      console.error('Erro na API Instagram Scraper:', error);
      return null;
    }
  }

  async function checkInstagram230(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram230.p.rapidapi.com/user/details',
        params: {
          username: username
        },
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'instagram230.p.rapidapi.com'
        }
      });

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.status === 'ok' && 
          response.data.data && 
          response.data.data.user) {
        
        const userData = response.data.data.user;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('instagram230');
          
          // Registrar no histórico
          await updateVerificationHistory('instagram230');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name,
          is_private: userData.is_private,
          is_verified: userData.is_verified,
          follower_count: userData.follower_count,
          following_count: userData.following_count,
          media_count: userData.media_count,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url,
          source: 'instagram230'
        });
      }
      return null;
    } catch (error) {
      console.error('Erro na API Instagram230:', error);
      return null;
    }
  }

  async function checkInstagramStatistics(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram-statistics.p.rapidapi.com/statistics',
        params: {
          username: username
        },
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'instagram-statistics.p.rapidapi.com'
        }
      });

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.username) {
        
        const userData = response.data;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('instagram_statistics');
          
          // Registrar no histórico
          await updateVerificationHistory('instagram_statistics');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name || userData.username,
          is_private: userData.private || false,
          is_verified: userData.verified || false,
          follower_count: userData.followers || 0,
          following_count: userData.following || 0,
          media_count: userData.posts || 0,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url || '',
          source: 'instagram_statistics'
        });
      }
      return null;
    } catch (error) {
      console.error('Erro na API Instagram Statistics:', error);
      return null;
    }
  }

  async function checkInstagramLooter(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram-looter2.p.rapidapi.com/profile',
        params: {
          username: username
        },
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com'
        }
      });

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.username) {
        
        const userData = response.data;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('instagram_looter');
          
          // Registrar no histórico
          await updateVerificationHistory('instagram_looter');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name || userData.username,
          is_private: userData.is_private || false,
          is_verified: userData.is_verified || false,
          follower_count: userData.edge_followed_by?.count || 0,
          following_count: userData.edge_follow?.count || 0,
          media_count: userData.edge_owner_to_timeline_media?.count || 0,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url || '',
          source: 'instagram_looter'
        });
      }
      return null;
    } catch (error) {
      console.error('Erro na API Instagram Looter:', error);
      return null;
    }
  }

  async function checkInstagramBestExperience(username: string, quickCheck = false) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram-best-experience.p.rapidapi.com/user-info/get-user-info-by-username',
        params: {
          username: username
        },
        headers: {
          'x-rapidapi-key': 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
          'x-rapidapi-host': 'instagram-best-experience.p.rapidapi.com'
        }
      });

      // Verificar o caminho correto da resposta
      if (response.data && 
          response.data.status === 'ok' && 
          response.data.data) {
        
        const userData = response.data.data;
        
        if (!quickCheck) {
          // Atualizar contador de requisições
          await updateRequestCount('instagram_best_experience');
          
          // Registrar no histórico
          await updateVerificationHistory('instagram_best_experience');
        }
        
        return NextResponse.json({
          username: userData.username,
          full_name: userData.full_name || userData.username,
          is_private: userData.is_private || false,
          is_verified: userData.is_verified || false,
          follower_count: userData.follower_count || 0,
          following_count: userData.following_count || 0,
          media_count: userData.media_count || 0,
          biography: userData.biography || '',
          profile_pic_url: userData.profile_pic_url || '',
          source: 'instagram_best_experience'
        });
      }
      return null;
    } catch (error) {
      console.error('Erro na API Instagram Best Experience:', error);
      return null;
    }
  }

  // Tentar cada API na ordem definida
  for (const api of enabledApis) {
    try {
      console.log(`Tentando API ${api.name} para ${username}...`);
      
      let response = null;
      
      if (api.name === 'rocketapi_get_info') {
        response = await checkRocketAPI(username);
      } else if (api.name === 'instagram_scraper') {
        response = await checkInstagramScraper(username);
      } else if (api.name === 'instagram230') {
        response = await checkInstagram230(username);
      } else if (api.name === 'instagram_statistics') {
        response = await checkInstagramStatistics(username);
      } else if (api.name === 'instagram_looter') {
        response = await checkInstagramLooter(username);
      } else if (api.name === 'instagram_best_experience') {
        response = await checkInstagramBestExperience(username);
      }
      
      // Se a API retornou dados, retorna a resposta
      if (response) {
        return response;
      }
    } catch (error) {
      console.error(`Erro ao verificar com a API ${api.name}:`, error);
      // Continuar para a próxima API em caso de erro
    }
  }
  
  // Se todas as APIs falharem, retornar erro 404
  return NextResponse.json(
    { message: 'Perfil não encontrado ou APIs indisponíveis', username },
    { status: 404 }
  );
}
