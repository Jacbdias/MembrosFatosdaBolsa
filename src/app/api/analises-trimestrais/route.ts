import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analises-trimestrais - Listar análises
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const ticker = searchParams.get('ticker');
    const userId = searchParams.get('userId');
    const trimestre = searchParams.get('trimestre');
    
    console.log('🔍 Buscando análises com filtros:', { status, ticker, userId, trimestre });
    
    const analises = await prisma.analiseTrimestreData.findMany({
      where: {
        ...(status && { status: status }),
        ...(ticker && { ticker: { contains: ticker, mode: 'insensitive' } }),
        ...(userId && { userId: userId }),
        ...(trimestre && { trimestre: { contains: trimestre, mode: 'insensitive' } })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { dataPublicacao: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    console.log(`✅ Encontradas ${analises.length} análises`);
    
    return NextResponse.json(analises, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro ao buscar análises:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// POST /api/analises-trimestrais - Criar nova análise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Criando nova análise:', { 
      ticker: body.ticker, 
      titulo: body.titulo,
      autor: body.autor 
    });
    
    // Validações básicas
    if (!body.ticker || !body.empresa || !body.titulo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: ticker, empresa, titulo' },
        { status: 400 }
      );
    }
    
    // Garantir que dataPublicacao seja uma data válida
    const dataPublicacao = body.dataPublicacao ? new Date(body.dataPublicacao) : new Date();
    
    // Preparar dados para o Prisma
    const analiseData = {
      ticker: body.ticker.toUpperCase(),
      empresa: body.empresa,
      trimestre: body.trimestre || null,
      dataPublicacao: dataPublicacao,
      autor: body.autor || null,
      categoria: body.categoria || 'resultado_trimestral',
      titulo: body.titulo,
      resumoExecutivo: body.resumoExecutivo || null,
      analiseCompleta: body.analiseCompleta || null,
      metricas: body.metricas || {},
      pontosFavoraveis: body.pontosFavoraveis || null,
      pontosAtencao: body.pontosAtencao || null,
      recomendacao: body.recomendacao || 'MANTER',
  nota: body.nota || null,            // ← ADICIONAR ESTA LINHA
      linkResultado: body.linkResultado || null,
      linkConferencia: body.linkConferencia || null,
      status: body.status || 'draft',
      userId: body.userId || null
    };
    
    const novaAnalise = await prisma.analiseTrimestreData.create({
      data: analiseData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
    
    console.log('✅ Análise criada com sucesso:', novaAnalise.id);
    
    return NextResponse.json(novaAnalise, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erro ao criar análise:', error);
    
    // Tratamento de erros específicos do Prisma
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Já existe uma análise com estes dados (ticker + trimestre + título)' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}