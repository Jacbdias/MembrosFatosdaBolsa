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
import { Star as StarIcon } from '@phosphor-icons/react/dist/ssr/Star';

// 🎨 CARD DE NAVEGAÇÃO CLEAN
interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isNew?: boolean;
}

function NavigationCard({ title, description, icon, href, isNew = false }: NavigationCardProps): React.JSX.Element {
  const handleNavigation = () => {
    window.location.href = href;
  };

  return (
    <Card
      onClick={handleNavigation}
      sx={{
        position: 'relative',
        height: '220px',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '& .arrow-icon': {
            transform: 'translateX(8px) scale(1.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          },
          '& .icon-container': {
            transform: 'scale(1.15) rotate(10deg)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          },
          '& .glow-effect': {
            opacity: 1,
            transform: 'scale(1.2)'
          }
        },
      }}
    >
      {/* Badge "NOVO" melhorado */}
      {isNew && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '20px',
            px: 2,
            py: 0.75,
            zIndex: 3,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            🇺🇸 NOVO
          </Typography>
        </Box>
      )}

      {/* Glow effect melhorado */}
      <Box
        className="glow-effect"
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          opacity: 0.6,
          transition: 'all 0.4s ease'
        }}
      />
      
      {/* Linha decorativa superior */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
        }}
      />
      
      {/* Content */}
      <Box
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Header */}
        <Stack spacing={3}>
          <Box
            className="icon-container"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'all 0.4s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 28, weight: 'bold' })}
          </Box>
          
          <Stack spacing={1.5}>
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
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                fontWeight: 400
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>

        {/* Arrow melhorada */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Box
            className="arrow-icon"
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'all 0.4s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            <ArrowRightIcon size={20} weight="bold" />
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
    },
    // 🇺🇸 NOVO CARD - Projeto América
    {
      title: 'Projeto América',
      description: 'Investimentos estratégicos no mercado americano',
      icon: <StarIcon />,
      href: '/dashboard/internacional/projeto-america',
      isNew: true
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
      <Stack spacing={3} sx={{ mb: 6 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard'}
          sx={{ 
            color: '#64748b',
            fontWeight: 600,
            alignSelf: 'flex-start',
            '&:hover': {
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Dashboard
        </Button>
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
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 3,
          maxWidth: '1200px',
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
