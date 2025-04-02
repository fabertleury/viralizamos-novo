import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/monitoring/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const search = url.searchParams.get('search') || '';
    const minCount = parseInt(url.searchParams.get('minCount') || '2');
    
    // Determinar o período de consulta
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // 24h
        startDate.setDate(startDate.getDate() - 1);
    }
    
    // Condições de busca
    const whereCondition = {
      last_seen: {
        gte: startDate
      },
      count: {
        gte: minCount
      },
      ...(search ? {
        OR: [
          { hash_key: { contains: search } },
          { transaction_id: { contains: search } },
          { order_id: { contains: search } },
          { target_url: { contains: search } },
          { service_id: { contains: search } },
          { provider_id: { contains: search } }
        ]
      } : {})
    };
    
    // Contagem total
    const total = await prisma.duplicateDetection.count({
      where: whereCondition
    });
    
    // Buscar duplicações
    const duplicates = await prisma.duplicateDetection.findMany({
      where: whereCondition,
      orderBy: [
        { count: 'desc' },
        { last_seen: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });
    
    return NextResponse.json({
      duplicates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar duplicações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar duplicações' },
      { status: 500 }
    );
  }
} 