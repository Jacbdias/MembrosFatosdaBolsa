// src/app/api/financial/market-data/route.ts
import { NextResponse } from 'next/server';

// 🔧 FUNÇÕES AUXILIARES INLINE (sem dependências externas)
function formatMarketValue(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return value.toFixed(2);
}

function getTrendDirection(change: number): 'up' | 'down' {
  return change >= 0 ? 'up' : 'down';
}

// 🔥 FUNÇÃO PARA BUSCAR DADOS DA BRAPI
async function fetchBrapiData(symbol: string) {
  try {
    const response = await fetch(`https://brapi.dev/api/quote/${symbol}?fundamental=false`, {
      next: { revalidate: 300 } // Cache por 5 minutos
    });
    
    if (!response.ok) {
      throw new Error(`BRAPI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar ${symbol}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    console.log('🚀 API market-data chamada');

    // 🔄 BUSCAR DADOS EM PARALELO COM TRATAMENTO DE ERRO
    const [ibovespaResult, smallCapResult] = await Promise.allSettled([
      fetchBrapiData('IBOV'), // Ibovespa
      fetchBrapiData('SMAL11') // Small Cap ETF
    ]);

    // 📊 DADOS PADRÃO PARA FALLBACK
    const defaultMarketData = {
      ibovespa: { value: "136.787", trend: "down" as const, diff: -0.18 },
      indiceSmall: { value: "3.200", trend: "up" as const, diff: 0.24 },
    };

    let ibovespaData = defaultMarketData.ibovespa;
    let smallCapData = defaultMarketData.indiceSmall;

    // 🎯 PROCESSAR IBOVESPA
    if (ibovespaResult.status === 'fulfilled' && ibovespaResult.value) {
      const ibovespa = ibovespaResult.value;
      ibovespaData = {
        value: formatMarketValue(ibovespa.regularMarketPrice),
        trend: getTrendDirection(ibovespa.regularMarketChange),
        diff: Number(ibovespa.regularMarketChangePercent.toFixed(2)),
      };
      console.log('✅ Ibovespa processado:', ibovespaData);
    } else {
      console.warn('⚠️ Usando fallback para Ibovespa');
    }

    // 🎯 PROCESSAR SMALL CAP
    if (smallCapResult.status === 'fulfilled' && smallCapResult.value) {
      const smallCap = smallCapResult.value;
      smallCapData = {
        value: formatMarketValue(smallCap.regularMarketPrice),
        trend: getTrendDirection(smallCap.regularMarketChange),
        diff: Number(smallCap.regularMarketChangePercent.toFixed(2)),
      };
      console.log('✅ Small Cap processado:', smallCapData);
    } else {
      console.warn('⚠️ Usando fallback para Small Cap');
    }

    // 🎨 DADOS FINAIS COMBINADOS
    const marketData = {
      ibovespa: ibovespaData,
      indiceSmall: smallCapData,
      carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
      dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };

    console.log('📊 Market data finalizado:', marketData);

    return NextResponse.json(
      { marketData, timestamp: new Date().toISOString() },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Market Data API Error:', errorMessage);
    
    // 🚨 FALLBACK COMPLETO EM CASO DE ERRO
    return NextResponse.json({
      error: `Falha ao buscar dados: ${errorMessage}`,
      marketData: {
        ibovespa: { value: "136.787", trend: "down" as const, diff: -0.18 },
        indiceSmall: { value: "3.200", trend: "up" as const, diff: 0.24 },
        carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
        dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
        ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
        carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
      },
      timestamp: new Date().toISOString(),
      fallback: true,
    }, { status: 200 }); // ✅ Mudei para 200 para não quebrar o frontend
  }
}
