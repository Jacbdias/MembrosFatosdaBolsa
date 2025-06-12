'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';

// 🔥 IMPORTAR O HOOK PARA DADOS FINANCEIROS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IBOVESPA VIA API (MESMO DA OVERVIEW)
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIbovespaReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO IBOVESPA REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO (MESMO DO SEU CÓDIGO)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR IBOVESPA (^BVSP) VIA BRAPI
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 Buscando Ibovespa:', ibovUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));

      const response = await fetch(ibovUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Ibovespa-Real-Time-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta IBOVESPA:', data);

        if (data.results && data.results.length > 0) {
          const ibovData = data.results[0];
          
          const dadosIbovespa = {
            valor: ibovData.regularMarketPrice,
            valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ibovData.regularMarketChange || 0,
            variacaoPercent: ibovData.regularMarketChangePercent || 0,
            trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI_REAL'
          };

          console.log('✅ IBOVESPA PROCESSADO:', dadosIbovespa);
          setIbovespaData(dadosIbovespa);
          
        } else {
          throw new Error('Sem dados do Ibovespa na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar Ibovespa:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK: Usar valor aproximado baseado na B3
      console.log('🔄 Usando fallback com valor aproximado da B3...');
      const fallbackData = {
        valor: 136985,
        valorFormatado: '136.985',
        variacao: -21.25,
        variacaoPercent: -0.02,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_B3'
      };
      setIbovespaData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIbovespaReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIbovespaReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🚀 NOVO HOOK PARA BUSCAR DADOS REAIS DO IFIX VIA BRAPI
function useIfixRealTime() {
  const [ifixData, setIfixData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIfixReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏢 BUSCANDO IFIX REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO (MESMO TOKEN)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 TENTAR DIFERENTES TICKERS PARA IFIX (EXPANDIDO)
      const tickers = ['XFIX11', 'IFIX.SA', '^IFIX', 'IFIX11', 'IFIX', 'IFIX.B3'];
      let dadosIfix = null;

      for (const ticker of tickers) {
        try {
          const ifixUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`;
          console.log(`🔍 Tentando ticker: ${ticker}`);

          const response = await fetch(ifixUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'IFIX-Real-Time-App'
            }
          });

          console.log(`📡 Status da resposta para ${ticker}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`📊 Resposta completa ${ticker}:`, data);

            if (data.results && data.results.length > 0) {
              const ifixInfo = data.results[0];
              console.log(`✅ Dados encontrados para ${ticker}:`, ifixInfo);
              
              dadosIfix = {
                valor: ifixInfo.regularMarketPrice,
                valorFormatado: ifixInfo.regularMarketPrice.toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }),
                variacao: ifixInfo.regularMarketChange || 0,
                variacaoPercent: ifixInfo.regularMarketChangePercent || 0,
                trend: (ifixInfo.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
                timestamp: new Date().toISOString(),
                fonte: `BRAPI_${ticker}`,
                ticker: ticker
              };

              console.log(`✅ IFIX PROCESSADO (${ticker}):`, dadosIfix);
              break; // Parar no primeiro ticker que funcionar
            } else {
              console.log(`⚠️ ${ticker}: Resposta sem resultados:`, data);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${ticker} falhou com status ${response.status}:`, errorText);
          }
        } catch (tickerError) {
          console.log(`⚠️ Ticker ${ticker} falhou:`, tickerError);
          continue; // Tentar próximo ticker
        }
      }

      if (dadosIfix) {
        setIfixData(dadosIfix);
      } else {
        throw new Error('Nenhum ticker do IFIX funcionou');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar IFIX:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK: Usar valor atualizado baseado na pesquisa (3.435 pontos)
      console.log('🔄 Usando fallback com valor atualizado do IFIX (3.435 pontos)...');
      const fallbackData = {
        valor: 3435,
        valorFormatado: '3.435',
        variacao: 8.15,
        variacaoPercent: 0.24,
        trend: 'up',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_VALOR_ATUAL_3435'
      };
      setIfixData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIfixReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIfixReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIfixReal]);

  return { ifixData, loading, error, refetch: buscarIfixReal };
}

export default function SettingsPage(): React.JSX.Element {
  console.log("🔥 PÁGINA SETTINGS (FIIs) - VERSÃO COM IBOVESPA E IFIX DINÂMICOS VIA BRAPI");

  const { fiis, loading: fiisLoading, erro: fiisError } = useFiisCotacoesBrapi();
  const { marketData, loading: marketLoading, error: marketError } = useFinancialData();
  
  // 🚀 BUSCAR DADOS REAIS DO IBOVESPA E IFIX
  const { ibovespaData, loading: ibovLoading, error: ibovError } = useIbovespaRealTime();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIfixRealTime();

  // 🔥 CONSTRUIR DADOS DOS CARDS COM IBOVESPA E IFIX DINÂMICOS
  const construirDadosCards = () => {
    const dadosBase = {
      carteiraHoje: { value: "88.7%", trend: "up" as const },
      dividendYield: { value: "7.4%", trend: "up" as const },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };

    // 🎯 USAR DADOS REAIS DO IBOVESPA SE DISPONÍVEL
    const ibovespaFinal = ibovespaData ? {
      value: ibovespaData.valorFormatado,
      trend: ibovespaData.trend,
      diff: ibovespaData.variacaoPercent
    } : { value: "136985", trend: "down" as const, diff: -0.02 };

    // 🏢 USAR DADOS REAIS DO IFIX SE DISPONÍVEL
    const ifixFinal = ifixData ? {
      value: ifixData.valorFormatado,
      trend: ifixData.trend,
      diff: ifixData.variacaoPercent
    } : { value: "3.435", trend: "up" as const, diff: 0.24 };

    return {
      ...dadosBase,
      ibovespa: ibovespaFinal,
      ifix: ifixFinal
    };
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DOS FIIs
  const calcularDYFiis = () => {
    if (!Array.isArray(fiis) || fiis.length === 0) return { value: "7.4%", trend: "up" as const };
    
    const dyValues = fiis
      .map(fii => parseFloat(fii.dy?.replace('%', '').replace(',', '.') || '0'))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return { value: "7.4%", trend: "up" as const };
    
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
    console.log('- fiis.length:', fiis?.length || 0);
    
    if (!Array.isArray(fiis) || fiis.length === 0) {
      console.log('❌ Portfolio vazio, usando padrão');
      return { value: "88.7%", trend: "up" as const };
    }
    
    const performances = fiis
      .filter(fii => {
        const hasPerformance = fii.performance !== undefined && !isNaN(fii.performance);
        console.log(`🔍 FII ${fii.ticker}: performance = ${fii.performance}, válida = ${hasPerformance}`);
        return hasPerformance;
      })
      .map(fii => fii.performance);
    
    console.log('🔍 Performances válidas:', performances);
    
    if (performances.length === 0) {
      console.log('❌ Nenhuma performance válida, usando padrão');
      return { value: "88.7%", trend: "up" as const };
    }
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    console.log('✅ Performance média calculada:', performancMedia);
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // 🔥 CONSTRUIR DADOS FINAIS COM CÁLCULOS DINÂMICOS
  const dadosCards = {
    ...construirDadosCards(),
    dividendYield: calcularDYFiis(),
    carteiraHoje: calcularPerformanceFiis(),
  };

  React.useEffect(() => {
    if (ibovespaData) {
      console.log('\n🎯 IBOVESPA REAL CARREGADO (SETTINGS):');
      console.log(`📊 Valor: ${ibovespaData.valorFormatado}`);
      console.log(`📈 Variação: ${ibovespaData.variacaoPercent}%`);
      console.log(`🎨 Trend: ${ibovespaData.trend}`);
      console.log(`🕐 Fonte: ${ibovespaData.fonte}`);
    }
  }, [ibovespaData]);

  React.useEffect(() => {
    if (ifixData) {
      console.log('\n🏢 IFIX REAL CARREGADO (SETTINGS):');
      console.log(`📊 Valor: ${ifixData.valorFormatado}`);
      console.log(`📈 Variação: ${ifixData.variacaoPercent}%`);
      console.log(`🎨 Trend: ${ifixData.trend}`);
      console.log(`🕐 Fonte: ${ifixData.fonte}`);
      console.log(`🎯 Ticker usado: ${ifixData.ticker || 'fallback'}`);
    }
  }, [ifixData]);

  React.useEffect(() => {
    if (Array.isArray(fiis) && fiis.length > 0) {
      console.log('\n🎯 RESULTADO FINAL FIIs PARA INTERFACE:');
      fiis.forEach(fii => {
        console.log(`📊 ${fii.ticker}: ${fii.precoAtual} (${fii.statusApi}) - Performance: ${fii.performance?.toFixed(2)}%`);
      });
    }
  }, [fiis]);

  // Loading state
  if (fiisLoading || marketLoading || ibovLoading || ifixLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando dados reais do IBOVESPA, IFIX e FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // Error state
  if (fiisError) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Box textAlign="center">
              <Typography variant="h6" color="error" gutterBottom>
                ⚠️ Erro ao carregar FIIs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fiisError}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: '#64748b' }}>
                Usando preços de entrada como fallback
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // Validation
  if (!Array.isArray(fiis) || fiis.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="text.secondary">
              📊 Nenhum FII encontrado na carteira
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <SettingsTable 
          count={fiis.length} 
          rows={fiis}
          cardsData={dadosCards}
          ibovespaReal={ibovespaData}
          ifixReal={ifixData}
        />
      </Grid>
    </Grid>
  );
}
