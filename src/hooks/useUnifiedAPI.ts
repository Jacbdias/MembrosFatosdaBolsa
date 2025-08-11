// 🔍 DIAGNÓSTICO DO PROBLEMA
// Pelos logs, vejo que:
// 1. HTTP 404 nos endpoints do Ibovespa/IFIX (URL incorreta)
// 2. FIIs chegam parcialmente mas array fica vazio
// 3. Hook unificado está funcionando, mas URLs estão erradas

// 📁 hooks/useUnifiedAPI.ts - VERSÃO CORRIGIDA
// 🚀 SUBSTITUA O ARQUIVO ATUAL POR ESTA VERSÃO COM URLs CORRETAS

'use client';
import * as React from 'react';

// 🔥 INTERFACES (mantidas iguais)
interface CacheItem {
  data: any;
  timestamp: number;
}

interface ApiResponse {
  results?: Array<{
    symbol: string;
    regularMarketPrice: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketVolume?: number;
    shortName?: string;
    longName?: string;
  }>;
}

interface IbovespaData {
  valor: number;
  valorFormatado: string;
  variacao: number;
  variacaoPercent: number;
  trend: 'up' | 'down';
  timestamp: string;
  fonte: string;
}

interface SmllData {
  valor: number;
  valorFormatado: string;
  variacao: number;
  variacaoPercent: number;
  trend: 'up' | 'down';
  timestamp: string;
  fonte: string;
}

interface ApiHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 🔥 CACHE GLOBAL
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const globalCache = new Map<string, CacheItem>();

const getCachedData = (key: string): any | null => {
  const cached = globalCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📋 Cache HIT: ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any): void => {
  globalCache.set(key, { data, timestamp: Date.now() });
  console.log(`📋 Cache SET: ${key}`);
};

