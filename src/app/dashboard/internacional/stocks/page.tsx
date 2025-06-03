/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

function noop(): void {
  // Função vazia para props obrigatórias
}

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API
function useMarketDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      console.log('🔄 Buscando dados da API internacional...');
      
      const timestamp = Date.now();
      const response = await fetch(`/api/financial/international-data?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Dados da API internacional recebidos:', result);
      
      setData(result.internationalData);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados da API internacional:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    
    // Refresh a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, trend, diff, isLoading }: StatCardProps): React.JSX.Element {
  const TrendIconComponent = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  
  return (
    <Card 
      sx={{ 
        minHeight: 120,
        flex: '1 1 200px',
        maxWidth: { xs: '100%', sm: '300px' },
        transition: 'all 0.2s ease-in-out',
        opacity: isLoading ? 0.7 : 1,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography 
              color="text.secondary" 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
            <Avatar 
              sx={{ 
                backgroundColor: '#374151',
                height: 32, 
                width: 32,
                '& svg': { 
                  fontSize: 16,
                  color: 'white'
                }
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: trend && diff !== undefined ? 
                  (trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)') 
                  : 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {isLoading ? '...' : value}
            </Typography>
          </Box>
          
          {!isLoading && diff !== undefined && trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendIconComponent 
                size={16} 
                style={{ color: trendColor }} 
              />
              <Typography 
                sx={{ 
                  color: trendColor,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
              </Typography>
              <Typography 
                color="text.secondary" 
                sx={{ fontSize: '0.75rem' }}
              >
                no período
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Page(): React.JSX.Element {
  console.log("🌎 PÁGINA EXTERIOR STOCKS - VERSÃO DINÂMICA");

  // 🔥 BUSCAR DADOS REAIS DA API
  const { data: apiData, loading } = useMarketDataAPI();

  const stocksInternacionais = [
    {
      id: '1',
      rank: '1º',
      ticker: 'XP',
      name: 'XP Inc.',
      sector: 'Financial Services',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '26/05/2023',
      precoQueIniciou: 'US$18,41',
      precoAtual: 'US$18,64',
      precoAlvo: 'US$24,34',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/xpinc.com',
    },
    {
      id: '2',
      rank: '2º',
      ticker: 'HD',
      name: 'Home Depot Inc.',
      sector: 'Varejo',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '24/02/2023',
      precoQueIniciou: 'US$299,31',
      precoAtual: 'US$362,71',
      precoAlvo: 'US$366,78',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/homedepot.com',
    },
    {
      id: '3',
      rank: '3º',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '05/05/2022',
      precoQueIniciou: 'US$156,77',
      precoAtual: 'US$195,27',
      precoAlvo: 'US$170,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/apple.com',
    },
    {
      id: '4',
      rank: '4º',
      ticker: 'FIVE',
      name: 'Five Below Inc.',
      sector: 'Varejo',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '17/03/2022',
      precoQueIniciou: 'US$163,41',
      precoAtual: 'US$107,27',
      precoAlvo: 'US$179,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/fivebelow.com',
    },
    {
      id: '5',
      rank: '5º',
      ticker: 'AMAT',
      name: 'Applied Materials Inc.',
      sector: 'Semicondutores',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '07/04/2022',
      precoQueIniciou: 'US$122,40',
      precoAtual: 'US$157,51',
      precoAlvo: 'US$151,30',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/appliedmaterials.com',
    },
    {
      id: '6',
      rank: '6º',
      ticker: 'COST',
      name: 'Costco Wholesale Corp.',
      sector: 'Consumer Discretionary',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '23/06/2022',
      precoQueIniciou: 'US$459,00',
      precoAtual: 'US$1.008,50',
      precoAlvo: 'US$571,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/costco.com',
    },
    {
      id: '7',
      rank: '7º',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '03/03/2022',
      precoQueIniciou: 'US$131,83',
      precoAtual: 'US$168,47',
      precoAlvo: 'US$133,29',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/google.com',
    },
    {
      id: '8',
      rank: '8º',
      ticker: 'META',
      name: 'Meta Platforms Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '17/02/2022',
      precoQueIniciou: 'US$213,92',
      precoAtual: 'US$627,06',
      precoAlvo: 'US$322,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/meta.com',
    },
    {
      id: '9',
      rank: '9º',
      ticker: 'BRKB',
      name: 'Berkshire Hathaway Inc.',
      sector: 'Holding',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '11/05/2021',
      precoQueIniciou: 'US$286,35',
      precoAtual: 'US$503,46',
      precoAlvo: 'US$300,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/berkshirehathaway.com',
    }
  ];

  // 🔥 VALORES PADRÃO PARA MERCADO INTERNACIONAL (4 INDICADORES)
  const defaultIndicators = {
    carteira: { value: "+62,66%", trend: "up" as const, diff: 62.66 },
    sp500Periodo: { value: "+36,93%", trend: "up" as const, diff: 36.93 },
    sp500Hoje: { value: "-0,67%", trend: "down" as const, diff: -0.67 },
    nasdaqHoje: { value: "-1,00%", trend: "down" as const, diff: -1.00 },
  };

  // 🔧 PRIORIZAR DADOS DA API, DEPOIS DEFAULT
  const indicators = React.useMemo(() => {
    // Se temos dados da API, usar eles
    if (apiData) {
      console.log('✅ Usando dados da API:', apiData);
      return {
        carteira: apiData.carteira || defaultIndicators.carteira,
        sp500Periodo: apiData.sp500Periodo || defaultIndicators.sp500Periodo,
        sp500Hoje: apiData.sp500Hoje || defaultIndicators.sp500Hoje,
        nasdaqHoje: apiData.nasdaqHoje || defaultIndicators.nasdaqHoje,
      };
    }
    
    // Por último, usar fallback
    console.log('⚠️ Usando dados de fallback');
    return defaultIndicators;
  }, [apiData]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com botão voltar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard/internacional'}
          sx={{ color: 'text.secondary' }}
        >
          Voltar
        </Button>
        <Divider orientation="vertical" flexItem />
        <Stack spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Exterior Stocks
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Ações internacionais de empresas de tecnologia, crescimento e valor
          </Typography>
        </Stack>
      </Stack>

      {/* Cards de estatísticas com dados dinâmicos da API */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard 
          title="CARTEIRA NO PERÍODO" 
          value={indicators.carteira.value} 
          icon={<TrendUpIcon />}
          trend={indicators.carteira.trend}
          diff={indicators.carteira.diff}
          isLoading={loading}
        />
        <StatCard 
          title="S&P 500 NO PERÍODO" 
          value={indicators.sp500Periodo.value} 
          icon={<ChartLineIcon />}
          trend={indicators.sp500Periodo.trend}
          diff={indicators.sp500Periodo.diff}
          isLoading={loading}
        />
        <StatCard 
          title="S&P 500 HOJE" 
          value={indicators.sp500Hoje.value} 
          icon={<CurrencyDollarIcon />}
          trend={indicators.sp500Hoje.trend}
          diff={indicators.sp500Hoje.diff}
          isLoading={loading}
        />
        <StatCard 
          title="NASDAQ HOJE" 
          value={indicators.nasdaqHoje.value} 
          icon={<GlobeIcon />}
          trend={indicators.nasdaqHoje.trend}
          diff={indicators.nasdaqHoje.diff}
          isLoading={loading}
        />
      </Box>
      
      {/* Tabela */}
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '1000px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '60px' }}>
                  Rank
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'left', width: '200px' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '130px' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '100px' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '90px' }}>Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '90px' }}>Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '90px' }}>Alvo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '90px' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocksInternacionais.map((row) => {
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {row.rank}
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar 
                          src={row.avatar}
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        >
                          {row.ticker.charAt(0)}
                        </Avatar>
                        <Stack spacing={0}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                            {row.name.length > 25 ? row.name.substring(0, 25) + '...' : row.name}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.8rem' }}>{row.sector}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500, fontSize: '0.8rem' }}>{row.precoQueIniciou}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500, fontSize: '0.8rem' }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500, fontSize: '0.8rem' }}>{row.precoAlvo}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          backgroundColor: row.viesAtual === 'COMPRA' ? '#e8f5e8' : '#fff3e0',
                          color: row.viesAtual === 'COMPRA' ? '#2e7d32' : '#f57c00',
                          border: row.viesAtual === 'COMPRA' ? '1px solid #4caf50' : '1px solid #ff9800',
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          display: 'inline-block',
                          textAlign: 'center',
                          minWidth: '60px',
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                        }}
                      >
                        {row.viesAtual}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={stocksInternacionais.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={stocksInternacionais.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
        />
      </Card>
    </Box>
  );
}
