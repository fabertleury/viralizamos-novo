import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface InstagramCommentUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
}

interface InstagramComment {
  pk: string;
  text: string;
  created_at: number;
  user: InstagramCommentUser;
  like_count: number;
  has_liked_comment: boolean;
  comment_like_count: number;
}

interface RocketAPICommentsResponse {
  status: string;
  response: {
    status_code: number;
    body: {
      comments: InstagramComment[];
      next_min_id?: string;
    };
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  const { shortcode } = params;
  const count = request.nextUrl.searchParams.get('count') || '24';
  const min_id = request.nextUrl.searchParams.get('min_id') || null;

  try {
    // Usando diretamente a RocketAPI já que a Scraper API foi descontinuada
    const commentsData = await fetchCommentsWithRocketAPI(shortcode, parseInt(count), min_id);
    return NextResponse.json(commentsData);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comentários do Instagram' },
      { status: 500 }
    );
  }
}

async function fetchCommentsWithRocketAPI(shortcode: string, count: number, min_id: string | null) {
  try {
    const options = {
      method: 'POST',
      url: 'https://rocketapi-for-developers.p.rapidapi.com/instagram/media/get_comments',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'cbfd294384msh525c1f1508b114ap1863a2jsn6c295cc5d3c8',
        'x-rapidapi-host': 'rocketapi-for-developers.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        shortcode,
        count,
        min_id
      }
    };

    const response = await axios.request<RocketAPICommentsResponse>(options);
    
    if (response.data.status === 'done' && response.data.response.status_code === 200) {
      return {
        comments: response.data.response.body.comments,
        next_min_id: response.data.response.body.next_min_id,
        status: 'success'
      };
    } else {
      throw new Error('Falha ao obter comentários com RocketAPI');
    }
  } catch (error) {
    console.error('Erro na RocketAPI para comentários:', error);
    throw error;
  }
}
