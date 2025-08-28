// src/app/api/carteiras/[id]/ativos-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email?.includes('@admin.com')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id: carteiraId } = params;

    // Buscar carteira com seus ativos
    const carteira = await prisma.carteiraAnalise.findUnique({
      where: { id: carteiraId },
      include: {
        ativos: {
          orderBy: { valorTotal: 'desc' } // Ordenar por maior posição
        }
      }
    });

    if (!carteira) {
      return NextResponse.json({ 
        error: 'Carteira não encontrada' 
      }, { status: 404 });
    }

    // Buscar informações detalhadas de cada ativo
    const ativosComInfo = await Promise.all(
      carteira.ativos.map(async (ativo) => {
        // Buscar informação do ativo no banco de dados
        const ativoInfo = await prisma.ativoInformacao.findUnique({
          where: { codigo: ativo.codigo }
        });

        return {
          // Dados da carteira
          codigo: ativo.codigo,
          quantidade: ativo.quantidade,
          precoMedio: ativo.precoMedio,
          valorTotal: ativo.valorTotal,
          tipo: ativo.tipo,
          setorOriginal: ativo.setor,
          
          // Informações detalhadas (se existir no banco)
          informacao: ativoInfo ? {
            nome: ativoInfo.nome,
            setor: ativoInfo.setor,
            subsetor: ativoInfo.subsetor,
            qualidade: ativoInfo.qualidade,
            risco: ativoInfo.risco,
            recomendacao: ativoInfo.recomendacao,
            fundamentosResumo: ativoInfo.fundamentosResumo,
            pontosFortes: ativoInfo.pontosFortes ? JSON.parse(ativoInfo.pontosFortes) : [],
            pontosFracos: ativoInfo.pontosFracos ? JSON.parse(ativoInfo.pontosFracos) : [],
            observacoes: ativoInfo.observacoes,
            segmento: ativoInfo.segmento,
            governanca: ativoInfo.governanca,
            dividend_yield: ativoInfo.dividend_yield,
            ultimaRevisao: ativoInfo.ultimaRevisao
          } : null,
          
          // Status se tem informação ou não
          temInformacao: !!ativoInfo,
          
          // Cálculo do peso na carteira
          pesoCarteira: ((ativo.valorTotal / carteira.valorTotal) * 100).toFixed(2)
        };
      })
    );

    // Estatísticas gerais
    const stats = {
      totalAtivos: ativosComInfo.length,
      ativosComInfo: ativosComInfo.filter(a => a.temInformacao).length,
      ativosSemInfo: ativosComInfo.filter(a => !a.temInformacao).length,
      percentualCobertura: ((ativosComInfo.filter(a => a.temInformacao).length / ativosComInfo.length) * 100).toFixed(1)
    };

    return NextResponse.json({
      success: true,
      carteira: {
        id: carteira.id,
        valorTotal: carteira.valorTotal,
        quantidadeAtivos: carteira.quantidadeAtivos,
        nomeArquivo: carteira.nomeArquivo
      },
      ativos: ativosComInfo,
      estatisticas: stats
    });

  } catch (error) {
    console.error('Erro ao buscar informações dos ativos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}