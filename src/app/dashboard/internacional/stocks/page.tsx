/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import Chip from '@mui/material/Chip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';

function noop(): void {
  // Função vazia para props obrigatórias
}

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API (CARDS)
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

// 🚀 HOOK SIMPLES PARA ATUALIZAR APENAS OS PREÇOS ATUAIS VIA BRAPI
function useExteriorStocks() {
  const [pricesData, setPricesData] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);

  // DADOS ESTÁTICOS (mantidos como no código original)
  const exteriorStocksBase = [
    {
      id: '1',
      rank: '1º',
      ticker: 'AMD',
      name: 'Advanced Micro Devices Inc.',
      setor: 'Tecnologia',
      dataEntrada: '29/05/2025',
      precoQueIniciou: 'US$112,86',
      precoAtual: 'US$118,50', // fallback estático
      precoTeto: 'US$135,20',
      avatar: 'https://logo.clearbit.com/amd.com',
    },
    {
      id: '2',
      rank: '2º',
      ticker: 'XP',
      name: 'XP Inc.',
      setor: 'Financial Services',
      dataEntrada: '26/05/2023',
      precoQueIniciou: 'US$18,41',
      precoAtual: 'US$19,25', // fallback estático
      precoTeto: 'US$24,34',
      avatar: 'https://logo.clearbit.com/xpi.com.br',
    },
    {
      id: '3',
      rank: '3º',
      ticker: 'HD',
      name: 'Home Depot Inc.',
      setor: 'Varejo',
      dataEntrada: '24/02/2023',
      precoQueIniciou: 'US$299,31',
      precoAtual: 'US$315,80', // fallback estático
      precoTeto: 'US$366,78',
      avatar: 'https://logo.clearbit.com/homedepot.com',
    },
    {
      id: '4',
      rank: '4º',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      setor: 'Tecnologia',
      dataEntrada: '05/05/2022',
      precoQueIniciou: 'US$156,77',
      precoAtual: 'US$162,50', // fallback estático
      precoTeto: 'US$170,00',
      avatar: 'https://logo.clearbit.com/apple.com',
    },
    {
      id: '5',
      rank: '5º',
      ticker: 'FIVE',
      name: 'Five Below Inc.',
      setor: 'Varejo',
      dataEntrada: '17/03/2022',
      precoQueIniciou: 'US$163,41',
      precoAtual: 'US$158,90', // fallback estático
      precoTeto: 'US$179,00',
      avatar: 'https://logo.clearbit.com/fivebelow.com',
    },
    {
      id: '6',
      rank: '6º',
      ticker: 'AMAT',
      name: 'Applied Materials Inc.',
      setor: 'Semicondutores',
      dataEntrada: '07/04/2022',
      precoQueIniciou: 'US$122,40',
      precoAtual: 'US$128,75', // fallback estático
      precoTeto: 'US$151,30',
      avatar: 'https://logo.clearbit.com/appliedmaterials.com',
    },
    {
      id: '7',
      rank: '7º',
      ticker: 'COST',
      name: 'Costco Wholesale Corporation',
      setor: 'Consumer Discretionary',
      dataEntrada: '23/06/2022',
      precoQueIniciou: 'US$459,00',
      precoAtual: 'US$485,20', // fallback estático
      precoTeto: 'US$571,00',
      avatar: 'https://logo.clearbit.com/costco.com',
    },
    {
      id: '8',
      rank: '8º',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      setor: 'Tecnologia',
      dataEntrada: '06/03/2022',
      precoQueIniciou: 'US$131,83',
      precoAtual: 'US$142,10', // fallback estático
      precoTeto: 'US$153,29',
      avatar: 'https://logo.clearbit.com/google.com',
    },
    {
      id: '9',
      rank: '9º',
      ticker: 'META',
      name: 'Meta Platforms Inc.',
      setor: 'Tecnologia',
      dataEntrada: '17/02/2022',
      precoQueIniciou: 'US$213,92',
      precoAtual: 'US$285,40', // fallback estático
      precoTeto: 'US$322,00',
      avatar: 'https://logo.clearbit.com/meta.com',
    },
    {
      id: '10',
      rank: '10º',
      ticker: 'BRK.B',
      name: 'Berkshire Hathaway Inc.',
      setor: 'Holding',
      dataEntrada: '11/05/2021',
      precoQueIniciou: 'US$286,35',
      precoAtual: 'US$295,80', // fallback estático
      precoTeto: 'US$330,00',
      avatar: 'https://s3-symbol-logo.tradingview.com/berkshire-hathaway--600.png',
    }
  ];

  // 🔥 BUSCAR APENAS OS PREÇOS ATUAIS DA BRAPI
  const fetchRealPrices = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const tickers = exteriorStocksBase.map(stock => stock.ticker);
      console.log('🔍 Buscando APENAS preços atuais da BRAPI:', tickers);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const tickersQuery = tickers.join(',');
      const brapiUrl = `https://brapi.dev/api/quote/${tickersQuery}?token=${BRAPI_TOKEN}`;
      
      console.log('📡 Requisição BRAPI:', brapiUrl);
      
      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Exterior-Stocks-App'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro BRAPI: ${response.status}`);
      }

      const brapiData = await response.json();
      console.log('✅ Preços BRAPI recebidos:', brapiData);

      // 🎯 PROCESSAR APENAS OS PREÇOS ATUAIS
      const newPrices: Record<string, string> = {};
      
      if (brapiData.results && brapiData.results.length > 0) {
        brapiData.results.forEach((quote: any) => {
          if (quote.regularMarketPrice) {
            newPrices[quote.symbol] = `US${quote.regularMarketPrice.toFixed(2)}`;
            console.log(`📊 ${quote.symbol}: ${newPrices[quote.symbol]} - REAL`);
          }
        });
      }
      
      setPricesData(newPrices);
      console.log(`✅ ${Object.keys(newPrices).length} preços atualizados da BRAPI`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar preços da BRAPI:', err);
      // Manter dados estáticos em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRealPrices();
    // Atualizar a cada 10 minutos
    const interval = setInterval(fetchRealPrices, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRealPrices]);

  // 🔄 COMBINAR DADOS ESTÁTICOS COM PREÇOS DINÂMICOS
  const exteriorStocks = React.useMemo(() => {
    return exteriorStocksBase.map(stock => ({
      ...stock,
      // Usar preço da BRAPI se disponível, senão manter o estático
      precoAtual: pricesData[stock.ticker] || stock.precoAtual,
      isRealPrice: !!pricesData[stock.ticker]
    }));
  }, [pricesData]);

  return {
    exteriorStocks,
    loading,
    refetch: fetchRealPrices,
  };
}

