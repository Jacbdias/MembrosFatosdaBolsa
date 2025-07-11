// src/app/api/carteiras/minhas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Filtros
    const where: any = {
      userId: session.user.id
    };

    if (status && status !== 'todos') {
      where.status = status.toUpperCase();
    }

    // Buscar carteiras com ativos
    const [carteiras, total] = await Promise.all([
      prisma.carteiraAnalise.findMany({
        where,
        include: {
          ativos: {
            orderBy: {
              valorTotal: 'desc'
            }
          },
          analista: {
            select: {
              id: true,
              name: true
            }
          },
          questionario: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.carteiraAnalise.count({ where })
    ]);

    // Calcular estatísticas por carteira
    const carteirasComEstatisticas = carteiras.map(carteira => {
      const estatisticasAtivos = calcularEstatisticasAtivos(carteira.ativos);
      
      return {
        id: carteira.id,
        nomeArquivo: carteira.nomeArquivo,
        status: carteira.status.toLowerCase(),
        dataEnvio: carteira.dataEnvio,
        dataAnalise: carteira.dataAnalise,
        valorTotal: carteira.valorTotal,
        quantidadeAtivos: carteira.quantidadeAtivos,
        feedback: carteira.feedback,
        recomendacoes: carteira.recomendacoes,
        pontuacao: carteira.pontuacao,
        riscoBeneficio: carteira.riscoBeneficio,
        diversificacao: carteira.diversificacao,
        analista: carteira.analista,
        questionario: carteira.questionario,
        ativos: carteira.ativos,
        estatisticas: estatisticasAtivos
      };
    });

    return NextResponse.json({
      carteiras: carteirasComEstatisticas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar carteiras:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

function calcularEstatisticasAtivos(ativos: any[]) {
  if (!ativos.length) return null;

  const totalCarteira = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
  
  // Distribuição por tipo
  const distribuicaoTipo = ativos.reduce((acc, ativo) => {
    acc[ativo.tipo] = (acc[ativo.tipo] || 0) + ativo.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  // Converter para percentual
  const distribuicaoPercentual = Object.entries(distribuicaoTipo).map(([tipo, valor]) => ({
    tipo,
    valor,
    percentual: (valor / totalCarteira) * 100
  }));

  // Top 5 ativos
  const topAtivos = ativos
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 5)
    .map(ativo => ({
      codigo: ativo.codigo,
      valorTotal: ativo.valorTotal,
      percentual: (ativo.valorTotal / totalCarteira) * 100,
      tipo: ativo.tipo
    }));

  // Concentração (soma dos top 5)
  const concentracaoTop5 = topAtivos.reduce((sum, ativo) => sum + ativo.percentual, 0);

  return {
    distribuicaoTipo: distribuicaoPercentual,
    topAtivos,
    concentracaoTop5,
    numeroSetores: new Set(ativos.filter(a => a.setor).map(a => a.setor)).size
  };
}