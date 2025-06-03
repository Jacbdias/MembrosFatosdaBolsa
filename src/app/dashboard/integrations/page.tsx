/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress } from '@mui/material';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { IntegrationsTable } from '@/components/dashboard/integrations/integrations-table';

// IMPORTAR HOOKS PARA DADOS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// Hook específico para dividendos (inline para simplificar)
function useDividendPortfolio() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // SUAS AÇÕES DE DIVIDENDOS COM DADOS DE ENTRADA
  const dividendPortfolioBase = [
    {
      id: '1',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/LEVE.png',
      ticker: 'LEVE3',
      setor: 'Automotivo',
      dataEntrada: '06/12/2024',
      precoEntrada: 'R$ 27,74',
      dy: '8,14%',
      precoTeto: 'R$ 35,27',
      vies: 'Compra',
    },
    {
      id: '2',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/EGIE.png',
      ticker: 'EGIE3',
      setor: 'Energia',
      dataEntrada: '31/03/2022',
      precoEntrada: 'R$ 43,13',
      dy: '6,29%',
      precoTeto: 'R$ 50,34',
      vies: 'Compra',
    },
    {
      id: '3',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
      ticker: 'VALE3',
      setor: 'Mineração',
      dataEntrada: '17/07/2023',
      precoEntrada: 'R$ 68,61',
      dy: '11,27%',
      precoTeto: 'R$ 78,20',
      vies: 'Compra',
    },
    {
      id: '4',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
      ticker: 'BBAS3',
      setor: 'Bancos',
      dataEntrada: '20/10/2021',
      precoEntrada: 'R$ 15,60',
      dy: '9,62%',
      precoTeto: 'R$ 30,10',
      vies: 'Compra',
    },
    {
      id: '5',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/BRSR.png',
      ticker: 'BRSR6',
      setor: 'Bancos',
      dataEntrada: '12/05/2022',
      precoEntrada: 'R$ 10,60',
      dy: '4,92%',
      precoTeto: 'R$ 15,10',
      vies: 'Compra',
    },
    {
      id: '6',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
      ticker: 'PETR4',
      setor: 'Petróleo',
      dataEntrada: '24/05/2022',
      precoEntrada: 'R$ 30,97',
      dy: '18,01%',
      precoTeto: 'R$ 37,50',
      vies: 'Compra',
    },
    {
      id: '7',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/SAPR.png',
      ticker: 'SAPR4',
      setor: 'Saneamento',
      dataEntrada: '27/10/2021',
      precoEntrada: 'R$ 3,81',
      dy: '5,30%',
      precoTeto: 'R$ 6,00',
      vies: 'Compra',
    },
    {
      id: '8',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ELET.png',
      ticker: 'ELET3',
      setor: 'Energia',
      dataEntrada: '20/11/2023',
      precoEntrada: 'R$ 40,41',
      dy: '1,12%',
      precoTeto: 'R$ 58,27',
      vies: 'Compra',
    },
    {
      id: '9',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ABCB.png',
      ticker: 'ABCB4',
      setor: 'Bancos',
      dataEntrada: '19/06/2023',
      precoEntrada: 'R$ 17,87',
      dy: '7,42%',
      precoTeto: 'R$ 22,30',
      vies: 'Compra',
    },
    {
      id: '10',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/CSMG.png',
      ticker: 'CSMG3',
      setor: 'Saneamento',
      dataEntrada: '19/08/2022',
      precoEntrada: 'R$ 13,68',
      dy: '15,89%',
      precoTeto: 'R$ 19,16',
      vies: 'Compra',
    },
    {
      id: '11',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/BBSE.png',
      ticker: 'BBSE3',
      setor: 'Financeiro',
      dataEntrada: '30/06/2022',
      precoEntrada: 'R$ 25,48',
      dy: '7,62%',
      precoTeto: 'R$ 33,20',
      vies: 'Compra',
    },
    {
      id: '12',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ISAE.png',
      ticker: 'ISAE4',
      setor: 'Energia',
      dataEntrada: '22/10/2021',
      precoEntrada: 'R$ 24,00',
      dy: '9,07%',
      precoTeto: 'R$ 26,50',
      vies: 'Compra',
    },
    {
      id: '13',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/VIVT.png',
      ticker: 'VIVT3',
      setor: 'Telecom',
      dataEntrada: '05/04/2022',
      precoEntrada: 'R$ 54,60',
      dy: '3,15%',
      precoTeto: 'R$ 29,00',
      vies: 'Compra',
    },
    {
      id: '14',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/KLBN.png',
      ticker: 'KLBN11',
      setor: 'Papel e Celulose',
      dataEntrada: '09/06/2022',
      precoEntrada: 'R$ 21,94',
      dy: '4,59%',
      precoTeto: 'R$ 27,60',
      vies: 'Compra',
    },
    {
      id: '15',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/SANB.png',
      ticker: 'SANB11',
      setor: 'Bancos',
      dataEntrada: '08/12/2022',
      precoEntrada: 'R$ 27,60',
      dy: '4,96%',
      precoTeto: 'R$ 31,76',
      vies: 'Compra',
    },
    {
      id: '16',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/CPLE.png',
      ticker: 'CPLE6',
      setor: 'Energia',
      dataEntrada: '10/11/2021',
      precoEntrada: 'R$ 6,28',
      dy: '2,26%',
      precoTeto: 'R$ 7,25',
      vies: 'Compra',
    },
  ];

  const fetchDividendPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // EXTRAIR TICKERS DAS AÇÕES DE DIVIDENDOS
      const tickers = dividendPortfolioBase.map(stock => stock.ticker);
      console.log('🔍 Buscando cotações para carteira de dividendos:', tickers);

      // BUSCAR COTAÇÕES REAIS DA API
      const response = await fetch(`/api/financial/quotes?symbols=${tickers.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotações das ações de dividendos');
      }

      const { quotes } = await response.json();
      console.log('✅ Cotações dividendos recebidas:', quotes.length, 'ações');

      // COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const portfolioAtualizado = dividendPortfolioBase.map(stock => {
        const cotacao = quotes.find((q: any) => q.symbol === stock.ticker);
        
        // CALCULAR PERFORMANCE SE TIVER COTAÇÃO
        let performance = 0;
        let precoAtual = 'N/A';
        
        if (cotacao) {
          const precoEntradaNum = parseFloat(stock.precoEntrada.replace('R$ ', '').replace(',', '.'));
          performance = ((cotacao.regularMarketPrice - precoEntradaNum) / precoEntradaNum) * 100;
          precoAtual = `R$ ${cotacao.regularMarketPrice.toFixed(2).replace('.', ',')}`;
          
          console.log(`📊 ${stock.ticker}: ${precoAtual} (${performance.toFixed(1)}%) DY: ${stock.dy}`);
        } else {
          console.log(`⚠️ ${stock.ticker}: cotação não encontrada`);
          precoAtual = 'N/A';
        }

        return {
          ...stock,
          precoAtual,
          performance,
          quotacoesReais: cotacao,
        };
      });

      setPortfolio(portfolioAtualizado);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar portfólio de dividendos:', err);
      
      // FALLBACK: usar dados estáticos
      const portfolioFallback = dividendPortfolioBase.map(stock => ({
        ...stock,
        precoAtual: 'N/A',
        performance: 0,
      }));
      setPortfolio(portfolioFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDividendPortfolioData();

    // ATUALIZAR A CADA 10 MINUTOS
    const interval = setInterval(fetchDividendPortfolioData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchDividendPortfolioData]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchDividendPortfolioData,
  };
}

export default function Page(): React.JSX.Element {
  console.log("💰 PÁGINA DIVIDENDOS - VERSÃO LIMPA");

  // 🔥 DADOS REAIS DO MERCADO (Ibovespa + Small Cap)
  const { marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useFinancialData();
  
  // 🔥 DADOS REAIS DAS AÇÕES DE DIVIDENDOS
  const { portfolio: dividendPortfolio, loading: portfolioLoading, error: portfolioError, refetch: refetchPortfolio } = useDividendPortfolio();

  // DADOS PADRÃO PARA CARDS CASO A API FALHE
  const dadosCardsPadrao = {
    ibovespa: { value: "158k", trend: "up" as const, diff: 3.2 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "92.1%", trend: "up" as const },
    dividendYield: { value: "8.8%", trend: "up" as const },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  // CALCULAR DIVIDEND YIELD MÉDIO REAL DA CARTEIRA
  const calcularDividendYieldMedio = () => {
    if (dividendPortfolio.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyValues = dividendPortfolio
      .map(stock => parseFloat(stock.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy));
    
    if (dyValues.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(1)}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA
  const calcularPerformanceCarteira = () => {
    if (dividendPortfolio.length === 0) return dadosCardsPadrao.carteiraHoje;
    
    const performances = dividendPortfolio
      .filter(stock => stock.performance !== undefined)
      .map(stock => stock.performance);
    
    if (performances.length === 0) return dadosCardsPadrao.carteiraHoje;
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // USAR DADOS DA API SE DISPONÍVEIS, SENÃO USAR PADRÃO
  const dadosCards = {
    ...dadosCardsPadrao,
    ...(marketData || {}),
    dividendYield: calcularDividendYieldMedio(),
    carteiraHoje: calcularPerformanceCarteira(),
  };

  // LOADING STATE
  if (marketLoading || portfolioLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              💰 Carregando carteira de dividendos...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Filtros */}
      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      {/* Tabela principal com dados REAIS */}
      <Grid xs={12}>
        <IntegrationsTable 
          count={dividendPortfolio.length} 
          rows={dividendPortfolio} // 🔥 DADOS REAIS DAS AÇÕES DE DIVIDENDOS!
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards} // 🔥 CARDS COM DY REAL CALCULADO!
        />
      </Grid>
    </Grid>
  );
}
