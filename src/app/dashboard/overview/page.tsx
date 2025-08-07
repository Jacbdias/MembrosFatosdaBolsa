/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useDataStore } from '@/hooks/useDataStore';
import { useProventosPorAtivo } from '@/hooks/useProventosPorAtivo';

// 🚀 CACHE GLOBAL PARA EVITAR REQUESTS DESNECESSÁRIOS
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos
const globalCache = new Map<string, { data: any; timestamp: number }>();

const getCachedData = (key: string) => {
  const cached = globalCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  globalCache.set(key, { data, timestamp: Date.now() });
};

// 🔥 DETECÇÃO DE DISPOSITIVO SIMPLIFICADA E OTIMIZADA
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

// 🚀 HOOK OTIMIZADO PARA BUSCAR DADOS REAIS DO SMLL
function useSmllRealTime() {
  const [smllData, setSmllData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarSmllReal = React.useCallback(async () => {
    const cacheKey = 'smll_data';
    const cached = getCachedData(cacheKey);
    if (cached) {
      setSmllData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const smal11Url = `https://brapi.dev/api/quote/SMAL11?token=${BRAPI_TOKEN}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // Timeout reduzido

      const response = await fetch(smal11Url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': isMobile 
            ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            : 'SMLL-Real-Time-App'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.results?.[0]?.regularMarketPrice > 0) {
          const smal11Data = data.results[0];
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
            fonte: isMobile ? 'BRAPI_MOBILE' : 'BRAPI_DESKTOP'
          };

          setCachedData(cacheKey, dadosSmll);
          setSmllData(dadosSmll);
          return;
        }
      }

      throw new Error('API response invalid');

    } catch (err) {
      console.log('SMLL: Usando fallback');
      
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
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    buscarSmllReal();
    const interval = setInterval(buscarSmllReal, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarSmllReal]);

  return { smllData, loading, error, refetch: buscarSmllReal };
}

// 🚀 HOOK OTIMIZADO PARA BUSCAR IBOVESPA
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarIbovespaReal = React.useCallback(async () => {
    const cacheKey = 'ibovespa_data';
    const cached = getCachedData(cacheKey);
    if (cached) {
      setIbovespaData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // Timeout reduzido

      const response = await fetch(ibovUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': isMobile 
            ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            : 'Ibovespa-Real-Time-App'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.results?.[0]?.regularMarketPrice > 0) {
          const ibovData = data.results[0];
          
          const dadosIbovespa = {
            valor: ibovData.regularMarketPrice,
            valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ibovData.regularMarketChange || 0,
            variacaoPercent: ibovData.regularMarketChangePercent || 0,
            trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: isMobile ? 'BRAPI_MOBILE' : 'BRAPI_DESKTOP'
          };

          setCachedData(cacheKey, dadosIbovespa);
          setIbovespaData(dadosIbovespa);
          return;
        }
      }

      throw new Error('API response invalid');

    } catch (err) {
      console.log('IBOV: Usando fallback');
      
      const fallbackData = {
        valor: 134500,
        valorFormatado: '134.500',
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
  }, [isMobile]);

  React.useEffect(() => {
    buscarIbovespaReal();
    const interval = setInterval(buscarIbovespaReal, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🚀 HOOK CORRIGIDO PARA IBOVESPA NO PERÍODO
function useIbovespaPeriodo(ativosAtualizados: any[]) {
  const [ibovespaPeriodo, setIbovespaPeriodo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const isMobile = useDeviceDetection();

  React.useEffect(() => {
    const calcularIbovespaPeriodo = async () => {
      if (!ativosAtualizados || ativosAtualizados.length === 0) return;

      // ❌ REMOVER CACHE PARA DEPURAR
      // const cacheKey = 'ibovespa_periodo';
      // const cached = getCachedData(cacheKey);
      // if (cached) {
      //   setIbovespaPeriodo(cached);
      //   return;
      // }

      try {
        setLoading(true);

        // 📅 ENCONTRAR A DATA MAIS ANTIGA DA CARTEIRA (CORRIGIDO)
        let dataMaisAntiga = new Date('2030-01-01'); // Começar com data futura
        ativosAtualizados.forEach(ativo => {
          if (ativo.dataEntrada && !ativo.posicaoEncerrada) { // ✅ SÓ ATIVOS ATIVOS
            const [dia, mes, ano] = ativo.dataEntrada.split('/');
            const dataAtivo = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            
            console.log(`📅 ${ativo.ticker}: ${ativo.dataEntrada} = ${dataAtivo.toLocaleDateString('pt-BR')}`);
            
            if (dataAtivo < dataMaisAntiga) {
              dataMaisAntiga = dataAtivo;
              console.log(`📅 Nova data mais antiga: ${dataMaisAntiga.toLocaleDateString('pt-BR')} (${ativo.ticker})`);
            }
          }
        });

        // ✅ VERIFICAÇÃO DE SEGURANÇA
        if (dataMaisAntiga.getFullYear() > 2025) {
          console.log('❌ Nenhuma data válida encontrada, usando fallback');
          dataMaisAntiga = new Date(2020, 2, 23); // 23/03/2020 (crash COVID)
        }

        console.log('📅 Data mais antiga FINAL da carteira:', dataMaisAntiga.toLocaleDateString('pt-BR'));

        const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
        let ibovAtual = 134500;
        
        // 📊 BUSCAR IBOVESPA ATUAL
        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': isMobile 
                ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                : 'SmallCaps-Ibov-Current'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            ibovAtual = data.results?.[0]?.regularMarketPrice || 134500;
            console.log('📊 Ibovespa atual obtido:', ibovAtual.toLocaleString('pt-BR'));
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar Ibovespa atual, usando fallback:', ibovAtual.toLocaleString('pt-BR'));
        }

        // 📊 VALORES HISTÓRICOS MAIS PRECISOS
        const anoInicial = dataMaisAntiga.getFullYear();
        const mesInicial = dataMaisAntiga.getMonth(); // 0-11
        
        const valoresHistoricos: { [key: string]: number } = {
          // 2020 - VALORES BASEADOS NO CRASH REAL DO COVID
          '2020-0': 115000,  // Jan 2020
          '2020-1': 110000,  // Fev 2020
          '2020-2': 63500,   // Mar 2020: CRASH COVID - mínima histórica real
          '2020-3': 73000,   // Abr 2020
          '2020-4': 78000,   // Mai 2020
          '2020-5': 93000,   // Jun 2020
          '2020-6': 100000,  // Jul 2020
          '2020-7': 105000,  // Ago 2020
          '2020-8': 103000,  // Set 2020
          '2020-9': 97000,   // Out 2020
          '2020-10': 103000, // Nov 2020 ← AQUI ESTAVA O ERRO!
          '2020-11': 118000, // Dez 2020
          
          // 2021 - ANO DE ALTA VOLATILIDADE
          '2021-0': 119000,  // Jan 2021 ← CORRIGIDO TAMBÉM
          '2021-1': 116000,  // Fev 2021
          '2021-2': 112000,  // Mar 2021
          '2021-3': 118000,  // Abr 2021
          '2021-4': 125000,  // Mai 2021
          '2021-5': 127000,  // Jun 2021: pico histórico
          '2021-6': 125000,  // Jul 2021
          '2021-7': 120000,  // Ago 2021
          '2021-8': 115000,  // Set 2021
          '2021-9': 108000,  // Out 2021
          '2021-10': 103000, // Nov 2021
          '2021-11': 105000, // Dez 2021
          
          // 2022 - CORREÇÃO E VOLATILIDADE
          '2022-0': 110000,  // Jan 2022
          '2022-1': 114000,  // Fev 2022
          '2022-2': 118000,  // Mar 2022
          '2022-3': 116000,  // Abr 2022
          '2022-4': 112000,  // Mai 2022
          '2022-5': 103000,  // Jun 2022
          '2022-6': 100000,  // Jul 2022: mínimo do ano
          '2022-7': 112000,  // Ago 2022
          '2022-8': 115000,  // Set 2022
          '2022-9': 116000,  // Out 2022
          '2022-10': 118000, // Nov 2022
          '2022-11': 109000, // Dez 2022
          
          // 2023 - RECUPERAÇÃO PARCIAL
          '2023-0': 109000,  // Jan 2023
          '2023-1': 112000,  // Fev 2023
          '2023-2': 108000,  // Mar 2023
          '2023-3': 112000,  // Abr 2023
          '2023-4': 116000,  // Mai 2023
          '2023-5': 121000,  // Jun 2023
          '2023-6': 125000,  // Jul 2023
          '2023-7': 122000,  // Ago 2023
          '2023-8': 118000,  // Set 2023
          '2023-9': 115000,  // Out 2023
          '2023-10': 125000, // Nov 2023
          '2023-11': 133000, // Dez 2023
          
          // 2024 - QUEDA SIGNIFICATIVA
          '2024-0': 134000,  // Jan 2024
          '2024-1': 132000,  // Fev 2024
          '2024-2': 130000,  // Mar 2024
          '2024-3': 128000,  // Abr 2024
          '2024-4': 126000,  // Mai 2024
          '2024-5': 123000,  // Jun 2024
          '2024-6': 128000,  // Jul 2024
          '2024-7': 133000,  // Ago 2024
          '2024-8': 135000,  // Set 2024
          '2024-9': 132000,  // Out 2024
          '2024-10': 130000, // Nov 2024
          '2024-11': 119000, // Dez 2024
          
          // 2025
          '2025-0': 119000,  // Jan 2025
          '2025-1': 122000,  // Fev 2025
          '2025-2': 128000,  // Mar 2025
          '2025-3': 132000,  // Abr 2025
          '2025-4': 134000,  // Mai 2025
          '2025-5': 136000,  // Jun 2025
          '2025-6': 134500,  // Jul 2025
          '2025-7': 134500   // Ago 2025: atual
        };
        
        // 🎯 BUSCAR VALOR HISTÓRICO MAIS ESPECÍFICO
        const chaveEspecifica = `${anoInicial}-${mesInicial}`;
        const ibovInicial = valoresHistoricos[chaveEspecifica] || 
                           valoresHistoricos[`${anoInicial}-0`] || 85000;
        
        console.log(`📊 Ibovespa inicial (${chaveEspecifica}):`, ibovInicial.toLocaleString('pt-BR'));
        console.log(`📊 Ibovespa atual:`, ibovAtual.toLocaleString('pt-BR'));

        // 🧮 CALCULAR PERFORMANCE NO PERÍODO
        const performancePeriodo = ((ibovAtual - ibovInicial) / ibovInicial) * 100;
        
        console.log(`📊 Performance Ibovespa no período: ${performancePeriodo.toFixed(2)}%`);
        
        // 📅 FORMATAR PERÍODO
        const mesInicial_formatado = dataMaisAntiga.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        const resultado = {
          performancePeriodo,
          dataInicial: mesInicial_formatado,
          ibovInicial,
          ibovAtual,
          anoInicial: dataMaisAntiga.getFullYear(),
          diasNoPeriodo: Math.floor((Date.now() - dataMaisAntiga.getTime()) / (1000 * 60 * 60 * 24)),
          dataEntradaCompleta: dataMaisAntiga.toLocaleDateString('pt-BR')
        };

        console.log('📊 Resultado FINAL Ibovespa período:', {
          periodo: `desde ${mesInicial_formatado}`,
          inicial: ibovInicial.toLocaleString('pt-BR'),
          atual: ibovAtual.toLocaleString('pt-BR'),
          performance: performancePeriodo.toFixed(2) + '%'
        });

        // setCachedData(cacheKey, resultado); ← CACHE DESABILITADO TEMPORARIAMENTE
        setIbovespaPeriodo(resultado);

      } catch (error) {
        console.error('❌ Erro ao calcular Ibovespa período:', error);
        
        // Fallback mais conservador
        const fallback = {
          performancePeriodo: 0,
          dataInicial: 'jan/2021',
          ibovInicial: 119000,
          ibovAtual: 134500,
          anoInicial: 2021,
          diasNoPeriodo: Math.floor((Date.now() - new Date(2021, 0, 15).getTime()) / (1000 * 60 * 60 * 24)),
          dataEntradaCompleta: '15/01/2021'
        };
        
        setIbovespaPeriodo(fallback);
      } finally {
        setLoading(false);
      }
    };

    calcularIbovespaPeriodo();
  }, [ativosAtualizados, isMobile]);

  return { ibovespaPeriodo, loading };
}

// 🔥 FUNÇÃO OTIMIZADA PARA CALCULAR VIÉS
function calcularViesAutomatico(precoTeto: number | undefined, precoAtual: string): string {
  if (!precoTeto || precoAtual === 'N/A') return 'Aguardar';
  
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  if (isNaN(precoAtualNum)) return 'Aguardar';
  
  return precoAtualNum < precoTeto ? 'Compra' : 'Aguardar';
}

// 🚀 FUNÇÃO OTIMIZADA PARA BUSCAR COTAÇÕES EM PARALELO
async function buscarCotacoesParalelas(tickers: string[], isMobile: boolean): Promise<Map<string, any>> {
  const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
  const cotacoesMap = new Map();
  
  if (!isMobile) {
    // Desktop: busca em lote (mais eficiente)
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SmallCaps-Desktop-Optimized'
        }
      });

      if (response.ok) {
        const data = await response.json();
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
          }
        });
      }
    } catch (error) {
      console.log('Erro na busca em lote desktop:', error);
    }
    
    return cotacoesMap;
  }

  // Mobile: busca em paralelo (máximo 2 tentativas por ativo)
  const buscarCotacaoAtivo = async (ticker: string) => {
    const tentativas = [
      // Tentativa 1: User-Agent Desktop
      fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }),
      // Tentativa 2: Sem User-Agent
      fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
    ];

    for (const tentativa of tentativas) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000); // Timeout reduzido
        
        const response = await Promise.race([
          tentativa,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as Response;

        if (response.ok) {
          const data = await response.json();
          if (data.results?.[0]?.regularMarketPrice > 0) {
            const quote = data.results[0];
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
        // Continua para próxima tentativa
      }
    }
    
    return { ticker, cotacao: null };
  };

  // Executar todas as buscas em paralelo
  const resultados = await Promise.allSettled(
    tickers.map(ticker => buscarCotacaoAtivo(ticker))
  );

  // Processar resultados
  resultados.forEach((resultado) => {
    if (resultado.status === 'fulfilled' && resultado.value.cotacao) {
      cotacoesMap.set(resultado.value.ticker, resultado.value.cotacao);
    }
  });

  return cotacoesMap;
}

// 🚀 FUNÇÃO OTIMIZADA PARA BUSCAR DY EM PARALELO
async function buscarDYParalelo(tickers: string[], isMobile: boolean): Promise<Map<string, string>> {
  const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
  const dyMap = new Map<string, string>();
  
  if (!isMobile) {
    // Desktop: busca em lote
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch(
        `https://brapi.dev/api/quote/${tickers.join(',')}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SmallCaps-DY-Batch-Optimized'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        data.results?.forEach((result: any) => {
          const ticker = result.symbol;
          const dy = result.defaultKeyStatistics?.dividendYield;
          dyMap.set(ticker, dy && dy > 0 ? `${dy.toFixed(2).replace('.', ',')}%` : '0,00%');
        });
      }
    } catch (error) {
      tickers.forEach(ticker => dyMap.set(ticker, '0,00%'));
    }
    
    return dyMap;
  }

  // Mobile: busca em paralelo simplificada
  const buscarDYAtivo = async (ticker: string) => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2500);
      
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
        return { ticker, dy: dy && dy > 0 ? `${dy.toFixed(2).replace('.', ',')}%` : '0,00%' };
      }
    } catch (error) {
      // Falha silenciosa
    }
    
    return { ticker, dy: '0,00%' };
  };

  // Executar buscas em paralelo
  const resultados = await Promise.allSettled(
    tickers.map(ticker => buscarDYAtivo(ticker))
  );

  // Processar resultados
  resultados.forEach((resultado) => {
    if (resultado.status === 'fulfilled') {
      dyMap.set(resultado.value.ticker, resultado.value.dy);
    }
  });

  return dyMap;
}

