// 🔍 HOOK COM DEBUG COMPLETO - Para identificar onde está o problema
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
      console.log('❌ Parâmetros faltando:', { ticker, dataEntrada, precoEntrada });
      setLoading(false);
      return;
    }

    console.log('🔍 === INICIANDO DEBUG COMPLETO ===');
    console.log('📝 Parâmetros recebidos:', { ticker, dataEntrada, precoEntrada, precoAtual });

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
            console.log('📊 Data recebida:', data);
            const result = data.results?.[0];
            const cashDividends = [
              ...(result?.dividendsData?.cashDividends || []),
              ...(data.dividendsData?.cashDividends || []),
              ...(data.cashDividends || [])
            ];
            console.log('💰 CashDividends extraídos:', cashDividends);
            return cashDividends;
          }
        }
      ];

      // 🔍 VARIAÇÕES DO TICKER (apenas a primeira para debug)
      const tickerVariacoes = [ticker];

      let todosResultados: any[] = [];

      // 🔄 TESTAR CADA COMBINAÇÃO
      for (const tickerTeste of tickerVariacoes) {
        console.log(`\n🎯 === TESTANDO TICKER: ${tickerTeste} ===`);
        
        for (const estrategia of estrategias) {
          try {
            const url = estrategia.getUrl(tickerTeste);
            console.log(`📡 ${estrategia.nome}: Buscando...`);
            console.log(`🔗 URL: ${url}`);
            
            const response = await fetch(url);
            console.log(`📤 Response status: ${response.status}`);

            if (!response.ok) {
              console.log(`❌ HTTP ${response.status}`);
              continue;
            }

            const data = await response.json();
            const resultados = estrategia.extrair(data);
            
            console.log(`📋 Resultados extraídos: ${resultados.length} itens`);
            
            if (resultados && resultados.length > 0) {
              console.log(`✅ ${estrategia.nome} (${tickerTeste}): ${resultados.length} resultados!`);
              
              // Debug detalhado de cada item
              resultados.forEach((item: any, i: number) => {
                console.log(`  ${i + 1}. paymentDate: ${item.paymentDate} | approvedOn: ${item.approvedOn} | label: ${item.label} | rate: ${item.rate}`);
              });

              todosResultados = [...todosResultados, ...resultados];
              break; // Para debug, usar só o primeiro que funcionar
            } else {
              console.log(`📭 ${estrategia.nome} (${tickerTeste}): Sem resultados`);
            }

          } catch (err) {
            console.log(`❌ ${estrategia.nome} (${tickerTeste}): ${err}`);
          }
        }

        if (todosResultados.length > 0) break;
      }

      // 🔄 PROCESSAR RESULTADOS COM DEBUG DETALHADO
      console.log(`\n📊 === PROCESSAMENTO FINAL ===`);
      console.log(`Total bruto encontrado: ${todosResultados.length}`);

      if (todosResultados.length > 0) {
        console.log('🔄 Removendo duplicatas...');
        const resultadosUnicos = removeDuplicatas(todosResultados);
        console.log(`Após remoção de duplicatas: ${resultadosUnicos.length}`);

        console.log('📅 Processando datas...');
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`Data de entrada: ${dataEntradaDate.toISOString()}`);
        
        console.log('🔍 Filtrando dividendos...');
        const dividendosProcessados = resultadosUnicos
          .filter((item: any) => {
            console.log(`\n🔍 Analisando item:`, item);
            
            // ✅ FILTRO CORRIGIDO
            if (!item.paymentDate && !item.approvedOn) {
              console.log('❌ Rejeitado: sem paymentDate nem approvedOn');
              return false;
            }
            
            const valor = item.rate || 0;
            if (valor <= 0) {
              console.log('❌ Rejeitado: valor <= 0');
              return false;
            }
            
            try {
              const dataParaComparar = item.paymentDate || item.approvedOn;
              const dataItem = new Date(dataParaComparar);
              const isAfterEntry = dataItem >= dataEntradaDate;
              
              console.log(`📅 Data: ${dataParaComparar} | Após entrada: ${isAfterEntry} | Valor: R$ ${valor}`);
              
              if (isAfterEntry) {
                console.log('✅ ACEITO!');
              } else {
                console.log('❌ Rejeitado: anterior à entrada');
              }
              
              return isAfterEntry;
            } catch (err) {
              console.log('❌ Rejeitado: erro na data', err);
              return false;
            }
          })
          .map((item: any) => {
            const dividendo = {
              date: item.paymentDate || item.approvedOn,
              value: item.rate || 0,
              type: item.label || 'Provento',
              dataFormatada: new Date(item.paymentDate || item.approvedOn).toLocaleDateString('pt-BR'),
              valorFormatado: `R$ ${(item.rate || 0).toFixed(2).replace('.', ',')}`
            };
            console.log('💎 Dividendo processado:', dividendo);
            return dividendo;
          })
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ FINAL: ${dividendosProcessados.length} proventos válidos desde ${dataEntrada}`);
        console.log('🎯 Dividendos finais:', dividendosProcessados);
        
        setDividendos(dividendosProcessados);
        
        const performanceCalculada = calcularPerformance(precoEntrada, precoAtual, dividendosProcessados);
        console.log('📊 Performance calculada:', performanceCalculada);
        setPerformance(performanceCalculada);

        if (dividendosProcessados.length === 0) {
          const errorMsg = `Encontrados ${todosResultados.length} proventos, mas todos anteriores à entrada (${dataEntrada})`;
          console.log('⚠️ ', errorMsg);
          setError(errorMsg);
        } else {
          setError(null);
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
      console.log('🚀 UseEffect disparado, iniciando busca em 500ms...');
      const timer = setTimeout(buscarDividendos, 500);
      return () => clearTimeout(timer);
    } else {
      console.log('❌ UseEffect: parâmetros faltando', { ticker, dataEntrada, precoEntrada });
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

// 🔄 FUNÇÃO DEBUG PARA REMOVER DUPLICATAS
function removeDuplicatas(items: any[]): any[] {
  console.log('🔄 Removendo duplicatas de', items.length, 'itens');
  const vistos = new Set();
  const resultado = items.filter(item => {
    const chave = `${item.paymentDate || item.approvedOn}_${item.label || 'default'}_${item.rate || 0}`;
    if (vistos.has(chave)) {
      console.log('🗑️ Duplicata removida:', chave);
      return false;
    }
    vistos.add(chave);
    return true;
  });
  console.log('✅ Após remoção:', resultado.length, 'itens únicos');
  return resultado;
}
