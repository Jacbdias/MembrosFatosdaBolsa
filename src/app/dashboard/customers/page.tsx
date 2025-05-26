/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { AtivosTable } from '@/components/dashboard/customer/customers-table';

// IMPORTAR HOOK PARA DADOS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// Hook específico para carteira de small caps / nanocaps
function useSmallCapPortfolio() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // SUAS AÇÕES SMALL/NANO CAPS COM DADOS DE ENTRADA
  const smallCapPortfolioBase = [
    {
      id: '1',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
      ticker: 'DEXP3',
      setor: 'Nanocap/Químico',
      dataEntrada: '27/01/2023',
      precoEntrada: 'R$ 7,96',
      dy: '5,91%',
      precoTeto: 'R$ 13,10',
      vies: 'Compra',
    },
    {
      id: '2',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
      ticker: 'KEPL3',
      setor: 'Agricultura',
      dataEntrada: '21/12/2020',
      precoEntrada: 'R$ 9,16',
      dy: '7,76%',
      precoTeto: 'R$ 11,00',
      vies: 'Compra',
    },
    {
      id: '3',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/EVEN.png',
      ticker: 'EVEN3',
      setor: 'C. Civil',
      dataEntrada: '06/06/2022',
      precoEntrada: 'R$ 5,18',
      dy: '19,57%',
      precoTeto: 'R$ 8,50',
      vies: 'Compra',
    },
    {
      id: '4',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/WIZC.png',
      ticker: 'WIZC3',
      setor: 'Seguros',
      dataEntrada: '30/04/2021',
      precoEntrada: 'R$ 10,94',
      dy: '4,21%',
      precoTeto: 'R$ 12,00',
      vies: 'Compra',
    },
    {
      id: '5',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/RANI.png',
      ticker: 'RANI3',
      setor: 'Papel',
      dataEntrada: '19/11/2020',
      precoEntrada: 'R$ 4,65',
      dy: '7,61%',
      precoTeto: 'R$ 10,57',
      vies: 'Compra',
    },
    {
      id: '6',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/SHUL.png',
      ticker: 'SHUL4',
      setor: 'Industrial',
      dataEntrada: '04/03/2021',
      precoEntrada: 'R$ 3,47',
      dy: '5,00%',
      precoTeto: 'R$ 5,45',
      vies: 'Compra',
    },
    {
      id: '7',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/RSUL.png',
      ticker: 'RSUL4',
      setor: 'Nanocap/Industrial',
      dataEntrada: '06/08/2021',
      precoEntrada: 'R$ 85,00',
      dy: '3,55%',
      precoTeto: 'R$ 100,00',
      vies: 'Compra',
    },
    {
      id: '8',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/TASA.png',
      ticker: 'TASA4',
      setor: 'Bens Industriais',
      dataEntrada: '27/06/2022',
      precoEntrada: 'R$ 17,14',
      dy: '2,90%',
      precoTeto: 'R$ 25,50',
      vies: 'Compra',
    },
    {
      id: '9',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/TRIS.png',
      ticker: 'TRIS3',
      setor: 'C. Civil',
      dataEntrada: '25/02/2022',
      precoEntrada: 'R$ 5,15',
      dy: '3,59%',
      precoTeto: 'R$ 5,79',
      vies: 'Compra',
    },
    {
      id: '10',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/CGRA.png',
      ticker: 'CGRA4',
      setor: 'Nanocap/C. cíclico',
      dataEntrada: '09/03/2023',
      precoEntrada: 'R$ 29,00',
      dy: '10,61%',
      precoTeto: 'R$ 42,50',
      vies: 'Compra',
    },
    {
      id: '11',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ROMI.png',
      ticker: 'ROMI3',
      setor: 'Bens Industriais',
      dataEntrada: '19/07/2022',
      precoEntrada: 'R$ 12,02',
      dy: '8,00%',
      precoTeto: 'R$ 19,40',
      vies: 'Compra',
    },
    {
      id: '12',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/POSI.png',
      ticker: 'POSI3',
      setor: 'Tecnologia',
      dataEntrada: '22/04/2022',
      precoEntrada: 'R$ 8,67',
      dy: '6,86%',
      precoTeto: 'R$ 10,16',
      vies: 'Compra',
    },
    {
      id: '13',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/CEAB.png',
      ticker: 'CEAB3',
      setor: 'Consumo cíclico',
      dataEntrada: '04/05/2023',
      precoEntrada: 'R$ 2,95',
      dy: '0,00%',
      precoTeto: 'R$ 10,94',
      vies: 'Compra',
    },
    {
      id: '14',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/LOGG.png',
      ticker: 'LOGG3',
      setor: 'Logística',
      dataEntrada: '25/11/2022',
      precoEntrada: 'R$ 18,96',
      dy: '2,99%',
      precoTeto: 'R$ 25,00',
      vies: 'Compra',
    },
    {
      id: '15',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/AGRO.png',
      ticker: 'AGRO3',
      setor: 'Agricultura',
      dataEntrada: '09/10/2020',
      precoEntrada: 'R$ 23,00',
      dy: '6,59%',
      precoTeto: 'R$ 31,80',
      vies: 'Compra',
    },
  ];

  const fetchSmallCapPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // EXTRAIR TICKERS DAS SMALL/NANO CAPS
      const tickers = smallCapPortfolioBase.map(stock => stock.ticker);
      console.log('🔍 Buscando cotações para small caps:', tickers);

      // BUSCAR COTAÇÕES REAIS DA API
      const response = await fetch(`/api/financial/quotes?symbols=${tickers.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotações das small caps');
      }

      const { quotes } = await response.json();
      console.log('✅ Cotações small caps recebidas:', quotes.length, 'ações');

      // COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const portfolioAtualizado = smallCapPortfolioBase.map(stock => {
        const cotacao = quotes.find((q: any) => q.symbol === stock.ticker);
        
        // CALCULAR PERFORMANCE SE TIVER COTAÇÃO
        let performance = 0;
        let precoAtual = 'N/A';
        
        if (cotacao) {
          const precoEntradaNum = parseFloat(stock.precoEntrada.replace('R$ ', '').replace(',', '.'));
          performance = ((cotacao.regularMarketPrice - precoEntradaNum) / precoEntradaNum) * 100;
          precoAtual = `R$ ${cotacao.regularMarketPrice.toFixed(2).replace('.', ',')}`;
          
          console.log(`📊 ${stock.ticker}: ${precoAtual} (${performance.toFixed(1)}%)`);
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
      console.error('❌ Erro ao buscar small caps:', err);
      
      // FALLBACK: usar dados estáticos
      const portfolioFallback = smallCapPortfolioBase.map(stock => ({
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
    fetchSmallCapPortfolioData();

    // ATUALIZAR A CADA 10 MINUTOS
    const interval = setInterval(fetchSmallCapPortfolioData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchSmallCapPortfolioData]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchSmallCapPortfolioData,
  };
}

export default function Page(): React.JSX.Element {
  // 🔥 DADOS REAIS DO MERCADO
  const { marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useFinancialData();
  
  // 🔥 DADOS REAIS DAS SMALL/NANO CAPS
  const { portfolio: smallCapPortfolio, loading: portfolioLoading, error: portfolioError, refetch: refetchPortfolio } = useSmallCapPortfolio();

  // DADOS PADRÃO CASO A API FALHE
  const dadosCardsPadrao = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const },
    dividendYield: { value: "7.4%", trend: "up" as const },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA SMALL CAPS
  const calcularPerformanceSmallCaps = () => {
    if (smallCapPortfolio.length === 0) return dadosCardsPadrao.carteiraHoje;
    
    const performances = smallCapPortfolio
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

  // CALCULAR DIVIDEND YIELD MÉDIO DAS SMALL CAPS
  const calcularDYSmallCaps = () => {
    if (smallCapPortfolio.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyValues = smallCapPortfolio
      .map(stock => parseFloat(stock.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(1)}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // USAR DADOS DA API SE DISPONÍVEIS
  const dadosCards = {
    ...dadosCardsPadrao,
    ...(marketData || {}),
    carteiraHoje: calcularPerformanceSmallCaps(),
    dividendYield: calcularDYSmallCaps(),
  };

  // LOADING STATE
  if (marketLoading || portfolioLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={40} />
          <Box ml={2} sx={{ fontSize: '1.1rem' }}>
            📈 Carregando small caps e nanocaps...
          </Box>
        </Box>
      </div>
    );
  }

  // ERROR HANDLING
  const hasError = marketError || portfolioError;
  
  const refetchAll = async () => {
    await Promise.all([refetchMarket(), refetchPortfolio()]);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Alertas de status */}
      {hasError && (
        <Alert 
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={refetchAll}>
              🔄 Tentar Novamente
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {marketError && `⚠️ Mercado: ${marketError}`}
          {portfolioError && `⚠️ Small Caps: ${portfolioError}`}
          {hasError && ' - Usando dados offline temporariamente'}
        </Alert>
      )}

      {/* Indicador de sucesso */}
      {!hasError && marketData && smallCapPortfolio.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Small/Nano Caps atualizadas - {smallCapPortfolio.length} ações com preços reais | 
          Performance média: {calcularPerformanceSmallCaps().value} | 
          DY médio: {calcularDYSmallCaps().value}
        </Alert>
      )}

      <AtivosTable 
        count={smallCapPortfolio.length} 
        rows={smallCapPortfolio} // 🔥 DADOS REAIS DAS SMALL CAPS!
        page={0} 
        rowsPerPage={5}
        cardsData={dadosCards} // 🔥 CARDS COM DADOS REAIS!
      />
    </div>
  );
}