// 🚀 HOOK PRINCIPAL OTIMIZADO COM LOADING STATES GRANULARES
function useSmallCapsIntegradas() {
  const { dados } = useDataStore();
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [cotacoesAtualizadas, setCotacoesAtualizadas] = React.useState<any>({});
  
  // Estados para garantir que TODOS os dados estejam prontos
  const [cotacoesCompletas, setCotacoesCompletas] = React.useState<Map<string, any>>(new Map());
  const [dyCompletos, setDyCompletos] = React.useState<Map<string, string>>(new Map());
  const [proventosCompletos, setProventosCompletos] = React.useState<Map<string, number>>(new Map());
  const [todosOsDadosProntos, setTodosOsDadosProntos] = React.useState(false);
  
  // Loading states granulares
  const [loadingCotacoes, setLoadingCotacoes] = React.useState(true);
  const [loadingDY, setLoadingDY] = React.useState(false);
  const [loadingProventos, setLoadingProventos] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isMobile = useDeviceDetection();
  const [proventosMap, setProventosMap] = React.useState<Map<string, number>>(new Map());
  const smallCapsData = dados.smallCaps || [];

  // Função otimizada para buscar proventos
  const buscarProventosAtivos = React.useCallback(async (ativosData: any[]) => {
    setLoadingProventos(true);
    const novosProventos = new Map<string, number>();
    
    console.log('💰 Iniciando busca de proventos para', ativosData.length, 'ativos');
    
    const buscarProventoAtivo = async (ativo: any) => {
      try {
        const [dia, mes, ano] = ativo.dataEntrada.split('/');
        const dataEntradaISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        
        console.log(`💰 Buscando proventos para ${ativo.ticker} desde ${ativo.dataEntrada}`);
        
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`/api/proventos/${ativo.ticker}`, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const proventosRaw = await response.json();
          
          if (Array.isArray(proventosRaw)) {
            const dataEntradaDate = new Date(dataEntradaISO + 'T00:00:00');
            const proventosFiltrados = proventosRaw.filter((p: any) => {
              if (!p.dataObj) return false;
              const dataProvento = new Date(p.dataObj);
              return dataProvento >= dataEntradaDate;
            });
            
            const total = proventosFiltrados.reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
            console.log(`💰 ${ativo.ticker}: R$ ${total.toFixed(2)} (${proventosFiltrados.length} proventos)`);
            return { ticker: ativo.ticker, valor: total };
          }
        } else {
          console.log(`💰 ${ativo.ticker}: Erro HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`💰 ${ativo.ticker}: Erro -`, error.message);
      }
      
      return { ticker: ativo.ticker, valor: 0 };
    };

    // Buscar proventos em paralelo
    const resultados = await Promise.allSettled(
      ativosData.map(ativo => buscarProventoAtivo(ativo))
    );

    resultados.forEach((resultado) => {
      if (resultado.status === 'fulfilled') {
        novosProventos.set(resultado.value.ticker, resultado.value.valor);
      }
    });
    
    console.log('💰 Proventos finais:', Object.fromEntries(novosProventos));
    setProventosMap(novosProventos);
    setLoadingProventos(false);
    return novosProventos;
  }, []);

  // 🎯 FUNÇÃO PRINCIPAL REESCRITA - ABORDAGEM STEP-BY-STEP ROBUSTA
  const buscarDadosCompletos = React.useCallback(async () => {
    if (smallCapsData.length === 0) {
      setAtivosAtualizados([]);
      setLoadingCotacoes(false);
      return;
    }

    try {
      setError(null);
      setTodosOsDadosProntos(false);
      const tickers = smallCapsData.map(ativo => ativo.ticker);
      
      console.log('🚀 INICIANDO BUSCA STEP-BY-STEP ROBUSTA...');
      
      // 🔄 RESET DOS ESTADOS
      setCotacoesCompletas(new Map());
      setDyCompletos(new Map());
      setProventosCompletos(new Map());

      // 📊 ETAPA 1: COTAÇÕES
      console.log('📊 ETAPA 1: Buscando cotações...');
      setLoadingCotacoes(true);
      
      const cotacoesMap = await buscarCotacoesParalelas(tickers, isMobile);
      console.log('📊 Cotações obtidas:', cotacoesMap.size, 'de', tickers.length);
      
      setCotacoesCompletas(cotacoesMap);
      setLoadingCotacoes(false);

      // 📈 ETAPA 2: DY
      console.log('📈 ETAPA 2: Buscando DY...');
      setLoadingDY(true);
      
      const dyMap = await buscarDYParalelo(tickers, isMobile);
      console.log('📈 DY obtidos:', dyMap.size, 'de', tickers.length);
      
      setDyCompletos(dyMap);
      setLoadingDY(false);

      // 💰 ETAPA 3: PROVENTOS
      console.log('💰 ETAPA 3: Buscando proventos...');
      setLoadingProventos(true);
      
      const proventosData = await buscarProventosAtivos(smallCapsData);
      console.log('💰 Proventos obtidos:', proventosData.size, 'de', smallCapsData.length);
      
      setProventosCompletos(proventosData);
      setLoadingProventos(false);

      // ✅ MARCAR COMO TODOS PRONTOS
      console.log('✅ TODOS OS DADOS COLETADOS - MARCANDO COMO PRONTOS');
      setTodosOsDadosProntos(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar dados:', err);
      
      setLoadingCotacoes(false);
      setLoadingDY(false);
      setLoadingProventos(false);
    }
  }, [smallCapsData, isMobile, buscarProventosAtivos]);

  // 🏆 USEEFFECT QUE SÓ EXECUTA QUANDO TODOS OS DADOS ESTÃO PRONTOS
  React.useEffect(() => {
    if (!todosOsDadosProntos || smallCapsData.length === 0) return;
    
    console.log('🏆 PROCESSANDO TOTAL RETURN - TODOS OS DADOS PRONTOS!');
    console.log('📊 Dados disponíveis:', {
      cotacoes: cotacoesCompletas.size,
      dy: dyCompletos.size, 
      proventos: proventosCompletos.size,
      ativos: smallCapsData.length
    });

    const novasCotacoes: any = {};

    // 🎯 PROCESSAR TODOS OS ATIVOS COM TOTAL RETURN CORRETO
    const ativosFinais = smallCapsData.map((ativo, index) => {
      const cotacao = cotacoesCompletas.get(ativo.ticker);
      const dyAPI = dyCompletos.get(ativo.ticker) || '0,00%';
      const proventosAtivo = proventosCompletos.get(ativo.ticker) || 0;
      
      if (cotacao && cotacao.precoAtual > 0) {
        // ✅ ATIVO COM COTAÇÃO REAL
        const precoAtualNum = cotacao.precoAtual;
        const performanceAcao = ((precoAtualNum - ativo.precoEntrada) / ativo.precoEntrada) * 100;
        const performanceProventos = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) * 100 : 0;
        const performanceTotal = performanceAcao + performanceProventos;
        
        novasCotacoes[ativo.ticker] = precoAtualNum;
        
        console.log(`🏆 ${ativo.ticker}: R$ ${ativo.precoEntrada.toFixed(2)} -> R$ ${precoAtualNum.toFixed(2)} | Ação ${performanceAcao.toFixed(2)}% + Proventos ${performanceProventos.toFixed(2)}% = TOTAL ${performanceTotal.toFixed(2)}%`);
        
        return {
          ...ativo,
          id: String(ativo.id || index + 1),
          precoAtual: precoAtualNum,
          performance: performanceTotal,     // 🏆 TOTAL RETURN DEFINITIVO
          performanceAcao: performanceAcao,
          performanceProventos: performanceProventos,
          proventosAtivo: proventosAtivo,
          variacao: cotacao.variacao,
          variacaoPercent: cotacao.variacaoPercent,
          volume: cotacao.volume,
          vies: calcularViesAutomatico(ativo.precoTeto, `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`),
          dy: dyAPI,
          statusApi: 'success',
          nomeCompleto: cotacao.nome,
          posicaoExibicao: index + 1
        };
      } else {
        // ⚠️ ATIVO SEM COTAÇÃO REAL - mas ainda pode ter proventos
        const performanceProventos = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) * 100 : 0;
        
        console.log(`🏆 ${ativo.ticker}: Sem cotação | R$ ${ativo.precoEntrada.toFixed(2)} + Proventos ${performanceProventos.toFixed(2)}% = TOTAL ${performanceProventos.toFixed(2)}%`);
        
        return {
          ...ativo,
          id: String(ativo.id || index + 1),
          precoAtual: ativo.precoEntrada,
          performance: performanceProventos,  // 🏆 SÓ PROVENTOS
          performanceAcao: 0,
          performanceProventos: performanceProventos,
          proventosAtivo: proventosAtivo,
          variacao: 0,
          variacaoPercent: 0,
          volume: 0,
          vies: calcularViesAutomatico(ativo.precoTeto, `R$ ${ativo.precoEntrada.toFixed(2).replace('.', ',')}`),
          dy: dyAPI,
          statusApi: 'not_found',
          nomeCompleto: 'N/A',
          posicaoExibicao: index + 1
        };
      }
    });

    // 🎯 ATUALIZAÇÃO FINAL DEFINITIVA
    setCotacoesAtualizadas(novasCotacoes);
    setAtivosAtualizados(ativosFinais);
    
    console.log('🏆 TOTAL RETURN PROCESSADO COM SUCESSO - PRIMEIRA VEZ!');
  }, [todosOsDadosProntos, cotacoesCompletas, dyCompletos, proventosCompletos, smallCapsData]);

  // UseEffect original simplificado
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🚀 Iniciando busca de dados...');
      buscarDadosCompletos();
    }, 100); // Pequeno debounce

    return () => clearTimeout(timeoutId);
  }, [buscarDadosCompletos]);

  const refetch = React.useCallback(() => {
    console.log('🔄 REFETCH: Resetando e buscando dados novamente...');
    setTodosOsDadosProntos(false); // Reset do flag
    buscarDadosCompletos();
  }, [buscarDadosCompletos]);

  return {
    ativosAtualizados,
    cotacoesAtualizadas,
    setCotacoesAtualizadas,
    loading: loadingCotacoes || !todosOsDadosProntos, // ✅ Loading até TUDO estar pronto
    loadingDY,
    loadingProventos,
    error,
    refetch,
    isMobile,
    todosOsDadosProntos // ✅ Novo estado para debug
  };
}

// 🎯 COMPONENTE PRINCIPAL OTIMIZADO
export default function SmallCapsPage() {
  const { dados } = useDataStore();
  const { 
    ativosAtualizados, 
    cotacoesAtualizadas, 
    setCotacoesAtualizadas, 
    loading, 
    isMobile,
    loadingMessage
  } = useSmallCapsIntegradas();
  
  const { smllData } = useSmllRealTime();
  const { ibovespaData } = useIbovespaRealTime();
  const { ibovespaPeriodo } = useIbovespaPeriodo(ativosAtualizados);

  // Separar ativos com memoização
  const { ativosAtivos, ativosEncerrados } = React.useMemo(() => {
    const ativos = ativosAtualizados.filter((ativo) => !ativo.posicaoEncerrada) || [];
    const encerrados = ativosAtualizados.filter((ativo) => ativo.posicaoEncerrada) || [];
    
    return {
      ativosAtivos: ativos.map((ativo, index) => ({
        ...ativo,
        posicaoExibicao: index + 1
      })),
      ativosEncerrados: encerrados
    };
  }, [ativosAtualizados]);

  // Métricas memoizadas
  const metricas = React.useMemo(() => {
    if (!ativosAtivos || ativosAtivos.length === 0) {
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

    const valorPorAtivo = 1000;
    const valorInicialTotal = ativosAtivos.length * valorPorAtivo;
    let valorFinalTotal = 0;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;

    ativosAtivos.forEach((ativo) => {
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

    const dyValues = ativosAtivos
      .map(ativo => parseFloat(ativo.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    const dyMedio = dyValues.length > 0 ? 
      dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: ativosAtivos.length,
      melhorAtivo,
      piorAtivo,
      dyMedio
    };
  }, [ativosAtivos]);

  // Funções auxiliares memoizadas
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

  const calcularPerformanceEncerrada = React.useCallback((ativo: any) => {
    if (!ativo.precoSaida) return 0;
    return ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '16px' : '24px'
    }}>
      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px',
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Carteira de Small Caps
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '16px' : '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {ativosAtivos.length} posições ativas • {ativosEncerrados.length} encerradas
          {loading && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>• {loadingMessage || 'Carregando...'}</span>}
          {!loading && <span style={{ color: '#059669', marginLeft: '8px' }}>• Total Return aplicado ✓</span>}
        </p>
      </div>

      {/* Cards de Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? 'repeat(auto-fit, minmax(140px, 1fr))'
          : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        marginBottom: '32px'
      }}>
        {/* Performance Total */}
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
            Rentabilidade total
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {loading ? '...' : formatPercentage(metricas.rentabilidadeTotal)}
          </div>
        </div>

        {/* DY Médio */}
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

        {/* SMLL Index */}
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
            SMLL Index
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {smllData?.valorFormatado || '2.205'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: smllData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {smllData ? formatPercentage(smllData.variacaoPercent) : '+0.4%'}
          </div>
        </div>

        {/* Ibovespa */}
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
            Ibovespa
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {ibovespaData?.valorFormatado || '134.500'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: ibovespaData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {ibovespaData ? formatPercentage(ibovespaData.variacaoPercent) : '+0.2%'}
          </div>
        </div>

        {/* Ibovespa Período */}
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
            Ibovespa período
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: ibovespaPeriodo?.performancePeriodo >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {ibovespaPeriodo ? formatPercentage(ibovespaPeriodo.performancePeriodo) : '+111.8%'}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            lineHeight: '1'
          }}>
            Desde {ibovespaPeriodo?.dataInicial || 'mar/2020'}
          </div>
        </div>
      </div>

      {/* Posições Ativas */}
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
            Posições Ativas ({ativosAtivos.length})
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
            {loading
              ? loadingMessage || 'Carregando dados...' 
              : 'Total Return aplicado - dados atualizados a cada 5 minutos'
            }
          </p>
        </div>

        {/* Skeleton Loading */}
        {loading && ativosAtivos.length === 0 ? (
          <div style={{ padding: '24px' }}>
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              {loadingMessage || 'Carregando dados...'}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                height: '60px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                marginBottom: '12px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : (
          // Conteúdo principal
          <>
            {isMobile ? (
              // 📱 MOBILE: Cards verticais
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ativosAtivos.map((ativo, index) => {
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
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {ativo.posicaoExibicao}
                        </div>

                        {/* Logo do Ativo */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e2e8f0'
                        }}>
                          <img 
                            src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                            alt={`Logo ${ativo.ticker}`}
                            style={{
                              width: '28px',
                              height: '28px',
                              objectFit: 'contain'
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
                                parent.textContent = ativo.ticker.slice(0, 2);
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
                            {loading ? '...' : ativo.dy}
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
                          Performance Total
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
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        #
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                        ATIVO
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          PERFORMANCE TOTAL
                          <div 
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#64748b',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'help',
                              position: 'relative'
                            }}
                            title="A rentabilidade de todos os ativos é calculada pelo método Total Return, incluindo o reinvestimento dos proventos."
                          >
                            i
                          </div>
                        </div>
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
                    {ativosAtivos.map((ativo, index) => {
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
                          {/* Posição */}
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
                              {ativo.posicaoExibicao}
                            </div>
                          </td>

                          {/* Ativo */}
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e2e8f0'
                              }}>
                                <img 
                                  src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                                  alt={`Logo ${ativo.ticker}`}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    objectFit: 'contain'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.style.backgroundColor = ativo.performance >= 0 ? '#dcfce7' : '#fee2e2';
                                      parent.style.color = ativo.performance >= 0 ? '#065f46' : '#dc2626';
                                      parent.style.fontWeight = '700';
                                      parent.style.fontSize = '14px';
                                      parent.textContent = ativo.ticker.slice(0, 2);
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
                                  {ativo.setor}
                                </div>
                              </div>
                            </div>
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
                            {loading ? '...' : ativo.dy}
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

      {/* Posições Encerradas */}
      {ativosEncerrados.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
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
              margin: '0 0 8px 0'
            }}>
              Posições Encerradas ({ativosEncerrados.length})
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: isMobile ? '14px' : '16px',
              margin: '0'
            }}>
              Histórico de operações finalizadas
            </p>
          </div>

          {isMobile ? (
            // 📱 MOBILE: Cards para encerradas
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ativosEncerrados.map((ativo, index) => {
                const performance = calcularPerformanceEncerrada(ativo);
                
                return (
                  <div 
                    key={ativo.id || index}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {/* Header do Card Encerrado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <img 
                          src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                          alt={`Logo ${ativo.ticker}`}
                          style={{
                            width: '28px',
                            height: '28px',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.backgroundColor = '#dc2626';
                              parent.style.color = 'white';
                              parent.style.fontWeight = '700';
                              parent.style.fontSize = '12px';
                              parent.textContent = ativo.ticker.slice(0, 2);
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: '1' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: '#64748b', 
                          fontSize: '16px'
                        }}>
                          {ativo.ticker}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          {ativo.setor}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '700',
                        backgroundColor: performance >= 0 ? '#dcfce7' : '#fee2e2',
                        color: performance >= 0 ? '#065f46' : '#dc2626'
                      }}>
                        ENCERRADO
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
                        <span style={{ fontWeight: '600', color: '#64748b' }}>{ativo.dataEntrada}</span>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        <span style={{ fontWeight: '500' }}>Saída:</span><br />
                        <span style={{ fontWeight: '600', color: '#64748b' }}>{ativo.dataSaida}</span>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        <span style={{ fontWeight: '500' }}>Preço Entrada:</span><br />
                        <span style={{ fontWeight: '700', color: '#64748b' }}>
                          {formatCurrency(ativo.precoEntrada)}
                        </span>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        <span style={{ fontWeight: '500' }}>Preço Saída:</span><br />
                        <span style={{ fontWeight: '700', color: '#64748b' }}>
                          {formatCurrency(ativo.precoSaida)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Performance final */}
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Performance Final
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '800',
                        color: performance >= 0 ? '#059669' : '#dc2626'
                      }}>
                        {formatPercentage(performance)}
                      </div>
                    </div>

                    {/* Motivo */}
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#64748b', 
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      Motivo: {ativo.motivoEncerramento}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // 🖥️ DESKTOP: Tabela para encerradas
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
                      SAÍDA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                      PREÇO ENTRADA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                      PREÇO SAÍDA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                      PERFORMANCE FINAL
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                      MOTIVO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ativosEncerrados.map((ativo, index) => {
                    const performance = calcularPerformanceEncerrada(ativo);
                    
                    return (
                      <tr 
                        key={ativo.id || index} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #e2e8f0'
                            }}>
                              <img 
                                src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                                alt={`Logo ${ativo.ticker}`}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = '#dc2626';
                                    parent.style.color = 'white';
                                    parent.style.fontWeight = '700';
                                    parent.style.fontSize = '14px';
                                    parent.textContent = ativo.ticker.slice(0, 2);
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ 
                                fontWeight: '700', 
                                color: '#64748b', 
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
                        <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                          {ativo.dataSaida}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                          {formatCurrency(ativo.precoEntrada)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                          {formatCurrency(ativo.precoSaida)}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontWeight: '800',
                          fontSize: '16px',
                          color: performance >= 0 ? '#059669' : '#dc2626'
                        }}>
                          {formatPercentage(performance)}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontSize: '12px', 
                          color: '#64748b' 
                        }}>
                          {ativo.motivoEncerramento}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de Composição */}
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
            Composição por Ativos Ativos
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            Distribuição percentual da carteira - {ativosAtivos.length} ativos ativos
          </p>
        </div>

        <div style={{ 
          padding: isMobile ? '16px' : '32px',
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '32px',
          alignItems: 'center' 
        }}>
          {/* Gráfico SVG Responsivo */}
          <div style={{ 
            flex: isMobile ? '1' : '0 0 400px',
            height: isMobile ? '300px' : '400px',
            position: 'relative' 
          }}>
            {(() => {
              const cores = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                '#14b8a6', '#eab308', '#dc2626', '#7c3aed', '#0891b2',
                '#65a30d', '#ea580c', '#db2777', '#4f46e5', '#0d9488'
              ];
              
              const chartSize = isMobile ? 300 : 400;
              const radius = isMobile ? 120 : 150;
              const innerRadius = isMobile ? 60 : 75;
              const centerX = chartSize / 2;
              const centerY = chartSize / 2;
              const totalAtivos = ativosAtivos.length;
              
              if (totalAtivos === 0) {
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#64748b',
                    fontSize: '16px'
                  }}>
                    Nenhum ativo ativo para exibir
                  </div>
                );
              }
              
              const anglePerSlice = (2 * Math.PI) / totalAtivos;
              
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
                  
                  {ativosAtivos.map((ativo, index) => {
                    const startAngle = index * anglePerSlice - Math.PI / 2;
                    const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;
                    const cor = cores[index % cores.length];
                    const path = createPath(startAngle, endAngle);
                    
                    const middleAngle = (startAngle + endAngle) / 2;
                    const textRadius = (radius + innerRadius) / 2;
                    const textX = centerX + textRadius * Math.cos(middleAngle);
                    const textY = centerY + textRadius * Math.sin(middleAngle);
                    const porcentagem = (100 / totalAtivos).toFixed(1);
                    
                    return (
                      <g key={ativo.ticker} className="slice-group">
                        <path
                          d={path}
                          fill={cor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="slice-path"
                        >
                          <title>{ativo.ticker}: {porcentagem}%</title>
                        </path>
                        
                        <g className="slice-text">
                          <text
                            x={textX}
                            y={textY - 6}
                            textAnchor="middle"
                            fontSize={isMobile ? "10" : "11"}
                            fontWeight="700"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {ativo.ticker}
                          </text>
                          
                          <text
                            x={textX}
                            y={textY + 8}
                            textAnchor="middle"
                            fontSize={isMobile ? "9" : "10"}
                            fontWeight="600"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {porcentagem}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerRadius}
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  
                  <text
                    x={centerX}
                    y={centerY - 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "14" : "16"}
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {totalAtivos}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "10" : "12"}
                    fill="#64748b"
                  >
                    ATIVOS ATIVOS
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
              ? 'repeat(auto-fit, minmax(100px, 1fr))'
              : 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: isMobile ? '8px' : '12px'
          }}>
            {ativosAtivos.map((ativo, index) => {
              const porcentagem = ativosAtivos.length > 0 ? ((1 / ativosAtivos.length) * 100).toFixed(1) : '0.0';
              const cores = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                '#14b8a6', '#eab308', '#dc2626', '#7c3aed', '#0891b2',
                '#65a30d', '#ea580c', '#db2777', '#4f46e5', '#0d9488'
              ];
              const cor = cores[index % cores.length];
              
              return (
                <div key={ativo.ticker} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      fontSize: isMobile ? '12px' : '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {ativo.ticker}
                    </div>
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: isMobile ? '10px' : '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {porcentagem}%
                    </div>
                  </div>
                </div>
              );
            })}
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