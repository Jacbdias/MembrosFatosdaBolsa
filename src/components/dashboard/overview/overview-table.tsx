/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';

import { useSelection } from '@/hooks/use-selection';

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
      console.log('🔄 Buscando dados da API...');
      
      const timestamp = Date.now();
      const response = await fetch(`/api/financial/market-data?_t=${timestamp}`, {
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
      console.log('✅ Dados da API recebidos:', result);
      
      setData(result.marketData);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados da API:', err);
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

// 🎨 INDICADOR DE MERCADO ESTILO MODERNO (SEM CARD)
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
  const bgGradient = trend === 'up' 
    ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
    : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        background: bgGradient,
        borderRadius: 4,
        p: 4,
        border: '1px solid',
        borderColor: trend === 'up' ? '#bbf7d0' : '#fecaca',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: trendColor,
        }
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                lineHeight: 1
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b',
                  display: 'block',
                  mt: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: trendColor,
            boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
          }}>
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
          </Box>
        </Stack>
        
        {/* Valor principal */}
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            color: '#1e293b',
            fontSize: { xs: '2.5rem', sm: '3rem' },
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          {isLoading ? '...' : value}
        </Typography>
        
        {/* Indicador de tendência */}
        {!isLoading && diff !== undefined && trend && (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: trendColor,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <TrendIcon size={14} weight="bold" />
            </Box>
            <Typography 
              variant="h6"
              sx={{ 
                color: trendColor,
                fontWeight: 700,
                fontSize: '1.125rem'
              }}
            >
              {diff > 0 ? '+' : ''}{typeof diff === 'number' ? diff.toFixed(2) : diff}%
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              hoje
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export interface OverviewData {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  dy: string;
  precoTeto: string;
  vies: string;
}

interface OverviewTableProps {
  count?: number;
  page?: number;
  rows?: OverviewData[];
  rowsPerPage?: number;
  cardsData?: {
    ibovespa?: { value: string; trend?: 'up' | 'down'; diff?: number };
    indiceSmall?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function OverviewTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {}
}: OverviewTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((item) => item.id), [rows]);

  // 🔥 BUSCAR DADOS REAIS DA API
  const { data: apiData, loading, error, refresh } = useMarketDataAPI();

  // 🔥 VALORES PADRÃO ATUALIZADOS (APENAS FALLBACK QUANDO API FALHA)
  const defaultIndicators = {
    ibovespa: { value: "136.431", trend: "down" as const, diff: -0.26 },
    indiceSmall: { value: "2.237,86", trend: "up" as const, diff: 1.56 },
  };

  // 🔧 PRIORIZAR DADOS DA API, DEPOIS cardsData, DEPOIS DEFAULT
  const indicators = React.useMemo(() => {
    // Se temos dados da API, usar eles
    if (apiData) {
      console.log('✅ Usando dados da API:', apiData);
      return {
        ibovespa: apiData.ibovespa || defaultIndicators.ibovespa,
        indiceSmall: apiData.indiceSmall || defaultIndicators.indiceSmall,
      };
    }
    
    // Senão, usar cardsData se disponível
    if (Object.keys(cardsData).length > 0) {
      console.log('⚠️ Usando cardsData prop:', cardsData);
      return { ...defaultIndicators, ...cardsData };
    }
    
    // Por último, usar fallback
    console.log('⚠️ Usando dados de fallback');
    return defaultIndicators;
  }, [apiData, cardsData]);

  return (
    <Box>
      {/* Header com status da API */}
      {error && (
        <Box sx={{ mb: 3, p: 3, backgroundColor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: '#dc2626' }}>
              ⚠️ Erro ao carregar dados da API: {error}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={refresh}
            >
              🔄 Tentar novamente
            </Typography>
          </Stack>
        </Box>
      )}

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mt: 2 }}>
            Carregando dados em tempo real...
          </Typography>
        </Box>
      )}

      {/* Indicadores de Mercado - Layout Otimizado */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 4,
          mb: 5,
        }}
      >
        <MarketIndicator 
          title="IBOVESPA" 
          description="Índice da Bolsa Brasileira"
          value={indicators.ibovespa.value} 
          icon={<CurrencyDollarIcon />} 
          trend={indicators.ibovespa.trend} 
          diff={indicators.ibovespa.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="ÍNDICE SMALL CAP" 
          description="Small Caps da B3"
          value={indicators.indiceSmall.value} 
          icon={<UsersThreeIcon />} 
          trend={indicators.indiceSmall.trend} 
          diff={indicators.indiceSmall.diff}
          isLoading={loading}
        />
      </Box>
      
      {/* Tabela de Ações */}
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
                📊 Carteira de Ações
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {rows.length} ativos em acompanhamento • Viés calculado automaticamente
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {rows.length} ativos
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
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
                  #
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
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
                  Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Preço Inicial
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Preço Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  DY
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Teto
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
              {rows.map((row, index) => {
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum)) {
                    return 'Aguardar';
                  }
                  
                  return precoAtualNum < precoTetoNum ? 'Compra' : 'Aguardar';
                };
                
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.04)',
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
                      color: '#6366f1'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar} 
                          alt={row.ticker}
                          sx={{ 
                            width: 44, 
                            height: 44,
                            border: '2px solid',
                            borderColor: 'rgba(99, 102, 241, 0.2)'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '1rem'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: performance >= 0 ? '#059669' : '#dc2626',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="medium"
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
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
                      {row.precoEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: performance >= 0 ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#6366f1',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.dy}
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
                        label={viesCalculado}
                        size="medium"
                        sx={{
                          backgroundColor: viesCalculado === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid',
                          borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
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
          count={count}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={page}
          rowsPerPage={rowsPerPage}
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
