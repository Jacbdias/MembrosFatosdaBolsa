// 🎯 Hook Otimizado para BRAPI Premium
'use client';

import * as React from 'react';

interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
  exDate?: string;
  paymentDate?: string;
  label?: string;
  relatedTo?: string;
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
  fonte: string;
  ultimaAtualizacao: string;
}

export function useDividendosAtivoPremium(
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

      console.log(`🏆 === BUSCA PREMIUM BRAPI PARA ${ticker} ===`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 🏆 ESTRATÉGIAS PREMIUM BRAPI (aproveitando recursos pagos)
      const estrategiasPremium = [
        {
          nome: 'Premium: Histórico Completo 10 Anos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&range=10y&fundamental=true&dividends=true&modules=dividends,fundamentals,summaryProfile`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividendsData?.cashDividends || []),
              ...(result?.dividendsData?.stockDividends || []),
              ...(result?.dividendsData?.subscriptions || [])
            ];
          }
        },
        {
          nome: 'Premium: Dividends Data Detalhado',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&dividends=true&fundamental=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            const dividends = result?.dividendsData;
            if (!dividends) return [];
            
            return [
              ...(dividends.cashDividends || []),
              ...(dividends.stockDividends || []),
              ...(dividends.subscriptions || [])
            ];
          }
        },
        {
          nome: 'Premium: Endpoint Dividendos Dedicado',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}/dividends?token=${BRAPI_TOKEN}&range=10y`,
          extrair: (data: any) => {
            return [
              ...(data.dividends || []),
              ...(data.stockDividends || []),
              ...(data.cashDividends || [])
            ];
          }
        },
        {
          nome: 'Premium: Módulos Específicos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&modules=dividends,earnings,splits&range=max`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.earnings || []),
              ...(result?.splits || [])
            ];
          }
        }
      ];

      // 🔍 VARIAÇÕES PREMIUM DO TICKER
      const tickerVariacoesPremium = [
        ticker,                          // ALOS3
        ticker.replace(/[34]$/, ''),     // ALOS
        ticker + '.SA',                  // ALOS3.SA
        ticker.replace(/[34]$/, '') + '.SA' // ALOS.SA
      ];

      let todosDividendos: any[] = [];
      let melhorEstrategia = '';
      let fonteDetalhada = '';

      // 🔄 BUSCA OTIMIZADA PARA PREMIUM
      for (const tickerTeste of tickerVariacoesPremium) {
        console.log(`\n🎯 === TESTANDO TICKER PREMIUM: ${tickerTeste} ===`);
        
        for (const estrategia of estrategiasPremium) {
          try {
            const url = estrategia.getUrl(tickerTeste);
            console.log(`🏆 ${estrategia.nome}: Buscando...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout maior para premium

            const response = await fetch(url, {
              method: 'GET',
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'BRAPI-Premium-Client/1.0',
                'X-Brapi-Premium': 'true' // Header para identificar cliente premium
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log(`📊 Status: ${response.status} | Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

            if (!response.ok) {
              console.log(`❌ HTTP ${response.status} - ${response.statusText}`);
              continue;
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              console.log(`⚠️ Não é JSON: ${contentType}`);
              continue;
            }

            let responseText;
            try {
              responseText = await response.text();
              console.log(`📄 Response length: ${responseText.length} chars`);
            } catch (textError) {
              console.log(`❌ Erro ao ler resposta:`, textError);
              continue;
            }

            if (responseText.trim().startsWith('<')) {
              console.log(`⚠️ Resposta é HTML (possível erro de servidor)`);
              continue;
            }

            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.log(`❌ JSON inválido:`, parseError);
              console.log(`Primeiros 500 chars:`, responseText.substring(0, 500));
              continue;
            }

            // 🏆 EXTRAIR DADOS PREMIUM
            const resultados = estrategia.extrair(data);
            
            if (resultados && resultados.length > 0) {
              console.log(`✅ ${estrategia.nome} (${tickerTeste}): ${resultados.length} dividendos encontrados!`);
              
              // 📋 LOG DETALHADO DOS DIVIDENDOS
              resultados.forEach((item: any, i: number) => {
                const data = item.paymentDate || item.date || item.approvedOn;
                const valor = item.rate || item.value || item.amount || item.factor;
                const tipo = item.type || item.label || item.eventType || 'N/A';
                const periodo = item.relatedTo || item.remarks || '';
                
                console.log(`  ${i + 1}. ${data} - ${tipo} - R$ ${valor} ${periodo ? `(${periodo})` : ''}`);
              });

              todosDividendos = [...todosDividendos, ...resultados];
              melhorEstrategia = estrategia.nome;
              fonteDetalhada = `${estrategia.nome} via ${tickerTeste}`;
              
              // Se encontrou muitos resultados com a estratégia premium, pode parar
              if (resultados.length >= 10) {
                console.log(`🎉 Muitos dividendos encontrados com BRAPI Premium!`);
                break;
              }
            } else {
              console.log(`📭 ${estrategia.nome} (${tickerTeste}): Sem resultados`);
              
              // 🔍 DEBUG: Mostrar estrutura da resposta
              if (data) {
                console.log(`🔍 Estrutura da resposta:`, Object.keys(data));
                if (data.results?.[0]) {
                  console.log(`🔍 Estrutura result[0]:`, Object.keys(data.results[0]));
                }
              }
            }

          } catch (err) {
            console.log(`❌ ${estrategia.nome} (${tickerTeste}): ${err}`);
          }
        }

        // Se já encontrou resultados com premium, pode parar
        if (todosDividendos.length >= 10) break;
      }

      // 🔄 PROCESSAR RESULTADOS PREMIUM
      console.log(`\n📊 === PROCESSAMENTO PREMIUM ===`);
      console.log(`Total encontrado: ${todosDividendos.length}`);
      console.log(`Melhor estratégia: ${melhorEstrategia}`);
      console.log(`Fonte detalhada: ${fonteDetalhada}`);

      if (todosDividendos.length > 0) {
        // 🔄 REMOVER DUPLICATAS AVANÇADO
        const dividendosUnicos = removeDuplicatasAvancado(todosDividendos);
        console.log(`Após remoção de duplicatas: ${dividendosUnicos.length}`);

        // 🔍 FILTRAR POR DATA DE ENTRADA
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`Data de entrada: ${dataEntradaDate.toISOString()}`);
        
        const dividendosProcessados = dividendosUnicos
          .filter((item: any) => {
            if (!item.paymentDate && !item.date && !item.approvedOn) return false;
            
            const valor = item.rate || item.value || item.amount || item.factor || 0;
            if (valor <= 0) return false;
            
            try {
              const dataItem = new Date(item.paymentDate || item.date || item.approvedOn);
              const isAfterEntry = dataItem >= dataEntradaDate;
              
              console.log(`📅 ${dataItem.toLocaleDateString('pt-BR')} (${item.type || item.label || 'N/A'}) - R$ ${valor} - Válido: ${isAfterEntry}`);
              return isAfterEntry;
            } catch {
              return false;
            }
          })
          .map((item: any) => {
            const data = item.paymentDate || item.date || item.approvedOn;
            const valor = item.rate || item.value || item.amount || item.factor || 0;
            
            return {
              date: data,
              value: valor,
              type: item.type || item.label || item.eventType || 'Provento',
              dataFormatada: new Date(data).toLocaleDateString('pt-BR'),
              valorFormatado: `R$ ${valor.toFixed(4).replace('.', ',')}`,
              exDate: item.lastDatePrior,
              paymentDate: item.paymentDate,
              label: item.label,
              relatedTo: item.relatedTo
            };
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ FINAL PREMIUM: ${dividendosProcessados.length} dividendos válidos`);
        
        setDividendos(dividendosProcessados);
        const performanceCalculada = calcularPerformancePremium(precoEntrada, precoAtual, dividendosProcessados);
        performanceCalculada.fonte = fonteDetalhada;
        performanceCalculada.ultimaAtualizacao = new Date().toLocaleString('pt-BR');
        setPerformance(performanceCalculada);

        if (dividendosProcessados.length === 0) {
          setError(`BRAPI Premium encontrou ${todosDividendos.length} dividendos, mas todos anteriores à entrada (${dataEntrada})`);
        }

      } else {
        console.log(`📭 NENHUM dividendo encontrado mesmo com BRAPI Premium`);
        setDividendos([]);
        const performanceFallback = calcularPerformancePremium(precoEntrada, precoAtual, []);
        performanceFallback.fonte = 'BRAPI Premium (sem dados)';
        performanceFallback.ultimaAtualizacao = new Date().toLocaleString('pt-BR');
        setPerformance(performanceFallback);
        setError('BRAPI Premium: Nenhum dividendo encontrado. A empresa pode não ter distribuído proventos ou os dados podem não estar disponíveis.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral no BRAPI Premium:`, err);
      setError(`BRAPI Premium: ${errorMessage}`);
      
      setDividendos([]);
      const performanceFallback = calcularPerformancePremium(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      performanceFallback.fonte = 'BRAPI Premium (erro)';
      performanceFallback.ultimaAtualizacao = new Date().toLocaleString('pt-BR');
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

// 🔄 REMOÇÃO DE DUPLICATAS AVANÇADA
function removeDuplicatasAvancado(items: any[]): any[] {
  const vistos = new Map();
  
  return items.filter(item => {
    const data = item.paymentDate || item.date || item.approvedOn;
    const valor = item.rate || item.value || item.amount || item.factor || 0;
    const tipo = item.type || item.label || item.eventType || 'default';
    
    // Chave mais robusta para identificar duplicatas
    const chave = `${data}_${tipo}_${valor.toFixed(4)}`;
    
    if (vistos.has(chave)) {
      console.log(`🔄 Removendo duplicata: ${chave}`);
      return false;
    }
    
    vistos.set(chave, true);
    return true;
  });
}

// 📊 CÁLCULO DE PERFORMANCE PREMIUM
function calcularPerformancePremium(
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

  // 📊 ANÁLISE POR ANO MAIS DETALHADA
  const dividendosPorAno: { [ano: string]: number } = {};
  const countPorAno: { [ano: string]: number } = {};
  
  dividendos.forEach(div => {
    try {
      const ano = new Date(div.date).getFullYear().toString();
      dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + (div.value || 0);
      countPorAno[ano] = (countPorAno[ano] || 0) + 1;
    } catch {
      // Ignorar datas inválidas
    }
  });

  const anos = Object.keys(dividendosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(dividendosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  // 📊 LOG DA ANÁLISE
  console.log(`📊 === ANÁLISE DE PERFORMANCE PREMIUM ===`);
  console.log(`Capital: ${performanceCapital.toFixed(2)}%`);
  console.log(`Dividendos: R$ ${dividendosTotal.toFixed(4)} (${dividendosPercentual.toFixed(2)}%)`);
  console.log(`Total: ${performanceTotal.toFixed(2)}%`);
  console.log(`Dividendos por ano:`, dividendosPorAno);

  return {
    performanceCapital,
    dividendosTotal,
    dividendosPercentual,
    performanceTotal,
    quantidadeDividendos: dividendos.length,
    ultimoDividendo,
    dividendosPorAno,
    mediaAnual,
    status: dividendos.length > 0 ? 'success' : 'partial',
    fonte: '',
    ultimaAtualizacao: ''
  };
}
