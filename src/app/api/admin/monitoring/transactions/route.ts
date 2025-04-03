import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/monitoring/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const search = url.searchParams.get('search') || '';
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
    
    // Condições de busca padrão - buscar transações independentemente do status
    const whereCondition: any = {
      created_at: {
        gte: startDate
      }
    };
    
    // Adicionar condição de busca por texto
    if (search) {
      whereCondition.OR = [
        { id: { contains: search } },
        { payment_id: { contains: search } },
        { status: { contains: search } }
      ];
    }
    
    // Adicionar filtro por status se fornecido
    if (status && status !== 'all') {
      whereCondition.status = status;
    }
    
    // Log para debug
    console.log('Condições de busca de transações:', JSON.stringify(whereCondition));
    
    // Contagem total
    const total = await prisma.transactionsLog.count({
      where: whereCondition
    });
    
    // Buscar transações
    const transactions = await prisma.transactionsLog.findMany({
      where: whereCondition,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Contar transações por status para debug
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    const approvedCount = transactions.filter(t => t.status === 'approved').length;
    const cancelledCount = transactions.filter(t => t.status === 'cancelled' || t.status === 'canceled').length;
    const errorCount = transactions.filter(t => t.status === 'error').length;
    
    // Logs para depuração
    console.log(`[Admin API] Buscando transações: ${transactions.length} encontradas`);
    console.log(`[Admin API] Status pendentes: ${pendingCount}`);
    console.log(`[Admin API] Status aprovados: ${approvedCount}`);
    console.log(`[Admin API] Status cancelados: ${cancelledCount}`);
    console.log(`[Admin API] Status com erro: ${errorCount}`);
    
    return NextResponse.json({
      transactions,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        cancelled: cancelledCount,
        error: errorCount,
        total: transactions.length
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    );
  }
} 