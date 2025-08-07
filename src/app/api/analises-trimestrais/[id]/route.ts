import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/analises-trimestrais/[id] - Atualizar análise
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('✏️ Atualizando análise:', id);
    
    // Verificar se a análise existe
    const analiseExistente = await prisma.analiseTrimestreData.findUnique({
      where: { id }
    });
    
    if (!analiseExistente) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }
    
    // Garantir que dataPublicacao seja uma data válida
    const dataPublicacao = body.dataPublicacao ? new Date(body.dataPublicacao) : analiseExistente.dataPublicacao;
    
    // Preparar dados para atualização
    const updateData = {
      ...(body.ticker && { ticker: body.ticker.toUpperCase() }),
      ...(body.empresa && { empresa: body.empresa }),
      ...(body.trimestre !== undefined && { trimestre: body.trimestre }),
      dataPublicacao,
      ...(body.autor !== undefined && { autor: body.autor }),
      ...(body.categoria && { categoria: body.categoria }),
      ...(body.titulo && { titulo: body.titulo }),
      ...(body.resumoExecutivo !== undefined && { resumoExecutivo: body.resumoExecutivo }),
      ...(body.analiseCompleta !== undefined && { analiseCompleta: body.analiseCompleta }),
      ...(body.metricas && { metricas: body.metricas }),
      ...(body.pontosFavoraveis !== undefined && { pontosFavoraveis: body.pontosFavoraveis }),
      ...(body.pontosAtencao !== undefined && { pontosAtencao: body.pontosAtencao }),
      ...(body.recomendacao && { recomendacao: body.recomendacao }),
      ...(body.precoAlvo !== undefined && { precoAlvo: body.precoAlvo }),
      ...(body.risco && { risco: body.risco }),
      ...(body.linkResultado !== undefined && { linkResultado: body.linkResultado }),
      ...(body.linkConferencia !== undefined && { linkConferencia: body.linkConferencia }),
      ...(body.status && { status: body.status }),
      ...(body.userId !== undefined && { userId: body.userId })
    };
    
    const analiseAtualizada = await prisma.analiseTrimestreData.update({
      where: { id },
      data: updateData,
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
    
    console.log('✅ Análise atualizada com sucesso:', id);
    
    return NextResponse.json(analiseAtualizada, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar análise:', error);
    
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

// DELETE /api/analises-trimestrais/[id] - Deletar análise
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('🗑️ Deletando análise:', id);
    
    // Verificar se a análise existe
    const analiseExistente = await prisma.analiseTrimestreData.findUnique({
      where: { id }
    });
    
    if (!analiseExistente) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }
    
    // Deletar a análise
    await prisma.analiseTrimestreData.delete({
      where: { id }
    });
    
    console.log('✅ Análise deletada com sucesso:', id);
    
    return NextResponse.json(
      { message: 'Análise deletada com sucesso' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('❌ Erro ao deletar análise:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// GET /api/analises-trimestrais/[id] - Buscar análise específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('🔍 Buscando análise específica:', id);
    
    const analise = await prisma.analiseTrimestreData.findUnique({
      where: { id },
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
    
    if (!analise) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }
    
    console.log('✅ Análise encontrada:', analise.ticker);
    
    // Incrementar visualizações
    await prisma.analiseTrimestreData.update({
      where: { id },
      data: { visualizacoes: { increment: 1 } }
    });
    
    return NextResponse.json(analise, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro ao buscar análise:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}