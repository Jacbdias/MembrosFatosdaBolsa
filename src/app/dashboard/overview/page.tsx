/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { OverviewTable } from '@/components/dashboard/overview/overview-table';

// IMPORTAR O HOOK PARA DADOS FINANCEIROS REAIS (AGORA BUSCA DA SUA API INTERNA)
import { useFinancialData } from '@/hooks/useFinancialData';
// IMPORTAR OS UTILS FINANCEIROS
import { FinancialUtils } from '@/lib/financial-utils'; // Ensure this path is correct

// Assuming these types are defined in src/types/financial.ts
import { MarketData, StockData } from '@/types/financial'; 

// DADOS BASE DAS AÇÕES COM MAPEAMENTO PARA TICKERS VÁLIDOS DA BRAPI
const ativosBase = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    ticker: 'ALOS3',
    tickerBrapi: 'ALOS3',
    setor: 'Shoppings',
    dataEntrada: '15/01/2021',
    precoEntrada: 'R$ 26,68',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
    ticker: 'TUPY3',
    tickerBrapi: 'TUPY3',
    setor: 'Industrial',
    dataEntrada: '04/11/2020',
    precoEntrada: 'R$ 20,36',
    dy: '1,71%',
    precoTeto: 'R$ 31,50',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    ticker: 'PETR4',
    tickerBrapi: 'PETR4',
    setor: 'Petróleo',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 30,00',
    dy: '8,50%',
    precoTeto: 'R$ 40,00',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    ticker: 'VALE3',
    tickerBrapi: 'VALE3',
    setor: 'Mineração',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 80,00',
    dy: '12,00%',
    precoTeto: 'R$ 90,00',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ITUB.png',
    ticker: 'ITUB4',
    tickerBrapi: 'ITUB4',
    setor: 'Bancário',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 25,00',
    dy: '6,50%',
    precoTeto: 'R$ 35,00',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBDC.png',
    ticker: 'BBDC4',
    tickerBrapi: 'BBDC4',
    setor: 'Bancário',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 20,00',
    dy: '8,00%',
    precoTeto: 'R$ 25,00',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ABEV.png',
    ticker: 'ABEV3',
    tickerBrapi: 'ABEV3',
    setor: 'Bebidas',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 15,00',
    dy: '4,50%',
    precoTeto: 'R$ 18,00',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MGLU.png',
    ticker: 'MGLU3',
    tickerBrapi: 'MGLU3',
    setor: 'Varejo',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 10,00',
    dy: '0,00%',
    precoTeto: 'R$ 15,00',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    ticker: 'RECV3',
    tickerBrapi: 'RECV3',
    setor: 'Petróleo',
    dataEntrada: '23/07/2023',
    precoEntrada: 'R$ 22,29',
    dy: '11,07%',
    precoTeto: 'R$ 31,37',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    ticker: 'CSED3',
    tickerBrapi: 'CSED3',
    setor: 'Educação',
    dataEntrada: '10/12/2023',
    precoEntrada: 'R$ 4,49',
    dy: '4,96%',
    precoTeto: 'R$ 8,35',
  }
];

