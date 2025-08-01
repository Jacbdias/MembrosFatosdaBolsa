import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📄 GET - Buscar relatório por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID do relatório é obrigatório' 
        },
        { status: 400 }
      );
    }

    const relatorio = await prisma.relatorio.findUnique({
      where: { id }
    });

    if (!relatorio) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Relatório não encontrado' 
        },
        { status: 404 }
      );
    }

    // Converter para formato da interface
    const relatorioFormatado = {
      id: relatorio.id,
      ticker: relatorio.ticker,
      nome: relatorio.nome,
      tipo: relatorio.tipo as 'trimestral' | 'anual' | 'apresentacao' | 'outros',
      dataReferencia: relatorio.dataReferencia,
      dataUpload: relatorio.dataUpload.toISOString(),
      linkCanva: relatorio.linkCanva || undefined,
      linkExterno: relatorio.linkExterno || undefined,
      tipoVisualizacao: relatorio.tipoVisualizacao as 'iframe' | 'canva' | 'link' | 'pdf',
      arquivoPdf: relatorio.arquivoPdf || undefined,
      nomeArquivoPdf: relatorio.nomeArquivoPdf || undefined,
      tamanhoArquivo: relatorio.tamanhoArquivo || undefined,
      tipoPdf: (relatorio.tipoPdf as 'base64' | 'referencia') || undefined,
      hashArquivo: relatorio.hashArquivo || undefined,
      solicitarReupload: relatorio.solicitarReupload || undefined
    };

    return NextResponse.json({
      success: true,
      relatorio: relatorioFormatado
    });

  } catch (error) {
    console.error('Erro ao buscar relatório por ID:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao buscar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// ✏️ PUT - Atualizar relatório por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const dadosAtualizacao = await request.json();

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID do relatório é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Verificar se o relatório existe
    const relatorioExistente = await prisma.relatorio.findUnique({
      where: { id }
    });

    if (!relatorioExistente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Relatório não encontrado' 
        },
        { status: 404 }
      );
    }

    // Atualizar relatório
    const relatorioAtualizado = await prisma.relatorio.update({
      where: { id },
      data: {
        ticker: dadosAtualizacao.ticker?.toUpperCase() || relatorioExistente.ticker,
        nome: dadosAtualizacao.nome || relatorioExistente.nome,
        tipo: dadosAtualizacao.tipo || relatorioExistente.tipo,
        dataReferencia: dadosAtualizacao.dataReferencia !== undefined 
          ? dadosAtualizacao.dataReferencia 
          : relatorioExistente.dataReferencia,
        linkCanva: dadosAtualizacao.linkCanva !== undefined 
          ? dadosAtualizacao.linkCanva 
          : relatorioExistente.linkCanva,
        linkExterno: dadosAtualizacao.linkExterno !== undefined 
          ? dadosAtualizacao.linkExterno 
          : relatorioExistente.linkExterno,
        tipoVisualizacao: dadosAtualizacao.tipoVisualizacao || relatorioExistente.tipoVisualizacao,
        arquivoPdf: dadosAtualizacao.arquivoPdf !== undefined 
          ? dadosAtualizacao.arquivoPdf 
          : relatorioExistente.arquivoPdf,
        nomeArquivoPdf: dadosAtualizacao.nomeArquivoPdf !== undefined 
          ? dadosAtualizacao.nomeArquivoPdf 
          : relatorioExistente.nomeArquivoPdf,
        tamanhoArquivo: dadosAtualizacao.tamanhoArquivo !== undefined 
          ? dadosAtualizacao.tamanhoArquivo 
          : relatorioExistente.tamanhoArquivo,
        tipoPdf: dadosAtualizacao.tipoPdf !== undefined 
          ? dadosAtualizacao.tipoPdf 
          : relatorioExistente.tipoPdf,
        hashArquivo: dadosAtualizacao.hashArquivo !== undefined 
          ? dadosAtualizacao.hashArquivo 
          : relatorioExistente.hashArquivo,
        solicitarReupload: dadosAtualizacao.solicitarReupload !== undefined 
          ? dadosAtualizacao.solicitarReupload 
          : relatorioExistente.solicitarReupload
      }
    });

    console.log(`✏️ Relatório atualizado:`, {
      id,
      ticker: relatorioAtualizado.ticker,
      nome: relatorioAtualizado.nome
    });

    // Converter para formato da interface
    const relatorioFormatado = {
      id: relatorioAtualizado.id,
      ticker: relatorioAtualizado.ticker,
      nome: relatorioAtualizado.nome,
      tipo: relatorioAtualizado.tipo as 'trimestral' | 'anual' | 'apresentacao' | 'outros',
      dataReferencia: relatorioAtualizado.dataReferencia,
      dataUpload: relatorioAtualizado.dataUpload.toISOString(),
      linkCanva: relatorioAtualizado.linkCanva || undefined,
      linkExterno: relatorioAtualizado.linkExterno || undefined,
      tipoVisualizacao: relatorioAtualizado.tipoVisualizacao as 'iframe' | 'canva' | 'link' | 'pdf',
      arquivoPdf: relatorioAtualizado.arquivoPdf || undefined,
      nomeArquivoPdf: relatorioAtualizado.nomeArquivoPdf || undefined,
      tamanhoArquivo: relatorioAtualizado.tamanhoArquivo || undefined,
      tipoPdf: (relatorioAtualizado.tipoPdf as 'base64' | 'referencia') || undefined,
      hashArquivo: relatorioAtualizado.hashArquivo || undefined,
      solicitarReupload: relatorioAtualizado.solicitarReupload || undefined
    };

    return NextResponse.json({
      success: true,
      message: 'Relatório atualizado com sucesso',
      relatorio: relatorioFormatado
    });

  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao atualizar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE - Excluir relatório por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID do relatório é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Buscar relatório antes da exclusão (para log)
    const relatorioExistente = await prisma.relatorio.findUnique({
      where: { id },
      select: {
        id: true,
        ticker: true,
        nome: true,
        tipo: true
      }
    });

    if (!relatorioExistente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Relatório não encontrado' 
        },
        { status: 404 }
      );
    }

    // Excluir relatório
    await prisma.relatorio.delete({
      where: { id }
    });

    console.log(`🗑️ Relatório excluído:`, {
      id,
      ticker: relatorioExistente.ticker,
      nome: relatorioExistente.nome,
      tipo: relatorioExistente.tipo
    });

    return NextResponse.json({
      success: true,
      message: 'Relatório excluído com sucesso',
      relatorioExcluido: relatorioExistente
    });

  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao excluir relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}