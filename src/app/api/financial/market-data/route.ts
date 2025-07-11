// src/app/api/financial/market-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 🛡️ CONFIGURAÇÃO PARA VERCEL
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// 🔧 FUNÇÕES AUXILIARES
function formatMarketValue(value: number): string {
  // Para SMLL (valor típico entre 2000-3000), manter 2 casas decimais
  if (value >= 1000 && value < 10000) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  // Para IBOVESPA (valor alto), sem casas decimais
  else if (value >= 10000) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  // Para valores menores, 2 casas decimais
  return value.toFixed(2);
}

function getTrendDirection(change: number): 'up' | 'down' {
  return change >= 0 ? 'up' : 'down';
}

// 🔥 FUNÇÃO MELHORADA PARA BUSCAR DADOS DO YAHOO FINANCE
async function fetchYahooFinanceData(symbol: string, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timestamp = Date.now();
      let yahooSymbol = symbol;
      
      // Mapear símbolos para o formato correto do Yahoo
      if (symbol === 'SMLL') {
        yahooSymbol = 'SMLL11.SA';
      } else if (symbol === 'IBOV') {
        yahooSymbol = '^BVSP';
      }
      
      console.log(`🔄 Tentativa ${attempt + 1} - Buscando ${symbol} (${yahooSymbol}) via Yahoo...`);
      
      // Usar a API v8/finance/chart que retorna dados mais confiáveis
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d&_t=${timestamp}`, {
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
      
      // 🎯 PEGAR PREÇOS CORRETAMENTE
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose || meta.chartPreviousClose;
      
      if (!currentPrice) {
        throw new Error('Preço atual não encontrado');
      }
      
      // 🔥 CALCULAR VARIAÇÃO CORRETAMENTE
      let changePercent = 0;
      let change = 0;
      
      if (meta.regularMarketChangePercent !== undefined) {
        // Se o Yahoo já calculou a variação, usar ela
        changePercent = meta.regularMarketChangePercent;
        change = meta.regularMarketChange || 0;
      } else if (previousClose && previousClose > 0) {
        // Senão, calcular manualmente
        change = currentPrice - previousClose;
        changePercent = (change / previousClose) * 100;
      }
      
      // 🎯 VALIDAR SE OS DADOS FAZEM SENTIDO
      if (Math.abs(changePercent) > 50) {
        console.warn(`⚠️ Variação muito alta para ${symbol}: ${changePercent}% - Pode ser erro de dados`);
      }
      
      console.log(`✅ ${symbol} via Yahoo:`);
      console.log(`   Preço atual: ${currentPrice.toFixed(2)}`);
      console.log(`   Preço anterior: ${previousClose?.toFixed(2) || 'N/A'}`);
      console.log(`   Variação: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
      console.log(`   Valor formatado: ${formatMarketValue(currentPrice)}`);
      
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
          exchangeName: meta.exchangeName,
          fullMeta: meta
        }
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

