/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { Box, Card, CardContent, Typography, Stack, Skeleton, Chip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { 
  TrendUp, 
  TrendDown, 
  CurrencyDollar, 
  ChartLine, 
  Percent, 
  Trophy,
  ArrowUp,
  ArrowDown,
  Wallet,
  Target
} from '@phosphor-icons/react/dist/ssr';

interface ResumoGeral {
  valorTotalInvestido: number;
  valorTotalAtual: number;
  totalDividendosRecebidos: number;
  rentabilidadeTotalGeral: number;
  rentabilidadeAnualizadaGeral: number;
  dyGeralRealizado: number;
  melhorCarteira: string;
  piorCarteira: string;
  melhorAtivo: string;
  piorAtivo: string;
}

interface Metricas {
  totalAtivos: number;
  totalCarteiras: number;
  performanceVsIbovespa: number;
  performanceVsCDI: number;
  ultimaAtualizacao: string;
  rentabilidadeTotal: number;
  rentabilidadeAnualizada: number;
  dyRealizado: number;
  melhorCarteira: string;
  melhorAtivo: string;
}

interface RentabilidadeHeaderProps {
  resumoGeral: ResumoGeral;
  metricas: Metricas;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: string;
  loading?: boolean;
  badge?: string;
  description?: string;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = '#6366f1', 
  loading = false,
  badge,
  description
}: StatCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [countedValue, setCountedValue] = React.useState('0');
  
  // Animação de contagem
  React.useEffect(() => {
    if (loading) return;
    
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(numericValue)) {
      setCountedValue(value);
      return;
    }
    
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCountedValue(value);
        clearInterval(timer);
      } else {
        // Preservar formato original
        if (value.includes('%')) {
          setCountedValue(`${start >= 0 ? '+' : ''}${start.toFixed(1)}%`);
        } else if (value.includes('R$')) {
          setCountedValue(`R$ ${start.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`);
        } else {
          setCountedValue(start.toFixed(1));
        }
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, loading]);

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b';
  
  if (loading) {
    return (
      <Card sx={{ 
        position: 'relative',
        height: 180,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
      }}>
        <CardContent sx={{ p: 4, height: '100%' }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="space-between">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="circular" width={40} height={40} />
            </Stack>
            <Skeleton variant="text" width={150} height={48} />
            <Skeleton variant="text" width={100} height={24} />
          </Stack>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: 180,
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          borderColor: color,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0.7)',
          transformOrigin: 'left',
          transition: 'transform 0.4s ease',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color}05, transparent)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }
      }}
    >
      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 1 }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Header com badge */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  display: 'block'
                }}
              >
                {title}
              </Typography>
              {badge && (
                <Chip 
                  label={badge}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: `${color}15`,
                    color: color,
                    fontWeight: 600,
                    mt: 0.5
                  }}
                />
              )}
            </Box>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              transform: isHovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {React.cloneElement(icon as React.ReactElement, { 
                size: 24, 
                weight: isHovered ? 'fill' : 'bold' 
              })}
            </Box>
          </Stack>
          
          {/* Valor principal com animação */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: '#1e293b',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                lineHeight: 1,
                letterSpacing: '-0.025em',
                transition: 'color 0.3s ease',
                ...(isHovered && { color: color })
              }}
            >
              {countedValue}
            </Typography>
          </Box>

          {/* Subtitle e trend */}
          <Box>
            {subtitle && (
              <Typography 
                variant="body2"
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: trendValue !== undefined ? 1 : 0
                }}
              >
                {subtitle}
              </Typography>
            )}
            
            {/* Indicador de tendência melhorado */}
            {trendValue !== undefined && TrendIcon && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
                  color: trendColor,
                  transition: 'all 0.3s ease',
                  ...(isHovered && {
                    transform: 'scale(1.2)',
                    boxShadow: `0 4px 12px ${trendColor}25`
                  })
                }}>
                  <TrendIcon size={14} weight="bold" />
                </Box>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: trendColor,
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}
                >
                  {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#64748b',
                    fontSize: '0.8rem'
                  }}
                >
                  período
                </Typography>
              </Stack>
            )}

            {description && (
              <Typography 
                variant="caption"
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                  display: 'block',
                  mt: 0.5
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function RentabilidadeHeader({ resumoGeral, metricas, loading = false }: RentabilidadeHeaderProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDataAtualizacao = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  };

  return (
    <Box>
      {/* Título da página melhorado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: '#1e293b',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              📈 Análise de Rentabilidades
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}
            >
              Visão completa da performance dos seus investimentos • {metricas.totalAtivos} ativos em {metricas.totalCarteiras} carteiras
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Última atualização:
            </Typography>
            <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600 }}>
              {formatDataAtualizacao()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Grid de cards otimizado */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="PATRIMÔNIO TOTAL"
            value={formatCurrency(resumoGeral.valorTotalAtual)}
            subtitle={`Investido: ${formatCurrency(resumoGeral.valorTotalInvestido)}`}
            icon={<Wallet />}
            color="#10b981"
            loading={loading}
            badge="Principal"
            description="Valor atual da carteira total"
          />
        </Grid>

        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="RENTABILIDADE TOTAL"
            value={formatPercentage(resumoGeral.rentabilidadeTotalGeral)}
            subtitle="Capital + Dividendos"
            icon={<ChartLine />}
            trend={resumoGeral.rentabilidadeTotalGeral >= 0 ? 'up' : 'down'}
            trendValue={resumoGeral.rentabilidadeTotalGeral}
            color={resumoGeral.rentabilidadeTotalGeral >= 0 ? '#10b981' : '#ef4444'}
            loading={loading}
            badge="Real"
            description="Performance total incluindo dividendos"
          />
        </Grid>

        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="DIVIDENDOS RECEBIDOS"
            value={formatCurrency(resumoGeral.totalDividendosRecebidos)}
            subtitle={`DY Realizado: ${resumoGeral.dyGeralRealizado.toFixed(1)}%`}
            icon={<CurrencyDollar />}
            trend="up"
            trendValue={resumoGeral.dyGeralRealizado}
            color="#3b82f6"
            loading={loading}
            badge="Efetivo"
            description="Total de dividendos efetivamente recebidos"
          />
        </Grid>

        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="RENTAB. ANUALIZADA"
            value={formatPercentage(resumoGeral.rentabilidadeAnualizadaGeral)}
            subtitle="TIR (Taxa Interna de Retorno)"
            icon={<TrendUp />}
            trend={resumoGeral.rentabilidadeAnualizadaGeral >= 0 ? 'up' : 'down'}
            trendValue={resumoGeral.rentabilidadeAnualizadaGeral}
            color="#8b5cf6"
            loading={loading}
            badge="TIR"
            description="Rentabilidade anualizada considerando tempo"
          />
        </Grid>

        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="VS IBOVESPA"
            value={formatPercentage(metricas.performanceVsIbovespa)}
            subtitle="Performance relativa ao mercado"
            icon={<Target />}
            trend={metricas.performanceVsIbovespa >= 0 ? 'up' : 'down'}
            trendValue={metricas.performanceVsIbovespa}
            color={metricas.performanceVsIbovespa >= 0 ? '#10b981' : '#ef4444'}
            loading={loading}
            badge={metricas.performanceVsIbovespa >= 0 ? 'Superou' : 'Abaixo'}
            description="Comparação com principal índice brasileiro"
          />
        </Grid>

        <Grid xs={12} sm={6} lg={4}>
          <StatCard
            title="MELHOR CARTEIRA"
            value={resumoGeral.melhorCarteira}
            subtitle={`Melhor ativo: ${resumoGeral.melhorAtivo}`}
            icon={<Trophy />}
            color="#f59e0b"
            loading={loading}
            badge="Top 1"
            description="Carteira com melhor performance"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
