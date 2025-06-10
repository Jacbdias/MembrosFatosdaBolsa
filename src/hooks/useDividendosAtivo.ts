// 🎯 src/hooks/useDividendosAtivo.ts - VERSÃO CORRIGIDA
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

      // 🔑 TOKEN BRAPI
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 📅 ENDPOINT DE DIVIDENDOS
      const dividendosUrl = `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}&sortBy=date&sortOrder=desc`;
      
      console.log(`🌐 URL: ${dividendosUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO')}`);

      const response = await fetch(dividendosUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Dividendos-Individual-App'
        }
      });

      console.log(`📡 Status da resposta: ${response.status}`);
      console.log(`📡 Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // 🚨 ERRO HTTP
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
        
        if (response.status === 404) {
          throw new Error(`Ticker ${ticker} não encontrado na API`);
        } else if (response.status === 401) {
          throw new Error('Token de API inválido ou expirado');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições excedido');
        } else {
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
      }

      // 🔍 VERIFICAR TIPO DE CONTEÚDO
      const contentType = response.headers.get('content-type');
      console.log(`📄 Content-Type: ${contentType}`);

      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error(`❌ Resposta não é JSON:`, responseText.substring(0, 200));
        throw new Error('API retornou HTML em vez de JSON. Possível erro de servidor.');
      }

      // 📊 PROCESSAR JSON
      const data = await response.json();
      console.log(`📊 Resposta dividendos ${ticker}:`, data);

      if (data.dividends && Array.isArray(data.dividends)) {
        // 📅 CONVERTER DATA DE ENTRADA
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`📅 Data entrada convertida: ${dataEntradaDate.toISOString()}`);
        
        // 🔍 FILTRAR E PROCESSAR DIVIDENDOS
        const dividendosProcessados = data.dividends
          .filter((div: any) => {
            if (!div.date || typeof div.value !== 'number') {
              console.warn(`⚠️ Dividendo inválido:`, div);
              return false;
            }

            const dataDividendo = new Date(div.date);
            const isAfterEntry = dataDividendo >= dataEntradaDate;
            const hasValidValue = div.value > 0;
            
            console.log(`📊 Dividendo ${div.date}: R$ ${div.value} - Válido: ${isAfterEntry && hasValidValue}`);
            
            return isAfterEntry && hasValidValue;
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

        console.log(`📈 Performance calculada:`, performanceCalculada);
        setPerformance(performanceCalculada);

      } else {
        console.warn(`⚠️ ${ticker}: Estrutura de dados inesperada:`, data);
        
        if (data.error) {
          throw new Error(`Erro da API: ${data.error}`);
        }
        
        // Sem dividendos, mas não é erro
        setDividendos([]);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
      }

    } catch (err) {
      let errorMessage = 'Erro desconhecido';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      console.error(`❌ Erro ao buscar dividendos de ${ticker}:`, err);
      setError(errorMessage);
      
      // 🔄 FALLBACK: calcular apenas performance de capital
      const performanceFallback = calcularPerformanceDetalhada(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      setDividendos([]);
      
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
  // 💰 CONVERTER PREÇOS COM VALIDAÇÃO
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  console.log(`💰 Preços convertidos: Entrada=${precoEntradaNum}, Atual=${precoAtualNum}`);

  // 📈 PERFORMANCE DE CAPITAL
  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  // 💰 TOTAL DE DIVIDENDOS
  const dividendosTotal = dividendos.reduce((sum, div) => sum + (div.value || 0), 0);
  
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
    dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + (div.value || 0);
  });

  // 📈 MÉDIA ANUAL
  const anos = Object.keys(dividendosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(dividendosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  const resultado = {
    performanceCapital,
    dividendosTotal,
    dividendosPercentual,
    performanceTotal,
    quantidadeDividendos: dividendos.length,
    ultimoDividendo,
    dividendosPorAno,
    mediaAnual,
    status: dividendos.length > 0 ? 'success' as const : 'partial' as const
  };

  console.log(`📊 Performance final calculada:`, resultado);
  return resultado;
}
