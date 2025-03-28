import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instagram-scraper-api2.p.rapidapi.com';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY || '',
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();

    // Transformar os dados para o formato que precisamos
    const profileData = {
      username: data.data.username,
      full_name: data.data.full_name,
      followers_count: data.data.follower_count,
      following_count: data.data.following_count,
      media_count: data.data.media_count,
      is_private: data.data.is_private,
      is_verified: data.data.is_verified,
      profile_pic_url: data.data.profile_pic_url_hd,
      biography: data.data.biography,
      about: data.data.about,
      account_type: data.data.account_type,
    };

    return NextResponse.json(profileData);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}
