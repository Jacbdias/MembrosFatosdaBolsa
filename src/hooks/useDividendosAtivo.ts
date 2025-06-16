// 🎯 HOOK CORRIGIDO PARA DIVIDENDOS
function useDividendosAtivo(
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

      console.log(`🔍 === BUSCA CORRIGIDA DE PROVENTOS PARA ${ticker} ===`);

      // 🔍 APENAS ESTRATÉGIAS QUE FUNCIONAM
      const estrategias = [
        {
          nome: 'Endpoint Básico com Dividendos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&dividends=true`,
          extrair: (data: any) => {
            // Múltiplas fontes possíveis na resposta
            const result = data.results?.[0];
            return [
              ...(result?.dividendsData?.cashDividends || []),
              ...(data.dividendsData?.cashDividends || []),
              ...(data.cashDividends || [])
            ];
          }
        },
        {
          nome: 'Endpoint Fundamental + Dividends',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividendsData?.cashDividends || []),
              ...(data.dividendsData?.cashDividends || [])
            ];
          }
        },
        {
          nome: 'Range 5 Anos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&range=5y&dividends=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividendsData?.cashDividends || []),
              ...(data.dividendsData?.cashDividends || [])
            ];
          }
        }
      ];

      // 🔍 VARIAÇÕES DO TICKER (sem as que falham)
      const tickerVariacoes = [
        ticker,
        ticker.toUpperCase(),
        ticker + '.SA'
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
            
            const response = await fetch(url, {
              method: 'GET',
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; DividendSearcher/1.0)'
              }
            });

            if (!response.ok) {
              console.log(`❌ HTTP ${response.status}`);
              continue;
            }

            const data = await response.json();
            const resultados = estrategia.extrair(data);
            
            if (resultados && resultados.length > 0) {
              console.log(`✅ ${estrategia.nome} (${tickerTeste}): ${resultados.length} resultados!`);
              
              resultados.forEach((item: any, i: number) => {
                console.log(`  ${i + 1}. ${item.paymentDate || 'sem data'} - ${item.label || 'sem tipo'} - R$ ${item.rate || 'sem valor'}`);
              });

              todosResultados = [...todosResultados, ...resultados];
              melhorEstrategia = `${estrategia.nome} (${tickerTeste})`;
              
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

        if (todosResultados.length >= 5) break;
      }

      // 🔄 PROCESSAR RESULTADOS COM ESTRUTURA CORRETA
      console.log(`\n📊 === PROCESSAMENTO FINAL ===`);
      console.log(`Total bruto encontrado: ${todosResultados.length}`);
      console.log(`Melhor estratégia: ${melhorEstrategia}`);

      if (todosResultados.length > 0) {
        const resultadosUnicos = removeDuplicatas(todosResultados);
        console.log(`Após remoção de duplicatas: ${resultadosUnicos.length}`);

        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`Data de entrada: ${dataEntradaDate.toISOString()}`);
        
        const dividendosProcessados = resultadosUnicos
          .filter((item: any) => {
            // 🔧 FILTROS CORRIGIDOS
            if (!item.paymentDate) return false; // paymentDate, não date
            
            const valor = item.rate || 0; // rate, não value
            if (valor <= 0) return false;
            
            try {
              const dataItem = new Date(item.paymentDate); // paymentDate, não date
              const isAfterEntry = dataItem >= dataEntradaDate;
              
              console.log(`📅 ${item.paymentDate} (${item.label || 'N/A'}) - R$ ${valor} - Após entrada: ${isAfterEntry}`);
              return isAfterEntry;
            } catch {
              return false;
            }
          })
          .map((item: any) => ({
            date: item.paymentDate, // paymentDate para date
            value: item.rate || 0,   // rate para value
            type: item.label || 'Provento', // label para type
            dataFormatada: new Date(item.paymentDate).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${(item.rate || 0).toFixed(2).replace('.', ',')}`
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

// 🔄 FUNÇÃO CORRIGIDA PARA REMOVER DUPLICATAS
function removeDuplicatas(items: any[]): any[] {
  const vistos = new Set();
  return items.filter(item => {
    // Usar paymentDate + label + rate para chave única
    const chave = `${item.paymentDate}_${item.label || 'default'}_${item.rate || 0}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
