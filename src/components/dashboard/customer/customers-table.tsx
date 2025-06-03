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

// 🎨 INDICADOR DE MERCADO DISCRETO E ELEGANTE (IGUAL AO OVERVIEW)
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
              hoje
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export interface Ativo {
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

interface AtivosTableProps {
  count?: number;
  page?: number;
  rows?: Ativo[];
  rowsPerPage?: number;
  cardsData?: {
    ibovespa?: { value: string; trend?: 'up' | 'down'; diff?: number };
    indiceSmall?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraHoje?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dividendYield?: { value: string; trend?: 'up' | 'down'; diff?: number };
    ibovespaPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function AtivosTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: AtivosTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((ativo) => ativo.id), [rows]);

  // 🔥 BUSCAR DADOS REAIS DA API
  const { data: apiData, loading, error, refresh } = useMarketDataAPI();

  // 🔥 VALORES PADRÃO PARA MICRO CAPS (APENAS FALLBACK QUANDO API FALHA)
  const defaultIndicators = {
    ibovespa: { value: "132k", trend: "up" as const, diff: 1.6 },
    indiceSmall: { value: "1.255k", trend: "down" as const, diff: -3.2 },
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
      
      {/* Tabela de Micro Caps */}
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
                Carteira de Micro Caps
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {rows.length} ações em acompanhamento • Alto potencial de crescimento
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.