// 🇧🇷 FUNÇÃO PARA BUSCAR DADOS DA BRAPI
async function fetchBrapiData(symbol: string) {
  try {
    let brapiSymbol = symbol;
    
    // Mapear símbolos para formato BRAPI
    if (symbol === 'IBOV') {
      brapiSymbol = 'IBOV';
    } else if (symbol === 'SMLL') {
      brapiSymbol = 'SMLL11';
    }
    
    console.log(`🇧🇷 Buscando ${symbol} (${brapiSymbol}) via BRAPI...`);
    
    // BRAPI tem endpoints diferentes para índices e ações
    const endpoint = symbol === 'IBOV' 
      ? `https://brapi.dev/api/quote/list?search=${brapiSymbol}&limit=1`
      : `https://brapi.dev/api/quote/${brapiSymbol}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FatosdaBolsa/1.0'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`BRAPI HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const quote = data.results?.[0];
    
    if (!quote) {
      throw new Error('Nenhum dado retornado pela BRAPI');
    }
    
    const currentPrice = quote.regularMarketPrice || quote.price;
    const changePercent = quote.regularMarketChangePercent || quote.changePercent || 0;
    const change = quote.regularMarketChange || quote.change || 0;
    
    if (!currentPrice) {
      throw new Error('Preço não encontrado na resposta BRAPI');
    }
    
    console.log(`✅ ${symbol} via BRAPI:`);
    console.log(`   Preço: ${currentPrice.toFixed(2)}`);
    console.log(`   Variação: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
    
    return {
      value: formatMarketValue(currentPrice),
      trend: getTrendDirection(changePercent),
      diff: Number(changePercent.toFixed(2)),
      source: 'brapi',
      rawData: {
        currentPrice,
        change,
        changePercent,
        currency: quote.currency,
        symbol: quote.symbol,
        fullQuote: quote
      }
    };
    
  } catch (error) {
    console.error(`❌ Erro BRAPI para ${symbol}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// 🎯 FUNÇÃO ALTERNATIVA USANDO API v7/finance/quote
async function fetchYahooQuoteData(symbol: string) {
  try {
    let yahooSymbol = symbol;
    
    if (symbol === 'SMLL') {
      yahooSymbol = 'SMLL11.SA';
    } else if (symbol === 'IBOV') {
      yahooSymbol = '^BVSP';
    }
    
    console.log(`🔄 Buscando ${symbol} via Yahoo Quote API...`);
    
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,previousClose,currency`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com/'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) throw new Error(`Quote API HTTP ${response.status}`);
    
    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0];
    
    if (!quote) throw new Error('Nenhum dado na Quote API');
    
    const currentPrice = quote.regularMarketPrice;
    const changePercent = quote.regularMarketChangePercent || 0;
    const change = quote.regularMarketChange || 0;
    
    console.log(`✅ ${symbol} via Yahoo Quote API:`);
    console.log(`   Preço: ${currentPrice}`);
    console.log(`   Variação: ${change} (${changePercent}%)`);
    
    return {
      value: formatMarketValue(currentPrice),
      trend: getTrendDirection(changePercent),
      diff: Number(changePercent.toFixed(2)),
      source: 'yahoo-quote'
    };
    
  } catch (error) {
    console.error(`❌ Erro Yahoo Quote API para ${symbol}:`, error);
    return null;
  }
}

// 🚀 FUNÇÃO PRINCIPAL PARA BUSCAR DADOS COM MÚLTIPLOS FALLBACKS
async function fetchMarketData(symbol: string) {
  console.log(`📊 Buscando dados para ${symbol}...`);
  
  // 1️⃣ Tentar Yahoo Finance Chart API primeiro (mais rápido)
  let result = await fetchYahooFinanceData(symbol);
  
  // 2️⃣ Se falhar, tentar BRAPI (dados brasileiros confiáveis)
  if (!result) {
    console.log(`⚠️ Yahoo falhou para ${symbol}, tentando BRAPI...`);
    result = await fetchBrapiData(symbol);
  }
  
  // 3️⃣ Se BRAPI falhar, tentar Yahoo Quote API
  if (!result) {
    console.log(`⚠️ BRAPI falhou para ${symbol}, tentando Yahoo Quote API...`);
    result = await fetchYahooQuoteData(symbol);
  }
  
  // 4️⃣ Se tudo falhar, será usado fallback no handler principal
  if (!result) {
    console.warn(`❌ Todas as APIs falharam para ${symbol}`);
  }
  
  return result;
}

// 🚀 HANDLER PRINCIPAL DA API
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Market Data API iniciada - Yahoo Finance + BRAPI + Fallbacks');
    
    // Buscar dados em paralelo
    const [ibovespaResult, smllResult] = await Promise.allSettled([
      fetchMarketData('IBOV'),
      fetchMarketData('SMLL')
    ]);
    
    // Dados de fallback atualizados
    let marketData = {
      ibovespa: { value: "136.431", trend: "down" as const, diff: -0.26 },
      indiceSmall: { value: "2.237,86", trend: "up" as const, diff: 1.56 },
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
      sources.ibovespa = ibovespaResult.value.source;
      debugInfo.ibovespaRawData = ibovespaResult.value.rawData;
      console.log(`✅ Ibovespa atualizado via ${ibovespaResult.value.source}`);
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
      sources.smll = smllResult.value.source;
      debugInfo.smllRawData = smllResult.value.rawData;
      console.log(`✅ SMLL atualizado via ${smllResult.value.source}`);
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
        version: '6.0-with-brapi',
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
        indiceSmall: { value: "2.237,86", trend: "up" as const, diff: 1.56 },
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