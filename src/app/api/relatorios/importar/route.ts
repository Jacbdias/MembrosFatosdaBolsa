import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 📤 POST - Importar relatórios de backup JSON
export async function POST(request: NextRequest) {
  try {
    const dadosImportacao = await request.json();

    // Validar estrutura básica
    if (!dadosImportacao) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados de importação não fornecidos' 
        },
        { status: 400 }
      );
    }

    let relatoriosParaImportar: any[] = [];

    // Detectar formato dos dados (compatibilidade com diferentes versões)
    if (dadosImportacao.relatorios && Array.isArray(dadosImportacao.relatorios)) {
      // Formato novo (API/Prisma)
      relatoriosParaImportar = dadosImportacao.relatorios;
    } else if (Array.isArray(dadosImportacao)) {
      // Formato de array direto
      relatoriosParaImportar = dadosImportacao;
    } else if (typeof dadosImportacao === 'object') {
      // Formato antigo (localStorage agrupado por ticker)
      relatoriosParaImportar = [];
      Object.entries(dadosImportacao).forEach(([ticker, relatorios]: [string, any]) => {
        if (Array.isArray(relatorios)) {
          relatorios.forEach(relatorio => {
            relatoriosParaImportar.push({
              ...relatorio,
              ticker: relatorio.ticker || ticker
            });
          });
        }
      });
    }

    if (relatoriosParaImportar.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhum relatório válido encontrado nos dados de importação' 
        },
        { status: 400 }
      );
    }

    // Limpar dados existentes (importação substitui tudo)
    console.log('🗑️ Limpando relatórios existentes antes da importação...');
    await prisma.relatorio.deleteMany({});

    // Preparar dados para inserção
    const relatoriosValidados = relatoriosParaImportar
      .filter(relatorio => {
        // Validar campos obrigatórios
        return relatorio.ticker && relatorio.nome && relatorio.tipo;
      })
      .map(relatorio => ({
        id: relatorio.id || `${relatorio.ticker}_${Date.now()}_${Math.random()}`,
        ticker: relatorio.ticker.toUpperCase(),
        nome: relatorio.nome,
        tipo: relatorio.tipo,
        dataReferencia: relatorio.dataReferencia || '',
        dataUpload: relatorio.dataUpload ? new Date(relatorio.dataUpload) : new Date(),
        linkCanva: relatorio.linkCanva || null,
        linkExterno: relatorio.linkExterno || null,
        tipoVisualizacao: relatorio.tipoVisualizacao || 'iframe',
        arquivoPdf: relatorio.arquivoPdf || null,
        nomeArquivoPdf: relatorio.nomeArquivoPdf || null,
        tamanhoArquivo: relatorio.tamanhoArquivo || null,
        tipoPdf: relatorio.tipoPdf || null,
        hashArquivo: relatorio.hashArquivo || null,
        solicitarReupload: relatorio.solicitarReupload || false
      }));

    if (relatoriosValidados.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhum relatório válido após validação' 
        },
        { status: 400 }
      );
    }

    // Inserir em lotes para melhor performance
    const LOTE_SIZE = 100;
    let totalInseridos = 0;
    
    for (let i = 0; i < relatoriosValidados.length; i += LOTE_SIZE) {
      const lote = relatoriosValidados.slice(i, i + LOTE_SIZE);
      
      try {
        await prisma.relatorio.createMany({
          data: lote,
          skipDuplicates: true // Pular duplicados se houver
        });
        totalInseridos += lote.length;
      } catch (loteError) {
        console.warn(`Erro em lote ${i}-${i + lote.length}:`, loteError);
        // Tentar inserir individualmente em caso de erro no lote
        for (const relatorio of lote) {
          try {
            await prisma.relatorio.create({ data: relatorio });
            totalInseridos++;
          } catch (individualError) {
            console.warn(`Erro ao inserir relatório individual:`, relatorio.ticker, relatorio.nome);
          }
        }
      }
    }

    console.log(`📤 Importação de relatórios concluída:`, {
      totalEnviados: relatoriosParaImportar.length,
      totalValidados: relatoriosValidados.length,
      totalInseridos,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Importação concluída com sucesso`,
      resultados: {
        totalEnviados: relatoriosParaImportar.length,
        totalValidados: relatoriosValidados.length,
        totalInseridos,
        tickersImportados: new Set(relatoriosValidados.map(r => r.ticker)).size
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao importar relatórios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao importar relatórios',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}