// 🎨 INDICADOR DE MERCADO
interface MarketIndicatorProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
  isLoading?: boolean;
  description?: string;
}

function MarketIndicator({ title, value, icon, trend, diff, isLoading, description }: MarketIndicatorProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  
  return (
    <Box 
      sx={{ 
        backgroundColor: '#ffffff',
        borderRadius: 2,
        p: 2.5,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#c7d2fe',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94a3b8',
                  display: 'block',
                  mt: 0.25,
                  fontSize: '0.7rem'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            {React.cloneElement(icon as React.ReactElement, { size: 16 })}
          </Box>
        </Stack>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '1.75rem',
            lineHeight: 1
          }}
        >
          {isLoading ? '...' : value}
        </Typography>
        
        {!isLoading && diff !== undefined && trend && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
              color: trendColor
            }}>
              <TrendIcon size={12} weight="bold" />
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {diff > 0 ? '+' : ''}{typeof diff === 'number' ? diff.toFixed(2) : diff}%
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              no período
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default function Page(): React.JSX.Element {
  console.log("🌍 PÁGINA EXTERIOR STOCKS - COM PREÇOS REAIS DA BRAPI");

  const { data: apiData, loading: cardsLoading } = useMarketDataAPI();
  const { exteriorStocks, loading: portfolioLoading } = useExteriorStocks();

  const defaultIndicators = {
    sp500: { value: "5.845", trend: "up" as const, diff: 25.13 },
    nasdaq: { value: "19.345", trend: "up" as const, diff: 28.7 },
  };

  const indicators = React.useMemo(() => {
    if (apiData) {
      console.log('✅ Usando dados da API:', apiData);
      return {
        sp500: apiData.sp500 || defaultIndicators.sp500,
        nasdaq: apiData.nasdaq || defaultIndicators.nasdaq,
      };
    }
    
    console.log('⚠️ Usando dados de fallback');
    return defaultIndicators;
  }, [apiData]);

  if (cardsLoading || portfolioLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            🌍 Carregando exterior stocks...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard/internacional'}
          sx={{ 
            color: '#64748b',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Voltar
        </Button>
        <Divider orientation="vertical" flexItem />
        <Stack spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              color: '#1e293b',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Exterior Stocks
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {exteriorStocks.length} ativos • Ações internacionais de tecnologia, crescimento e valor
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          mb: 4,
        }}
      >
        <MarketIndicator 
          title="S&P 500" 
          description="Índice das 500 maiores empresas dos EUA"
          value={indicators.sp500.value} 
          icon={<CurrencyDollarIcon />} 
          trend={indicators.sp500.trend} 
          diff={indicators.sp500.diff}
          isLoading={cardsLoading}
        />
        <MarketIndicator 
          title="NASDAQ 100" 
          description="Índice de tecnologia americana"
          value={indicators.nasdaq.value} 
          icon={<GlobeIcon />} 
          trend={indicators.nasdaq.trend} 
          diff={indicators.nasdaq.diff}
          isLoading={cardsLoading}
        />
      </Box>
      
      <Card sx={{ 
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 4,
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.2)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                color: '#1e293b',
                fontSize: '1.5rem',
                mb: 0.5
              }}>
                Carteira Exterior Stocks
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {exteriorStocks.length} ativos • Empresas de tecnologia e crescimento
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              🌍 {exteriorStocks.length} ativos
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '1000px' }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  width: '60px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Rank
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '200px'
                }}>
                  Ativo
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Setor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Data
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Alvo
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Viés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exteriorStocks.map((row, index) => {
                const precoIniciou = parseFloat(row.precoQueIniciou.replace('US$', ''));
                const precoAtual = parseFloat(row.precoAtual.replace('US$', ''));
                const precoTeto = parseFloat(row.precoTeto.replace('US$', ''));
                const variacao = row.precoAtual !== 'N/A' ? 
                  ((precoAtual - precoIniciou) / precoIniciou) * 100 : 0;
                const isPositive = variacao >= 0;
                
                // 🎯 CÁLCULO AUTOMÁTICO DO VIÉS
                const percentualDoTeto = (precoAtual / precoTeto) * 100;
                const viesAutomatico = percentualDoTeto >= 95 ? 'AGUARDAR' : 'COMPRA';
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                        transform: 'scale(1.005)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      color: '#000000'
                    }}>
                      {index + 1}º
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar}
                          sx={{ 
                            width: 44, 
                            height: 44, 
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: '2px solid',
                            borderColor: 'rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {row.ticker.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '1rem'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: row.precoAtual === 'N/A' ? '#64748b' : 
                                   isPositive ? '#059669' : '#dc2626',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {row.precoAtual === 'N/A' ? 'Sem dados' : 
                             `${isPositive ? '+' : ''}${variacao.toFixed(1)}%`}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="medium"
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          color: '#000000',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      {row.precoQueIniciou}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: row.precoAtual === 'N/A' ? '#64748b' :
                             isPositive ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.precoTeto}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={viesAutomatico}
                        size="medium"
                        sx={{
                          backgroundColor: viesAutomatico === 'COMPRA' ? '#dcfce7' : '#fef3c7',
                          color: viesAutomatico === 'COMPRA' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid',
                          borderColor: viesAutomatico === 'COMPRA' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      />
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
          count={exteriorStocks.length}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={0}
          rowsPerPage={exteriorStocks.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: 2,
            '& .MuiTablePagination-toolbar': {
              color: '#475569'
            }
          }}
        />
      </Card>
    </Box>
  );
}
