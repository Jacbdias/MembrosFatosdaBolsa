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
  href: string;
  gradient: string;
}

function CarteiraCard({ 
  title, 
  description, 
  icon, 
  href,
  gradient 
}: CarteiraCardProps): React.JSX.Element {
  const handleClick = () => {
    window.location.href = href;
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: '200px',
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
      {/* Background Dollar Bills */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Dollar bill representations using rectangles with $ symbols */}
        <Box
          sx={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '80px',
            height: '35px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(15deg)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.4)'
          }}
        >
          $100
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '30px',
            left: '15px',
            width: '70px',
            height: '30px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-10deg)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.3)'
          }}
        >
          $50
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '80px',
            left: '65%',
            width: '60px',
            height: '25px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(25deg)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.25)'
          }}
        >
          $20
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '70px',
            right: '30%',
            width: '75px',
            height: '32px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-20deg)',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.35)'
          }}
        >
          $10
        </Box>
      </Box>
      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Header com título ao lado do ícone */}
          <Stack direction="row" spacing={3} alignItems="center">
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
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.5rem',
                lineHeight: 1.2,
                flex: 1
              }}
            >
              {title}
            </Typography>
            <ArrowUpRightIcon size={24} style={{ opacity: 0.7 }} />
          </Stack>

          {/* Description */}
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: '0.95rem',
              lineHeight: 1.4,
              textAlign: 'left',
              flex: 1
            }}
          >
            {description}
          </Typography>
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
      href: '/dashboard/internacional/stocks',
      gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
    },
    {
      title: 'Exterior ETFs',
      description: 'Fundos de índice diversificados para exposição global de mercados',
      icon: <ChartLineUpIcon />,
      href: '/dashboard/internacional/etfs',
      gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
    },
    {
      title: 'Exterior Dividendos',
      description: 'Ações pagadoras de dividendos consistentes e REITs internacionais',
      icon: <CurrencyDollarIcon />,
      href: '/dashboard/internacional/dividendos',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
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
            href={carteira.href}
            gradient={carteira.gradient}
          />
        ))}
      </Box>
    </Box>
  );
}
