import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/monitoring/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const search = url.searchParams.get('search') || '';
    const provider = url.searchParams.get('provider') || '';
    const status = url.searchParams.get('status') || '';
    
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
      created_at: {
        gte: startDate
      },
      ...(provider ? { provider_id: provider } : {}),
      ...(status ? { status: status } : {}),
      ...(search ? {
        OR: [
          { id: { contains: search } },
          { transaction_id: { contains: search } },
          { service_id: { contains: search } },
          { target_url: { contains: search } }
        ]
      } : {})
    };
    
    // Contagem total
    const total = await prisma.ordersLog.count({
      where: whereCondition
    });
    
    // Buscar pedidos
    const orders = await prisma.ordersLog.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Obter a lista de provedores distintos para filtros
    const providers = await prisma.ordersLog.findMany({
      select: {
        provider_id: true
      },
      distinct: ['provider_id'],
      where: {
        provider_id: {
          not: null
        }
      }
    });
    
    // Obter a lista de status distintos para filtros
    const statuses = await prisma.ordersLog.findMany({
      select: {
        status: true
      },
      distinct: ['status'],
      where: {
        status: {
          not: null
        }
      }
    });
    
    return NextResponse.json({
      orders,
      providers: providers.map(p => p.provider_id),
      statuses: statuses.map(s => s.status),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
} 