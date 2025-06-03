// src/app/api/financial/market-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 🛡️ CONFIGURAÇÃO PARA VERCEL
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// 🔧 FUNÇÕES AUXILIARES
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

// 🔥 BUSCAR DADOS VIA YAHOO FINANCE
async function fetchYahooData(symbol: string, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timestamp = Date.now();
      const yahooSymbol = symbol === 'SMLL' ? 'SMLL11.SA' : `${symbol}.SA`;
      
      console.log(`🔄 Tentativa ${attempt + 1} - Buscando ${symbol} (${yahooSymbol}) via Yahoo...`);
      
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d&_t=${timestamp}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://finance.yahoo.com/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error(`Yahoo HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.chart?.error) {
        throw new Error(`Yahoo API Error: ${data.chart.error.description}`);
      }
      
      const chart = data.chart?.result?.[0];
      if (!chart) {
        throw new Error('Nenhum dado retornado pelo Yahoo');
      }
      
      const meta = chart.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      
      if (!currentPrice || !previousClose) {
        throw new Error('Dados de preço incompletos');
      }
      
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      console.log(`✅ ${symbol} via Yahoo: R$ ${currentPrice.toFixed(2)} (${changePercent.toFixed(2)}%)`);
      
      return {
        value: formatMarketValue(currentPrice),
        trend: getTrendDirection(changePercent),
        diff: Number(changePercent.toFixed(2)),
        rawPrice: currentPrice,
        source: 'yahoo'
      };
      
    } catch (error) {
      console.error(`❌ Tentativa ${attempt + 1} falhou para ${symbol}:`, error instanceof Error ? error.message : error);
      
      if (attempt === retries) {
        return null;
      }
      
      // Aguarda antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return null;
}

// 🎯 BUSCAR IBOVESPA VIA YAHOO
async function fetchIbovespaYahoo() {
  try {
    // Yahoo usa ^BVSP para Ibovespa
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=1d', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com/'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error(`Yahoo IBOV HTTP ${response.status}`);
    
    const data = await response.json();
    const chart = data.chart?.result?.[0];
    
    if (chart?.meta) {
      const meta = chart.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      console.log(`✅ IBOVESPA via Yahoo: ${currentPrice.toFixed(0)} pontos (${changePercent.toFixed(2)}%)`);
      
      return {
        value: formatMarketValue(currentPrice),
        trend: getTrendDirection(changePercent),
        diff: Number(changePercent.toFixed(2)),
        source: 'yahoo'
      };
    }
    
    throw new Error('Dados do IBOVESPA incompletos');
  } catch (error) {
    console.error('❌ Erro IBOVESPA Yahoo:', error);
    return null;
  }
}

// 🎯 BUSCAR SMLL VIA YAHOO
async function fetchSMLLYahoo() {
  try {
    console.log('🔄 Buscando SMLL11 via Yahoo Finance...');
    
    // SMLL11.SA é o ticker correto na B3
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/SMLL11.SA?interval=1d&range=1d', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://finance.yahoo.com/',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Yahoo SMLL HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.chart?.error) {
      throw new Error(`Yahoo SMLL Error: ${data.chart.error.description}`);
    }
    
    const chart = data.chart?.result?.[0];
    
    if (chart?.meta) {
      const meta = chart.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose || meta.chartPreviousClose;
      
      if (!currentPrice) {
        throw new Error('Preço atual do SMLL não encontrado');
      }
      
      const change = currentPrice - (previousClose || currentPrice);
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;
      
      console.log(`✅ SMLL11 via Yahoo: R$ ${currentPrice.toFixed(2)} (${changePercent.toFixed(2)}%)`);
      console.log(`📊 Meta completa:`, JSON.stringify(meta, null, 2));
      
      return {
        value: formatMarketValue(currentPrice),
        trend: getTrendDirection(changePercent),
        diff: Number(changePercent.toFixed(2)),
        source: 'yahoo',
        rawData: {
          currentPrice,
          previousClose,
          change,
          changePercent,
          currency: meta.currency,
          exchangeName: meta.exchangeName
        }
      };
    }
    
    throw new Error('Dados do SMLL incompletos no Yahoo');
  } catch (error) {
    console.error('❌ Erro SMLL Yahoo:', error instanceof Error ? error.message : error);
    return null;
  }
}

// 🚀 HANDLER PRINCIPAL DA API
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Market Data API iniciada - Yahoo Finance only');
    
    // Buscar dados em paralelo
    const [ibovespaResult, smllResult] = await Promise.allSettled([
      fetchIbovespaYahoo(),
      fetchSMLLYahoo()
    ]);
    
    // Dados de fallback
    let marketData = {
      ibovespa: { value: "136.431", trend: "down" as const, diff: -0.26 },
      indiceSmall: { value: "2.203", trend: "down" as const, diff: -0.16 },
      carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
      dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };
    
    const sources = { ibovespa: 'fallback', smll: 'fallback' };
    let debugInfo: any = {};
    
    // Processar Ibovespa
    if (ibovespaResult.status === 'fulfilled' && ibovespaResult.value) {
      marketData.ibovespa = {
        value: ibovespaResult.value.value,
        trend: ibovespaResult.value.trend,
        diff: ibovespaResult.value.diff,
      };
      sources.ibovespa = 'yahoo';
      console.log('✅ Ibovespa atualizado via Yahoo Finance');
    } else {
      console.warn('⚠️ Usando fallback para Ibovespa');
      debugInfo.ibovespaError = ibovespaResult.status === 'rejected' ? ibovespaResult.reason?.message : 'Unknown error';
    }
    
    // Processar SMLL
    if (smllResult.status === 'fulfilled' && smllResult.value) {
      marketData.indiceSmall = {
        value: smllResult.value.value,
        trend: smllResult.value.trend,
        diff: smllResult.value.diff,
      };
      sources.smll = 'yahoo';
      debugInfo.smllRawData = smllResult.value.rawData;
      console.log('✅ SMLL atualizado via Yahoo Finance');
    } else {
      console.warn('⚠️ Usando fallback para SMLL');
      debugInfo.smllError = smllResult.status === 'rejected' ? smllResult.reason?.message : 'Unknown error';
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`📊 Processamento concluído em ${processingTime}ms`);
    
    const response = {
      marketData,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        sources,
        lastUpdate: new Date().toLocaleString('pt-BR', { 
          timeZone: 'America/Sao_Paulo' 
        }),
        version: '4.0-yahoo-only',
        debug: debugInfo
      }
    };
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro crítico na API:', errorMessage);
    
    return NextResponse.json({
      error: `Falha ao buscar dados: ${errorMessage}`,
      marketData: {
        ibovespa: { value: "136.431", trend: "down" as const, diff: -0.26 },
        indiceSmall: { value: "2.203", trend: "down" as const, diff: -0.16 },
        carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
        dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
        ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
        carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        fallback: true,
        error: errorMessage
      }
    }, { 
      status: 200,
      headers: { 
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
