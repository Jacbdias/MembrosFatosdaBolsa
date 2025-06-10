// 🎯 src/hooks/useDividendosAtivo.ts - BUSCA MAIS COMPLETA
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

      console.log(`🔍 === BUSCA COMPLETA DE PROVENTOS PARA ${ticker} ===`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 🔍 TODAS AS ESTRATÉGIAS POSSÍVEIS
      const estrategias = [
        {
          nome: 'Dividendos Direto',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}/dividends?token=${BRAPI_TOKEN}`,
          extrair: (data: any) => data.dividends || []
        },
        {
          nome: 'Quote com Dividends Module',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&modules=dividends`,
          extrair: (data: any) => data.results?.[0]?.dividends || []
        },
        {
          nome: 'Quote Fundamental Completo',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&fundamental=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.splits || []),
              ...(result?.earnings || [])
            ];
          }
        },
        {
          nome: 'Histórico 5 Anos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&range=5y&fundamental=true&modules=dividends,splits,earnings`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.stockSplits || []),
              ...(result?.capitalGains || [])
            ];
          }
        }
      ];

      // 🔍 VARIAÇÕES DO TICKER (incluindo mais opções)
      const tickerVariacoes = [
        ticker,                    // ALOS3
        ticker.replace(/[34]$/, ''), // ALOS
        ticker + '.SA',            // ALOS3.SA  
        ticker.replace(/[34]$/, '') + '.SA', // ALOS.SA
        ticker.toUpperCase(),      // Garantir maiúscula
        ticker.toLowerCase()       // Tentar minúscula
      ];

      let todosResultados: any[] = [];
      let melhorEstrategia = '';

      // 🔄 TESTAR CADA COMBINAÇÃO
      for (const tickerTeste of tickerVariacoes) {
        console.log(`\n🎯 === TESTANDO TICKER: ${tickerTeste} ===`);
        
        for (const estrategia of estrategias) {
          try {
            const url = estrategia.getUrl(tickerTeste);
            console.log(`📡 ${estrategia.nome}: Buscando...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(url, {
              method: 'GET',
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; DividendSearcher/1.0)'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log(`📊 Status: ${response.status} | Content-Type: ${response.headers.get('content-type')}`);

            if (!response.ok) {
              console.log(`❌ HTTP ${response.status}`);
              continue;
            }

            // 🔍 VERIFICAR SE É JSON VÁLIDO
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              console.log(`⚠️ Não é JSON: ${contentType}`);
              continue;
            }

            let responseText;
            try {
              responseText = await response.text();
            } catch (textError) {
              console.log(`❌ Erro ao ler texto:`, textError);
              continue;
            }

            // 🔍 VERIFICAR SE NÃO É HTML
            if (responseText.trim().startsWith('<')) {
              console.log(`⚠️ Resposta é HTML`);
              continue;
            }

            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.log(`❌ JSON inválido:`, parseError);
              continue;
            }

            // 🔍 EXTRAIR DADOS
            const resultados = estrategia.extrair(data);
            
            if (resultados && resultados.length > 0) {
              console.log(`✅ ${estrategia.nome} (${tickerTeste}): ${resultados.length} resultados!`);
              
              // 📋 MOSTRAR CADA RESULTADO
              resultados.forEach((item: any, i: number) => {
                console.log(`  ${i + 1}. ${item.date || 'sem data'} - ${item.type || item.eventType || 'sem tipo'} - ${item.value || item.amount || 'sem valor'}`);
              });

              todosResultados = [...todosResultados, ...resultados];
              melhorEstrategia = `${estrategia.nome} (${tickerTeste})`;
              
              // Se encontrou muitos resultados, pode parar
              if (resultados.length >= 5) {
                console.log(`🎉 Muitos resultados encontrados, usando: ${melhorEstrategia}`);
                break;
              }
            } else {
              console.log(`📭 ${estrategia.nome} (${tickerTeste}): Sem resultados`);
            }

          } catch (err) {
            console.log(`❌ ${estrategia.nome} (${tickerTeste}): ${err}`);
          }
        }

        // Se já encontrou resultados suficientes, pode parar
        if (todosResultados.length >= 5) break;
      }

      // 🔄 PROCESSAR RESULTADOS
      console.log(`\n📊 === PROCESSAMENTO FINAL ===`);
      console.log(`Total bruto encontrado: ${todosResultados.length}`);
      console.log(`Melhor estratégia: ${melhorEstrategia}`);

      if (todosResultados.length > 0) {
        // 🔄 REMOVER DUPLICATAS
        const resultadosUnicos = removeDuplicatas(todosResultados);
        console.log(`Após remoção de duplicatas: ${resultadosUnicos.length}`);

        // 🔍 FILTRAR POR DATA
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`Data de entrada: ${dataEntradaDate.toISOString()}`);
        
        const dividendosProcessados = resultadosUnicos
          .filter((item: any) => {
            if (!item.date) return false;
            
            // Aceitar diferentes tipos de valor
            const valor = item.value || item.amount || item.rate || 0;
            if (valor <= 0) return false;
            
            try {
              const dataItem = new Date(item.date);
              const isAfterEntry = dataItem >= dataEntradaDate;
              
              console.log(`📅 ${item.date} (${item.type || 'N/A'}) - R$ ${valor} - Após entrada: ${isAfterEntry}`);
              return isAfterEntry;
            } catch {
              return false;
            }
          })
          .map((item: any) => ({
            date: item.date,
            value: item.value || item.amount || item.rate || 0,
            type: item.type || item.eventType || 'Provento',
            dataFormatada: new Date(item.date).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${(item.value || item.amount || item.rate || 0).toFixed(2).replace('.', ',')}`
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ FINAL: ${dividendosProcessados.length} proventos válidos desde ${dataEntrada}`);
        
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, dividendosProcessados));

        if (dividendosProcessados.length === 0) {
          setError(`Encontrados ${todosResultados.length} proventos, mas todos anteriores à entrada (${dataEntrada})`);
        }

      } else {
        console.log(`📭 NENHUM resultado encontrado em todas as estratégias`);
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError('Nenhum provento encontrado em nenhuma fonte. Pode não estar disponível na API.');
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
      const timer = setTimeout(buscarDividendos, 500);
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

// 🔄 FUNÇÃO PARA REMOVER DUPLICATAS
function removeDuplicatas(items: any[]): any[] {
  const vistos = new Set();
  return items.filter(item => {
    const chave = `${item.date}_${item.type || 'default'}_${item.value || item.amount || 0}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

// 📊 FUNÇÃO DE CÁLCULO (mesmo que antes)
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
