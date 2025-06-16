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

      console.log(`🔍 HOOK - Buscando dividendos para ${ticker}`);

      const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true`;
      console.log(`📡 URL: ${url}`);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      let cashDividends: any[] = [];

      if (data.results?.[0]?.dividendsData?.cashDividends) {
        cashDividends = [...cashDividends, ...data.results[0].dividendsData.cashDividends];
      }
      if (data.dividendsData?.cashDividends) {
        cashDividends = [...cashDividends, ...data.dividendsData.cashDividends];
      }
      if (data.cashDividends) {
        cashDividends = [...cashDividends, ...data.cashDividends];
      }

      console.log(`💰 Total bruto: ${cashDividends.length}`);

      if (cashDividends.length === 0) {
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError('Nenhum dividendo encontrado na resposta da API.');
        return;
      }

      const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-') + 'T00:00:00');

      const resultadosUnicos = removeDuplicatasSimples(cashDividends);

      const dividendosProcessados = resultadosUnicos
        .filter((item: any) => {
          const dataRaw = item.paymentDate || item.approvedOn;
          if (!dataRaw) return false;
          const dataItem = new Date(dataRaw);
          if (isNaN(dataItem.getTime())) return false;
          if (dataItem < dataEntradaDate) return false;

          const valor = item.rate || 0;
          return valor > 0;
        })
        .map((item: any) => {
          const dataFinal = item.paymentDate || item.approvedOn;
          return {
            date: dataFinal,
            value: item.rate || 0,
            type: item.label || 'Provento',
            dataFormatada: new Date(dataFinal).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${(item.rate || 0).toFixed(2).replace('.', ',')}`
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (dividendosProcessados.length > 0) {
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, dividendosProcessados));
        setError(null);
      } else {
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError(`Nenhum dividendo a partir de ${dataEntrada}`);
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro ao buscar dividendos:`, msg);
      setError(msg);
      setDividendos([]);
      setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
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
