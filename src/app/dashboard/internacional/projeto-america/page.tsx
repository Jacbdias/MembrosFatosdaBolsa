/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useDataStore } from '@/hooks/useDataStore';

// 🔥 DETECÇÃO DE DISPOSITIVO (ADICIONADO)
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// 🚀 HOOK PARA BUSCAR DADOS REAIS DE ÍNDICES INTERNACIONAIS
function useIndicesInternacionaisRealTime() {
  const [indicesData, setIndicesData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIndicesReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO ÍNDICES INTERNACIONAIS REAIS...');

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR S&P 500 E NASDAQ VIA BRAPI COM TIMEOUT
      const indices = ['^GSPC', '^IXIC']; // S&P 500 e NASDAQ
      const indicesUrl = `https://brapi.dev/api/quote/${indices.join(',')}?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 Buscando índices internacionais...');

      // 🔥 ADICIONAR TIMEOUT DE 5 SEGUNDOS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(indicesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'International-Indices-App'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta Índices Internacionais:', data);

        if (data.results && data.results.length > 0) {
          const dadosIndices = {
            sp500: null,
            nasdaq: null
          };

          data.results.forEach((indice: any) => {
            console.log('🔍 Processando índice:', indice.symbol, indice.regularMarketPrice);
            
            if (indice.symbol === '^GSPC') {
              dadosIndices.sp500 = {
                valor: indice.regularMarketPrice,
                valorFormatado: indice.regularMarketPrice.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }),
                variacao: indice.regularMarketChange || 0,
                variacaoPercent: indice.regularMarketChangePercent || 0,
                trend: (indice.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down'
              };
              console.log('✅ S&P 500 processado:', dadosIndices.sp500);
            } else if (indice.symbol === '^IXIC') {
              dadosIndices.nasdaq = {
                valor: indice.regularMarketPrice,
                valorFormatado: indice.regularMarketPrice.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }),
                variacao: indice.regularMarketChange || 0,
                variacaoPercent: indice.regularMarketChangePercent || 0,
                trend: (indice.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down'
              };
              console.log('✅ NASDAQ processado:', dadosIndices.nasdaq);
            }
          });

          console.log('✅ ÍNDICES INTERNACIONAIS PROCESSADOS:', dadosIndices);
          setIndicesData(dadosIndices);
          
        } else {
          throw new Error('Sem dados dos índices na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar índices internacionais:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK CORRIGIDO
      console.log('🔄 Usando fallback para índices internacionais...');
      const fallbackData = {
        sp500: {
          valor: 5970.80,
          valorFormatado: '5,970.80',
          variacao: 35.2,
          variacaoPercent: 0.59,
          trend: 'up'
        },
        nasdaq: {
          valor: 19400.00,
          valorFormatado: '19,400.00',
          variacao: 156.3,
          variacaoPercent: 0.81,
          trend: 'up'
        }
      };
      setIndicesData(fallbackData);
      console.log('✅ Fallback aplicado:', fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIndicesReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIndicesReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // 🔥 ARRAY VAZIO PARA EVITAR LOOP INFINITO

  return { indicesData, loading, error, refetch: buscarIndicesReal };
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesAutomatico(precoTeto: number | undefined, precoAtual: string): string {
  if (!precoTeto || precoAtual === 'N/A' || precoTeto === 0) {
    return 'Aguardar';
  }
  
  // Remover formatação e converter para números
  const precoAtualNum = parseFloat(precoAtual.replace('US$', '').replace(',', '.'));
  
  if (isNaN(precoAtualNum)) {
    return 'Aguardar';
  }
  
  // 🎯 LÓGICA CORRETA: Preço Atual < Preço Teto = COMPRA (ação está barata)
  if (precoAtualNum < precoTeto) {
    return 'Compra';
  } else {
    return 'Aguardar';
  }
}

// 🚀 FUNÇÃO PARA BUSCAR DY 12 MESES VIA YAHOO FINANCE API (ADAPTADA DO EXTERIOR STOCKS)
async function buscarDY12MesesAPI(ticker: string, precoAtual: number): Promise<string> {
  try {
    if (!ticker || precoAtual <= 0) return '0,00%';
    
    console.log(`🔍 Buscando DY via API para ${ticker}...`);
    
    // 📊 MÉTODO 1: TENTAR VIA BRAPI (PODE TER DADOS DE DIVIDENDOS)
    try {
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const brapiUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DY-Calculator-App'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Resposta BRAPI para ${ticker}:`, data);
        
        if (data.results && data.results.length > 0) {
          const quote = data.results[0];
          
          // Verificar se tem dados de dividendos
          if (quote.dividendYield && quote.dividendYield > 0) {
            const dyPercent = quote.dividendYield * 100;
            console.log(`✅ DY encontrado via BRAPI para ${ticker}: ${dyPercent.toFixed(2)}%`);
            return `${dyPercent.toFixed(2).replace('.', ',')}%`;
          }
          
          // Verificar dados fundamentais
          if (quote.summaryProfile?.dividendYield) {
            const dyPercent = quote.summaryProfile.dividendYield * 100;
            console.log(`✅ DY encontrado via BRAPI (fundamental) para ${ticker}: ${dyPercent.toFixed(2)}%`);
            return `${dyPercent.toFixed(2).replace('.', ',')}%`;
          }
        }
      }
    } catch (brapiError) {
      console.warn(`⚠️ Erro BRAPI para ${ticker}:`, brapiError);
    }
    
    // 📊 MÉTODO 2: TENTAR VIA YAHOO FINANCE DIRETO (COM CORS PROXY)
    try {
      // Usar um proxy CORS público para acessar Yahoo Finance
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d&events=div`;
      
      const proxyUrl = corsProxy + encodeURIComponent(yahooUrl);
      
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
      
      const response2 = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller2.signal
      });
      
      clearTimeout(timeoutId2);
      
      if (response2.ok) {
        const data = await response2.json();
        console.log(`📊 Resposta Yahoo Finance para ${ticker}:`, data);
        
        if (data.chart && data.chart.result && data.chart.result.length > 0) {
          const result = data.chart.result[0];
          
          // Verificar se tem eventos de dividendos
          if (result.events && result.events.dividends) {
            const dividendos = Object.values(result.events.dividends) as any[];
            
            // Calcular data de 12 meses atrás
            const hoje = new Date();
            const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
            const timestampUmAnoAtras = Math.floor(umAnoAtras.getTime() / 1000);
            
            // Filtrar dividendos dos últimos 12 meses
            const dividendosUltimos12Meses = dividendos.filter((div: any) => 
              div.date && div.date >= timestampUmAnoAtras
            );
            
            if (dividendosUltimos12Meses.length > 0) {
              // Somar todos os dividendos dos últimos 12 meses
              const totalDividendos = dividendosUltimos12Meses.reduce((total: number, div: any) => 
                total + (div.amount || 0), 0
              );
              
              if (totalDividendos > 0) {
                // Calcular DY: (Total Dividendos / Preço Atual) * 100
                const dy = (totalDividendos / precoAtual) * 100;
                console.log(`✅ DY calculado via Yahoo Finance para ${ticker}: ${dy.toFixed(2)}% (${totalDividendos} USD em dividendos)`);
                return `${dy.toFixed(2).replace('.', ',')}%`;
              }
            }
          }
        }
      }
    } catch (yahooError) {
      console.warn(`⚠️ Erro Yahoo Finance para ${ticker}:`, yahooError);
    }
    
    // 📊 MÉTODO 3: TENTAR VIA FINANCIAL MODELING PREP (GRATUITO ATÉ 250 CALLS/DIA)
    try {
      // API Key demo da Financial Modeling Prep (substituir por uma própria se necessário)
      const fmpUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${ticker}?apikey=demo`;
      
      const controller3 = new AbortController();
      const timeoutId3 = setTimeout(() => controller3.abort(), 5000);
      
      const response3 = await fetch(fmpUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller3.signal
      });
      
      clearTimeout(timeoutId3);
      
      if (response3.ok) {
        const data = await response3.json();
        console.log(`📊 Resposta FMP para ${ticker}:`, data);
        
        if (data.historical && Array.isArray(data.historical)) {
          // Calcular data de 12 meses atrás
          const hoje = new Date();
          const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
          
          // Filtrar dividendos dos últimos 12 meses
          const dividendosUltimos12Meses = data.historical.filter((div: any) => {
            const dataDividendo = new Date(div.date);
            return dataDividendo >= umAnoAtras && dataDividendo <= hoje;
          });
          
          if (dividendosUltimos12Meses.length > 0) {
            // Somar todos os dividendos dos últimos 12 meses
            const totalDividendos = dividendosUltimos12Meses.reduce((total: number, div: any) => 
              total + (div.dividend || 0), 0
            );
            
            if (totalDividendos > 0) {
              // Calcular DY: (Total Dividendos / Preço Atual) * 100
              const dy = (totalDividendos / precoAtual) * 100;
              console.log(`✅ DY calculado via FMP para ${ticker}: ${dy.toFixed(2)}% (${totalDividendos} USD em dividendos)`);
              return `${dy.toFixed(2).replace('.', ',')}%`;
            }
          }
        }
      }
    } catch (fmpError) {
      console.warn(`⚠️ Erro FMP para ${ticker}:`, fmpError);
    }
    
    // 📊 MÉTODO 4: FALLBACK - TENTAR BUSCAR DIVIDEND YIELD ATUAL VIA QUOTE
    try {
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const yahooQuoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics,summaryDetail`;
      const proxyQuoteUrl = corsProxy + encodeURIComponent(yahooQuoteUrl);
      
      const controller4 = new AbortController();
      const timeoutId4 = setTimeout(() => controller4.abort(), 5000);
      
      const response4 = await fetch(proxyQuoteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller4.signal
      });
      
      clearTimeout(timeoutId4);
      
      if (response4.ok) {
        const data = await response4.json();
        console.log(`📊 Resposta Yahoo Quote para ${ticker}:`, data);
        
        if (data.quoteSummary && data.quoteSummary.result && data.quoteSummary.result.length > 0) {
          const result = data.quoteSummary.result[0];
          
          // Tentar vários campos de dividend yield
          const possiveisCampos = [
            result.summaryDetail?.dividendYield?.raw,
            result.summaryDetail?.trailingAnnualDividendYield?.raw,
            result.defaultKeyStatistics?.dividendYield?.raw,
            result.defaultKeyStatistics?.trailingAnnualDividendYield?.raw
          ];
          
          for (const dy of possiveisCampos) {
            if (dy && dy > 0) {
              const dyPercent = dy * 100;
              console.log(`✅ DY encontrado via Yahoo Quote para ${ticker}: ${dyPercent.toFixed(2)}%`);
              return `${dyPercent.toFixed(2).replace('.', ',')}%`;
            }
          }
        }
      }
    } catch (quoteError) {
      console.warn(`⚠️ Erro Yahoo Quote para ${ticker}:`, quoteError);
    }
    
    console.log(`❌ Nenhum método funcionou para ${ticker}, usando fallback localStorage`);
    
    // 📊 MÉTODO 5: FALLBACK PARA LOCALSTORAGE (MÉTODO ORIGINAL)
    return calcularDY12MesesLocalStorage(ticker, precoAtual);
    
  } catch (error) {
    console.error(`❌ Erro geral ao buscar DY para ${ticker}:`, error);
    return calcularDY12MesesLocalStorage(ticker, precoAtual);
  }
}

// 🎯 FUNÇÃO ORIGINAL RENOMEADA PARA FALLBACK
function calcularDY12MesesLocalStorage(ticker: string, precoAtual: number): string {
  try {
    if (typeof window === 'undefined' || precoAtual <= 0) return '0,00%';
    
    // Buscar proventos do ticker específico no localStorage
    const proventosData = localStorage.getItem(`proventos_${ticker}`);
    if (!proventosData) return '0,00%';
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return '0,00%';
    
    // Data de 12 meses atrás
    const hoje = new Date();
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    
    console.log(`🔍 Calculando DY para ${ticker}:`);
    
    // Filtrar proventos dos últimos 12 meses
    const proventosUltimos12Meses = proventos.filter((provento: any) => {
      let dataProvento: Date;
      
      // Tentar várias formas de parsing da data
      if (provento.dataObj) {
        dataProvento = new Date(provento.dataObj);
      } else if (provento.dataCom) {
        if (provento.dataCom.includes('/')) {
          const [d, m, a] = provento.dataCom.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.dataCom);
        }
      } else if (provento.data) {
        if (provento.data.includes('/')) {
          const [d, m, a] = provento.data.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.data);
        }
      } else {
        return false;
      }
      
      return dataProvento >= umAnoAtras && dataProvento <= hoje;
    });
    
    if (proventosUltimos12Meses.length === 0) {
      console.log(`❌ ${ticker}: Nenhum provento nos últimos 12 meses`);
      return '0,00%';
    }
    
    // Somar valores dos proventos
    const totalProventos = proventosUltimos12Meses.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    if (totalProventos <= 0) {
      return '0,00%';
    }
    
    // Calcular DY: (Total Proventos 12 meses / Preço Atual) * 100
    const dy = (totalProventos / precoAtual) * 100;
    
    return `${dy.toFixed(2).replace('.', ',')}%`;
    
  } catch (error) {
    console.error(`❌ Erro ao calcular DY para ${ticker}:`, error);
    return '0,00%';
  }
}

// 🚀 FUNÇÃO PARA BUSCAR COTAÇÕES EM PARALELO (ADAPTADA DO EXTERIOR STOCKS)
async function buscarCotacoesProjetoAmericaParalelas(tickers: string[], isMobile: boolean): Promise<Map<string, any>> {
  const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
  const cotacoesMap = new Map();
  
  if (!isMobile) {
    // 🖥️ DESKTOP: busca em lote (mais eficiente)
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProjetoAmerica-Desktop-Optimized'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🖥️ Resposta Desktop:', data.results?.length || 0, 'ativos');
        
        data.results?.forEach((quote: any) => {
          if (quote.regularMarketPrice > 0) {
            cotacoesMap.set(quote.symbol, {
              precoAtual: quote.regularMarketPrice,
              variacao: quote.regularMarketChange || 0,
              variacaoPercent: quote.regularMarketChangePercent || 0,
              volume: quote.regularMarketVolume || 0,
              nome: quote.shortName || quote.longName || quote.symbol,
              dadosCompletos: quote
            });
            console.log(`✅ Desktop ${quote.symbol}: US$ ${quote.regularMarketPrice}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Erro na busca em lote desktop:', error);
    }
    
    return cotacoesMap;
  }

  // 📱 MOBILE: busca individual com estratégias múltiplas
  console.log('📱 MOBILE: Iniciando busca individual para', tickers.length, 'tickers');
  
  const buscarCotacaoAtivo = async (ticker: string) => {
    const estrategias = [
      // Estratégia 1: User-Agent Desktop
      {
        nome: 'Desktop UA',
        fetch: () => fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache'
          }
        })
      },
      // Estratégia 2: Sem User-Agent
      {
        nome: 'Sem UA',
        fetch: () => fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
      },
      // Estratégia 3: URL simplificada
      {
        nome: 'URL simples',
        fetch: () => fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&range=1d`, {
          method: 'GET',
          mode: 'cors'
        })
      }
    ];

    for (const estrategia of estrategias) {
      try {
        console.log(`📱🔄 ${ticker}: Tentativa ${estrategia.nome}`);
        
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        
        const response = await Promise.race([
          estrategia.fetch(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as Response;

        if (response.ok) {
          const data = await response.json();
          if (data.results?.[0]?.regularMarketPrice > 0) {
            const quote = data.results[0];
            console.log(`📱✅ ${ticker}: US$ ${quote.regularMarketPrice} (${estrategia.nome})`);
            return {
              ticker,
              cotacao: {
                precoAtual: quote.regularMarketPrice,
                variacao: quote.regularMarketChange || 0,
                variacaoPercent: quote.regularMarketChangePercent || 0,
                volume: quote.regularMarketVolume || 0,
                nome: quote.shortName || quote.longName || ticker,
                dadosCompletos: quote
              }
            };
          }
        }
      } catch (error) {
        console.log(`📱❌ ${ticker} (${estrategia.nome}): ${error.message}`);
      }
      
      // Delay entre estratégias
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`📱⚠️ ${ticker}: Todas as estratégias falharam`);
    return { ticker, cotacao: null };
  };

  // Executar todas as buscas em paralelo (com limite)
  const BATCH_SIZE = 3; // Máximo 3 tickers por vez no mobile
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);
    console.log(`📱🔄 Lote mobile ${Math.floor(i/BATCH_SIZE) + 1}: ${batch.join(', ')}`);
    
    const resultados = await Promise.allSettled(
      batch.map(ticker => buscarCotacaoAtivo(ticker))
    );

    resultados.forEach((resultado) => {
      if (resultado.status === 'fulfilled' && resultado.value.cotacao) {
        cotacoesMap.set(resultado.value.ticker, resultado.value.cotacao);
      }
    });
    
    // Delay entre lotes no mobile
    if (i + BATCH_SIZE < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`📱📊 Mobile final: ${cotacoesMap.size} cotações obtidas de ${tickers.length} tickers`);
  return cotacoesMap;
}

// 🚀 HOOK ATUALIZADO PARA BUSCAR COTAÇÕES COM ESTRATÉGIA MOBILE/DESKTOP
function useProjetoAmericaIntegradas() {
  const { dados } = useDataStore();
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection(); // ✅ USAR DETECÇÃO DE MOBILE

  // 📊 OBTER DADOS DA CARTEIRA PROJETO AMÉRICA DO DATASTORE
  const projetoAmericaData = dados.projetoAmerica || [];

  const buscarCotacoesIntegradas = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔥 BUSCANDO COTAÇÕES INTEGRADAS PARA PROJETO AMÉRICA - ESTRATÉGIA MOBILE/DESKTOP');
      console.log('📱 Device Info:', { isMobile });
      console.log('📋 Ativos do DataStore:', projetoAmericaData);

      if (projetoAmericaData.length === 0) {
        console.log('⚠️ Nenhum ativo encontrado no DataStore');
        setAtivosAtualizados([]);
        setLoading(false);
        return;
      }

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = projetoAmericaData.map(ativo => ativo.ticker);
      console.log('🎯 Tickers para buscar:', tickers.join(', '));

      // 🔄 USAR FUNÇÃO ADAPTADA COM ESTRATÉGIAS MOBILE/DESKTOP
      const cotacoesMap = await buscarCotacoesProjetoAmericaParalelas(tickers, isMobile);

      console.log(`✅ Total processado: ${cotacoesMap.size} sucessos de ${tickers.length} tentativas`);

      // 🔥 COMBINAR DADOS DO DATASTORE COM COTAÇÕES REAIS E DY VIA API
      const ativosComCotacoes = await Promise.all(
        projetoAmericaData.map(async (ativo, index) => {
          const cotacao = cotacoesMap.get(ativo.ticker);
          
          console.log(`\n🔄 Processando ${ativo.ticker}:`);
          console.log(`💵 Preço entrada: US$ ${ativo.precoEntrada}`);
          console.log(`🎯 Preço teto: ${ativo.precoTeto}`);
          
          if (cotacao && cotacao.precoAtual > 0) {
            // 📊 PREÇO E PERFORMANCE REAIS
            const precoAtualNum = cotacao.precoAtual;
            const performance = ((precoAtualNum - ativo.precoEntrada) / ativo.precoEntrada) * 100;
            
            console.log(`💰 Preço atual: US$ ${precoAtualNum}`);
            console.log(`📈 Performance: ${performance.toFixed(2)}%`);
            
            // VALIDAR SE O PREÇO FAZ SENTIDO (para ações americanas, usar limite maior)
            const diferencaPercent = Math.abs(performance);
            if (diferencaPercent > 1000) {
              console.warn(`🚨 ${ativo.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
              return {
                ...ativo,
                id: String(ativo.id || index + 1),
                precoAtual: ativo.precoEntrada,
                performance: 0,
                variacao: 0,
                variacaoPercent: 0,
                volume: 0,
                vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
                dy: await buscarDY12MesesAPI(ativo.ticker, ativo.precoEntrada), // 🚀 USAR API
                statusApi: 'suspicious_price',
                nomeCompleto: cotacao.nome,
                rank: (index + 1) + '°'
              };
            }
            
            return {
              ...ativo,
              id: String(ativo.id || index + 1),
              precoAtual: precoAtualNum,
              performance: performance,
              variacao: cotacao.variacao,
              variacaoPercent: cotacao.variacaoPercent,
              volume: cotacao.volume,
              vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${precoAtualNum.toFixed(2)}`),
              dy: await buscarDY12MesesAPI(ativo.ticker, precoAtualNum), // 🚀 USAR API
              statusApi: 'success',
              nomeCompleto: cotacao.nome,
              rank: (index + 1) + '°'
            };
          } else {
            // ⚠️ FALLBACK PARA AÇÕES SEM COTAÇÃO
            console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida, usando preço de entrada`);
            
            return {
              ...ativo,
              id: String(ativo.id || index + 1),
              precoAtual: ativo.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
              dy: await buscarDY12MesesAPI(ativo.ticker, ativo.precoEntrada), // 🚀 USAR API
              statusApi: 'not_found',
              nomeCompleto: 'N/A',
              rank: (index + 1) + '°'
            };
          }
        })
      );

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = ativosComCotacoes.filter(a => a.statusApi === 'success').length;
      const suspeitos = ativosComCotacoes.filter(a => a.statusApi === 'suspicious_price').length;
      const naoEncontrados = ativosComCotacoes.filter(a => a.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS:');
      console.log(`✅ Sucessos: ${sucessos}/${ativosComCotacoes.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${ativosComCotacoes.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${ativosComCotacoes.length}`);

      setAtivosAtualizados(ativosComCotacoes);

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < ativosComCotacoes.length / 2) {
        setError(`Apenas ${sucessos} de ${ativosComCotacoes.length} ações com cotação válida`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} ações com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações:', err);
      
      // 🔄 FALLBACK: USAR DADOS DO DATASTORE SEM COTAÇÕES
      console.log('🔄 Usando fallback com dados do DataStore...');
      const ativosFallback = await Promise.all(
        projetoAmericaData.map(async (ativo, index) => ({
          ...ativo,
          id: String(ativo.id || index + 1),
          precoAtual: ativo.precoEntrada,
          performance: 0,
          variacao: 0,
          variacaoPercent: 0,
          volume: 0,
          vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
          dy: await buscarDY12MesesAPI(ativo.ticker, ativo.precoEntrada), // 🚀 USAR API MESMO NO FALLBACK
          statusApi: 'error',
          nomeCompleto: 'Erro',
          rank: (index + 1) + '°'
        }))
      );
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, [dados.projetoAmerica, isMobile]); // 🔥 DEPENDÊNCIA DOS DADOS DO DATASTORE E MOBILE

  // 🔄 EXECUTAR QUANDO OS DADOS DO DATASTORE MUDAREM
  React.useEffect(() => {
    console.log('🔄 EFFECT DISPARADO - DADOS DO DATASTORE MUDARAM');
    console.log('📊 ProjetoAmerica data length:', dados.projetoAmerica?.length || 0);
    
    buscarCotacoesIntegradas();
  }, [buscarCotacoesIntegradas]);

  // 🔄 FUNÇÃO PARA FORÇAR ATUALIZAÇÃO
  const refetch = React.useCallback(() => {
    console.log('🔄 FORÇANDO ATUALIZAÇÃO MANUAL...');
    buscarCotacoesIntegradas();
  }, [buscarCotacoesIntegradas]);

  return {
    ativosAtualizados,
    loading,
    error,
    refetch,
  };
}

