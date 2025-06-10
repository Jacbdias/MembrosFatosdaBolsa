// 🎯 src/hooks/useDividendosAtivo.ts - VERSÃO FINAL OTIMIZADA
'use client';

import * as React from 'react';

interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
}

interface PerformanceDetalhada {
  performanceCapital: number;
  dividendosTotal: number;
  dividendosPercentual: number;
  performanceTotal: number;
  quantidadeDividendos: number;
  ultimoDividendo: string;
  dividendosPorAno: { [ano: string]: number };
  mediaAnual: number;
  status: 'success' | 'partial' | 'error';
}

export function useDividendosAtivo(
  ticker: string, 
  dataEntrada: string, 
  precoEntrada: string, 
  precoAtual: string
) {
  const [dividendos, setDividendos] = React.useState<DividendoDetalhado[]>([]);
  const [performance, setPerformance] = React.useState<PerformanceDetalhada | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarDividendos = React.useCallback(async () => {
    if (!ticker || !dataEntrada || !precoEntrada) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Buscando dividendos para ${ticker} desde ${dataEntrada}`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const dividendosUrl = `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}&sortBy=date&sortOrder=desc`;
      
      // 🚀 OTIMIZAÇÃO: Timeout mais curto para evitar preload warnings
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await fetch(dividendosUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dividendos-App/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ ${ticker}: Ticker não encontrado na API de dividendos`);
          // Não é erro crítico, apenas não tem dividendos
          setDividendos([]);
          setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
          return;
        }
        throw new Error(`Erro ${response.status} ao buscar dividendos`);
      }

      const data = await response.json();
      
      if (data.dividends && Array.isArray(data.dividends) && data.dividends.length > 0) {
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        
        const dividendosProcessados = data.dividends
          .filter((div: any) => {
            if (!div.date || typeof div.value !== 'number' || div.value <= 0) return false;
            const dataDividendo = new Date(div.date);
            return dataDividendo >= dataEntradaDate;
          })
          .map((div: any) => ({
            date: div.date,
            value: div.value,
            type: div.type || 'Dividendo',
            dataFormatada: new Date(div.date).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${div.value.toFixed(2).replace('.', ',')}`
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ ${ticker}: ${dividendosProcessados.length} dividendos encontrados`);
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, dividendosProcessados));
      } else {
        console.log(`📭 ${ticker}: Nenhum dividendo encontrado`);
        setDividendos([]);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`⏱️ Timeout na busca de dividendos para ${ticker}`);
        setError('Timeout na busca de dividendos');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro na API de dividendos';
        console.error(`❌ Erro ao buscar dividendos de ${ticker}:`, err);
        setError(errorMessage);
      }
      
      // Sempre calcular performance de capital, mesmo com erro
      setDividendos([]);
      const performanceFallback = calcularPerformanceDetalhada(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      // 🚀 OTIMIZAÇÃO: Delay para evitar muitas requisições simultâneas
      const timer = setTimeout(buscarDividendos, 300);
      return () => clearTimeout(timer);
    }
  }, [buscarDividendos]);

  return {
    dividendos,
    performance,
    loading,
    error,
    refetch: buscarDividendos
  };
}

function calcularPerformanceDetalhada(
  precoEntrada: string,
  precoAtual: string,
  dividendos: DividendoDetalhado[]
): PerformanceDetalhada {
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  const dividendosTotal = dividendos.reduce((sum, div) => sum + div.value, 0);
  const dividendosPercentual = precoEntradaNum > 0 ? (dividendosTotal / precoEntradaNum) * 100 : 0;
  const performanceTotal = performanceCapital + dividendosPercentual;

  const ultimoDividendo = dividendos.length > 0 ? dividendos[0].dataFormatada : 'Nenhum';

  const dividendosPorAno: { [ano: string]: number } = {};
  dividendos.forEach(div => {
    const ano = new Date(div.date).getFullYear().toString();
    dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + div.value;
  });

  const anos = Object.keys(dividendosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(dividendosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  return {
    performanceCapital,
    dividendosTotal,
    dividendosPercentual,
    performanceTotal,
    quantidadeDividendos: dividendos.length,
    ultimoDividendo,
    dividendosPorAno,
    mediaAnual,
    status: dividendos.length > 0 ? 'success' : 'partial'
  };
}
