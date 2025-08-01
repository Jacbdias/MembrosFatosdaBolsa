import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📊 GET - Obter estatísticas dos relatórios
export async function GET(request: NextRequest) {
  try {
    // Buscar todos os relatórios
    const relatorios = await prisma.relatorio.findMany({
      orderBy: [
        { ticker: 'asc' },
        { dataReferencia: 'desc' }
      ]
    });

    // Calcular estatísticas
    const totalRelatorios = relatorios.length;
    
    // Contar tickers únicos
    const tickersUnicos = new Set(relatorios.map(r => r.ticker));
    const totalTickers = tickersUnicos.size;
    
    // Contar relatórios com PDF
    const relatoriosComPdf = relatorios.filter(r => 
      r.arquivoPdf || r.nomeArquivoPdf
    ).length;
    
    // Calcular tamanho total em MB
    const tamanhoTotalBytes = relatorios.reduce((sum, r) => 
      sum + (r.tamanhoArquivo || 0), 0
    );
    const tamanhoTotalMB = tamanhoTotalBytes / (1024 * 1024);
    
    // Data do último upload
    const ultimoUpload = relatorios.length > 0 
      ? Math.max(...relatorios.map(r => r.dataUpload.getTime()))
      : null;
    
    const dataUltimoUpload = ultimoUpload 
      ? new Date(ultimoUpload).toISOString()
      : undefined;

    // Converter relatórios para o formato da interface
    const relatoriosFormatados = relatorios.map(relatorio => ({
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
    }));

    // Estatísticas por ticker
    const estatisticasPorTicker = Array.from(tickersUnicos).map(ticker => {
      const relatoriosDoTicker = relatorios.filter(r => r.ticker === ticker);
      return {
        ticker,
        total: relatoriosDoTicker.length,
        comPdf: relatoriosDoTicker.filter(r => r.arquivoPdf || r.nomeArquivoPdf).length,
        tamanhoMB: relatoriosDoTicker.reduce((sum, r) => 
          sum + (r.tamanhoArquivo || 0), 0
        ) / (1024 * 1024)
      };
    }).sort((a, b) => b.total - a.total);

    // Estatísticas por tipo
    const estatisticasPorTipo = {
      trimestral: relatorios.filter(r => r.tipo === 'trimestral').length,
      anual: relatorios.filter(r => r.tipo === 'anual').length,
      apresentacao: relatorios.filter(r => r.tipo === 'apresentacao').length,
      outros: relatorios.filter(r => r.tipo === 'outros').length
    };

    return NextResponse.json({
      success: true,
      totalRelatorios,
      totalTickers,
      relatoriosComPdf,
      tamanhoTotalMB: Number(tamanhoTotalMB.toFixed(2)),
      dataUltimoUpload,
      relatorios: relatoriosFormatados,
      estatisticasPorTicker,
      estatisticasPorTipo,
      resumo: {
        base64: relatorios.filter(r => r.tipoPdf === 'base64').length,
        referencia: relatorios.filter(r => r.tipoPdf === 'referencia').length,
        semPdf: relatorios.filter(r => !r.arquivoPdf && !r.nomeArquivoPdf).length
      }
    });

  } catch (error) {
    console.error('Erro ao calcular estatísticas dos relatórios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao calcular estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        // Retornar dados vazios em caso de erro
        totalRelatorios: 0,
        totalTickers: 0,
        relatoriosComPdf: 0,
        tamanhoTotalMB: 0,
        relatorios: []
      },
      { status: 500 }
    );
  }
}