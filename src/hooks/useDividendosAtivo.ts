// 🔍 src/hooks/useDividendosAtivo.ts - VERSÃO DEBUG AVANÇADO
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
  debugInfo?: string;
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

      console.log(`🔍 === DEBUG AVANÇADO PARA ${ticker} ===`);
      console.log(`📅 Data entrada: ${dataEntrada}`);
      console.log(`💰 Preço entrada: ${precoEntrada}`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 🔍 TESTAR MÚLTIPLAS VARIAÇÕES DO TICKER
      const tickerVariacoes = [
        ticker,                    // ALOS3
        ticker.replace('3', ''),   // ALOS
        ticker.replace('4', ''),   // Para casos como RAPT4 -> RAPT
        ticker + '.SA'             // ALOS3.SA
      ];

      console.log(`🎯 Testando variações: ${tickerVariacoes.join(', ')}`);

      let melhorResultado: any = null;
      let debugInfo = '';

      for (const tickerTeste of tickerVariacoes) {
        try {
          console.log(`\n🌐 Testando: ${tickerTeste}`);
          
          const url = `https://brapi.dev/api/quote/${tickerTeste}/dividends?token=${BRAPI_TOKEN}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });

          console.log(`📡 ${tickerTeste} - Status: ${response.status}`);

          if (!response.ok) {
            console.log(`❌ ${tickerTeste} - Erro HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          console.log(`📊 ${tickerTeste} - Dados recebidos:`, data);

          if (data.dividends && Array.isArray(data.dividends)) {
            console.log(`📋 ${tickerTeste} - Dividendos encontrados: ${data.dividends.length}`);
            
            // 🔍 MOSTRAR TODOS OS DIVIDENDOS SEM FILTRO
            console.log(`📜 ${tickerTeste} - TODOS os dividendos:`);
            data.dividends.forEach((div: any, index: number) => {
              console.log(`  ${index + 1}. ${div.date} - R$ ${div.value} (${div.type || 'N/A'})`);
            });

            // 🔍 TESTAR FILTRO DE DATA
            const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
            console.log(`📅 ${tickerTeste} - Data entrada convertida: ${dataEntradaDate.toISOString()}`);
            
            const dividendosFiltrados = data.dividends.filter((div: any) => {
              if (!div.date || typeof div.value !== 'number') return false;
              
              const dataDividendo = new Date(div.date);
              const isAfterEntry = dataDividendo >= dataEntradaDate;
              
              console.log(`  📊 ${div.date} (${dataDividendo.toISOString()}) - Após entrada: ${isAfterEntry}`);
              
              return isAfterEntry && div.value > 0;
            });

            console.log(`✅ ${tickerTeste} - Dividendos após filtro: ${dividendosFiltrados.length}`);

            if (dividendosFiltrados.length > 0 || data.dividends.length > (melhorResultado?.length || 0)) {
              melhorResultado = {
                ticker: tickerTeste,
                dividendos: dividendosFiltrados,
                todosDividendos: data.dividends,
                length: dividendosFiltrados.length
              };
              debugInfo = `Melhor resultado: ${tickerTeste} (${dividendosFiltrados.length} dividendos filtrados de ${data.dividends.length} totais)`;
            }

          } else {
            console.log(`❌ ${tickerTeste} - Estrutura inválida ou sem dividendos`);
          }

        } catch (tickerError) {
          console.log(`❌ ${tickerTeste} - Erro:`, tickerError);
        }
      }

      // 🎯 PROCESSAR MELHOR RESULTADO
      if (melhorResultado && melhorResultado.dividendos.length > 0) {
        const dividendosProcessados = melhorResultado.dividendos
          .map((div: any) => ({
            date: div.date,
            value: div.value,
            type: div.type || 'Dividendo',
            dataFormatada: new Date(div.date).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${div.value.toFixed(2).replace('.', ',')}`
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`🎉 SUCESSO! ${dividendosProcessados.length} dividendos processados para ${melhorResultado.ticker}`);
        setDividendos(dividendosProcessados);
        
        const performance = calcularPerformanceDetalhada(precoEntrada, precoAtual, dividendosProcessados);
        performance.debugInfo = debugInfo;
        setPerformance(performance);

      } else {
        console.log(`📭 NENHUM DIVIDENDO encontrado para ${ticker} em nenhuma variação`);
        
        // 🔍 MOSTRAR INFORMAÇÕES DE DEBUG
        let infoDebug = `Testadas variações: ${tickerVariacoes.join(', ')}. `;
        
        if (melhorResultado && melhorResultado.todosDividendos.length > 0) {
          infoDebug += `Encontrados ${melhorResultado.todosDividendos.length} dividendos, mas todos anteriores à entrada (${dataEntrada}).`;
          
          // Mostrar os 3 dividendos mais recentes
          const recentes = melhorResultado.todosDividendos
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
          
          console.log(`📋 Últimos dividendos encontrados:`);
          recentes.forEach((div: any) => {
            console.log(`  • ${div.date} - R$ ${div.value}`);
          });
          
          infoDebug += ` Últimos: ${recentes.map((d: any) => d.date).join(', ')}.`;
        } else {
          infoDebug += `Nenhum dividendo encontrado na API.`;
        }

        setDividendos([]);
        const performance = calcularPerformanceDetalhada(precoEntrada, precoAtual, []);
        performance.debugInfo = infoDebug;
        setPerformance(performance);
        setError(`Sem dividendos desde a entrada. ${infoDebug}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral:`, err);
      setError(errorMessage);
      
      setDividendos([]);
      const performanceFallback = calcularPerformanceDetalhada(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      performanceFallback.debugInfo = `Erro: ${errorMessage}`;
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
