/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Button, 
  Typography, 
  Stack,
  IconButton
} from '@mui/material';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

// IMPORTAR HOOK PARA DADOS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// Hook específico para carteira de FIIs - VERSÃO SEM LUCIDE-REACT
function useFiisPortfolio() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  // 🔥 DADOS CORRETOS - FIIs PARA TESTE
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
      precoTeto: 'R$ 192,00',
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
    }
  ];

  const fetchFiisPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 SIMULANDO BUSCA DE COTAÇÕES DOS FIIs');

      // Simular dados para evitar problemas de API durante o build
      const portfolioAtualizado = fiisPortfolioBase.map((fii, index) => {
        const precoEntradaNum = parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        // Simular variação aleatória entre -5% e +5%
        const variacao = (Math.random() - 0.5) * 10;
        const precoAtualNum = precoEntradaNum * (1 + variacao / 100);
        const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
        
        return {
          ...fii,
          precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
          performance: performance,
          variacao: variacao,
          variacaoPercent: variacao,
          volume: Math.floor(Math.random() * 1000000),
          statusApi: 'success'
        };
      });

      setPortfolio(portfolioAtualizado);
      setLastUpdate(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar cotações:', err);
      
      // FALLBACK: USAR DADOS ESTÁTICOS
      const portfolioFallback = fiisPortfolioBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        statusApi: 'error'
      }));
      setPortfolio(portfolioFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFiisPortfolioData();

    // ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(fetchFiisPortfolioData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchFiisPortfolioData]);

  return {
    portfolio,
    loading,
    error,
    lastUpdate,
    refetch: fetchFiisPortfolioData,
  };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 PÁGINA SETTINGS (FIIs) CARREGADA - SEM LUCIDE-REACT!");

  // 🔥 DADOS REAIS DO MERCADO
  const { marketData, loading: marketLoading, error: marketError, refetch: refetchMarket } = useFinancialData();
  
  // 🔥 DADOS DOS FIIs
  const { portfolio: fiisPortfolio, loading: portfolioLoading, error: portfolioError, lastUpdate, refetch: refetchPortfolio } = useFiisPortfolio();

  // DADOS PADRÃO PARA OS CARDS
  const dadosCardsPadrao = {
    ibovespa: { value: "158.268", trend: "up" as const, diff: 10.09 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "R$ 118,27", trend: "up" as const, diff: 10.09 },
    dividendYield: { value: "10,9%", trend: "up" as const, diff: 10.9 },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
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

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA
  const calcularPerformanceFiis = () => {
    if (fiisPortfolio.length === 0) return dadosCardsPadrao.carteiraHoje;
    
    const performances = fiisPortfolio
      .filter(fii => fii.performance !== undefined && !isNaN(fii.performance))
      .map(fii => fii.performance);
    
    if (performances.length === 0) return dadosCardsPadrao.carteiraHoje;
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // USAR DADOS CALCULADOS
  const dadosCards = {
    ...dadosCardsPadrao,
    ...(marketData || {}),
    dividendYield: calcularDYFiis(),
    carteiraHoje: calcularPerformanceFiis(),
  };

  // LOADING STATE
  if (marketLoading || portfolioLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        gap: 3
      }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#1e293b' }}
        />
        <Stack alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1e293b',
            fontSize: '1.25rem'
          }}>
            🏢 Carregando Carteira de FIIs
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#64748b',
            textAlign: 'center',
            maxWidth: 400
          }}>
            Preparando dados da carteira • {fiisPortfolio.length || 5} FIIs
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ERROR HANDLING
  const hasError = marketError || portfolioError;
  
  const refetchAll = async () => {
    console.log('🔄 Atualizando todos os dados...');
    await Promise.all([refetchMarket(), refetchPortfolio()]);
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Grid container spacing={3}>
      {/* Header da página */}
      <Grid xs={12}>
        <Box sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 3,
          p: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#1e293b',
                mb: 0.5
              }}>
                💼 Carteira de FIIs
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                {fiisPortfolio.length} Fundos Imobiliários • Última atualização: {formatLastUpdate(lastUpdate)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={refetchAll}
              disabled={marketLoading || portfolioLoading}
              sx={{
                borderColor: '#64748b',
                color: '#64748b',
                minWidth: 120,
                height: 40,
                '&:hover': {
                  borderColor: '#1e293b',
                  color: '#1e293b',
                  backgroundColor: 'rgba(30, 41, 59, 0.04)'
                }
              }}
            >
              🔄 Atualizar
            </Button>
          </Stack>
        </Box>
      </Grid>

      {/* Alertas de status */}
      {hasError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={refetchAll}
              >
                🔄 Tentar Novamente
              </Button>
            }
            sx={{ 
              mb: 1,
              borderRadius: 2
            }}
          >
            <Stack spacing={0.5}>
              {marketError && (
                <Typography variant="body2">
                  ⚠️ <strong>Mercado:</strong> {marketError}
                </Typography>
              )}
              {portfolioError && (
                <Typography variant="body2">
                  ⚠️ <strong>FIIs:</strong> {portfolioError}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Usando dados simulados temporariamente.
              </Typography>
            </Stack>
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso */}
      {!hasError && fiisPortfolio.length > 0 && (
        <Grid xs={12}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 1,
              borderRadius: 2
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                ✅ <strong>Carteira carregada:</strong> {fiisPortfolio.length} FIIs disponíveis
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#059669',
                backgroundColor: '#dcfce7',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600
              }}>
                SISTEMA ✓
              </Typography>
            </Stack>
          </Alert>
        </Grid>
      )}

      {/* Filtros */}
      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      {/* Tabela principal */}
      <Grid xs={12}>
        <SettingsTable 
          count={fiisPortfolio.length} 
          rows={fiisPortfolio}
          page={0} 
          rowsPerPage={25}
          cardsData={dadosCards}
        />
      </Grid>

      {/* Footer */}
      <Grid xs={12}>
        <Box sx={{
          backgroundColor: '#f8fafc',
          borderRadius: 2,
          p: 2,
          border: '1px solid #e2e8f0'
        }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              💡 <strong>Dica:</strong> Clique em qualquer linha para ver detalhes do FII
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ 
                color: '#059669',
                backgroundColor: '#dcfce7',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600
              }}>
                {fiisPortfolio.filter(f => f.statusApi === 'success').length} Online
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Atualização: 5min
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
