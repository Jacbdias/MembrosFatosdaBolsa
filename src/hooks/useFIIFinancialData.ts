// hooks/useFIIFinancialData.ts
'use client';

import * as React from 'react';

// 🔥 TIPOS PARA DADOS FINANCEIROS DOS FIIs
export interface FIIMarketData {
  ifix: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
  carteiraHoje: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
  dividendYield: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
  carteiraPeriodo: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
}

export interface FIIFinancialDataResponse {
  marketData: FIIMarketData;
  success: boolean;
  error?: string;
  timestamp: string;
  source: string;
}

// 🚀 HOOK PARA BUSCAR DADOS FINANCEIROS DOS FIIs
export function useFIIFinancialData() {
  const [marketData, setMarketData] = React.useState<FIIMarketData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);

  const fetchFIIData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Buscando dados financeiros dos FIIs...');

      // 🌐 BUSCAR DADOS DA API CUSTOMIZADA PARA FIIs
      const response = await fetch('/api/financial/fii-market-data', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FIIFinancialDataResponse = await response.json();
      
      if (data.success && data.marketData) {
        console.log('✅ Dados financeiros FIIs recebidos:', data.marketData);
        setMarketData(data.marketData);
        setLastUpdate(data.timestamp);
      } else {
        throw new Error(data.error || 'Falha ao obter dados válidos da API FIIs');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar dados financeiros FIIs:', err);
      setError(errorMessage);

      // 🔄 FALLBACK: Dados padrão para FIIs
      console.log('🔄 Usando dados de fallback para FIIs...');
      const fallbackData: FIIMarketData = {
        ifix: { value: "3.200", trend: "up", diff: 0.25 },
        carteiraHoje: { value: "12.4%", trend: "up", diff: 12.4 },
        dividendYield: { value: "11.8%", trend: "up", diff: 11.8 },
        carteiraPeriodo: { value: "15.2%", trend: "up", diff: 15.2 }
      };
      
      setMarketData(fallbackData);
      setLastUpdate(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFIIData();

    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(fetchFIIData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchFIIData]);

  // 🔄 MÉTODO PARA FORÇAR ATUALIZAÇÃO
  const refetch = React.useCallback(() => {
    fetchFIIData();
  }, [fetchFIIData]);

  return {
    marketData,
    loading,
    error,
    lastUpdate,
    refetch,
  };
}

// 🔥 HOOK ESPECÍFICO PARA DADOS DO IFIX EM TEMPO REAL
export function useIFIXRealTime() {
  const [ifixData, setIfixData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchIFIXData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO DADOS IFIX EM TEMPO REAL...');

      // 🔑 TOKEN BRAPI VALIDADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 📊 BUSCAR IFIX VIA BRAPI
      const ifixUrl = `https://brapi.dev/api/quote/IFIX?token=${BRAPI_TOKEN}`;
      
      const response = await fetch(ifixUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IFIX-Real-Time-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const ifixQuote = data.results[0];
          
          const processedData = {
            valor: ifixQuote.regularMarketPrice,
            valorFormatado: Math.round(ifixQuote.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ifixQuote.regularMarketChange || 0,
            variacaoPercent: ifixQuote.regularMarketChangePercent || 0,
            trend: (ifixQuote.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            volume: ifixQuote.regularMarketVolume || 0,
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI_REAL'
          };

          console.log('✅ IFIX PROCESSADO:', processedData);
          setIfixData(processedData);
          
        } else {
          throw new Error('Sem dados do IFIX na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar IFIX:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK
      const fallbackData = {
        valor: 3200,
        valorFormatado: '3.200',
        variacao: 8.0,
        variacaoPercent: 0.25,
        trend: 'up',
        volume: 125000000,
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK'
      };
      setIfixData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIFIXData();
    
    // 🔄 ATUALIZAR A CADA 3 MINUTOS (IFIX muda menos frequentemente)
    const interval = setInterval(fetchIFIXData, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchIFIXData]);

  return { 
    ifixData, 
    loading, 
    error, 
    refetch: fetchIFIXData 
  };
}

// 🔥 HOOK PARA CALCULAR ESTATÍSTICAS DA CARTEIRA DE FIIs
export function useFIIPortfolioStats(fiis: any[]) {
  return React.useMemo(() => {
    if (!fiis || fiis.length === 0) {
      return {
        totalFIIs: 0,
        performanceMedia: 0,
        dyMedio: 0,
        melhorPerformance: null,
        piorPerformance: null,
        totalInvestido: 0,
        valorAtual: 0,
        lucroOuPrejuizo: 0
      };
    }

    const fiisValidos = fiis.filter(fii => 
      fii.performance !== undefined && 
      !isNaN(fii.performance) &&
      fii.statusApi === 'success'
    );

    if (fiisValidos.length === 0) {
      return {
        totalFIIs: fiis.length,
        performanceMedia: 0,
        dyMedio: 0,
        melhorPerformance: null,
        piorPerformance: null,
        totalInvestido: 0,
        valorAtual: 0,
        lucroOuPrejuizo: 0
      };
    }

    // 📊 CALCULAR ESTATÍSTICAS
    const performances = fiisValidos.map(fii => fii.performance);
    const performanceMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;

    const dyValues = fiisValidos.map(fii => {
      let dyString = fii.dy.replace('%', '').replace(',', '.');
      let dyNum = parseFloat(dyString);
      if (dyNum > 0 && dyNum < 1) dyNum *= 100;
      return dyNum;
    }).filter(dy => !isNaN(dy) && dy > 0);

    const dyMedio = dyValues.length > 0 
      ? dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length 
      : 0;

    const melhorPerformance = fiisValidos.reduce((best, fii) => 
      !best || fii.performance > best.performance ? fii : best
    );

    const piorPerformance = fiisValidos.reduce((worst, fii) => 
      !worst || fii.performance < worst.performance ? fii : worst
    );

    return {
      totalFIIs: fiis.length,
      fiisComDados: fiisValidos.length,
      performanceMedia,
      dyMedio,
      melhorPerformance,
      piorPerformance,
      setoresUnicos: [...new Set(fiis.map(fii => fii.setor))].length
    };
  }, [fiis]);
}
