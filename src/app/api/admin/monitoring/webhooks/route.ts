import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/monitoring/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const webhookType = url.searchParams.get('type') || '';
    const source = url.searchParams.get('source') || '';
    const processed = url.searchParams.get('processed');
    
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
      received_at: {
        gte: startDate
      },
      ...(webhookType ? { webhook_type: webhookType } : {}),
      ...(source ? { source: source } : {}),
      ...(processed !== null ? { processed: processed === 'true' } : {})
    };
    
    // Contagem total
    const total = await prisma.webhookLogs.count({
      where: whereCondition
    });
    
    // Buscar webhooks
    const webhooks = await prisma.webhookLogs.findMany({
      where: whereCondition,
      orderBy: {
        received_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Obter tipos de webhook disponíveis
    const webhookTypes = await prisma.webhookLogs.findMany({
      select: {
        webhook_type: true
      },
      distinct: ['webhook_type']
    });
    
    // Obter fontes de webhook disponíveis
    const webhookSources = await prisma.webhookLogs.findMany({
      select: {
        source: true
      },
      distinct: ['source']
    });
    
    // Calcular estatísticas de processamento
    const processingStats = await prisma.$queryRaw`
      SELECT 
        webhook_type,
        COUNT(*) as total,
        SUM(CASE WHEN processed = true THEN 1 ELSE 0 END) as processed_count,
        ROUND(AVG(processing_time)) as avg_processing_time,
        MIN(processing_time) as min_processing_time,
        MAX(processing_time) as max_processing_time
      FROM webhook_logs
      WHERE received_at >= ${startDate}
      GROUP BY webhook_type
      ORDER BY total DESC
    `;
    
    return NextResponse.json({
      webhooks,
      webhookTypes: webhookTypes.map(t => t.webhook_type),
      webhookSources: webhookSources.map(s => s.source),
      processingStats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar webhooks' },
      { status: 500 }
    );
  }
} 