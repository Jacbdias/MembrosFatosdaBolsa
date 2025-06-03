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
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

// 🎨 CARD DE NAVEGAÇÃO CLEAN
interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function NavigationCard({ title, description, icon, href }: NavigationCardProps): React.JSX.Element {
  const handleNavigation = () => {
    window.location.href = href;
  };

  return (
    <Card
      onClick={handleNavigation}
      sx={{
        position: 'relative',
        height: '200px',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #000000 0%, #1f1f1f 50%, #2d2d2d 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.4)',
          '& .arrow-icon': {
            transform: 'translateX(6px)',
          },
          '& .icon-container': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        },
      }}
    >
      {/* Subtle pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }}
      />
      
      {/* Content */}
      <Box
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Header */}
        <Stack spacing={2}>
          <Box
            className="icon-container"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'transform 0.3s ease'
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 24, weight: 'bold' })}
          </Box>
          
          <Stack spacing={1}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
                fontSize: '1.4rem'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>

        {/* Arrow */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            className="arrow-icon"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'transform 0.3s ease'
            }}
          >
            <ArrowRightIcon size={18} weight="bold" />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default function Page(): React.JSX.Element {
  const navigationCards = [
    {
      title: 'ETFs',
      description: 'Fundos diversificados para exposição global',
      icon: <ChartLineIcon />,
      href: '/dashboard/internacional/etfs'
    },
    {
      title: 'Stocks',
      description: 'Ações individuais de empresas globais',
      icon: <TrendUpIcon />,
      href: '/dashboard/internacional/stocks'
    },
    {
      title: 'Dividendos',
      description: 'Ativos focados em renda passiva',
      icon: <CurrencyDollarIcon />,
      href: '/dashboard/internacional/dividendos'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        p: 3 
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard'}
          sx={{ 
            color: '#64748b',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Dashboard
        </Button>
        <Box sx={{ width: 1, height: 24, backgroundColor: '#cbd5e0', mx: 2 }} />
        <Stack spacing={0.5}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: '#1e293b',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            Internacional
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}
          >
            Escolha sua carteira de investimentos
          </Typography>
        </Stack>
      </Stack>

      {/* Navigation Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          maxWidth: '900px',
          mx: 'auto'
        }}
      >
        {navigationCards.map((card, index) => (
          <NavigationCard key={index} {...card} />
        ))}
      </Box>
    </Box>
  );
}
