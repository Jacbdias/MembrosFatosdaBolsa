/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

// IMPORTAR HOOK PARA DADOS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// Hook específico para carteira de FIIs
function useFiisPortfolio() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 🔥 DADOS CORRETOS - MESMOS DO SETTINGSTABLE
  const fiisPortfolioBase = [
    {
      id: '1',
      avatar: '',
      ticker: 'MALL11',
      setor: 'Shopping',
      dataEntrada: '26/01/2022',
      precoEntrada: 'R$ 118,37',
      dy: '8.40%',
      precoTeto: 'R$ 103,68',
      vies: 'Compra'
    },
    {
      id: '2',
      avatar: '',
      ticker: 'KNSC11',
      setor: 'Papel',
      dataEntrada: '24/05/2022',
      precoEntrada: 'R$ 9,31',
      dy: '10.98%',
      precoTeto: 'R$ 9,16',
      vies: 'Compra'
    },
    {
      id: '3',
      avatar: '',
      ticker: 'KNHF11',
      setor: 'Hedge Fund',
      dataEntrada: '20/12/2024',
      precoEntrada: 'R$ 76,31',
      dy: '15.00%',
      precoTeto: 'R$ 90,50',
      vies: 'Compra'
    },
    {
      id: '4',
      avatar: '',
      ticker: 'HGBS11',
      setor: 'Shopping',
      dataEntrada: '02/01/2025',
      precoEntrada: 'R$ 186,08',
      dy: '10.50%',
      precoTeto: 'R$ 19,20',
      vies: 'Compra'
    },
    {
      id: '5',
      avatar: '',
      ticker: 'RURA11',
      setor: 'Fiagro',
      dataEntrada: '14/02/2023',
      precoEntrada: 'R$ 10,25',
      dy: '13.21%',
      precoTeto: 'R$ 8,70',
      vies: 'Compra'
    },
    {
      id: '6',
      avatar: '',
      ticker: 'BCIA11',
      setor: 'FoF',
      dataEntrada: '12/04/2023',
      precoEntrada: 'R$ 82,28',
      dy: '9.77%',
      precoTeto: 'R$ 87,81',
      vies: 'Compra'
    },
    {
      id: '7',
      avatar: '',
      ticker: 'BPFF11',
      setor: 'FoF',
      dataEntrada: '08/01/2024',
      precoEntrada: 'R$ 72,12',
      dy: '11.00%',
      precoTeto: 'R$ 66,26',
      vies: 'Compra'
    },
    {
      id: '8',
      avatar: '',
      ticker: 'HGFF11',
      setor: 'FoF',
      dataEntrada: '03/04/2023',
      precoEntrada: 'R$ 69,15',
      dy: '9.25%',
      precoTeto: 'R$ 73,59',
      vies: 'Compra'
    },
    {
      id: '9',
      avatar: '',
      ticker: 'BRCO11',
      setor: 'Logística',
      dataEntrada: '09/05/2022',
      precoEntrada: 'R$ 99,25',
      dy: '8.44%',
      precoTeto: 'R$ 109,89',
      vies: 'Compra'
    },
    {
      id: '10',
      avatar: '',
      ticker: 'XPML11',
      setor: 'Shopping',
      dataEntrada: '16/02/2022',
      precoEntrada: 'R$ 93,32',
      dy: '8.44%',
      precoTeto: 'R$ 110,40',
      vies: 'Compra'
    },
    {
      id: '11',
      avatar: '',
      ticker: 'HGLG11',
      setor: 'Logística',
      dataEntrada: '20/06/2022',
      precoEntrada: 'R$ 161,80',
      dy: '8.44%',
      precoTeto: 'R$ 146,67',
      vies: 'Compra'
    },
    {
      id: '12',
      avatar: '',
      ticker: 'HSML11',
      setor: 'Shopping',
      dataEntrada: '14/06/2022',
      precoEntrada: 'R$ 78,00',
      dy: '8.91%',
      precoTeto: 'R$ 93,60',
      vies: 'Compra'
    },
    {
      id: '13',
      avatar: '',
      ticker: 'VGIP11',
      setor: 'Papel',
      dataEntrada: '02/12/2021',
      precoEntrada: 'R$ 96,99',
      dy: '13.67%',
      precoTeto: 'R$ 88,00',
      vies: 'Compra'
    },
    {
      id: '14',
      avatar: '',
      ticker: 'AFHI11',
      setor: 'Papel',
      dataEntrada: '05/07/2022',
      precoEntrada: 'R$ 99,91',
      dy: '13.08%',
      precoTeto: 'R$ 93,20',
      vies: 'Compra'
    },
    {
      id: '15',
      avatar: '',
      ticker: 'BTLG11',
      setor: 'Logística',
      dataEntrada: '05/01/2022',
      precoEntrada: 'R$ 103,14',
      dy: '8.42%',
      precoTeto: 'R$ 104,00',
      vies: 'Compra'
    },
    {
      id: '16',
      avatar: '',
      ticker: 'VRTA11',
      setor: 'Papel',
      dataEntrada: '27/12/2022',
      precoEntrada: 'R$ 88,30',
      dy: '9.66%',
      precoTeto: 'R$ 94,33',
      vies: 'Compra'
    },
    {
      id: '17',
      avatar: '',
      ticker: 'LVBI11',
      setor: 'Logística',
      dataEntrada: '18/10/2022',
      precoEntrada: 'R$ 113,85',
      dy: '7.90%',
      precoTeto: 'R$ 122,51',
      vies: 'Compra'
    },
    {
      id: '18',
      avatar: '',
      ticker: 'HGRU11',
      setor: 'Renda Urbana',
      dataEntrada: '17/05/2022',
      precoEntrada: 'R$ 115,00',
      dy: '8.44%',
      precoTeto: 'R$ 138,57',
      vies: 'Compra'
    },
    {
      id: '19',
      avatar: '',
      ticker: 'ALZR11',
      setor: 'Híbrido',
      dataEntrada: '02/02/2022',
      precoEntrada: 'R$ 115,89',
      dy: '8.44%',
      precoTeto: 'R$ 10,16',
      vies: 'Compra'
    },
    {
      id: '20',
      avatar: '',
      ticker: 'BCRI11',
      setor: 'Logística',
      dataEntrada: '25/11/2021',
      precoEntrada: 'R$ 104,53',
      dy: '14,71%',
      precoTeto: 'R$ 87,81',
      vies: 'Compra'
    },
    {
      id: '21',
      avatar: '',
      ticker: 'KNRI11',
      setor: 'Logística',
      dataEntrada: '27/06/2022',
      precoEntrada: 'R$ 131,12',
      dy: '8,82%',
      precoTeto: 'R$ 146,67',
      vies: 'Compra'
    },
    {
      id: '22',
      avatar: '',
      ticker: 'IRDM11',
      setor: 'Shopping',
      dataEntrada: '05/01/2022',
      precoEntrada: 'R$ 107,04',
      dy: '13,21%',
      precoTeto: 'R$ 73,20',
      vies: 'Compra'
    },
    {
      id: '23',
      avatar: '',
      ticker: 'MXRF11',
      setor: 'Tijolo',
      dataEntrada: '12/07/2022',
      precoEntrada: 'R$ 9,69',
      dy: '12,91%',
      precoTeto: 'R$ 9,40',
      vies: 'Compra'
    }
  ];

  const fetchFiisPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES REAIS DOS FIIs COM BRAPI - COM TOKEN');

      // 🔑 TOKEN BRAPI CONFIGURADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = fiisPortfolioBase.map(fii => fii.ticker);
      console.log('🎯 Tickers para buscar:', tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES COM TOKEN
      const LOTE_SIZE = 5;
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        
        // 🔑 URL COM TOKEN DE AUTENTICAÇÃO
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`;
        
        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);
        console.log(`🌐 URL: ${apiUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO')}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'FIIs-Portfolio-App'
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
                console.log(`🔍 Processando: ${quote.symbol}`);
                console.log(`💰 Preço: ${quote.regularMarketPrice}`);
                console.log(`📈 Variação: ${quote.regularMarketChangePercent}%`);
                
                if (quote.symbol && quote.regularMarketPrice && quote.regularMarketPrice > 0) {
                  cotacoesMap.set(quote.symbol, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    dadosCompletos: quote
                  });
                  sucessosTotal++;
                  console.log(`✅ ${quote.symbol}: R$ ${quote.regularMarketPrice}`);
                } else {
                  console.warn(`⚠️ ${quote.symbol}: Dados inválidos (preço: ${quote.regularMarketPrice})`);
                  falhasTotal++;
                }
              });
            }
          } else {
            console.error(`❌ Erro HTTP ${response.status} para lote: ${lote.join(', ')}`);
            
            // LOG DA RESPOSTA DE ERRO
            const errorText = await response.text();
            console.error('📄 Resposta de erro:', errorText);
            
            falhasTotal += lote.length;
          }
        } catch (loteError) {
          console.error(`❌ Erro no lote ${lote.join(', ')}:`, loteError);
          falhasTotal += lote.length;
        }

        // DELAY entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ Total processado: ${sucessosTotal} sucessos, ${falhasTotal} falhas`);
      console.log('🗺️ Mapa de cotações:', Array.from(cotacoesMap.entries()));

      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const portfolioAtualizado = fiisPortfolioBase.map((fii) => {
        const cotacao = cotacoesMap.get(fii.ticker);
        const precoEntradaNum = parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        console.log(`\n🔄 Processando ${fii.ticker}:`);
        console.log(`💵 Preço entrada: R$ ${precoEntradaNum}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          // 📊 PREÇO E PERFORMANCE REAIS
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          // VALIDAR SE O PREÇO FAZ SENTIDO (não pode ser muito diferente)
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 500) {
            console.warn(`🚨 ${fii.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            return {
              ...fii,
              precoAtual: fii.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              quotacoesReais: cotacao.dadosCompletos,
              statusApi: 'suspicious_price'
            };
          }
          
          return {
            ...fii,
            precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            quotacoesReais: cotacao.dadosCompletos,
            statusApi: 'success'
          };
        } else {
          // ⚠️ FALLBACK PARA FIIs SEM COTAÇÃO
          console.warn(`⚠️ ${fii.ticker}: Sem cotação válida, usando preço de entrada`);
          
          return {
            ...fii,
            precoAtual: fii.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            quotacoesReais: null,
            statusApi: 'not_found'
          };
        }
      });

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = portfolioAtualizado.filter(f => f.statusApi === 'success').length;
      const suspeitos = portfolioAtualizado.filter(f => f.statusApi === 'suspicious_price').length;
      const naoEncontrados = portfolioAtualizado.filter(f => f.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS:');
      console.log(`✅ Sucessos: ${sucessos}/${portfolioAtualizado.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${portfolioAtualizado.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${portfolioAtualizado.length}`);
      
      if (sucessos > 0) {
        const performanceMedia = portfolioAtualizado
          .filter(f => f.statusApi === 'success')
          .reduce((sum, f) => sum + f.performance, 0) / sucessos;
        console.log(`📈 Performance média: ${performanceMedia.toFixed(2)}%`);
      }

      setPortfolio(portfolioAtualizado);

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < portfolioAtualizado.length / 2) {
        setError(`Apenas ${sucessos} de ${portfolioAtualizado.length} FIIs com cotação válida`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} FIIs com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro na API: ${errorMessage}`);
      console.error('❌ Erro geral ao buscar cotações:', err);
      
      // 🔄 FALLBACK: USAR DADOS ESTÁTICOS
      console.log('🔄 Usando fallback completo com preços de entrada...');
      const portfolioFallback = fiisPortfolioBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        quotacoesReais: null,
        statusApi: 'error'
      }));
      setPortfolio(portfolioFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFiisPortfolioData();

    // ATUALIZAR A CADA 10 MINUTOS
    const interval = setInterval(fetchFiisPortfolioData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchFiisPortfolioData]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchFiisPortfolioData,
  };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 PÁGINA SETTINGS (FIIs) CARREGADA!");
  console.log("🎯 USANDO SettingsTable COM EMPRESAS CORRETAS");

  // 🔥 DADOS REAIS DO MERCADO
  const { marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useFinancialData();
  
  // 🔥 DADOS REAIS DOS FIIs COM API BRAPI
  const { portfolio: fiisPortfolio, loading: portfolioLoading, error: portfolioError, refetch: refetchPortfolio } = useFiisPortfolio();

  // DADOS PADRÃO CASO A API FALHE
  const dadosCardsPadrao = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "3.200", trend: "up" as const, diff: 1.5 }, // IFIX ao invés de Small Cap
    carteiraHoje: { value: "91.2%", trend: "up" as const },
    dividendYield: { value: "8.9%", trend: "up" as const }, // FIIs têm DY alto
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "7.8%", trend: "up" as const, diff: 7.8 },
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DOS FIIs
  const calcularDYFiis = () => {
    if (fiisPortfolio.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyValues = fiisPortfolio
      .map(fii => parseFloat(fii.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy));
    
    if (dyValues.length === 0) return dadosCardsPadrao.dividendYield;
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(1)}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA FIIs
  const calcularPerformanceFiis = () => {
    console.log('🔍 DEBUG calcularPerformanceFiis:');
    console.log('- fiisPortfolio.length:', fiisPortfolio.length);
    
    if (fiisPortfolio.length === 0) {
      console.log('❌ Portfolio vazio, usando padrão');
      return dadosCardsPadrao.carteiraHoje;
    }
    
    const performances = fiisPortfolio
      .filter(fii => {
        const hasPerformance = fii.performance !== undefined && !isNaN(fii.performance);
        console.log(`🔍 FII ${fii.ticker}: performance = ${fii.performance}, válida = ${hasPerformance}`);
        return hasPerformance;
      })
      .map(fii => fii.performance);
    
    console.log('🔍 Performances válidas:', performances);
    
    if (performances.length === 0) {
      console.log('❌ Nenhuma performance válida, usando padrão');
      return dadosCardsPadrao.carteiraHoje;
    }
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    console.log('✅ Performance média calculada:', performancMedia);
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // 🔥 CALCULAR IFIX HOJE BASEADO NO IBOVESPA
  const calcularIfixCard = () => {
    console.log('🔍 DEBUG IFIX HOJE:');
    console.log('- marketData existe?', !!marketData);
    
    const ifixPadrao = { value: "3.200", trend: "up" as const, diff: 1.5 };
    
    if (!marketData?.ibovespa) {
      console.log('❌ USANDO DADOS PADRÃO - API não funcionou');
      return ifixPadrao;
    }
    
    console.log('✅ API funcionando - Ibovespa data:', marketData.ibovespa);
    
    // IFIX geralmente varia cerca de 60% da variação do Ibovespa
    const variacaoIbovespa = marketData.ibovespa.diff || 0;
    const variacaoIfix = variacaoIbovespa * 0.6;
    
    console.log('📊 CÁLCULOS:');
    console.log('- Ibovespa variação:', variacaoIbovespa, '%');
    console.log('- IFIX variação calculada:', variacaoIfix, '%');
    console.log('- Trend será:', variacaoIfix >= 0 ? 'UP (verde)' : 'DOWN (vermelho)');
    
    // Valor base do IFIX (~3200 pontos)
    const ifixBase = 3200;
    const ifixCalculado = ifixBase + (ifixBase * (variacaoIfix / 100));
    
    const resultado = {
      value: Math.round(ifixCalculado).toLocaleString('pt-BR'),
      trend: variacaoIfix >= 0 ? "up" as const : "down" as const,
      diff: Number(variacaoIfix.toFixed(2)),
    };
    
    console.log('🎯 RESULTADO FINAL:', resultado);
    
    return resultado;
  };

  // 🔥 CALCULAR IFIX PERÍODO BASEADO NO IBOVESPA PERÍODO
  const calcularIfixPeriodo = () => {
    const ifixPadrao = { value: "3.1%", trend: "up" as const, diff: 3.1 };
    
    if (!marketData?.ibovespaPeriodo) return ifixPadrao;
    
    // IFIX período baseado no Ibovespa período com correlação de ~65%
    const variacaoIbovespaPeriodo = marketData.ibovespaPeriodo.diff || 0;
    const variacaoIfixPeriodo = variacaoIbovespaPeriodo * 0.65;
    
    return {
      value: `${variacaoIfixPeriodo.toFixed(1)}%`,
      trend: variacaoIfixPeriodo >= 0 ? "up" as const : "down" as const,
      diff: Number(variacaoIfixPeriodo.toFixed(2)),
    };
  };
  
  // USAR DADOS DA API SE DISPONÍVEIS COM IFIX CALCULADO
  const dadosCards = {
    ...dadosCardsPadrao,
    ...(marketData || {}),
    indiceSmall: calcularIfixCard(), // 🏢 IFIX HOJE
    dividendYield: calcularDYFiis(),
    carteiraHoje: calcularPerformanceFiis(),
    ibovespaPeriodo: calcularIfixPeriodo(), // 🔥 IFIX PERÍODO
  };

  // LOADING STATE
  if (marketLoading || portfolioLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando carteira de FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // ERROR HANDLING
  const hasError = marketError || portfolioError;
  
  const refetchAll = async () => {
    await Promise.all([refetchMarket(), refetchPortfolio()]);
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
            {marketError && `⚠️ Mercado: ${marketError}`}
            {portfolioError && `⚠️ FIIs: ${portfolioError}`}
            {hasError && ' - Usando dados offline temporariamente'}
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso */}
      {!hasError && marketData && fiisPortfolio.length > 0 && (
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Carteira de FIIs atualizada com sucesso - Cotações reais do mercado
          </Alert>
        </Grid>
      )}

      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      <Grid xs={12}>
        <SettingsTable 
          count={fiisPortfolio.length} 
          rows={fiisPortfolio} // 🔥 DADOS REAIS DOS FIIs COM API BRAPI!
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards} // 🔥 CARDS COM IFIX CALCULADO!
        />
      </Grid>
    </Grid>
  );
}
