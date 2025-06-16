// 🔧 HOOK FORÇADO - Usando a MESMA URL e estrutura do debug que funcionou
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

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 === HOOK FORÇADO PARA ${ticker} ===`);
      console.log('📝 Parâmetros:', { ticker, dataEntrada, precoEntrada, precoAtual });

      // 🎯 USAR EXATAMENTE A MESMA URL DO DEBUG QUE FUNCIONOU
      const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true`;
      console.log(`📡 URL: ${url}`);

      const response = await fetch(url);
      console.log(`📤 Status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Data completa recebida:', data);

      // 🎯 EXTRAIR EXATAMENTE COMO O DEBUG FAZ
      let cashDividends: any[] = [];

      // Tentar todas as possíveis fontes de dividendos
      if (data.results?.[0]?.dividendsData?.cashDividends) {
        cashDividends = [...cashDividends, ...data.results[0].dividendsData.cashDividends];
        console.log('✅ Encontrado em results[0].dividendsData.cashDividends:', data.results[0].dividendsData.cashDividends.length);
      }

      if (data.dividendsData?.cashDividends) {
        cashDividends = [...cashDividends, ...data.dividendsData.cashDividends];
        console.log('✅ Encontrado em dividendsData.cashDividends:', data.dividendsData.cashDividends.length);
      }

      if (data.cashDividends) {
        cashDividends = [...cashDividends, ...data.cashDividends];
        console.log('✅ Encontrado em cashDividends:', data.cashDividends.length);
      }

      console.log(`💰 Total de dividendos brutos: ${cashDividends.length}`);

      if (cashDividends.length === 0) {
        console.log('❌ Nenhum dividendo encontrado na resposta');
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError('Nenhum dividendo encontrado na resposta da API.');
        return;
      }

      // 📅 PROCESSAR DATA DE ENTRADA
      const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
      console.log(`📅 Data de entrada: ${dataEntradaDate.toISOString()}`);

      // 🔄 REMOVER DUPLICATAS
      const resultadosUnicos = removeDuplicatasSimples(cashDividends);
      console.log(`🔄 Após duplicatas: ${resultadosUnicos.length}`);

      // 🔍 FILTRAR E PROCESSAR
      const dividendosProcessados = resultadosUnicos
        .filter((item: any) => {
          console.log(`\n🔍 Analisando:`, {
            paymentDate: item.paymentDate,
            approvedOn: item.approvedOn,
            rate: item.rate,
            label: item.label
          });

          // Verificar se tem data
          if (!item.paymentDate && !item.approvedOn) {
            console.log('❌ Sem data válida');
            return false;
          }

          // Verificar valor
          const valor = item.rate || 0;
          if (valor <= 0) {
            console.log('❌ Valor inválido:', valor);
            return false;
          }

          // Verificar data
          try {
            const dataParaComparar = item.paymentDate || item.approvedOn;
            const dataItem = new Date(dataParaComparar);
            const isAfterEntry = dataItem >= dataEntradaDate;
            
            console.log(`📅 ${dataParaComparar} - Após entrada: ${isAfterEntry} - R$ ${valor}`);
            
            return isAfterEntry;
          } catch (err) {
            console.log('❌ Erro na data:', err);
            return false;
          }
        })
        .map((item: any) => {
          const dataFinal = item.paymentDate || item.approvedOn;
          const dividendo = {
            date: dataFinal,
            value: item.rate || 0,
            type: item.label || 'Provento',
            dataFormatada: new Date(dataFinal).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${(item.rate || 0).toFixed(2).replace('.', ',')}`
          };
          console.log('💎 Processado:', dividendo);
          return dividendo;
        })
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`✅ RESULTADO FINAL: ${dividendosProcessados.length} dividendos válidos`);

      if (dividendosProcessados.length > 0) {
        console.log('🎯 Lista final de dividendos:', dividendosProcessados);
        
        setDividendos(dividendosProcessados);
        
        const performanceCalculada = calcularPerformance(precoEntrada, precoAtual, dividendosProcessados);
        console.log('📊 Performance:', performanceCalculada);
        setPerformance(performanceCalculada);
        
        setError(null);
      } else {
        const msg = `Encontrados ${cashDividends.length} dividendos, mas todos anteriores à entrada (${dataEntrada})`;
        console.log('⚠️', msg);
        setError(msg);
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro:`, err);
      setError(errorMessage);
      setDividendos([]);
      setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      console.log('🚀 Iniciando busca de dividendos...');
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

// 🔄 FUNÇÃO SIMPLES PARA REMOVER DUPLICATAS
function removeDuplicatasSimples(items: any[]): any[] {
  const vistos = new Set();
  return items.filter(item => {
    const chave = `${item.paymentDate || item.approvedOn || 'sem-data'}_${item.rate || 0}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
