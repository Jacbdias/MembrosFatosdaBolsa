// 🎯 src/hooks/useDividendosAtivo.ts
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

      // 🔑 TOKEN BRAPI (MESMO QUE VOCÊ USA)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 📅 ENDPOINT DE DIVIDENDOS
      const dividendosUrl = `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}&sortBy=date&sortOrder=desc`;

      const response = await fetch(dividendosUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dividendos-Individual-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Resposta dividendos ${ticker}:`, data);

        if (data.dividends && Array.isArray(data.dividends)) {
          // 📅 CONVERTER DATA DE ENTRADA
          const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
          
          // 🔍 FILTRAR E PROCESSAR DIVIDENDOS
          const dividendosProcessados = data.dividends
            .filter((div: any) => {
              const dataDividendo = new Date(div.date);
              return dataDividendo >= dataEntradaDate && div.value > 0;
            })
            .map((div: any) => ({
              date: div.date,
              value: div.value,
              type: div.type || 'Dividendo',
              dataFormatada: new Date(div.date).toLocaleDateString('pt-BR'),
              valorFormatado: `R$ ${div.value.toFixed(2).replace('.', ',')}`
            }))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

          console.log(`✅ ${ticker}: ${dividendosProcessados.length} dividendos processados`);
          setDividendos(dividendosProcessados);

          // 🎯 CALCULAR PERFORMANCE DETALHADA
          const performanceCalculada = calcularPerformanceDetalhada(
            precoEntrada,
            precoAtual,
            dividendosProcessados
          );

          setPerformance(performanceCalculada);

        } else {
          console.warn(`⚠️ ${ticker}: Sem dados de dividendos na resposta`);
          setDividendos([]);
          setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
        }
      } else {
        console.error(`❌ Erro HTTP ${response.status} para dividendos de ${ticker}`);
        setError(`Erro ${response.status} ao buscar dividendos`);
        setDividendos([]);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro ao buscar dividendos de ${ticker}:`, err);
      setError(errorMessage);
      setDividendos([]);
      setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      buscarDividendos();
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

// 🎯 FUNÇÃO PARA CALCULAR PERFORMANCE DETALHADA
function calcularPerformanceDetalhada(
  precoEntrada: string,
  precoAtual: string,
  dividendos: DividendoDetalhado[]
): PerformanceDetalhada {
  // 💰 CONVERTER PREÇOS
  const precoEntradaNum = parseFloat(precoEntrada.replace('R$ ', '').replace(',', '.'));
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));

  // 📈 PERFORMANCE DE CAPITAL
  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  // 💰 TOTAL DE DIVIDENDOS
  const dividendosTotal = dividendos.reduce((sum, div) => sum + div.value, 0);
  
  // 📊 DIVIDEND YIELD ACUMULADO
  const dividendosPercentual = precoEntradaNum > 0 
    ? (dividendosTotal / precoEntradaNum) * 100 
    : 0;

  // 🎯 PERFORMANCE TOTAL
  const performanceTotal = performanceCapital + dividendosPercentual;

  // 📅 ÚLTIMO DIVIDENDO
  const ultimoDividendo = dividendos.length > 0 
    ? dividendos[0].dataFormatada
    : 'Nenhum';

  // 📊 DIVIDENDOS POR ANO
  const dividendosPorAno: { [ano: string]: number } = {};
  dividendos.forEach(div => {
    const ano = new Date(div.date).getFullYear().toString();
    dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + div.value;
  });

  // 📈 MÉDIA ANUAL
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
