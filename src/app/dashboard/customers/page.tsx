/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useDataStore } from '@/hooks/useDataStore';

// 🚀 HOOK OTIMIZADO PARA SMLL - MAIS RÁPIDO
function useSmllRealTime() {
  const [smllData, setSmllData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarSmllReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 TIMEOUT REDUZIDO PARA MOBILE (2s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      try {
        const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
        const smal11Url = `https://brapi.dev/api/quote/SMAL11?token=${BRAPI_TOKEN}`;
        
        const brapiResponse = await fetch(smal11Url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (brapiResponse.ok) {
          const brapiData = await brapiResponse.json();
          
          if (brapiData.results?.[0]?.regularMarketPrice > 0) {
            const smal11Data = brapiData.results[0];
            const precoETF = smal11Data.regularMarketPrice;
            const fatorConversao = 20.6;
            const pontosIndice = Math.round(precoETF * fatorConversao);
            
            const dadosSmll = {
              valor: pontosIndice,
              valorFormatado: pontosIndice.toLocaleString('pt-BR'),
              variacao: (smal11Data.regularMarketChange || 0) * fatorConversao,
              variacaoPercent: smal11Data.regularMarketChangePercent || 0,
              trend: (smal11Data.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
              timestamp: new Date().toISOString(),
              fonte: 'BRAPI_SMAL11'
            };

            setSmllData(dadosSmll);
            return;
          }
        }
      } catch (error) {
        console.log('SMLL API falhou, usando fallback');
      }

      // 🔄 FALLBACK RÁPIDO
      const dadosFallback = {
        valor: 2204.90,
        valorFormatado: '2.205',
        variacao: -20.87,
        variacaoPercent: -0.94,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK'
      };
      
      setSmllData(dadosFallback);

    } catch (err) {
      setError('Erro ao carregar SMLL');
      setSmllData({
        valor: 2204.90,
        valorFormatado: '2.205',
        variacao: -20.87,
        variacaoPercent: -0.94,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'EMERGENCIA'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarSmllReal();
  }, [buscarSmllReal]);

  return { smllData, loading, error, refetch: buscarSmllReal };
}

// 🚀 HOOK OTIMIZADO PARA IBOVESPA - MAIS RÁPIDO
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIbovespaReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 TIMEOUT REDUZIDO (2s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;

      const response = await fetch(ibovUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.results?.[0]) {
          const ibovData = data.results[0];
          
          const dadosIbovespa = {
            valor: ibovData.regularMarketPrice,
            valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ibovData.regularMarketChange || 0,
            variacaoPercent: ibovData.regularMarketChangePercent || 0,
            trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI'
          };

          setIbovespaData(dadosIbovespa);
          return;
        }
      }

      throw new Error('API falhou');

    } catch (err) {
      setError('Erro ao carregar Ibovespa');
      
      // 🔄 FALLBACK RÁPIDO
      const fallbackData = {
        valor: 137213,
        valorFormatado: '137.213',
        variacao: -588.25,
        variacaoPercent: -0.43,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK'
      };
      setIbovespaData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIbovespaReal();
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🚀 FUNÇÃO OTIMIZADA PARA CALCULAR PROVENTOS - CACHE LOCAL
const calcularProventosAtivo = React.useMemo(() => {
  const cache = new Map<string, number>();
  
  return (ticker: string, dataEntrada: string): number => {
    const cacheKey = `${ticker}_${dataEntrada}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    try {
      if (typeof window === 'undefined') return 0;
      
      // 🎯 BUSCAR PROVENTOS (OTIMIZADO)
      let proventosData = localStorage.getItem(`proventos_${ticker}`);
      
      if (!proventosData) {
        const masterData = localStorage.getItem('proventos_central_master');
        if (masterData) {
          try {
            const todosProviventos = JSON.parse(masterData);
            const proventosTicker = todosProviventos.filter((p: any) => 
              p.ticker && p.ticker.toUpperCase() === ticker.toUpperCase()
            );
            
            if (proventosTicker.length > 0) {
              proventosData = JSON.stringify(proventosTicker);
            }
          } catch (error) {
            console.error('Erro ao processar master:', error);
          }
        }
      }
      
      if (!proventosData) {
        cache.set(cacheKey, 0);
        return 0;
      }
      
      const proventos = JSON.parse(proventosData);
      if (!Array.isArray(proventos) || proventos.length === 0) {
        cache.set(cacheKey, 0);
        return 0;
      }
      
      // 📅 CONVERTER DATA DE ENTRADA
      const [dia, mes, ano] = dataEntrada.split('/');
      const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
      
      // 🔍 FILTRAR E SOMAR PROVENTOS
      const totalProventos = proventos.reduce((total: number, provento: any) => {
        try {
          let dataProventoObj: Date;
          
          if (provento.dataPagamento) {
            if (provento.dataPagamento.includes('/')) {
              const [d, m, a] = provento.dataPagamento.split('/');
              dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d), 12, 0, 0);
            } else {
              dataProventoObj = new Date(provento.dataPagamento);
            }
          } else if (provento.data) {
            if (provento.data.includes('/')) {
              const [d, m, a] = provento.data.split('/');
              dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d), 12, 0, 0);
            } else {
              dataProventoObj = new Date(provento.data);
            }
          } else {
            return total;
          }
          
          if (isNaN(dataProventoObj.getTime()) || dataProventoObj < dataEntradaObj) {
            return total;
          }
          
          let valor = 0;
          if (typeof provento.valor === 'number') {
            valor = provento.valor;
          } else if (typeof provento.valor === 'string') {
            valor = parseFloat(
              provento.valor
                .toString()
                .replace('R$', '')
                .replace(/\s/g, '')
                .replace(',', '.')
            );
          }
          
          return total + (isNaN(valor) ? 0 : valor);
        } catch (error) {
          return total;
        }
      }, 0);
      
      cache.set(cacheKey, totalProventos);
      return totalProventos;
      
    } catch (error) {
      console.error(`Erro ao calcular proventos para ${ticker}:`, error);
      cache.set(cacheKey, 0);
      return 0;
    }
  };
}, []);

// 🔥 FUNÇÃO OTIMIZADA PARA CALCULAR VIÉS
const calcularViesAutomatico = (precoTeto: number | undefined, precoAtual: string): string => {
  if (!precoTeto || precoAtual === 'N/A') return 'Aguardar';
  
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  if (isNaN(precoAtualNum)) return 'Aguardar';
  
  return precoAtualNum < precoTeto ? 'Compra' : 'Aguardar';
};

// 🚀 HOOK MOBILE-FIRST SUPER OTIMIZADO
function useMicroCapsOptimized() {
  const { dados } = useDataStore();
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [screenWidth, setScreenWidth] = React.useState(0);

  // 🔥 DETECTAR DISPOSITIVO - OTIMIZADO
  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setScreenWidth(width);
      setIsMobile(mobile);
    };

    checkDevice();
    const debouncedResize = React.useMemo(
      () => {
        let timeoutId: NodeJS.Timeout;
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(checkDevice, 150);
        };
      },
      []
    );
    
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  const microCapsData = dados.microCaps || [];

  // 🚀 FUNÇÃO DE BUSCAR COTAÇÕES OTIMIZADA
  const buscarCotacoes = React.useCallback(async () => {
    if (microCapsData.length === 0) {
      setAtivosAtualizados([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const tickers = microCapsData.map(ativo => ativo.ticker);
      const cotacoesMap = new Map();
      const dyMap = new Map();
      
      // 🔥 ESTRATÉGIA OTIMIZADA PARA MOBILE
      if (isMobile) {
        console.log('📱 MOBILE: Processamento paralelo otimizado');
        
        // 📊 PROCESSAR EM LOTES PEQUENOS (5 por vez)
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < tickers.length; i += batchSize) {
          batches.push(tickers.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
          const promises = batch.map(async (ticker) => {
            try {
              // 🔥 TIMEOUT AGRESSIVO DE 1.5s POR TICKER
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 1500);
              
              const [cotacaoResponse, dyResponse] = await Promise.allSettled([
                fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                  },
                  signal: controller.signal
                }),
                fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                  },
                  signal: controller.signal
                })
              ]);
              
              clearTimeout(timeoutId);
              
              // 📊 PROCESSAR COTAÇÃO
              if (cotacaoResponse.status === 'fulfilled' && cotacaoResponse.value.ok) {
                const data = await cotacaoResponse.value.json();
                if (data.results?.[0]?.regularMarketPrice > 0) {
                  const quote = data.results[0];
                  cotacoesMap.set(ticker, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName || ticker
                  });
                }
              }
              
              // 📈 PROCESSAR DY
              if (dyResponse.status === 'fulfilled' && dyResponse.value.ok) {
                const dyData = await dyResponse.value.json();
                const dy = dyData.results?.[0]?.defaultKeyStatistics?.dividendYield;
                if (dy && dy > 0) {
                  dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
                }
              }
              
              if (!dyMap.has(ticker)) {
                dyMap.set(ticker, '0,00%');
              }
              
            } catch (error) {
              console.log(`❌ ${ticker}: ${error.message}`);
              dyMap.set(ticker, '0,00%');
            }
          });
          
          await Promise.allSettled(promises);
          
          // 🔥 DELAY MÍNIMO ENTRE LOTES
          if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
      } else {
        // 🖥️ DESKTOP: Requisição em lote (mais rápida)
        console.log('🖥️ DESKTOP: Requisição em lote');
        
        try {
          const [cotacaoResponse, dyResponse] = await Promise.allSettled([
            fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'MicroCaps-Desktop'
              }
            }),
            fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'MicroCaps-Desktop'
              }
            })
          ]);
          
          // Processar cotações
          if (cotacaoResponse.status === 'fulfilled' && cotacaoResponse.value.ok) {
            const data = await cotacaoResponse.value.json();
            data.results?.forEach((quote: any) => {
              if (quote.regularMarketPrice > 0) {
                cotacoesMap.set(quote.symbol, {
                  precoAtual: quote.regularMarketPrice,
                  variacao: quote.regularMarketChange || 0,
                  variacaoPercent: quote.regularMarketChangePercent || 0,
                  volume: quote.regularMarketVolume || 0,
                  nome: quote.shortName || quote.longName || quote.symbol
                });
              }
            });
          }
          
          // Processar DY
          if (dyResponse.status === 'fulfilled' && dyResponse.value.ok) {
            const dyData = await dyResponse.value.json();
            dyData.results?.forEach((result: any) => {
              const ticker = result.symbol;
              const dy = result.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
              } else {
                dyMap.set(ticker, '0,00%');
              }
            });
          }
          
        } catch (error) {
          console.log('🖥️❌ Erro na requisição em lote:', error);
        }
      }

      // 🔥 PROCESSAR DADOS FINAL - OTIMIZADO
      const ativosProcessados = microCapsData.map((ativo, index) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        const dyAPI = dyMap.get(ativo.ticker) || '0,00%';
        
        // 💰 CALCULAR PROVENTOS (COM CACHE)
        const proventosAtivo = calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
        
        if (cotacao) {
          const precoAtual = cotacao.precoAtual;
          const performanceAcao = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
          const performanceProventos = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) * 100 : 0;
          const performanceTotal = performanceAcao + performanceProventos;
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual,
            performance: performanceTotal,
            performanceAcao: performanceAcao,
            performanceProventos: performanceProventos,
            proventosAtivo: proventosAtivo,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomatico(ativo.precoTeto, `R$ ${precoAtual.toFixed(2).replace('.', ',')}`),
            dy: dyAPI,
            statusApi: 'success',
            nomeCompleto: cotacao.nome,
            rank: `${index + 1}°`
          };
        } else {
          const performanceProventos = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) * 100 : 0;
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual: ativo.precoEntrada,
            performance: performanceProventos,
            performanceAcao: 0,
            performanceProventos: performanceProventos,
            proventosAtivo: proventosAtivo,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, `R$ ${ativo.precoEntrada.toFixed(2).replace('.', ',')}`),
            dy: dyAPI,
            statusApi: 'fallback',
            nomeCompleto: ativo.ticker,
            rank: `${index + 1}°`
          };
        }
      });

      setAtivosAtualizados(ativosProcessados);
      
      const sucessos = cotacoesMap.size;
      if (sucessos === 0) {
        setError('Nenhuma cotação obtida');
      } else if (sucessos < tickers.length / 2) {
        setError(`Apenas ${sucessos} de ${tickers.length} cotações obtidas`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral:', err);
      
      // 🔄 FALLBACK RÁPIDO
      const ativosFallback = microCapsData.map((ativo, index) => {
        const proventosAtivo = calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
        const performanceProventos = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) * 100 : 0;
        
        return {
          ...ativo,
          id: String(ativo.id || index + 1),
          precoAtual: ativo.precoEntrada,
          performance: performanceProventos,
          performanceAcao: 0,
          performanceProventos: performanceProventos,
          proventosAtivo: proventosAtivo,
          variacao: 0,
          variacaoPercent: 0,
          volume: 0,
          vies: calcularViesAutomatico(ativo.precoTeto, `R$ ${ativo.precoEntrada.toFixed(2).replace('.', ',')}`),
          dy: '0,00%',
          statusApi: 'fallback',
          nomeCompleto: ativo.ticker,
          rank: `${index + 1}°`
        };
      });
      
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, [microCapsData, isMobile]);

  // 🔥 EFFECT OTIMIZADO - SÓ EXECUTA QUANDO NECESSÁRIO
  React.useEffect(() => {
    if (microCapsData.length > 0) {
      // 🚀 DELAY MÍNIMO NO MOBILE PARA GARANTIR RENDER
      const delay = isMobile ? 200 : 0;
      const timer = setTimeout(() => {
        buscarCotacoes();
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [buscarCotacoes]);

  return {
    ativosAtualizados,
    loading,
    error,
    refetch: buscarCotacoes,
    isMobile,
    screenWidth
  };
}

// 🔥 COMPONENTE PRINCIPAL OTIMIZADO
export default function MicroCapsPage() {
  const { dados } = useDataStore();
  const { ativosAtualizados, loading, error, refetch, isMobile, screenWidth } = useMicroCapsOptimized();
  const { smllData } = useSmllRealTime();
  const { ibovespaData } = useIbovespaRealTime();

  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS - OTIMIZADO COM USEMEMO
  const metricas = React.useMemo(() => {
    if (!ativosAtualizados || ativosAtualizados.length === 0) {
      return {
        valorInicial: 0,
        valorAtual: 0,
        rentabilidadeTotal: 0,
        quantidadeAtivos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        dyMedio: 0,
        ativosPositivos: 0,
        ativosNegativos: 0
      };
    }

    const valorInicialTotal = ativosAtualizados.length * valorPorAtivo;
    let valorFinalTotal = 0;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;
    let ativosPositivos = 0;
    let ativosNegativos = 0;
    let dyValues: number[] = [];

    ativosAtualizados.forEach((ativo) => {
      const valorFinal = valorPorAtivo * (1 + ativo.performance / 100);
      valorFinalTotal += valorFinal;

      if (ativo.performance > 0) ativosPositivos++;
      if (ativo.performance < 0) ativosNegativos++;

      if (ativo.performance > melhorPerformance) {
        melhorPerformance = ativo.performance;
        melhorAtivo = { ...ativo, performance: ativo.performance };
      }

      if (ativo.performance < piorPerformance) {
        piorPerformance = ativo.performance;
        piorAtivo = { ...ativo, performance: ativo.performance };
      }
      
      // DY
      const dy = parseFloat(ativo.dy.replace('%', '').replace(',', '.'));
      if (!isNaN(dy) && dy > 0) {
        dyValues.push(dy);
      }
    });

    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

    const dyMedio = dyValues.length > 0 ? 
      dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: ativosAtualizados.length,
      melhorAtivo,
      piorAtivo,
      dyMedio,
      ativosPositivos,
      ativosNegativos
    };
  }, [ativosAtualizados, valorPorAtivo]);

  // 🔥 FUNÇÕES DE FORMATAÇÃO - OTIMIZADAS
  const formatCurrency = React.useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  }, []);

  const formatPercentage = React.useCallback((value: number) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(2) + '%';
  }, []);

  const handleRefresh = React.useCallback(() => {
    console.log('🔄 Refresh manual');
    refetch();
  }, [refetch]);

  // 🔥 LOADING OTIMIZADO
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: isMobile ? '32px' : '48px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h3 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Carregando Micro Caps
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '13px' : '14px',
            margin: '0'
          }}>
            📱 {isMobile ? 'Mobile' : 'Desktop'} • Otimizado para velocidade
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '12px' : '24px' 
    }}>
      {/* 🔥 CSS ANIMATIONS - OTIMIZADO */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }
        
        @media (max-width: 768px) {
          .card-hover:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Header Otimizado */}
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }} className="fade-in">
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: 1.2
        }}>
          Micro Caps
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '16px'
        }}>
          <p style={{ 
            color: '#64748b', 
            fontSize: isMobile ? '14px' : '18px',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {metricas.quantidadeAtivos} ativos • 📱 {isMobile ? 'Mobile' : 'Desktop'} • Otimizado
          </p>
          
          <button
            onClick={handleRefresh}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: isMobile ? '10px 18px' : '12px 24px',
              fontSize: isMobile ? '13px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            className="card-hover"
          >
            🔄 Atualizar
          </button>
        </div>
        
        {error && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#991b1b'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Cards de Métricas Otimizados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: isMobile ? '10px' : '16px',
        marginBottom: isMobile ? '20px' : '32px'
      }} className="fade-in">
        
        {/* Performance Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            Rentabilidade
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
            fontWeight: '700', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {formatPercentage(metricas.rentabilidadeTotal)}
          </div>
        </div>

        {/* DY Médio */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            DY médio
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {metricas.dyMedio.toFixed(1)}%
          </div>
        </div>

        {/* SMLL */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            SMLL
          </div>
          <div style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '3px'
          }}>
            {smllData?.valorFormatado || '2.205'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: smllData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {smllData ? formatPercentage(smllData.variacaoPercent) : '-0.9%'}
          </div>
        </div>

        {/* Ibovespa */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            Ibovespa
          </div>
          <div style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '3px'
          }}>
            {ibovespaData?.valorFormatado || '137.213'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: ibovespaData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {ibovespaData ? formatPercentage(ibovespaData.variacaoPercent) : '-0.4%'}
          </div>
        </div>

        {/* No Verde */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            No Verde
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
            fontWeight: '700', 
            color: '#10b981',
            lineHeight: '1'
          }}>
            {metricas.ativosPositivos}
          </div>
        </div>

        {/* No Vermelho */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '14px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            No Vermelho
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
            fontWeight: '700', 
            color: '#ef4444',
            lineHeight: '1'
          }}>
            {metricas.ativosNegativos}
          </div>
        </div>
      </div>

      {/* Lista de Ativos Otimizada */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }} className="fade-in">
        
        {/* Header */}
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 6px 0'
          }}>
            Performance Individual
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '13px' : '16px',
            margin: '0'
          }}>
            {ativosAtualizados.length} ativos • {isMobile ? 'Mobile' : 'Desktop'} • Otimizado
          </p>
        </div>

        {/* Lista Mobile Otimizada */}
        {isMobile ? (
          <div style={{ padding: '12px' }}>
            {ativosAtualizados.map((ativo, index) => (
              <div
                key={ativo.id || index}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '10px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                className="card-hover"
              >
                {/* Header do Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
                    color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {ativo.ticker.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {ativo.ticker}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {ativo.setor}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: ativo.performance >= 0 ? '#10b981' : '#ef4444',
                    textAlign: 'right'
                  }}>
                    {formatPercentage(ativo.performance)}
                  </div>
                </div>

                {/* Dados do Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '13px'
                }}>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '3px' }}>Entrada</div>
                    <div style={{ fontWeight: '600' }}>{ativo.dataEntrada}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '3px' }}>Preço</div>
                    <div style={{ fontWeight: '600' }}>{formatCurrency(ativo.precoAtual)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '3px' }}>DY</div>
                    <div style={{ fontWeight: '600' }}>{ativo.dy}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '3px' }}>Viés</div>
                    <span style={{
                      padding: '3px 6px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                      color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                    }}>
                      {ativo.vies}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table Otimizada
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    ATIVO
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    ENTRADA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PREÇO
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PERFORMANCE
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    DY
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    VIÉS
                  </th>
                </tr>
              </thead>
              <tbody>
                {ativosAtualizados.map((ativo, index) => (
                  <tr 
                    key={ativo.id || index} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
                          color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {ativo.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: '700', 
                            color: '#1e293b', 
                            fontSize: '16px'
                          }}>
                            {ativo.ticker}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '14px' }}>
                            {ativo.setor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      {ativo.dataEntrada}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: ativo.performance >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(ativo.precoAtual)}
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
                      {ativo.dy}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info Otimizado */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <div>📱 {isMobile ? 'Mobile' : 'Desktop'} • {screenWidth}px • {ativosAtualizados.length} ativos • Otimizado para velocidade</div>
      </div>
    </div>
  );
}