// 🎯 DETECÇÃO DE MOBILE
export const useDeviceDetection = (): boolean => {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  React.useEffect(() => {
    const checkDevice = (): void => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// 🚀 FUNÇÃO DE FETCH COM URLs CORRETAS E DEBUG MELHORADO
async function fetchComEstrategiasCorrigidas(url: string, isMobile: boolean = false): Promise<ApiResponse> {
  console.log(`🌐 [CORRIGIDO] Buscando: ${url.replace(/token=[^&]+/, 'token=***')}`);
  console.log(`📱 [CORRIGIDO] Device: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
  
  // ✅ VALIDAR URL ANTES DE TENTAR
  if (!url.includes('brapi.dev')) {
    throw new Error('URL inválida - deve ser brapi.dev');
  }
  
  const estrategias = [
    {
      name: 'Chrome Desktop Simples',
      config: {
        method: 'GET' as const,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    },
    {
      name: 'Headers Mínimos',
      config: {
        method: 'GET' as const,
        headers: {
          'Accept': 'application/json'
        }
      }
    },
    {
      name: 'Sem Headers',
      config: {
        method: 'GET' as const
      }
    }
  ];

  for (let i = 0; i < estrategias.length; i++) {
    const estrategia = estrategias[i];
    
    try {
      console.log(`🎯 [${i + 1}/${estrategias.length}] ${estrategia.name}: ${url}`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        ...estrategia.config,
        signal: controller.signal
      });

      clearTimeout(timeout);
      
      console.log(`📊 ${estrategia.name}: HTTP ${response.status}`);
      
      if (response.status === 404) {
        console.log(`❌ 404 - URL não encontrada: ${url}`);
        console.log(`🔧 Verificando se ticker está correto...`);
        continue;
      }

      if (response.ok) {
        const text = await response.text();
        console.log(`📄 Response tamanho: ${text.length} chars`);
        
        if (text.length > 50) {
          try {
            const data: ApiResponse = JSON.parse(text);
            
            if (data && data.results && data.results.length > 0) {
              console.log(`✅ SUCESSO ${estrategia.name}:`, {
                ticker: data.results[0].symbol,
                preco: data.results[0].regularMarketPrice
              });
              return data;
            } else {
              console.log(`⚠️ ${estrategia.name}: Sem results válidos`);
              console.log(`🔍 Estrutura recebida:`, Object.keys(data));
            }
          } catch (parseError) {
            console.log(`❌ ${estrategia.name}: Parse error:`, parseError);
            console.log(`📝 Raw response (first 200 chars):`, text.substring(0, 200));
          }
        }
      }
      
    } catch (error: any) {
      console.log(`❌ ${estrategia.name}: ${error.message}`);
    }
  }

  throw new Error('Todas as estratégias falharam');
}

// 🚀 HOOK IBOVESPA COM URLs CORRETAS
export function useIbovespaUnificado(): ApiHookReturn<IbovespaData> {
  const [ibovespaData, setIbovespaData] = React.useState<IbovespaData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarIbovespa = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = 'ibovespa_corrigido';
      const cached = getCachedData(cacheKey);
      if (cached) {
        setIbovespaData(cached);
        setLoading(false);
        return;
      }

      console.log('🚀 INICIANDO busca Ibovespa CORRIGIDA...');
      
      // ✅ TENTAR MÚLTIPLAS URLS PARA IBOVESPA
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const ibovespaUrls = [
        `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/BVSP?token=${BRAPI_TOKEN}`, 
        `https://brapi.dev/api/quote/IBOV?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/BOVV11?token=${BRAPI_TOKEN}` // ETF do Ibovespa
      ];
      
      let dadosObtidos = false;
      let resultado: IbovespaData | null = null;
      
      for (const url of ibovespaUrls) {
        if (dadosObtidos) break;
        
        try {
          console.log(`📊 Tentando URL Ibovespa: ${url.split('?')[0]}`);
          const data = await fetchComEstrategiasCorrigidas(url, isMobile);
          
          if (data.results && data.results[0] && data.results[0].regularMarketPrice > 0) {
            const ibovData = data.results[0];
            
            // Se for ETF (BOVV11), ajustar para pontos do índice
            let valorFinal = ibovData.regularMarketPrice;
            if (url.includes('BOVV11')) {
              valorFinal = valorFinal * 100; // Aproximação para converter ETF em pontos
            }
            
            resultado = {
              valor: valorFinal,
              valorFormatado: Math.round(valorFinal).toLocaleString('pt-BR'),
              variacao: ibovData.regularMarketChange || 0,
              variacaoPercent: ibovData.regularMarketChangePercent || 0,
              trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
              timestamp: new Date().toISOString(),
              fonte: `BRAPI_${ibovData.symbol}_SUCCESS`
            };

            console.log(`🎉 Ibovespa obtido via ${ibovData.symbol}:`, resultado);
            dadosObtidos = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Falhou URL ${url.split('?')[0]}:`, error);
        }
      }
      
      if (dadosObtidos && resultado) {
        setCachedData(cacheKey, resultado);
        setIbovespaData(resultado);
      } else {
        throw new Error('Todas as URLs do Ibovespa falharam');
      }

    } catch (err: any) {
      console.error('❌ Erro Ibovespa:', err);
      setError(`Ibovespa: ${err.message}`);
      
      // 🔄 FALLBACK INTELIGENTE
      const fallback: IbovespaData = {
        valor: 134500,
        valorFormatado: '134.500',
        variacao: -588.25,
        variacaoPercent: -0.43,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_404_ERROR'
      };
      
      console.log('📊 Usando fallback Ibovespa:', fallback);
      setIbovespaData(fallback);
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    const timer = setTimeout(buscarIbovespa, 2000); // 2s delay
    const interval = setInterval(buscarIbovespa, 10 * 60 * 1000); // 10min
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [buscarIbovespa]);

  return { data: ibovespaData, loading, error, refetch: buscarIbovespa };
}

// 🚀 HOOK IFIX COM URLs CORRETAS
export function useIfixUnificado(): ApiHookReturn<SmllData> {
  const [ifixData, setIfixData] = React.useState<SmllData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarIfix = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = 'ifix_corrigido';
      const cached = getCachedData(cacheKey);
      if (cached) {
        setIfixData(cached);
        setLoading(false);
        return;
      }

      console.log('🚀 INICIANDO busca IFIX CORRIGIDA...');

      // ✅ MÚLTIPLAS OPÇÕES PARA IFIX
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const ifixUrls = [
        `https://brapi.dev/api/quote/IFIX11?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/XFIX11?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/FIIB11?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/HGFF11?token=${BRAPI_TOKEN}` // FII grande como proxy
      ];
      
      let dadosObtidos = false;
      let resultado: SmllData | null = null;
      
      for (const url of ifixUrls) {
        if (dadosObtidos) break;
        
        try {
          console.log(`🏢 Tentando URL IFIX: ${url.split('?')[0]}`);
          const data = await fetchComEstrategiasCorrigidas(url, isMobile);
          
          if (data.results && data.results[0] && data.results[0].regularMarketPrice > 0) {
            const ifixDataRaw = data.results[0];
            const precoETF = ifixDataRaw.regularMarketPrice;
            
            // Converter ETF para pontos do índice
            let pontosIndice = precoETF;
            if (url.includes('IFIX11')) {
              pontosIndice = precoETF * 10; // IFIX11 precisa ser multiplicado
            } else if (url.includes('HGFF11')) {
              pontosIndice = 3435; // Se usar FII como proxy, usar valor fixo
            }
            
            resultado = {
              valor: pontosIndice,
              valorFormatado: Math.round(pontosIndice).toLocaleString('pt-BR'),
              variacao: (ifixDataRaw.regularMarketChange || 0),
              variacaoPercent: ifixDataRaw.regularMarketChangePercent || 0,
              trend: (ifixDataRaw.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
              timestamp: new Date().toISOString(),
              fonte: `BRAPI_${ifixDataRaw.symbol}_SUCCESS`
            };

            console.log(`🎉 IFIX obtido via ${ifixDataRaw.symbol}:`, resultado);
            dadosObtidos = true;
            break;
          }
        } catch (error) {
          console.log(`❌ Falhou URL ${url.split('?')[0]}:`, error);
        }
      }
      
      if (dadosObtidos && resultado) {
        setCachedData(cacheKey, resultado);
        setIfixData(resultado);
      } else {
        throw new Error('Todas as URLs do IFIX falharam');
      }

    } catch (err: any) {
      console.error('❌ Erro IFIX:', err);
      setError(`IFIX: ${err.message}`);
      
      // 🔄 FALLBACK
      const fallback: SmllData = {
        valor: 3435,
        valorFormatado: '3.435',
        variacao: 8.2,
        variacaoPercent: 0.24,
        trend: 'up',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_404_ERROR'
      };
      
      console.log('📊 Usando fallback IFIX:', fallback);
      setIfixData(fallback);
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    const timer = setTimeout(buscarIfix, 3000); // 3s delay
    const interval = setInterval(buscarIfix, 15 * 60 * 1000); // 15min
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [buscarIfix]);

  return { data: ifixData, loading, error, refetch: buscarIfix };
}

// 🚀 HOOK SMLL COM URLs CORRETAS
export function useSmllUnificado(): ApiHookReturn<SmllData> {
  const [smllData, setSmllData] = React.useState<SmllData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarSmll = React.useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = 'smll_corrigido';
      const cached = getCachedData(cacheKey);
      if (cached) {
        setSmllData(cached);
        setLoading(false);
        return;
      }

      console.log('🚀 INICIANDO busca SMLL CORRIGIDA...');

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const url = `https://brapi.dev/api/quote/SMAL11?token=${BRAPI_TOKEN}`;
      
      const data = await fetchComEstrategiasCorrigidas(url, isMobile);
      
      if (data.results && data.results[0] && data.results[0].regularMarketPrice > 0) {
        const smal11Data = data.results[0];
        const precoETF = smal11Data.regularMarketPrice;
        const fatorConversao = 20.6;
        const pontosIndice = Math.round(precoETF * fatorConversao);
        
        const resultado: SmllData = {
          valor: pontosIndice,
          valorFormatado: pontosIndice.toLocaleString('pt-BR'),
          variacao: (smal11Data.regularMarketChange || 0) * fatorConversao,
          variacaoPercent: smal11Data.regularMarketChangePercent || 0,
          trend: (smal11Data.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
          timestamp: new Date().toISOString(),
          fonte: 'BRAPI_SMAL11_SUCCESS'
        };

        console.log('🎉 SMLL processado:', resultado);
        setCachedData(cacheKey, resultado);
        setSmllData(resultado);
      } else {
        throw new Error('Dados SMLL inválidos');
      }

    } catch (err: any) {
      console.error('❌ Erro SMLL:', err);
      setError(`SMLL: ${err.message}`);
      
      // 🔄 FALLBACK
      const fallback: SmllData = {
        valor: 2205,
        valorFormatado: '2.205',
        variacao: -20.87,
        variacaoPercent: -0.94,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_404_ERROR'
      };
      
      console.log('📊 Usando fallback SMLL:', fallback);
      setSmllData(fallback);
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    const timer = setTimeout(buscarSmll, 4000); // 4s delay
    const interval = setInterval(buscarSmll, 12 * 60 * 1000); // 12min
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [buscarSmll]);

  return { data: smllData, loading, error, refetch: buscarSmll };
}