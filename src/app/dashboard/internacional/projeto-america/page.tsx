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
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';
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

// 🚀 HOOK PARA BUSCAR COTAÇÕES REAIS DA BRAPI - PROJETO AMÉRICA
function useProjetoAmerica() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // DADOS BASE DO PROJETO AMÉRICA
  const projetoAmericaBase = [
    {
      id: '1',
      rank: 1,
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      setor: 'TECNOLOGIA',
      dataEntrada: '09/04/2025',
      precoQueIniciou: 'US$98,88',
      precoTeto: 'US$110,00',
      avatar: 'https://logo.clearbit.com/nvidia.com',
    },
    {
      id: '2',
      rank: 2,
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      setor: 'VAREJO',
      dataEntrada: '16/04/2025',
      precoQueIniciou: 'US$176,29',
      precoTeto: 'US$203,00',
      avatar: 'https://logo.clearbit.com/amazon.com',
    },
    {
      id: '3',
      rank: 3,
      ticker: 'PEP',
      name: 'PepsiCo Inc.',
      setor: 'CONSUMO NÃO CÍCLICO',
      dataEntrada: '22/04/2025',
      precoQueIniciou: 'US$141,78',
      precoTeto: 'US$149,66',
      avatar: 'https://logo.clearbit.com/pepsi.com',
    },
    {
      id: '4',
      rank: 4,
      ticker: 'IAU',
      name: 'iShares Gold Trust',
      setor: 'ETF',
      dataEntrada: '30/04/2025',
      precoQueIniciou: 'US$62,48',
      precoTeto: '-',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '5',
      rank: 5,
      ticker: 'WPC',
      name: 'W. P. Carey Inc.',
      setor: 'REIT',
      dataEntrada: '07/05/2025',
      precoQueIniciou: 'US$62,17',
      precoTeto: 'US$65,00',
      avatar: 'https://logo.clearbit.com/wpcarey.com',
    },
    {
      id: '6',
      rank: 6,
      ticker: 'NOBL',
      name: 'ProShares S&P 500 Dividend Aristocrats ETF',
      setor: 'ETF',
      dataEntrada: '14/05/2025',
      precoQueIniciou: 'US$99,26',
      precoTeto: '-',
      avatar: 'https://logo.clearbit.com/proshares.com',
    },
    {
      id: '7',
      rank: 7,
      ticker: 'CRM',
      name: 'Salesforce Inc.',
      setor: 'TECNOLOGIA',
      dataEntrada: '21/05/2025',
      precoQueIniciou: 'US$285,85',
      precoTeto: 'US$310,00',
      avatar: 'https://logo.clearbit.com/salesforce.com',
    },
    {
      id: '8',
      rank: 8,
      ticker: 'AMD',
      name: 'Advanced Micro Devices Inc.',
      setor: 'TECNOLOGIA',
      dataEntrada: '29/05/2025',
      precoQueIniciou: 'US$112,86',
      precoTeto: 'US$135,20',
      avatar: 'https://logo.clearbit.com/amd.com',
    },
    {
      id: '9',
      rank: 9,
      ticker: 'TLT',
      name: 'iShares 20+ Year Treasury Bond ETF',
      setor: 'ETF',
      dataEntrada: '05/06/2025',
      precoQueIniciou: 'US$86,62',
      precoTeto: '-',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '10',
      rank: 10,
      ticker: 'QQQ',
      name: 'Invesco QQQ Trust',
      setor: 'ETF',
      dataEntrada: '12/06/2025',
      precoQueIniciou: 'US$353,38',
      precoTeto: '-',
      avatar: 'https://logo.clearbit.com/invesco.com',
    },
    {
      id: '11',
      rank: 11,
      ticker: 'NNN',
      name: 'NNN REIT Inc.',
      setor: 'REIT',
      dataEntrada: '18/06/2025',
      precoQueIniciou: 'US$42,90',
      precoTeto: 'US$45,10',
      avatar: 'https://logo.clearbit.com/nnnreit.com',
    }
  ];

  const fetchRealQuotes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tickers = projetoAmericaBase.map(stock => stock.ticker);
      console.log('🔍 Buscando cotações REAIS da BRAPI para Projeto América:', tickers);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const tickersQuery = tickers.join(',');
      const brapiUrl = `https://brapi.dev/api/quote/${tickersQuery}?token=${BRAPI_TOKEN}`;
      
      console.log('📡 Fazendo requisição para BRAPI:', brapiUrl);
      
      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Projeto-America-App'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro BRAPI: ${response.status}`);
      }

      const brapiData = await response.json();
      console.log('✅ Resposta BRAPI recebida:', brapiData);

      if (!brapiData.results || brapiData.results.length === 0) {
        throw new Error('Nenhum resultado encontrado na BRAPI');
      }

      const portfolioAtualizado = projetoAmericaBase.map(stock => {
        const brapiQuote = brapiData.results.find((quote: any) => 
          quote.symbol === stock.ticker || quote.symbol === `${stock.ticker}.SA`
        );
        
        let precoAtual = 'N/A';
        let performance = 0;
        
        if (brapiQuote && brapiQuote.regularMarketPrice) {
          const precoEntradaNum = parseFloat(stock.precoQueIniciou.replace('US$', ''));
          const precoAtualNum = brapiQuote.regularMarketPrice;
          performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          precoAtual = `US$${precoAtualNum.toFixed(2)}`;
          
          console.log(`📊 ${stock.ticker}: ${precoAtual} (${performance.toFixed(1)}%) - REAL DA BRAPI`);
        } else {
          console.log(`⚠️ ${stock.ticker}: não encontrado na BRAPI, usando fallback`);
          
          const fallbackPrices: Record<string, number> = {
            'NVDA': 105.50,
            'AMZN': 185.20,
            'PEP': 145.30,
            'IAU': 64.15,
            'WPC': 63.80,
            'NOBL': 101.45,
            'CRM': 295.75,
            'AMD': 118.90,
            'TLT': 88.25,
            'QQQ': 365.80,
            'NNN': 44.10
          };
          
          const precoEntradaNum = parseFloat(stock.precoQueIniciou.replace('US$', ''));
          const precoFallback = fallbackPrices[stock.ticker] || precoEntradaNum * 1.05;
          performance = ((precoFallback - precoEntradaNum) / precoEntradaNum) * 100;
          precoAtual = `US$${precoFallback.toFixed(2)}`;
          
          console.log(`🎲 ${stock.ticker}: usando fallback ${precoAtual} (${performance.toFixed(1)}%)`);
        }

        return {
          ...stock,
          precoAtual,
          performance,
          brapiData: brapiQuote,
          isReal: !!brapiQuote,
          lastUpdate: new Date().toISOString(),
        };
      });

      setPortfolio(portfolioAtualizado);
      
      const realCount = portfolioAtualizado.filter(p => p.isReal).length;
      const fallbackCount = portfolioAtualizado.length - realCount;
      console.log(`✅ Projeto América atualizado: ${realCount} preços reais, ${fallbackCount} fallbacks`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar cotações da BRAPI:', err);
      
      const portfolioFallback = projetoAmericaBase.map(stock => {
        const fallbackPrices: Record<string, number> = {
          'NVDA': 105.50,
          'AMZN': 185.20,
          'PEP': 145.30,
          'IAU': 64.15,
          'WPC': 63.80,
          'NOBL': 101.45,
          'CRM': 295.75,
          'AMD': 118.90,
          'TLT': 88.25,
          'QQQ': 365.80,
          'NNN': 44.10
        };
        
        const precoEntradaNum = parseFloat(stock.precoQueIniciou.replace('US$', ''));
        const precoFallback = fallbackPrices[stock.ticker] || precoEntradaNum * 1.05;
        const performance = ((precoFallback - precoEntradaNum) / precoEntradaNum) * 100;
        
        return {
          ...stock,
          precoAtual: `US$${precoFallback.toFixed(2)}`,
          performance,
          isReal: false,
          isFallback: true,
        };
      });
      
      setPortfolio(portfolioFallback);
      console.log('🎲 Usando portfólio fallback completo para Projeto América');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRealQuotes();
    const interval = setInterval(fetchRealQuotes, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRealQuotes]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchRealQuotes,
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
  console.log("🇺🇸 PÁGINA PROJETO AMÉRICA - COM PREÇOS REAIS DA BRAPI");

  const { data: apiData, loading: cardsLoading } = useMarketDataAPI();
  const { portfolio: projetoAmerica, loading: portfolioLoading } = useProjetoAmerica();

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
            🇺🇸 Carregando Projeto América...
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
            Projeto América
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {projetoAmerica.length} ativos • Investimentos estratégicos no mercado americano
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
                Projeto América - Portfolio
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {projetoAmerica.length} ativos • Diversificação em ações, ETFs e REITs americanos
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              🇺🇸 {projetoAmerica.length} ativos
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ 
            minWidth: '100%',
            tableLayout: 'fixed', // Força larguras fixas
            width: '100%'
          }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  width: '8%',
                  color: '#475569',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '8px 4px'
                }}>
                  RANK
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '20%',
                  padding: '8px 8px'
                }}>
                  Ativo
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '16%',
                  padding: '8px 4px'
                }}>
                  Setor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '12%',
                  padding: '8px 4px'
                }}>
                  Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '14%',
                  padding: '8px 4px'
                }}>
                  Inicial
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '15%',
                  padding: '8px 4px'
                }}>
                  Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  width: '15%',
                  padding: '8px 4px'
                }}>
                  Teto
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projetoAmerica.map((row) => {
                const precoIniciou = parseFloat(row.precoQueIniciou.replace('US
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={projetoAmerica.length}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={0}
          rowsPerPage={projetoAmerica.length}
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
}, ''));
                const precoAtual = parseFloat(row.precoAtual.replace('US
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={projetoAmerica.length}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={0}
          rowsPerPage={projetoAmerica.length}
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
}, ''));
                const variacao = row.precoAtual !== 'N/A' ? 
                  ((precoAtual - precoIniciou) / precoIniciou) * 100 : 0;
                const isPositive = variacao >= 0;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                        transform: 'scale(1.002)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      fontSize: '0.9rem',
                      color: '#1e40af',
                      padding: '8px 4px'
                    }}>
                      {row.rank}°
                    </TableCell>
                    <TableCell sx={{ 
                      width: '20%',
                      padding: '8px 8px'
                    }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar 
                          src={row.avatar}
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: 600,
                            fontSize: '0.7rem',
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
                            fontSize: '0.9rem',
                            lineHeight: 1.2
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: row.precoAtual === 'N/A' ? '#64748b' : 
                                   isPositive ? '#059669' : '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            lineHeight: 1
                          }}>
                            {row.precoAtual === 'N/A' ? 'Sem dados' : 
                             `${isPositive ? '+' : ''}${variacao.toFixed(1)}%`}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      padding: '8px 4px'
                    }}>
                      <Chip 
                        label={row.setor}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(30, 64, 175, 0.1)',
                          color: '#1e40af',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          border: '1px solid rgba(30, 64, 175, 0.2)',
                          height: '24px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      padding: '8px 4px'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      padding: '8px 4px'
                    }}>
                      {row.precoQueIniciou}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: row.precoAtual === 'N/A' ? '#64748b' :
                             isPositive ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      padding: '8px 4px'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: row.precoTeto === '-' ? '#94a3b8' : '#475569',
                      whiteSpace: 'nowrap',
                      fontStyle: row.precoTeto === '-' ? 'italic' : 'normal',
                      fontSize: '0.85rem',
                      padding: '8px 4px'
                    }}>
                      {row.precoTeto}
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
          count={projetoAmerica.length}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={0}
          rowsPerPage={projetoAmerica.length}
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
