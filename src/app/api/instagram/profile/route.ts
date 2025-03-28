import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    const rawData = await response.json();
    
    if (!rawData?.data) {
      throw new Error('Invalid profile data');
    }

    const data = rawData.data;

    // Formatar apenas os dados necessários
    const profileData = {
      data: {
        username: data.username,
        full_name: data.full_name,
        profile_pic_url: data.profile_pic_url_hd || data.profile_pic_url,
        follower_count: data.follower_count,
        following_count: data.following_count,
        media_count: data.media_count,
        is_private: data.is_private,
        is_verified: data.is_verified,
        biography: data.biography,
        category: data.category || null,
        external_url: data.external_url || null,
        about: {
          country: data.about?.country || null,
          date_joined: data.about?.date_joined || null
        },
        contact_phone_number: data.contact_phone_number || null,
        public_email: data.public_email || null
      }
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
