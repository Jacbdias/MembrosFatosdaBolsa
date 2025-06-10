// 🎯 src/hooks/useDividendosAtivo.ts - VERSÃO SIMPLES FUNCIONANDO
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
      
      // 🔍 MÚLTIPLAS VARIAÇÕES DO TICKER
      const tickerVariacoes = [ticker, ticker.replace(/[34]$/, ''), ticker + '.SA'];
      
      let melhorResultado: any = null;

      for (const tickerTeste of tickerVariacoes) {
        try {
          const url = `https://brapi.dev/api/quote/${tickerTeste}/dividends?token=${BRAPI_TOKEN}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000)
          });

          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.dividends && Array.isArray(data.dividends) && data.dividends.length > 0) {
            console.log(`✅ ${tickerTeste}: ${data.dividends.length} dividendos encontrados`);
            melhorResultado = { ticker: tickerTeste, dividendos: data.dividends };
            break;
          }

        } catch (err) {
          console.log(`❌ Erro com ${tickerTeste}:`, err);
          continue;
        }
      }

      if (melhorResultado) {
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        
        const dividendosProcessados = melhorResultado.dividendos
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

        console.log(`✅ ${dividendosProcessados.length} dividendos processados`);
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, dividendosProcessados));

      } else {
        console.log(`📭 Nenhum dividendo encontrado para ${ticker}`);
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError(`Nenhum dividendo encontrado. Testados: ${tickerVariacoes.join(', ')}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral:`, err);
      setError(errorMessage);
      
      setDividendos([]);
      const performanceFallback = calcularPerformance(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
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

function calcularPerformance(
  precoEntrada: string,
  precoAtual: string,
  dividendos: DividendoDetalhado[]
): PerformanceDetalhada {
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  const dividendosTotal = dividendos.reduce((sum, div) => sum + (div.value || 0), 0);
  const dividendosPercentual = precoEntradaNum > 0 ? (dividendosTotal / precoEntradaNum) * 100 : 0;
  const performanceTotal = performanceCapital + dividendosPercentual;

  const ultimoDividendo = dividendos.length > 0 ? dividendos[0].dataFormatada : 'Nenhum';

  const dividendosPorAno: { [ano: string]: number } = {};
  dividendos.forEach(div => {
    try {
      const ano = new Date(div.date).getFullYear().toString();
      dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + (div.value || 0);
    } catch {
      // Ignorar datas inválidas
    }
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