export default function ProjetoAmericaPage() {
  const { dados } = useDataStore();
  const { ativosAtualizados, loading, refetch } = useProjetoAmericaIntegradas(); // ✅ USAR O HOOK ATUALIZADO
  const { indicesData } = useIndicesInternacionaisRealTime();
  const isMobile = useDeviceDetection(); // ✅ DETECÇÃO DE MOBILE

  // Valor por ativo para simulação
  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS DA CARTEIRA
  const calcularMetricas = () => {
    if (!ativosAtualizados || ativosAtualizados.length === 0) {
      return {
        valorInicial: 0,
        valorAtual: 0,
        rentabilidadeTotal: 0,
        quantidadeAtivos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        dyMedio: 0
      };
    }

    const valorInicialTotal = ativosAtualizados.length * valorPorAtivo;
    let valorFinalTotal = 0;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;

    ativosAtualizados.forEach((ativo) => {
      const valorFinal = valorPorAtivo * (1 + ativo.performance / 100);
      valorFinalTotal += valorFinal;

      if (ativo.performance > melhorPerformance) {
        melhorPerformance = ativo.performance;
        melhorAtivo = { ...ativo, performance: ativo.performance };
      }

      if (ativo.performance < piorPerformance) {
        piorPerformance = ativo.performance;
        piorAtivo = { ...ativo, performance: ativo.performance };
      }
    });

    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

    // Calcular DY médio
    const dyValues = ativosAtualizados
      .map(ativo => parseFloat(ativo.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    const dyMedio = dyValues.length > 0 ? 
      dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: ativosAtualizados.length,
      melhorAtivo,
      piorAtivo,
      dyMedio
    };
  };

  const metricas = calcularMetricas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(2) + '%';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '16px' : '24px' // ✅ PADDING RESPONSIVO
    }}>
      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', // ✅ TAMANHO RESPONSIVO
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Projeto América
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '16px' : '18px', // ✅ TAMANHO RESPONSIVO
          margin: '0',
          lineHeight: '1.5'
        }}>
          Investimentos estratégicos no mercado americano • Dados atualizados a cada 15 minutos.
        </p>
      </div>

      {/* Cards de Métricas Responsivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? 'repeat(auto-fit, minmax(140px, 1fr))'  // ✅ GRID RESPONSIVO
          : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '8px' : '12px', // ✅ GAP RESPONSIVO
        marginBottom: '32px'
      }}>
        {/* Performance Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px', // ✅ PADDING RESPONSIVO
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px', // ✅ FONTE RESPONSIVA
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Rentabilidade total
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px', // ✅ FONTE RESPONSIVA
            fontWeight: '700', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {loading ? '...' : formatPercentage(metricas.rentabilidadeTotal)}
          </div>
        </div>

        {/* Dividend Yield Médio */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            DY médio 12M
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {loading ? '...' : `${metricas.dyMedio.toFixed(1)}%`}
          </div>
        </div>

        {/* S&P 500 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            S&P 500
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {indicesData?.sp500?.valorFormatado || '5,970.80'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: indicesData?.sp500?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {indicesData?.sp500 ? formatPercentage(indicesData.sp500.variacaoPercent) : '+0.59%'}
          </div>
        </div>

        {/* NASDAQ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            NASDAQ 100
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {indicesData?.nasdaq?.valorFormatado || '19,400.00'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: indicesData?.nasdaq?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {indicesData?.nasdaq ? formatPercentage(indicesData.nasdaq.variacaoPercent) : '+0.81%'}
          </div>
        </div>
      </div>

      {/* Tabela de Ativos Responsiva */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
           Projeto América • Performance Individual
           {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e2e8f0',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            {loading ? 'Carregando...' : `${ativosAtualizados.length} ativos`}
          </p>
        </div>

        {/* Skeleton Loading */}
        {loading && ativosAtualizados.length === 0 ? (
          <div style={{ padding: isMobile ? '16px' : '24px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                height: isMobile ? '80px' : '60px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                marginBottom: '12px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : (
          <>
            {isMobile ? (
              // 📱 MOBILE: Cards verticais
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ativosAtualizados.map((ativo, index) => {
                  const temCotacaoReal = ativo.statusApi === 'success';
                  
                  return (
                    <div 
                      key={ativo.id || index}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => {
                        window.location.href = `/dashboard/ativo/${ativo.ticker}`;
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                    >
                      {/* Header do Card */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {/* Posição */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: '#64748b',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          {index + 1}
                        </div>

                        {/* Logo do Ativo */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          padding: '4px',
                          flexShrink: 0         // ✅ IMPEDIR QUE ENCOLHA
                        }}>
                          <img 
                            src={`https://financialmodelingprep.com/image-stock/${ativo.ticker}.png`}
                            alt={`Logo ${ativo.ticker}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              objectFit: 'cover',
                              borderRadius: '2px',
                              flexShrink: 0       // ✅ IMPEDIR QUE A IMAGEM ENCOLHA
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.backgroundColor = ativo.performance >= 0 ? '#dcfce7' : '#fee2e2';
                                parent.style.color = ativo.performance >= 0 ? '#065f46' : '#dc2626';
                                parent.style.fontWeight = '700';
                                parent.style.fontSize = '12px';
                                parent.style.letterSpacing = '0.5px';
                                parent.textContent = ativo.ticker.slice(0, 2).toUpperCase();
                              }
                            }}
                          />
                        </div>

                        {/* Nome e Setor */}
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            fontWeight: '700', 
                            color: '#1e293b', 
                            fontSize: '16px'
                          }}>
                            {ativo.ticker}
                            {!temCotacaoReal && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '10px', 
                                color: '#f59e0b',
                                backgroundColor: '#fef3c7',
                                padding: '2px 4px',
                                borderRadius: '3px'
                              }}>
                                SIM
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>
                            {ativo.setor}
                          </div>
                        </div>

                        {/* Viés */}
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                        }}>
                          {ativo.vies}
                        </div>
                      </div>
                      
                      {/* Dados em Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '8px', 
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ color: '#64748b' }}>
                          <span style={{ fontWeight: '500' }}>Entrada:</span><br />
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{ativo.dataEntrada}</span>
                        </div>
                        <div style={{ color: '#64748b' }}>
                          <span style={{ fontWeight: '500' }}>DY 12M:</span><br />
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {ativo.dy}
                          </span>
                        </div>
                        <div style={{ color: '#64748b' }}>
                          <span style={{ fontWeight: '500' }}>Preço Atual:</span><br />
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {formatCurrency(ativo.precoAtual)}
                          </span>
                        </div>
                        <div style={{ color: '#64748b' }}>
                          <span style={{ fontWeight: '500' }}>Preço Teto:</span><br />
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {ativo.precoTeto ? formatCurrency(ativo.precoTeto) : '-'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Performance em destaque */}
                      <div style={{
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Performance
                        </div>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '800',
                          color: ativo.performance >= 0 ? '#10b981' : '#ef4444'
                        }}>
                          {formatPercentage(ativo.performance)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // 🖥️ DESKTOP: Tabela completa
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px', width: '60px' }}>
                        RANK
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px', width: '200px' }}>
                        ATIVO
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        SETOR
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        ENTRADA
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        PREÇO INICIAL
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        PREÇO ATUAL
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        PREÇO TETO
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        PERFORMANCE
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        DY 12M
                      </th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        VIÉS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ativosAtualizados.map((ativo, index) => {
                      const temCotacaoReal = ativo.statusApi === 'success';
                      
                      return (
                        <tr 
                          key={ativo.id || index} 
                          style={{ 
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            window.location.href = `/dashboard/ativo/${ativo.ticker}`;
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              color: '#64748b',
                              margin: '0 auto'
                            }}>
                              {index + 1}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                padding: '6px',
                                flexShrink: 0         // ✅ IMPEDIR QUE ENCOLHA
                              }}>
                                <img 
                                  src={`https://financialmodelingprep.com/image-stock/${ativo.ticker}.png`}
                                  alt={`Logo ${ativo.ticker}`}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    objectFit: 'cover',
                                    borderRadius: '2px',
                                    flexShrink: 0       // ✅ IMPEDIR QUE A IMAGEM ENCOLHA
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.backgroundColor = ativo.performance >= 0 ? '#dcfce7' : '#fee2e2';
                                      parent.style.color = ativo.performance >= 0 ? '#065f46' : '#991b1b';
                                      parent.style.fontWeight = '700';
                                      parent.style.fontSize = '14px';
                                      parent.style.letterSpacing = '0.5px';
                                      parent.textContent = ativo.ticker.slice(0, 2).toUpperCase();
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <div style={{ 
                                  fontWeight: '700', 
                                  color: '#1e293b', 
                                  fontSize: '16px'
                                }}>
                                  {ativo.ticker}
                                  {!temCotacaoReal && (
                                    <span style={{ 
                                      marginLeft: '8px', 
                                      fontSize: '12px', 
                                      color: '#f59e0b',
                                      backgroundColor: '#fef3c7',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      SIM
                                    </span>
                                  )}
                                </div>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                  {ativo.nomeCompleto || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            {ativo.setor}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            {ativo.dataEntrada}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                            {formatCurrency(ativo.precoEntrada)}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: ativo.performance >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatCurrency(ativo.precoAtual)}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                            {ativo.precoTeto ? formatCurrency(ativo.precoTeto) : '-'}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            textAlign: 'center', 
                            fontWeight: '800',
                            fontSize: '16px',
                            color: ativo.performance >= 0 ? '#10b981' : '#ef4444'
                          }}>
                            {formatPercentage(ativo.performance)}
                          </td>
                          <td style={{ 
                            padding: '16px', 
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#1e293b'
                          }}>
                            {ativo.dy || '0,00%'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                              color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                            }}>
                              {ativo.vies}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Gráfico de Composição por Setor Responsivo */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
           Composição por Setor
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            Distribuição setorial da carteira • {ativosAtualizados.length} ativos
          </p>
        </div>

        <div style={{ 
          padding: isMobile ? '16px' : '32px', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', // ✅ DIREÇÃO RESPONSIVA
          gap: isMobile ? '16px' : '32px', 
          alignItems: 'center' 
        }}>
          {/* Gráfico SVG Responsivo */}
          <div style={{ 
            flex: isMobile ? '1' : '0 0 400px', 
            height: isMobile ? '300px' : '400px', // ✅ ALTURA RESPONSIVA
            position: 'relative' 
          }}>
            {(() => {
              // Agrupar por setor
              const setoresMap = new Map();
              ativosAtualizados.forEach(ativo => {
                const setor = ativo.setor || 'Outros';
                setoresMap.set(setor, (setoresMap.get(setor) || 0) + 1);
              });
              
              const setores = Array.from(setoresMap.entries()).map(([setor, quantidade]) => ({
                setor,
                quantidade,
                porcentagem: (quantidade / ativosAtualizados.length) * 100
              }));
              
              const cores = [
                '#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', 
                '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
                '#8b5cf6', '#6366f1', '#4f46e5', '#7c3aed', '#0891b2',
                '#65a30d', '#ea580c', '#db2777', '#0d9488', '#dc2626'
              ];
              
              const chartSize = isMobile ? 300 : 400; // ✅ TAMANHO RESPONSIVO
              const radius = isMobile ? 120 : 150; // ✅ RAIO RESPONSIVO
              const innerRadius = isMobile ? 60 : 75; // ✅ RAIO INTERNO RESPONSIVO
              const centerX = chartSize / 2;
              const centerY = chartSize / 2;
              const totalAngle = 2 * Math.PI;
              let currentAngle = -Math.PI / 2; // Começar no topo
              
              const createPath = (startAngle: number, endAngle: number) => {
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const x3 = centerX + innerRadius * Math.cos(endAngle);
                const y3 = centerY + innerRadius * Math.sin(endAngle);
                const x4 = centerX + innerRadius * Math.cos(startAngle);
                const y4 = centerY + innerRadius * Math.sin(startAngle);
                
                const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                
                return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
              };
              
              return (
                <svg 
                  width={chartSize} 
                  height={chartSize} 
                  viewBox={`0 0 ${chartSize} ${chartSize}`} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <defs>
                    <style>
                      {`
                        .slice-text {
                          opacity: 0;
                          transition: opacity 0.3s ease;
                          pointer-events: none;
                        }
                        .slice-group:hover .slice-text {
                          opacity: 1;
                        }
                        .slice-path {
                          transition: all 0.3s ease;
                          cursor: pointer;
                        }
                        .slice-group:hover .slice-path {
                          transform: scale(1.05);
                          transform-origin: ${centerX}px ${centerY}px;
                        }
                      `}
                    </style>
                  </defs>
                  
                  {setores.map((setor, index) => {
                    const sliceAngle = (setor.porcentagem / 100) * totalAngle;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + sliceAngle;
                    const cor = cores[index % cores.length];
                    const path = createPath(startAngle, endAngle);
                    
                    // Calcular posição do texto no meio da fatia
                    const middleAngle = (startAngle + endAngle) / 2;
                    const textRadius = (radius + innerRadius) / 2; // Meio da fatia
                    const textX = centerX + textRadius * Math.cos(middleAngle);
                    const textY = centerY + textRadius * Math.sin(middleAngle);
                    
                    currentAngle += sliceAngle;
                    
                    return (
                      <g key={setor.setor} className="slice-group">
                        <path
                          d={path}
                          fill={cor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="slice-path"
                        >
                          <title>{setor.setor}: {setor.porcentagem.toFixed(1)}% ({setor.quantidade} ativos)</title>
                        </path>
                        
                        {/* Textos que aparecem no hover */}
                        <g className="slice-text">
                          {/* Texto do setor */}
                          <text
                            x={textX}
                            y={textY - 6}
                            textAnchor="middle"
                            fontSize={isMobile ? "10" : "11"} // ✅ FONTE RESPONSIVA
                            fontWeight="700"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {setor.setor.length > 12 ? setor.setor.substring(0, 10) + '...' : setor.setor}
                          </text>
                          
                          {/* Texto da porcentagem */}
                          <text
                            x={textX}
                            y={textY + 8}
                            textAnchor="middle"
                            fontSize={isMobile ? "9" : "10"} // ✅ FONTE RESPONSIVA
                            fontWeight="600"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {setor.porcentagem.toFixed(1)}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  
                  {/* Círculo central */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerRadius}
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  
                  {/* Texto central */}
                  <text
                    x={centerX}
                    y={centerY - 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "14" : "16"} // ✅ FONTE RESPONSIVA
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {setores.length}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "10" : "12"} // ✅ FONTE RESPONSIVA
                    fill="#64748b"
                  >
                    SETORES
                  </text>
                </svg>
              );
            })()}
          </div>
          
          {/* Legenda Responsiva */}
          <div style={{ 
            flex: '1', 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? 'repeat(auto-fit, minmax(100px, 1fr))' // ✅ GRID RESPONSIVO
              : 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: isMobile ? '8px' : '12px' // ✅ GAP RESPONSIVO
          }}>
            {(() => {
              // Agrupar por setor para a legenda
              const setoresMap = new Map();
              ativosAtualizados.forEach(ativo => {
                const setor = ativo.setor || 'Outros';
                setoresMap.set(setor, (setoresMap.get(setor) || 0) + 1);
              });
              
              const setores = Array.from(setoresMap.entries()).map(([setor, quantidade]) => ({
                setor,
                quantidade,
                porcentagem: (quantidade / ativosAtualizados.length) * 100
              }));
              
              const cores = [
                '#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', 
                '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
                '#8b5cf6', '#6366f1', '#4f46e5', '#7c3aed', '#0891b2',
                '#65a30d', '#ea580c', '#db2777', '#0d9488', '#dc2626'
              ];
              
              return setores.map((setor, index) => {
                const cor = cores[index % cores.length];
                
                return (
                  <div key={setor.setor} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      backgroundColor: cor,
                      flexShrink: 0
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        fontSize: isMobile ? '12px' : '14px', // ✅ FONTE RESPONSIVA
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {setor.setor}
                      </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: isMobile ? '10px' : '12px', // ✅ FONTE RESPONSIVA
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {setor.porcentagem.toFixed(1)}% • {setor.quantidade} ativo{setor.quantidade > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Animações CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}