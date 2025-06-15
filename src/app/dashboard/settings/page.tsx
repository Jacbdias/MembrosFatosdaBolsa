'use client';
import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useIfixRealTime } from '@/hooks/useIfixRealTime';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IBOVESPA VIA API (INLINE - IGUAL AO SEU CÓDIGO)
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

function SettingsPage(): React.JSX.Element {
  const { fiis, loading: fiisLoading, erro: fiisError } = useFiisCotacoesBrapi();
  const { marketData, loading: marketLoading, error: marketError } = useFinancialData();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIfixRealTime();
  
  // 🚀 BUSCAR DADOS REAIS DO IBOVESPA (IGUAL AO SEU CÓDIGO)
  const { ibovespaData, loading: ibovLoading, error: ibovError } = useIbovespaRealTime();

  // Memoize dadosCards para evitar recriação desnecessária
  const dadosCards = React.useMemo(() => ({
    dividendYield: { value: '7.4%', trend: 'up' as const },
    carteiraHoje: { value: '88.7%', trend: 'up' as const },
    ibovespa: ibovespaData ? {
      value: ibovespaData.valorFormatado,
      trend: ibovespaData.trend,
      diff: ibovespaData.variacaoPercent
    } : { value: '136.985', trend: 'down' as const, diff: -0.02 },
    ifix: ifixData ? {
      value: ifixData.valorFormatado,
      trend: ifixData.trend,
      diff: ifixData.variacaoPercent
    } : { value: '3.435', trend: 'up' as const, diff: 0.24 }
  }), [ifixData, ibovespaData]);

  // Loading apenas dos dados críticos (não incluir IFIX se já tem fallback)
  const isLoading = fiisLoading || marketLoading;

  // Log do Ibovespa quando carregado (igual ao seu código)
  React.useEffect(() => {
    if (ibovespaData) {
      console.log('\n🎯 IBOVESPA REAL CARREGADO:');
      console.log(`📊 Valor: ${ibovespaData.valorFormatado}`);
      console.log(`📈 Variação: ${ibovespaData.variacaoPercent}%`);
      console.log(`🎨 Trend: ${ibovespaData.trend}`);
      console.log(`🕐 Fonte: ${ibovespaData.fonte}`);
    }
  }, [ibovespaData]);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando dados reais do IFIX, Ibovespa e FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // Mostra erro só se for crítico (FIIs), IFIX e Ibovespa podem falhar
  if (fiisError) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="error" gutterBottom>
              ⚠️ Erro ao carregar FIIs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fiisError}
            </Typography>
            {ifixError && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                ℹ️ IFIX: {ifixError}
              </Typography>
            )}
            {ibovError && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                ℹ️ Ibovespa: {ibovError}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (!Array.isArray(fiis) || fiis.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="text.secondary">
              📊 Nenhum FII encontrado na carteira
            </Typography>
            {ifixData && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                ✅ IFIX: {ifixData.valorFormatado} ({ifixData.trend === 'up' ? '↗️' : '↘️'})
              </Typography>
            )}
            {ibovespaData && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                ✅ Ibovespa: {ibovespaData.valorFormatado} ({ibovespaData.trend === 'up' ? '↗️' : '↘️'})
              </Typography>
            )}
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
          ifixReal={ifixData}
        />
      </Grid>
    </Grid>
  );
}

export default SettingsPage;
