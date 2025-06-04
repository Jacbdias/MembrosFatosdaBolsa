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
import { Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { Percent as PercentIcon } from '@phosphor-icons/react/dist/ssr/Percent';
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // Função vazia para props obrigatórias
}

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API FIIs
function useFIIMarketDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      console.log('🔄 Buscando dados da API FIIs...');
      
      const timestamp = Date.now();
      const response = await fetch(`/api/financial/fii-market-data?_t=${timestamp}`, {
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
      console.log('✅ Dados da API FIIs recebidos:', result);
      
      setData(result.marketData);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados da API FIIs:', err);
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

// 🎨 INDICADOR DE MERCADO PARA FIIs - ELEGANTE E MODERNO
interface FIIMarketIndicatorProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
  isLoading?: boolean;
  description?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

function FIIMarketIndicator({ 
  title, 
  value, 
  icon, 
  trend, 
  diff, 
  isLoading, 
  description,
  variant = 'primary'
}: FIIMarketIndicatorProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  
  // Cores por variante
  const variantColors = {
    primary: { bg: '#ffffff', border: '#e2e8f0', iconBg: '#f1f5f9', iconColor: '#64748b' },
    secondary: { bg: '#f8fafc', border: '#cbd5e1', iconBg: '#e2e8f0', iconColor: '#475569' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', iconBg: '#dcfce7', iconColor: '#16a34a' },
    warning: { bg: '#fffbeb', border: '#fed7aa', iconBg: '#fef3c7', iconColor: '#d97706' }
  };
  
  const colors = variantColors[variant];
  
  return (
    <Box 
      sx={{ 
        backgroundColor: colors.bg,
        borderRadius: 3,
        p: 3,
        border: '1px solid',
        borderColor: colors.border,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: variant === 'primary' ? '#c7d2fe' : colors.border,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Stack spacing={2.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.75rem',
                lineHeight: 1.2
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
                  mt: 0.5,
                  fontSize: '0.7rem',
                  lineHeight: 1.3
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.iconColor,
            flexShrink: 0
          }}>
            {React.cloneElement(icon as React.ReactElement, { size: 18, weight: 'duotone' })}
          </Box>
        </Stack>
        
        {/* Valor principal */}
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            color: '#1e293b',
            fontSize: '2rem',
            lineHeight: 1,
            letterSpacing: '-0.025em'
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress sx={{ width: 80, height: 6, borderRadius: 3 }} />
            </Box>
          ) : value}
        </Typography>
        
        {/* Indicador de tendência */}
        {!isLoading && diff !== undefined && trend && (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
              color: trendColor
            }}>
              <TrendIcon size={14} weight="bold" />
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                color: trendColor,
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              {diff > 0 ? '+' : ''}{typeof diff === 'number' ? diff.toFixed(2) : diff}%
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 500
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

export interface FIIOverviewData {
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
  rank: string;
  performance?: number;
}

interface FIIOverviewTableProps {
  count?: number;
  page?: number;
  rows?: FIIOverviewData[];
  rowsPerPage?: number;
  cardsData?: {
    ifix?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraHoje?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dividendYield?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
  ifixReal?: any;
}

export function FIIOverviewTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
  ifixReal
}: FIIOverviewTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((item) => item.id), [rows]);

  // 🔥 BUSCAR DADOS REAIS DA API FIIs
  const { data: apiData, loading, error, refresh } = useFIIMarketDataAPI();

  // 🔥 VALORES PADRÃO PARA FIIs (FALLBACK)
  const defaultIndicators = {
    ifix: { value: "3.200", trend: "up" as const, diff: 0.25 },
    carteiraHoje: { value: "12.4%", trend: "up" as const, diff: 12.4 },
    dividendYield: { value: "11.8%", trend: "up" as const, diff: 11.8 },
    carteiraPeriodo: { value: "15.2%", trend: "up" as const, diff: 15.2 },
  };

  // 🔧 PRIORIZAR DADOS DA API, DEPOIS cardsData, DEPOIS DEFAULT
  const indicators = React.useMemo(() => {
    // Se temos dados da API, usar eles
    if (apiData) {
      console.log('✅ Usando dados da API FIIs:', apiData);
      return {
        ifix: apiData.ifix || defaultIndicators.ifix,
        carteiraHoje: apiData.carteiraHoje || defaultIndicators.carteiraHoje,
        dividendYield: apiData.dividendYield || defaultIndicators.dividendYield,
        carteiraPeriodo: apiData.carteiraPeriodo || defaultIndicators.carteiraPeriodo,
      };
    }
    
    // Senão, usar cardsData se disponível
    if (Object.keys(cardsData).length > 0) {
      console.log('⚠️ Usando cardsData prop FIIs:', cardsData);
      return { ...defaultIndicators, ...cardsData };
    }
    
    // Por último, usar fallback
    console.log('⚠️ Usando dados de fallback FIIs');
    return defaultIndicators;
  }, [apiData, cardsData]);

  // 🏢 MAPEAMENTO DE SETORES PARA CORES
  const setorColors: Record<string, { bg: string; color: string; border: string }> = {
    'Shopping': { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
    'Papel': { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    'Hedge Fund': { bg: '#f3e8ff', color: '#7c3aed', border: '#e9d5ff' },
    'Fiagro': { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
    'FoF': { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
    'Logística': { bg: '#fef2f2', color: '#ef4444', border: '#fde2e2' },
    'Híbrido': { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
    'Corporativo': { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
    'Residencial': { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  };

  const getSetorStyle = (setor: string) => {
    return setorColors[setor] || setorColors['Corporativo'];
  };

  return (
    <Box>
      {/* Header com status da API */}
      {error && (
        <Box sx={{ mb: 3, p: 3, backgroundColor: '#fef2f2', borderRadius: 3, border: '1px solid #fecaca' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 500 }}>
              ⚠️ Erro ao carregar dados da API FIIs: {error}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#2563eb', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                fontWeight: 600,
                '&:hover': { color: '#1d4ed8' }
              }}
              onClick={refresh}
            >
              🔄 Tentar novamente
            </Typography>
          </Stack>
        </Box>
      )}

      {loading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 8, backgroundColor: '#f1f5f9' }} />
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mt: 2, fontWeight: 500 }}>
            📈 Carregando dados em tempo real dos FIIs...
          </Typography>
        </Box>
      )}

      {/* Grid de Indicadores FIIs - Layout Premium */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '1fr 1fr 1fr 1fr' 
          },
          gap: 3,
          mb: 5,
        }}
      >
        <FIIMarketIndicator 
          title="IFIX" 
          description="Índice de Fundos Imobiliários"
          value={indicators.ifix.value} 
          icon={<BuildingsIcon />} 
          trend={indicators.ifix.trend} 
          diff={indicators.ifix.diff}
          isLoading={loading}
          variant="primary"
        />
        <FIIMarketIndicator 
          title="CARTEIRA HOJE" 
          description="Performance do dia"
          value={indicators.carteiraHoje.value} 
          icon={<TrendUp />} 
          trend={indicators.carteiraHoje.trend} 
          diff={indicators.carteiraHoje.diff}
          isLoading={loading}
          variant="success"
        />
        <FIIMarketIndicator 
          title="DIVIDEND YIELD" 
          description="Rendimento médio"
          value={indicators.dividendYield.value} 
          icon={<PercentIcon />} 
          trend={indicators.dividendYield.trend} 
          diff={indicators.dividendYield.diff}
          isLoading={loading}
          variant="warning"
        />
        <FIIMarketIndicator 
          title="CARTEIRA PERÍODO" 
          description="Performance acumulada"
          value={indicators.carteiraPeriodo.value} 
          icon={<ChartPieIcon />} 
          trend={indicators.carteiraPeriodo.trend} 
          diff={indicators.carteiraPeriodo.diff}
          isLoading={loading}
          variant="secondary"
        />
      </Box>
      
      {/* Tabela de FIIs */}
      <Card sx={{ 
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          p: 4,
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            pointerEvents: 'none'
          }
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: '#ffffff',
                fontSize: '1.75rem',
                mb: 0.5,
                letterSpacing: '-0.025em'
              }}>
                🏢 Carteira de FIIs Premium
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#cbd5e1',
                fontSize: '1rem',
                fontWeight: 500
              }}>
                {rows.length} fundos imobiliários • Viés calculado automaticamente • DY atualizado
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              px: 4,
              py: 2,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {rows.length} FIIs
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '900px' }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  width: '60px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  RANK
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Fundo Imobiliário
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Setor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Preço Inicial
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Preço Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Dividend Yield
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Preço Teto
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Viés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const calcularViesFII = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum)) {
                    return 'Aguardar';
                  }
                  
                  return precoAtualNum < precoTetoNum ? 'Compra' : 'Aguardar';
                };
                
                const viesCalculado = calcularViesFII(row.precoTeto, row.precoAtual);
                
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                
                const setorStyle = getSetorStyle(row.setor);
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/fii/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        cursor: 'pointer',
                        transform: 'scale(1.002)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 900, 
                      fontSize: '1.1rem',
                      color: '#0f172a',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      borderRadius: 2,
                      mx: 1
                    }}>
                      {row.rank}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2.5} alignItems="center">
                        <Avatar 
                          src={row.avatar} 
                          alt={row.ticker}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            border: '2px solid',
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 800,
                            color: '#1e293b',
                            fontSize: '1.1rem',
                            letterSpacing: '-0.025em'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" sx={{ 
                              color: performance >= 0 ? '#059669' : '#dc2626',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              backgroundColor: performance >= 0 ? '#dcfce7' : '#fee2e2',
                              px: 1.5,
                              py: 0.25,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: performance >= 0 ? '#bbf7d0' : '#fecaca'
                            }}>
                              {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="medium"
                        sx={{
                          backgroundColor: setorStyle.bg,
                          color: setorStyle.color,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid',
                          borderColor: setorStyle.border,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          '&:hover': {
                            backgroundColor: setorStyle.color,
                            color: 'white'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      fontWeight: 500
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      fontSize: '0.95rem'
                    }}>
                      {row.precoEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 800,
                      color: performance >= 0 ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.95rem'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      <Box sx={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        border: '1px solid #fde68a',
                        display: 'inline-block'
                      }}>
                        {row.dy}
                      </Box>
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
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          border: '2px solid',
                          borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          minWidth: 80,
                          '&:hover': {
                            backgroundColor: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                            color: 'white',
                            transform: 'scale(1.05)'
                          }
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
          labelRowsPerPage="FIIs por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`} FIIs`
          }
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: 3,
            '& .MuiTablePagination-toolbar': {
              color: '#475569',
              fontWeight: 500
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 600
            }
          }}
        />
      </Card>
    </Box>
  );
}
