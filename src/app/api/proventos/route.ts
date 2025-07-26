// 📁 /src/app/api/proventos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 📊 BUSCAR TODOS OS PROVENTOS
    const proventos = await prisma.provento.findMany({
      orderBy: { dataObj: 'desc' }
    });
    
    return NextResponse.json(proventos);
  } catch (error) {
    console.error('Erro ao buscar proventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proventos } = body;
    
    if (!Array.isArray(proventos)) {
      return NextResponse.json(
        { error: 'Proventos deve ser um array' },
        { status: 400 }
      );
    }
    
    console.log(`🚀 Iniciando upload de ${proventos.length} proventos`);
    
    // 🚀 INSERÇÃO EM LOTES MENORES SEM TRANSAÇÃO GIGANTE
    const BATCH_SIZE = 50; // Reduzido para 50 (era 100)
    let totalInseridos = 0;
    let totalErros = 0;
    
    for (let i = 0; i < proventos.length; i += BATCH_SIZE) {
      const batch = proventos.slice(i, i + BATCH_SIZE);
      
      try {
        console.log(`📦 Processando lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(proventos.length/BATCH_SIZE)} (${batch.length} itens)`);
        
        // 🔄 CADA LOTE É UMA TRANSAÇÃO SEPARADA
        const resultado = await prisma.$transaction(
          async (tx) => {
            return await tx.provento.createMany({
              data: batch.map(p => ({
                ticker: p.ticker,
                valor: p.valor,
                tipo: p.tipo,
                data: p.data,
                dataObj: new Date(p.dataObj),
                dataCom: p.dataCom,
                dataPagamento: p.dataPagamento,
                dataFormatada: p.dataFormatada,
                valorFormatado: p.valorFormatado,
                dividendYield: p.dividendYield,
                fonte: 'csv_upload'
              })),
              skipDuplicates: true
            });
          },
          {
            maxWait: 10000, // 10 segundos para aguardar
            timeout: 20000, // 20 segundos para executar
          }
        );
        
        totalInseridos += resultado.count;
        console.log(`✅ Lote processado: ${resultado.count} inseridos`);
        
        // 🛑 PAUSA PEQUENA ENTRE LOTES (evita sobrecarga)
        if (i + BATCH_SIZE < proventos.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Erro no lote ${Math.floor(i/BATCH_SIZE) + 1}:`, error);
        totalErros += batch.length;
        
        // 🔄 TENTAR INSERÇÃO INDIVIDUAL EM CASO DE ERRO
        console.log(`🔄 Tentando inserção individual para o lote com erro...`);
        for (const provento of batch) {
          try {
            await prisma.provento.create({
              data: {
                ticker: provento.ticker,
                valor: provento.valor,
                tipo: provento.tipo,
                data: provento.data,
                dataObj: new Date(provento.dataObj),
                dataCom: provento.dataCom,
                dataPagamento: provento.dataPagamento,
                dataFormatada: provento.dataFormatada,
                valorFormatado: provento.valorFormatado,
                dividendYield: provento.dividendYield,
                fonte: 'csv_upload'
              }
            });
            totalInseridos++;
            totalErros--;
          } catch (individualError) {
            console.error(`❌ Erro individual para ${provento.ticker}:`, individualError);
          }
        }
      }
    }
    
    console.log(`🎉 Upload finalizado: ${totalInseridos} inseridos, ${totalErros} erros`);
    
    // 📊 ATUALIZAR ESTATÍSTICAS (FORA DA TRANSAÇÃO PRINCIPAL)
    try {
      console.log(`📊 Atualizando estatísticas...`);
      await atualizarEstatisticas();
      console.log(`✅ Estatísticas atualizadas`);
    } catch (statsError) {
      console.error(`⚠️ Erro ao atualizar estatísticas (não crítico):`, statsError);
    }
    
    return NextResponse.json({
      message: `${totalInseridos} proventos inseridos com sucesso`,
      total: totalInseridos,
      erros: totalErros,
      sucesso: totalErros === 0
    });
    
  } catch (error) {
    console.error('Erro na API de proventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // 🗑️ LIMPAR TODOS OS PROVENTOS EM LOTES
    console.log(`🗑️ Iniciando limpeza de proventos...`);
    
    let totalRemovidos = 0;
    let hasMore = true;
    
    while (hasMore) {
      const resultado = await prisma.provento.deleteMany({
        take: 1000 // Deletar no máximo 1000 por vez
      });
      
      totalRemovidos += resultado.count;
      hasMore = resultado.count === 1000;
      
      console.log(`🗑️ Removidos ${resultado.count} proventos (total: ${totalRemovidos})`);
      
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 🧹 LIMPAR TAMBÉM AS ESTATÍSTICAS
    await prisma.proventoEstatistica.deleteMany({});
    
    console.log(`✅ Limpeza concluída: ${totalRemovidos} proventos removidos`);
    
    return NextResponse.json({
      message: `${totalRemovidos} proventos removidos`,
      total: totalRemovidos
    });
    
  } catch (error) {
    console.error('Erro ao deletar proventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 📊 FUNÇÃO OTIMIZADA PARA ATUALIZAR ESTATÍSTICAS
async function atualizarEstatisticas() {
  try {
    // 🔍 BUSCAR TICKERS ÚNICOS EM LOTES
    const tickers = await prisma.provento.findMany({
      select: { ticker: true },
      distinct: ['ticker']
    });
    
    console.log(`📊 Atualizando estatísticas para ${tickers.length} tickers...`);
    
    // 🔄 PROCESSAR TICKERS EM LOTES DE 10
    const TICKER_BATCH_SIZE = 10;
    
    for (let i = 0; i < tickers.length; i += TICKER_BATCH_SIZE) {
      const tickerBatch = tickers.slice(i, i + TICKER_BATCH_SIZE);
      
      // 📊 PROCESSAR CADA TICKER DO LOTE
      for (const { ticker } of tickerBatch) {
        try {
          const stats = await prisma.provento.aggregate({
            where: { ticker },
            _count: { id: true },
            _sum: { valor: true },
            _avg: { valor: true },
            _min: { dataObj: true },
            _max: { dataObj: true }
          });
          
          await prisma.proventoEstatistica.upsert({
            where: { ticker },
            create: {
              ticker,
              totalProventos: stats._count.id,
              valorTotal: stats._sum.valor || 0,
              valorMedio: stats._avg.valor || 0,
              primeiroProvento: stats._min.dataObj,
              ultimoProvento: stats._max.dataObj
            },
            update: {
              totalProventos: stats._count.id,
              valorTotal: stats._sum.valor || 0,
              valorMedio: stats._avg.valor || 0,
              primeiroProvento: stats._min.dataObj,
              ultimoProvento: stats._max.dataObj,
              ultimaAtualizacao: new Date()
            }
          });
          
        } catch (tickerError) {
          console.error(`❌ Erro ao processar estatísticas do ticker ${ticker}:`, tickerError);
        }
      }
      
      // 🛑 PAUSA ENTRE LOTES DE TICKERS
      if (i + TICKER_BATCH_SIZE < tickers.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log(`✅ Estatísticas atualizadas para ${tickers.length} tickers`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
    throw error;
  }
}