// HOOK PARA BUSCAR COTAÇÕES REAIS DAS AÇÕES DA BRAPI
// **IMPORTANT:** For client-side fetching of stock quotes, you still need NEXT_PUBLIC_BRAPI_TOKEN
// Alternatively, create a dedicated server-side API route for stock quotes.
function useBrapiCotacoesValidadas() {
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<StockData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarCotacoes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES DAS AÇÕES VIA API INTERNA /api/financial/stocks');

      // Use the internal API route for stocks for better security and caching control
      const response = await fetch('/api/financial/stocks', {
        method: 'POST', // Use POST if you're sending a list of tickers in the body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers: ativosBase.map(ativo => ativo.tickerBrapi) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
      }
      
      const { stockQuotes } = await response.json(); // Assuming your API route returns `stockQuotes`
      console.log('✅ Cotações de ações recebidas:', stockQuotes);
      
      const cotacoesMap = new Map<string, any>();
      stockQuotes.forEach((quote: any) => {
        cotacoesMap.set(quote.symbol, quote);
      });

      const ativosComCotacoes: StockData[] = ativosBase.map((ativo) => {
        const cotacao = cotacoesMap.get(ativo.tickerBrapi);
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        console.log(`\n🔄 Processando ${ativo.ticker}:`);
        console.log(`💵 Preço entrada: R$ ${precoEntradaNum}`);
        
        let processedStock: StockData;

        if (cotacao && cotacao.regularMarketPrice && cotacao.regularMarketPrice > 0) {
          const precoAtualNum = cotacao.regularMarketPrice;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 500) { // Arbitrary large change detection
            console.warn(`🚨 ${ativo.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            processedStock = {
              ...ativo,
              precoAtual: ativo.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: FinancialUtils.calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),
              dy: ativo.dy,
              statusApi: 'suspicious_price',
              nomeCompleto: cotacao.shortName || cotacao.longName || ativo.ticker,
            };
          } else {
            const precoAtualFormatado = FinancialUtils.formatCurrency(precoAtualNum);
            processedStock = {
              ...ativo,
              precoAtual: precoAtualFormatado,
              performance: performance,
              variacao: cotacao.regularMarketChange || 0,
              variacaoPercent: cotacao.regularMarketChangePercent || 0,
              volume: cotacao.regularMarketVolume || 0,
              vies: FinancialUtils.calcularViesAutomatico(ativo.precoTeto, precoAtualFormatado),
              dy: FinancialUtils.calcularDYAtualizado(ativo.dy, ativo.precoEntrada, precoAtualNum),
              statusApi: 'success',
              nomeCompleto: cotacao.shortName || cotacao.longName || ativo.ticker,
            };
          }
        } else {
          console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida, usando preço de entrada`);
          processedStock = {
            ...ativo,
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: FinancialUtils.calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),
            dy: ativo.dy,
            statusApi: 'not_found',
            nomeCompleto: ativo.ticker,
          };
        }
        return processedStock;
      });

      const sucessos = ativosComCotacoes.filter(a => a.statusApi === 'success').length;
      const suspeitos = ativosComCotacoes.filter(a => a.statusApi === 'suspicious_price').length;
      const naoEncontrados = ativosComCotacoes.filter(a => a.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS DE AÇÕES:');
      console.log(`✅ Sucessos: ${sucessos}/${ativosComCotacoes.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${ativosComCotacoes.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${ativosComCotacoes.length}`);
      
      if (sucessos > 0) {
        const performanceMedia = ativosComCotacoes
          .filter(a => a.statusApi === 'success')
          .reduce((sum, a) => sum + a.performance, 0) / sucessos;
        console.log(`📈 Performance média: ${performanceMedia.toFixed(2)}%`);
      }

      setAtivosAtualizados(ativosComCotacoes);

      if (sucessos < ativosComCotacoes.length / 2) {
        setError(`Apenas ${sucessos} de ${ativosComCotacoes.length} ações com cotação válida.`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} ações com preços suspeitos foram ignorados.`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar cotações de ações.';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações de ações:', err);
      
      const ativosFallback: StockData[] = ativosBase.map(ativo => ({
        ...ativo,
        precoAtual: ativo.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: FinancialUtils.calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),
        dy: ativo.dy,
        statusApi: 'error',
        nomeCompleto: 'Erro'
      }));
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarCotacoes();

    const interval = setInterval(buscarCotacoes, 10 * 60 * 1000); // Update every 10 minutes
    
    return () => clearInterval(interval);
  }, [buscarCotacoes]);

  return {
    ativosAtualizados,
    loading,
    error,
    refetch: buscarCotacoes,
  };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 PÁGINA OVERVIEW (AÇÕES) - VERSÃO FINAL COM VALORES REAIS BRAPI");

  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { ativosAtualizados, loading: cotacoesLoading, error: cotacoesError, refetch: cotacoesRefetch } = useBrapiCotacoesValidadas();

  // DADOS PADRÃO ATUALIZADOS - Estes serão sobrepostos pelos dados reais
  // quando useFinancialData retornar valores.
  const dadosCardsPadrao = {
    ibovespa: { value: "N/A", trend: "up" as const, diff: 0 }, // Will be replaced by marketData.ibovespa
    indiceSmall: { value: "N/A", trend: "up" as const, diff: 0 }, // Will be replaced by marketData.indiceSmall
    carteiraHoje: { value: "0.0%", trend: "up" as const, diff: 0 },
    dividendYield: { value: "0.0%", trend: "up" as const, diff: 0 },
    ibovespaPeriodo: { value: "N/A", trend: "up" as const, diff: 0 },
    carteiraPeriodo: { value: "0.0%", trend: "up" as const, diff: 0 },
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DAS AÇÕES
  const calcularDYAcoes = () => {
    if (ativosAtualizados.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyValues = ativosAtualizados
      .map(acao => parseFloat(acao.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(1).replace('.', ',')}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA AÇÕES
  const calcularPerformanceAcoes = () => {
    console.log('🔍 DEBUG calcularPerformanceAcoes:');
    console.log('- ativosAtualizados.length:', ativosAtualizados.length);
    
    if (ativosAtualizados.length === 0) {
      console.log('❌ Portfolio vazio, usando padrão');
      return dadosCardsPadrao.carteiraHoje;
    }
    
    const performances = ativosAtualizados
      .filter(acao => {
        const hasPerformance = acao.performance !== undefined && !isNaN(acao.performance);
        console.log(`🔍 ACAO ${acao.ticker}: performance = ${acao.performance}, válida = ${hasPerformance}`);
        return hasPerformance;
      })
      .map(acao => acao.performance);
    
    console.log('🔍 Performances válidas:', performances);
    
    if (performances.length === 0) {
      console.log('❌ Nenhuma performance válida, usando padrão');
      return dadosCardsPadrao.carteiraHoje;
    }
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    console.log('✅ Performance média calculada:', performancMedia);
    
    return {
      value: `${performancMedia.toFixed(1).replace('.', ',')}%`, // Format with comma
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // USAR DADOS DA API SE DISPONÍVEIS COM CÁLCULOS PERSONALIZADOS
  const dadosCards = {
    ...dadosCardsPadrao,
    // Overwrite with real market data if available
    ...(marketData?.ibovespa ? { ibovespa: marketData.ibovespa } : {}),
    ...(marketData?.indiceSmall ? { indiceSmall: marketData.indiceSmall } : {}),
    dividendYield: calcularDYAcoes(),
    carteiraHoje: calcularPerformanceAcoes(),
  };

  React.useEffect(() => {
    if (ativosAtualizados.length > 0) {
      console.log('\n🎯 RESULTADO FINAL PARA INTERFACE:');
      ativosAtualizados.forEach(ativo => {
        console.log(`📊 ${ativo.ticker}: ${ativo.precoAtual} (${ativo.statusApi}) - Performance: ${ativo.performance?.toFixed(2)}%`);
      });
    }
    console.log('Cards Data Final:', dadosCards);
  }, [ativosAtualizados, dadosCards]);

  // LOADING STATE
  if (cotacoesLoading || marketLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              📈 Carregando carteira e dados de mercado com cotações reais...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // ERROR HANDLING
  const hasError = marketError || cotacoesError;
  
  const refetchAll = async () => {
    await Promise.all([marketRefetch(), cotacoesRefetch()]);
  };

  return (
    <Grid container spacing={3}>
      {/* Alertas de status */}
      {hasError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={refetchAll}>
                🔄 Tentar Novamente
              </Button>
            }
            sx={{ mb: 1 }}
          >
            {marketError && `⚠️ Mercado: ${marketError}.`}
            {cotacoesError && `⚠️ Ações: ${cotacoesError}.`}
            {(marketError || cotacoesError) && ' Usando dados offline temporariamente.'}
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso para ações */}
      {!cotacoesError && ativosAtualizados.length > 0 && (
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Carteira de ações atualizada com sucesso - Cotações reais: {ativosAtualizados.filter(a => a.statusApi === 'success').length}/{ativosAtualizados.length} ações via BRAPI
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso para dados de mercado */}
      {!marketError && marketData && (marketData.ibovespa || marketData.indiceSmall) && (
        <Grid xs={12}>
          <Alert severity="info" sx={{ mb: 1 }}>
            📈 Dados de mercado em tempo real ({marketData.ibovespa?.value ? `Ibovespa: ${marketData.ibovespa.value} pts` : ''}
            {marketData.ibovespa && marketData.indiceSmall ? ' | ' : ''}
            {marketData.indiceSmall ? `Small Cap: R$ ${marketData.indiceSmall.value}` : ''})
          </Alert>
        </Grid>
      )}

      <Grid xs={12}>
        <Alert severity="info" sx={{ mb: 1 }}>
          🎯 Viés automático: Preço Teto &gt; Preço Atual = COMPRA | Caso contrário = AGUARDAR
        </Alert>
      </Grid>

      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      
      <Grid xs={12}>
        <OverviewTable 
          count={ativosAtualizados.length} 
          rows={ativosAtualizados}
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
        />
      </Grid>
    </Grid>
  );
}
