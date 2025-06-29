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

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API BRAPI
function useETFDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      console.log('🔄 Buscando cotações dos ETFs via BRAPI...');
      
      // Lista dos tickers dos ETFs
      const etfTickers = ['VOO', 'IJS', 'QUAL', 'QQQ', 'VNQ', 'SCHP', 'IAU', 'HERO', 'SOXX', 'MCHI', 'TFLO'];
      
      const response = await fetch(`https://brapi.dev/api/quote/${etfTickers.join(',')}?token=jJrMYVy9MATGEicx3GxBp8`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Cotações ETFs recebidas:', result);
      
      setData(result.results);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados dos ETFs:', err);
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

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API
function useMarketDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      console.log('🔄 Buscando índices via BRAPI...');
      
      const response = await fetch(`https://brapi.dev/api/quote/^GSPC,^IXIC?token=jJrMYVy9MATGEicx3GxBp8`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Índices recebidos:', result);
      
      // Processar dados dos índices
      const processedData = {
        sp500: null,
        nasdaq: null
      };

      if (result.results) {
        result.results.forEach((item: any) => {
          if (item.symbol === '^GSPC') {
            processedData.sp500 = {
              value: item.regularMarketPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }),
              trend: item.regularMarketChangePercent >= 0 ? 'up' as const : 'down' as const,
              diff: parseFloat(item.regularMarketChangePercent.toFixed(2))
            };
          }
          if (item.symbol === '^IXIC') {
            processedData.nasdaq = {
              value: item.regularMarketPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }),
              trend: item.regularMarketChangePercent >= 0 ? 'up' as const : 'down' as const,
              diff: parseFloat(item.regularMarketChangePercent.toFixed(2))
            };
          }
        });
      }
      
      setData(processedData);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados dos índices:', err);
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

