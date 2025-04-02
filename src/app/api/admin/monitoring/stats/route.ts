import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/monitoring/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    
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
    
    // Buscar totais de transações
    const totalTransactions = await prisma.transactionsLog.count({
      where: {
        created_at: {
          gte: startDate
        }
      }
    });
    
    // Buscar totais de pedidos
    const totalOrders = await prisma.ordersLog.count({
      where: {
        created_at: {
          gte: startDate
        }
      }
    });
    
    // Buscar total de duplicações
    const totalDuplicates = await prisma.duplicateDetection.count({
      where: {
        count: {
          gt: 1
        },
        last_seen: {
          gte: startDate
        }
      }
    });
    
    // Calcular taxa de sucesso de integração
    const successfulIntegrations = await prisma.integrationsLog.count({
      where: {
        status: 'success',
        created_at: {
          gte: startDate
        }
      }
    });
    
    const totalIntegrations = await prisma.integrationsLog.count({
      where: {
        created_at: {
          gte: startDate
        }
      }
    });
    
    const successRate = totalIntegrations > 0 
      ? Math.round((successfulIntegrations / totalIntegrations) * 100) 
      : 0;
    
    // Buscar transações por status
    const transactionsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM transactions_log 
      WHERE created_at >= ${startDate}
      GROUP BY status
      ORDER BY count DESC
    `;
    
    // Buscar pedidos por provedor
    const ordersByProvider = await prisma.$queryRaw`
      SELECT provider_id, COUNT(*) as count 
      FROM orders_log 
      WHERE created_at >= ${startDate}
      GROUP BY provider_id
      ORDER BY count DESC
      LIMIT 10
    `;
    
    // Buscar tendência de duplicações
    // Agrupar por dia para tendências
    const duplicatesTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', last_seen) as date,
        COUNT(*) as count
      FROM duplicate_detection
      WHERE count > 1 AND last_seen >= ${startDate}
      GROUP BY DATE_TRUNC('day', last_seen)
      ORDER BY date
    `;
    
    // Buscar performance de webhooks
    const webhookPerformance = await prisma.$queryRaw`
      SELECT 
        webhook_type as name,
        AVG(processing_time) as time,
        COUNT(*) as count
      FROM webhook_logs
      WHERE received_at >= ${startDate}
      GROUP BY webhook_type
    `;
    
    // Calcular mudanças percentuais no período anterior
    const previousStartDate = new Date(startDate);
    switch (timeRange) {
      case '7d':
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case '30d':
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        break;
      default: // 24h
        previousStartDate.setDate(previousStartDate.getDate() - 1);
    }
    
    const previousTransactionsCount = await prisma.transactionsLog.count({
      where: {
        created_at: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    const previousOrdersCount = await prisma.ordersLog.count({
      where: {
        created_at: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    const previousDuplicatesCount = await prisma.duplicateDetection.count({
      where: {
        count: {
          gt: 1
        },
        last_seen: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    const previousSuccessfulIntegrations = await prisma.integrationsLog.count({
      where: {
        status: 'success',
        created_at: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    const previousTotalIntegrations = await prisma.integrationsLog.count({
      where: {
        created_at: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    });
    
    const previousSuccessRate = previousTotalIntegrations > 0 
      ? Math.round((previousSuccessfulIntegrations / previousTotalIntegrations) * 100) 
      : 0;
    
    // Calcular crescimento percentual
    const transactionsGrowth = previousTransactionsCount > 0 
      ? Math.round(((totalTransactions - previousTransactionsCount) / previousTransactionsCount) * 100) 
      : 100;
    
    const ordersGrowth = previousOrdersCount > 0 
      ? Math.round(((totalOrders - previousOrdersCount) / previousOrdersCount) * 100) 
      : 100;
    
    const duplicatesChange = previousDuplicatesCount > 0 
      ? Math.round(((totalDuplicates - previousDuplicatesCount) / previousDuplicatesCount) * 100) 
      : 0;
    
    const successRateChange = previousSuccessRate > 0 
      ? successRate - previousSuccessRate 
      : successRate;
    
    // Retornar estatísticas completas
    return NextResponse.json({
      totalTransactions,
      totalOrders,
      totalDuplicates,
      successRate,
      transactionsByStatus,
      ordersByProvider,
      duplicatesTrend,
      webhookPerformance,
      transactionsGrowth,
      ordersGrowth,
      duplicatesChange,
      successRateChange
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 