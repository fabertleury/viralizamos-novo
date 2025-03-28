import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Interface para os dados de seguidores retornados pela API Apify
interface ApifyFollowerData {
  id: string;
  username: string;
  url: string;
  fullName: string;
  biography: string;
  externalUrl: string | null;
  externalUrlShimmed: string | null;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  businessCategoryName: string | null;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  facebookPage: string | null;
  igtvVideoCount: number;
  relatedProfiles: Array<{
    id: string;
    full_name: string;
    is_private: boolean;
    is_verified: boolean;
    profile_pic_url: string;
    username: string;
  }>;
}

// Interface para a resposta formatada
interface SeguidoresResponse {
  success: boolean;
  message: string;
  data: {
    username: string;
    followersCount: number;
    followsCount: number;
    verified: boolean;
    private: boolean;
    profilePicUrl: string;
    fullName: string;
    biography: string;
    relatedProfiles: Array<{
      username: string;
      fullName: string;
      isPrivate: boolean;
      isVerified: boolean;
      profilePicUrl: string;
    }>;
  } | null;
}

export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
): Promise<NextResponse> {
  try {
    // Obter o nome de usuário da URL
    const username = await context.params.username;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Nome de usuário não fornecido",
          data: null,
        },
        { status: 400 }
      );
    }

    // Configurar a chamada para a API Apify
    const apifyApiKey = process.env.APIFY_API_KEY || process.env.NEXT_PUBLIC_APIFY_API_KEY;
    
    if (!apifyApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Chave da API Apify não configurada",
          data: null,
        },
        { status: 500 }
      );
    }

    // Iniciar uma nova execução do ator Apify para obter informações do perfil
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/dSCLg0C3YEZ83HzYX/runs?token=${apifyApiKey}`,
      {
        usernames: [username],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Obter o ID da execução
    const runId = runResponse.data.data.id;

    // Aguardar a conclusão da execução (com timeout)
    let isFinished = false;
    let attempts = 0;
    const maxAttempts = 10; // Número máximo de tentativas
    let datasetId = "";

    while (!isFinished && attempts < maxAttempts) {
      attempts++;
      
      // Verificar o status da execução
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/acts/dSCLg0C3YEZ83HzYX/runs/${runId}?token=${apifyApiKey}`
      );
      
      const status = statusResponse.data.data.status;
      
      if (status === "SUCCEEDED") {
        isFinished = true;
        datasetId = statusResponse.data.data.defaultDatasetId;
      } else if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        return NextResponse.json(
          {
            success: false,
            message: `A execução da API falhou com status: ${status}`,
            data: null,
          },
          { status: 500 }
        );
      } else {
        // Aguardar 2 segundos antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!isFinished) {
      return NextResponse.json(
        {
          success: false,
          message: "Tempo limite excedido ao aguardar a conclusão da API",
          data: null,
        },
        { status: 504 }
      );
    }

    // Obter os resultados do dataset
    const datasetResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyApiKey}`
    );

    const profileData = datasetResponse.data[0] as ApifyFollowerData;

    if (!profileData) {
      return NextResponse.json(
        {
          success: false,
          message: "Nenhum dado de perfil encontrado para este usuário",
          data: null,
        },
        { status: 404 }
      );
    }

    // Formatar a resposta
    const formattedResponse: SeguidoresResponse = {
      success: true,
      message: "Dados de seguidores obtidos com sucesso",
      data: {
        username: profileData.username,
        followersCount: profileData.followersCount,
        followsCount: profileData.followsCount,
        verified: profileData.verified,
        private: profileData.private,
        profilePicUrl: profileData.profilePicUrlHD || profileData.profilePicUrl,
        fullName: profileData.fullName,
        biography: profileData.biography,
        relatedProfiles: profileData.relatedProfiles?.map(profile => ({
          username: profile.username,
          fullName: profile.full_name,
          isPrivate: profile.is_private,
          isVerified: profile.is_verified,
          profilePicUrl: profile.profile_pic_url,
        })) || [],
      },
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Erro ao obter dados de seguidores:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao obter dados de seguidores: ${(error as Error).message}`,
        data: null,
      },
      { status: 500 }
    );
  }
}
