/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

// 🎨 CARD DE NAVEGAÇÃO ELEGANTE
interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  stats?: {
    label: string;
    value: string;
    trend?: 'up' | 'down';
  };
}

function NavigationCard({ title, description, icon, gradient, href, stats }: NavigationCardProps): React.JSX.Element {
  const handleNavigation = () => {
    window.location.href = href;
  };

  return (
    <Card
      onClick={handleNavigation}
      sx={{
        position: 'relative',
        height: '280px',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: gradient,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          '& .arrow-icon': {
            transform: 'translateX(8px)',
          },
          '& .card-content': {
            transform: 'translateY(-4px)',
          }
        },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(25%, -25%)'
        }}
      />
      
      {/* Content */}
      <Box
        className="card-content"
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Header */}
        <Stack spacing={3}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 28, weight: 'bold' })}
          </Box>
          
          <Stack spacing={1}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: 'white',
                fontSize: '1.5rem',
                lineHeight: 1.2
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                lineHeight: 1.4
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>

        {/* Stats & Action */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {stats && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.8rem',
                  mb: 0.5
                }}
              >
                {stats.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                {stats.value}
              </Typography>
            </Box>
          )}
          
          <Box
            className="arrow-icon"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'transform 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <ArrowRightIcon size={20} weight="bold" />
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

// 🎨 ESTATÍSTICA RÁPIDA
interface QuickStatProps {
  label: string;
  value: string;
  trend?: 'up' | 'down';
  color: string;
}

function QuickStat({ label, value, trend, color }: QuickStatProps): React.JSX.Element {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          color: color,
          fontWeight: 800,
          fontSize: '1.5rem'
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function Page(): React.JSX.Element {
  const navigationCards = [
    {
      title: 'ETFs',
      description: 'Fundos de investimento diversificados para exposição global e setorial',
      icon: <ChartLineIcon />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      href: '/dashboard/internacional/etfs',
      stats: {
        label: 'Ativos',
        value: '12 ETFs'
      }
    },
    {
      title: 'Stocks',
      description: 'Ações individuais de empresas de tecnologia, crescimento e valor',
      icon: <TrendUpIcon />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      href: '/dashboard/internacional/stocks',
      stats: {
        label: 'Carteira',
        value: '+62.66%'
      }
    },
    {
      title: 'Dividendos',
      description: 'Ações com foco em distribuição de dividendos e renda passiva',
      icon: <CurrencyDollarIcon />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      href: '/dashboard/internacional/dividendos',
      stats: {
        label: 'Yield',
        value: '4.2%'
      }
    }
  ];

  const quickStats = [
    { label: 'Total Investido', value: 'R$ 450.000', color: '#1e293b' },
    { label: 'Retorno Total', value: '+28.5%', color: '#10b981' },
    { label: 'Renda Mensal', value: 'R$ 1.850', color: '#3b82f6' },
    { label: 'Ativos', value: '45', color: '#8b5cf6' }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        p: 3 
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard'}
          sx={{ 
            color: '#64748b',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.7)'
            }
          }}
        >
          Dashboard
        </Button>
        <Box sx={{ width: 1, height: 24, backgroundColor: '#cbd5e0', mx: 2 }} />
        <Stack spacing={1}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            Investimentos Internacionais
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            Diversificação global em ETFs, ações e dividendos
          </Typography>
        </Stack>
      </Stack>

      {/* Quick Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
          gap: 2,
          mb: 5
        }}
      >
        {quickStats.map((stat, index) => (
          <QuickStat key={index} {...stat} />
        ))}
      </Box>

      {/* Navigation Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 4,
          mb: 4
        }}
      >
        {navigationCards.map((card, index) => (
          <NavigationCard key={index} {...card} />
        ))}
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          mt: 6,
          p: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <GlobeIcon size={24} color="#64748b" />
          <Typography
            variant="h6"
            sx={{
              color: '#1e293b',
              fontWeight: 700
            }}
          >
            Diversificação Global
          </Typography>
        </Stack>
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Explore oportunidades de investimento em mercados internacionais com estratégias
          diversificadas em ETFs, ações individuais e ativos geradores de dividendos.
        </Typography>
      </Box>
    </Box>
  );
}
