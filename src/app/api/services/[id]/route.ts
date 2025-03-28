import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Error:', error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
