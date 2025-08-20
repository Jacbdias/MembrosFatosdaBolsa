export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // CORRIGIDO: Usar a mesma estratégia de autenticação que funciona
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    // Buscar usuário no banco pelo email
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Filtros
    const where: any = {
      userId: user.id // CORRIGIDO: Usar user.id em vez de session.user.id
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
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.carteiraAnalise.count({ where })
    ]);

    // Processar carteiras
    const carteirasProcessadas = carteiras.map(carteira => {
      const totalCarteira = carteira.ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);

      // Distribuição por tipo
      const distribuicaoTipo = carteira.ativos.reduce((acc, ativo) => {
        acc[ativo.tipo] = (acc[ativo.tipo] || 0) + ativo.valorTotal;
        return acc;
      }, {} as Record<string, number>);

      const distribuicaoPercentual = Object.entries(distribuicaoTipo).map(([tipo, valor]) => ({
        tipo,
        valor,
        percentual: totalCarteira > 0 ? (valor / totalCarteira) * 100 : 0
      }));

      // PARSE DOS DADOS ESTRUTURADOS
      let dadosEstruturados = null;
      if (carteira.dadosEstruturados) {
        try {
          dadosEstruturados = typeof carteira.dadosEstruturados === 'string' 
            ? JSON.parse(carteira.dadosEstruturados)
            : carteira.dadosEstruturados;
        } catch (error) {
          console.error('Erro ao parsear dadosEstruturados:', error);
        }
      }

      return {
        id: carteira.id,
        nomeArquivo: carteira.nomeArquivo,
        status: carteira.status.toLowerCase(),
        dataEnvio: carteira.dataEnvio,
        dataAnalise: carteira.dataAnalise,
        valorTotal: carteira.valorTotal,
        quantidadeAtivos: carteira.quantidadeAtivos,
        feedback: carteira.feedback,
        recomendacoes: carteira.recomendacoes ? JSON.parse(carteira.recomendacoes) : [],
        pontuacao: carteira.pontuacao,
        // INCLUIR DADOS ESTRUTURADOS
        dadosEstruturados: dadosEstruturados,
        // CAMPOS INDIVIDUAIS PARA COMPATIBILIDADE
        avaliacaoQualidade: dadosEstruturados?.avaliacoes?.qualidade,
        avaliacaoDiversificacao: dadosEstruturados?.avaliacoes?.diversificacao,
        avaliacaoAdaptacao: dadosEstruturados?.avaliacoes?.adaptacao,
        analista: carteira.analista ? {
          id: carteira.analista.id,
          name: `${carteira.analista.firstName} ${carteira.analista.lastName}`
        } : null,
        ativos: carteira.ativos,
        estatisticas: {
          distribuicaoTipo: distribuicaoPercentual
        }
      };
    });

    return NextResponse.json({
      carteiras: carteirasProcessadas,
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