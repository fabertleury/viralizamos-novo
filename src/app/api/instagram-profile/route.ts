import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Função para calcular métricas de engajamento
function calculateEngagementMetrics(totalFollowers: number, likes: number, comments: number, reelViews: number) {
  console.log('[METRICS] Calculando métricas:', { 
    totalFollowers, 
    likes, 
    comments, 
    reelViews 
  });

  // Taxa de engajamento básica
  const engagementRate = (likes + comments) / totalFollowers * 100;
  
  // Pontuação de influência
  const influenceScore = 
    (likes * 0.5) + 
    (comments * 1.5) + 
    (reelViews * 0.1);

  // Classificação de perfil
  let profileTier = 'Iniciante';
  if (engagementRate > 5) profileTier = 'Intermediário';
  if (engagementRate > 10) profileTier = 'Avançado';
  if (engagementRate > 20) profileTier = 'Influenciador';

  console.log('[METRICS] Resultado:', {
    engagementRate,
    influenceScore,
    profileTier
  });

  return {
    engagementRate: Number(engagementRate.toFixed(2)),
    influenceScore: Number(influenceScore.toFixed(2)),
    profileTier
  };
}

export async function GET(request: NextRequest) {
  // Extrair parâmetros da URL
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  console.log('[INSTAGRAM PROFILE] Recebendo solicitação para username:', username);

  // Validar username
  if (!username) {
    console.error('[INSTAGRAM PROFILE] Username não fornecido');
    return NextResponse.json({ 
      error: 'Nome de usuário não fornecido' 
    }, { status: 400 });
  }

  // Configurações da API para informações do perfil
  const profileOptions = {
    method: 'GET',
    hostname: 'instagram-scraper-api2.p.rapidapi.com',
    port: null,
    path: `/v1/info?username_or_id_or_url=${username}`,
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
    }
  };

  // Função para buscar informações do perfil
  const fetchInstagramProfile = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const req = https.request(profileOptions, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            const responseText = body.toString();
            console.log('[INSTAGRAM PROFILE] Resposta bruta:', responseText);
            
            const responseData = JSON.parse(responseText);
            console.log('[INSTAGRAM PROFILE] Dados recebidos:', JSON.stringify(responseData, null, 2));
            
            resolve(responseData);
          } catch (error) {
            console.error('[INSTAGRAM PROFILE] Erro ao parsear resposta:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('[INSTAGRAM PROFILE] Erro na requisição:', error);
        reject(error);
      });

      req.end();
    });
  };

  try {
    const profileData = await fetchInstagramProfile();

    // Verificar se há dados de perfil
    if (!profileData.data) {
      console.warn('[INSTAGRAM PROFILE] Nenhum dado de perfil encontrado');
      return NextResponse.json({
        username: username,
        full_name: null,
        biography: null,
        followers_count: 0,
        following_count: 0,
        media_count: 0,
        profile_pic_url: null,
        is_verified: false
      });
    }

    // Extrair dados principais do perfil
    const profile = profileData.data;

    // Retornar dados no formato esperado
    return NextResponse.json({
      username: profile.username,
      full_name: profile.full_name,
      biography: profile.biography,
      followers_count: profile.follower_count || 0,
      following_count: profile.following_count || 0,
      media_count: profile.media_count || 0,
      profile_pic_url: profile.profile_pic_url_hd || profile.profile_pic_url,
      is_verified: profile.is_verified
    });

  } catch (error) {
    console.error('[INSTAGRAM PROFILE] Erro ao buscar perfil:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar perfil',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// Configuração para permitir chamadas de qualquer origem
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
