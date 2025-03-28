import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface InstagramFollowerUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
  followed_by_viewer?: boolean;
  follows_viewer?: boolean;
}

interface RocketAPIFollowersResponse {
  status: string;
  response: {
    status_code: number;
    body: {
      users: InstagramFollowerUser[];
      next_max_id?: string;
    };
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  const count = request.nextUrl.searchParams.get('count') || '50';
  const max_id = request.nextUrl.searchParams.get('max_id') || null;

  try {
    const followersData = await fetchFollowersWithRocketAPI(username, parseInt(count), max_id);
    return NextResponse.json(followersData);
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar seguidores do Instagram' },
      { status: 500 }
    );
  }
}

async function fetchFollowersWithRocketAPI(username: string, count: number, max_id: string | null) {
  try {
    const options = {
      method: 'POST',
      url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/user/get_followers',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'x-rapidapi-host': 'rocketapi-for-developers.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        username,
        count,
        max_id
      }
    };

    const response = await axios.request<RocketAPIFollowersResponse>(options);
    
    if (response.data.status === 'done' && response.data.response.status_code === 200) {
      return {
        users: response.data.response.body.users,
        next_max_id: response.data.response.body.next_max_id,
        status: 'success'
      };
    } else {
      throw new Error('Falha ao obter seguidores com RocketAPI');
    }
  } catch (error) {
    console.error('Erro na RocketAPI para seguidores:', error);
    throw error;
  }
}
