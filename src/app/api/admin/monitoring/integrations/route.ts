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
          { order_id: { contains: search } },
          { transaction_id: { contains: search } },
          { provider_id: { contains: search } },
          { error_message: { contains: search } }
        ]
      } : {})
    };
    
    // Contagem total
    const total = await prisma.integrationsLog.count({
      where: whereCondition
    });
    
    // Buscar integrações
    const integrations = await prisma.integrationsLog.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Estatísticas sobre erros
    const errorStats = await prisma.$queryRaw`
      SELECT 
        provider_id, 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
        ROUND((SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as error_rate
      FROM integrations_log
      WHERE created_at >= ${startDate}
      GROUP BY provider_id
      ORDER BY error_rate DESC
    `;
    
    // Erros mais comuns
    const commonErrors = await prisma.$queryRaw`
      SELECT 
        error_message, 
        COUNT(*) as count
      FROM integrations_log
      WHERE created_at >= ${startDate}
      AND status = 'error'
      AND error_message IS NOT NULL
      GROUP BY error_message
      ORDER BY count DESC
      LIMIT 10
    `;
    
    return NextResponse.json({
      integrations,
      errorStats,
      commonErrors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar integrações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar integrações' },
      { status: 500 }
    );
  }
} 