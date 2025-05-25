/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { ChartLineUp as ChartLineUpIcon } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { ArrowUpRight as ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';

interface CarteiraCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  totalValue: string;
  totalAssets: number;
  performance: string;
  performancePercent: number;
  href: string;
  gradient: string;
}

function CarteiraCard({ 
  title, 
  description, 
  icon, 
  totalValue, 
  totalAssets, 
  performance, 
  performancePercent, 
  href,
  gradient 
}: CarteiraCardProps): React.JSX.Element {
  const handleClick = () => {
    window.location.href = href;
  };

  const isPositive = performancePercent >= 0;

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: '280px',
        background: gradient,
        color: 'white',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        }
      }}
    >
      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 1 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '& svg': { fontSize: 28, color: 'white' }
              }}
            >
              {icon}
            </Avatar>
            <ArrowUpRightIcon size={24} style={{ opacity: 0.7 }} />
          </Stack>

          {/* Title & Description */}
          <Stack spacing={1}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.5rem',
                lineHeight: 1.2
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                fontSize: '0.95rem',
                lineHeight: 1.4
              }}
            >
              {description}
            </Typography>
          </Stack>

          {/* Stats */}
          <Stack spacing={2} sx={{ flex: 1, justifyContent: 'flex-end' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                  VALOR TOTAL
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {totalValue}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                  ATIVOS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {totalAssets}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip
                label={`${isPositive ? '+' : ''}${performancePercent.toFixed(1)}%`}
                size="small"
                sx={{
                  backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: isPositive ? '#4caf50' : '#f44336',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: `1px solid ${isPositive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                {performance}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Page(): React.JSX.Element {
  const carteiras = [
    {
      title: 'Exterior Stocks',
      description: 'Ações internacionais de empresas de tecnologia, crescimento e valor',
      icon: <TrendUpIcon />,
      totalValue: 'USD 45.230',
      totalAssets: 12,
      performance: 'USD +8.420',
      performancePercent: 22.8,
      href: '/dashboard/internacional/stocks',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Exterior ETFs',
      description: 'Fundos de índice diversificados para exposição global de mercados',
      icon: <ChartLineUpIcon />,
      totalValue: 'USD 28.950',
      totalAssets: 8,
      performance: 'USD +3.120',
      performancePercent: 12.1,
      href: '/dashboard/internacional/etfs',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Exterior Dividendos',
      description: 'Ações pagadoras de dividendos consistentes e REITs internacionais',
      icon: <CurrencyDollarIcon />,
      totalValue: 'USD 32.180',
      totalAssets: 15,
      performance: 'USD +4.680',
      performancePercent: 17.0,
      href: '/dashboard/internacional/dividendos',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          Investimentos Internacionais
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '1.1rem',
            maxWidth: '600px'
          }}
        >
          Gerencie suas carteiras de investimentos no exterior. Escolha uma carteira para visualizar detalhes e performance.
        </Typography>
      </Stack>

      {/* Carteiras Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          maxWidth: '1200px'
        }}
      >
        {carteiras.map((carteira, index) => (
          <CarteiraCard
            key={index}
            title={carteira.title}
            description={carteira.description}
            icon={carteira.icon}
            totalValue={carteira.totalValue}
            totalAssets={carteira.totalAssets}
            performance={carteira.performance}
            performancePercent={carteira.performancePercent}
            href={carteira.href}
            gradient={carteira.gradient}
          />
        ))}
      </Box>

      {/* Summary Stats */}
      <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="space-around">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                USD 106.360
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Investido no Exterior
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                +USD 16.220
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ganho Total (18,0%)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                35
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total de Ativos
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