// 🎨 INDICADOR DE MERCADO DISCRETO E ELEGANTE (INTERNACIONAL)
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
        {/* Header */}
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
        
        {/* Valor principal */}
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
        
        {/* Indicador de tendência */}
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
  console.log("🌎 PÁGINA ETFs INTERNACIONAIS - VERSÃO LIMPA");

  // 🔥 BUSCAR DADOS REAIS DA API
  const { data: apiData, loading: marketLoading } = useMarketDataAPI();
  const { data: etfData, loading: etfLoading } = useETFDataAPI();

  const dividendosInternacionaisBase = [
    {
      id: '1',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      setor: 'Large Cap',
      dataEntrada: '03/06/2021',
      precoQueIniciou: 'US$383,95',
      precoAtual: 'US$485,20',
      dy: '1,32%',
      precoTeto: 'US$520,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/vanguard.com',
    },
    {
      id: '2',
      ticker: 'IJS',
      name: 'iShares Core S&P Small-Cap ETF',
      setor: 'Small Caps',
      dataEntrada: '21/07/2021',
      precoQueIniciou: 'US$100,96',
      precoAtual: 'US$112,45',
      dy: '1,85%',
      precoTeto: 'US$125,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '3',
      ticker: 'QUAL',
      name: 'iShares MSCI USA Quality Factor ETF',
      setor: 'Total Market',
      dataEntrada: '11/06/2021',
      precoQueIniciou: 'US$130,13',
      precoAtual: 'US$158,75',
      dy: '1,45%',
      precoTeto: 'US$170,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '4',
      ticker: 'QQQ',
      name: 'Invesco QQQ Trust ETF',
      setor: 'Large Cap',
      dataEntrada: '09/06/2021',
      precoQueIniciou: 'US$337,18',
      precoAtual: 'US$465,30',
      dy: '0,68%',
      precoTeto: 'US$495,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/invesco.com',
    },
    {
      id: '5',
      ticker: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      setor: 'Real Estate (USA)',
      dataEntrada: '12/07/2021',
      precoQueIniciou: 'US$105,96',
      precoAtual: 'US$95,20',
      dy: '3,85%',
      precoTeto: 'US$115,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/vanguard.com',
    },
    {
      id: '6',
      ticker: 'SCHP',
      name: 'Schwab U.S. TIPS ETF',
      setor: 'Renda Fixa',
      dataEntrada: '22/11/2021',
      precoQueIniciou: 'US$63,14',
      precoAtual: 'US$58,90',
      dy: '3,25%',
      precoTeto: 'US$67,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/schwab.com',
    },
    {
      id: '7',
      ticker: 'IAU',
      name: 'iShares Gold Trust ETF',
      setor: 'Ouro',
      dataEntrada: '07/06/2021',
      precoQueIniciou: 'US$36,04',
      precoAtual: 'US$42,15',
      dy: '0,00%',
      precoTeto: 'US$45,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '8',
      ticker: 'HERO',
      name: 'Global X Video Games & Esports ETF',
      setor: 'Games',
      dataEntrada: '15/07/2021',
      precoQueIniciou: 'US$31,28',
      precoAtual: 'US$28,50',
      dy: '0,00%',
      precoTeto: 'US$35,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/globalxetfs.com',
    },
    {
      id: '9',
      ticker: 'SOXX',
      name: 'iShares Semiconductor ETF',
      setor: 'Semicondutores',
      dataEntrada: '04/08/2021',
      precoQueIniciou: 'US$156,03',
      precoAtual: 'US$235,80',
      dy: '1,12%',
      precoTeto: 'US$250,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '10',
      ticker: 'MCHI',
      name: 'iShares MSCI China ETF',
      setor: 'Empresas Chinesas',
      dataEntrada: '01/02/2023',
      precoQueIniciou: 'US$53,58',
      precoAtual: 'US$48,25',
      dy: '2,45%',
      precoTeto: 'US$60,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '11',
      ticker: 'TFLO',
      name: 'iShares Treasury Floating Rate Bond ETF',
      setor: 'Renda Fixa',
      dataEntrada: '21/03/2023',
      precoQueIniciou: 'US$50,50',
      precoAtual: 'US$50,85',
      dy: '4,75%',
      precoTeto: 'US$52,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    }
  ];

  // 🔧 COMBINAR DADOS DOS ETFs COM COTAÇÕES REAIS
  const etfsComCotacoes = React.useMemo(() => {
    return dividendosInternacionaisBase.map(etf => {
      // Buscar cotação real do ETF
      const cotacao = etfData?.find((item: any) => item.symbol === etf.ticker);
      
      let precoAtualCalculado = etf.precoAtual;
      let performance = 0;
      
      if (cotacao) {
        precoAtualCalculado = `US$${cotacao.regularMarketPrice.toFixed(2)}`;
        const precoInicial = parseFloat(etf.precoQueIniciou.replace('US$', ''));
        performance = ((cotacao.regularMarketPrice - precoInicial) / precoInicial) * 100;
        
        console.log(`📊 ${etf.ticker}: ${precoAtualCalculado} (${performance.toFixed(1)}%)`);
      }
      
      // 🎯 CALCULAR VIÉS AUTOMATICAMENTE
      const calcularVies = (precoAtual: string, precoTeto: string) => {
        const precoAtualNum = parseFloat(precoAtual.replace('US$', ''));
        const precoTetoNum = parseFloat(precoTeto.replace('US$', ''));
        
        if (isNaN(precoAtualNum) || isNaN(precoTetoNum)) {
          return 'AGUARDAR';
        }
        
        // Se preço atual está pelo menos 5% abaixo do teto, é COMPRA
        const percentualDoTeto = (precoAtualNum / precoTetoNum) * 100;
        
        if (percentualDoTeto <= 95) {
          return 'COMPRA';
        } else {
          return 'AGUARDAR';
        }
      };
      
      const viesCalculado = calcularVies(precoAtualCalculado, etf.precoTeto);
      
      return {
        ...etf,
        precoAtual: precoAtualCalculado,
        performance,
        viesAtual: viesCalculado,
        cotacaoReal: cotacao
      };
    });
  }, [etfData]);

  // 🔥 VALORES PADRÃO PARA MERCADO INTERNACIONAL (APENAS FALLBACK QUANDO API FALHA)
  const defaultIndicators = {
    sp500: { value: "5,970.80", trend: "up" as const, diff: 0.59 },
    nasdaq: { value: "19,400.00", trend: "up" as const, diff: 0.81 },
  };

  // 🔧 PRIORIZAR DADOS DA API, DEPOIS DEFAULT
  const indicators = React.useMemo(() => {
    // Se temos dados da API, usar eles
    if (apiData) {
      console.log('✅ Usando dados da API:', apiData);
      return {
        sp500: apiData.sp500 || defaultIndicators.sp500,
        nasdaq: apiData.nasdaq || defaultIndicators.nasdaq,
      };
    }
    
    // Por último, usar fallback
    console.log('⚠️ Usando dados de fallback');
    return defaultIndicators;
  }, [apiData]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com botão voltar */}
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
            Exterior ETFs
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            {etfsComCotacoes.length} ETFs em acompanhamento • Exposição diversificada aos mercados globais
          </Typography>
        </Stack>
      </Stack>

      {/* Indicadores de Mercado - Layout com 2 cards como Overview */}
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
          isLoading={marketLoading}
        />
        <MarketIndicator 
          title="NASDAQ 100" 
          description="Índice de tecnologia americana"
          value={indicators.nasdaq.value} 
          icon={<GlobeIcon />} 
          trend={indicators.nasdaq.trend} 
          diff={indicators.nasdaq.diff}
          isLoading={marketLoading}
        />
      </Box>
      
      {/* Tabela de ETFs Internacionais */}
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
                Carteira de ETFs Internacionais
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {etfsComCotacoes.length} ETFs • Diversificação global com baixo custo
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
              🌎 {etfsComCotacoes.length} ETFs
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
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '180px'
                }}>
                  Ativo
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '120px'
                }}>
                  Setor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '120px'
                }}>
                  Data Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '130px'
                }}>
                  Preço que Iniciou
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '130px'
                }}>
                  Preço Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '80px'
                }}>
                  DY
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '120px'
                }}>
                  Teto
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  width: '100px'
                }}>
                  Viés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {etfsComCotacoes.map((row, index) => {
                const precoIniciou = parseFloat(row.precoQueIniciou.replace('US$', ''));
                const precoAtual = parseFloat(row.precoAtual.replace('US$', ''));
                
                // Usar performance calculada se disponível, senão calcular manualmente
                const variacao = row.performance || ((precoAtual - precoIniciou) / precoIniciou) * 100;
                const isPositive = variacao >= 0;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa-exterior/${row.ticker}`}
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
                    <TableCell sx={{ width: '180px' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar}
                          sx={{ 
                            width: 40, 
                            height: 40, 
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
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 700,
                          color: '#1e293b',
                          fontSize: '1rem'
                        }}>
                          {row.ticker}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      <Stack spacing={0.5}>
                        <Chip 
                          label={row.setor}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            color: '#000000',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '22px'
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          color: isPositive ? '#059669' : '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {isPositive ? '+' : ''}{variacao.toFixed(1)}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      width: '120px'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      width: '130px'
                    }}>
                      {row.precoQueIniciou}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: isPositive ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      width: '130px'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      width: '80px'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#000000',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        {row.dy}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      width: '120px',
                      fontSize: '0.85rem'
                    }}>
                      {row.precoTeto}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      width: '100px'
                    }}>
                      <Chip
                        label={row.viesAtual}
                        size="medium"
                        sx={{
                          backgroundColor: row.viesAtual === 'COMPRA' ? '#dcfce7' : '#fef3c7',
                          color: row.viesAtual === 'COMPRA' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: row.viesAtual === 'COMPRA' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          minWidth: '80px'
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
          count={etfsComCotacoes.length}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={0}
          rowsPerPage={etfsComCotacoes.length}
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
