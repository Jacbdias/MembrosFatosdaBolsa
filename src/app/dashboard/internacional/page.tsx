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
  isSpecial?: boolean;
}

function NavigationCard({ title, description, icon, href, isSpecial = false }: NavigationCardProps): React.JSX.Element {
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
        background: isSpecial 
          ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
          : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #3a3a3a 100%)',
        border: isSpecial 
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: isSpecial
          ? '0 4px 6px -1px rgba(30, 64, 175, 0.2), 0 2px 4px -2px rgba(30, 64, 175, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: isSpecial
            ? '0 20px 40px -8px rgba(30, 64, 175, 0.4)'
            : '0 20px 40px -8px rgba(0, 0, 0, 0.3)',
          border: isSpecial
            ? '1px solid rgba(255, 255, 255, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.25)',
          '& .arrow-icon': {
            transform: 'translateX(6px)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          '& .icon-container': {
            transform: 'scale(1.1) rotate(5deg)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }
        },
      }}
    >
      {/* Special badge para Projeto América */}
      {isSpecial && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            zIndex: 3
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            🇺🇸 Novo
          </Typography>
        </Box>
      )}

      {/* Subtle glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)'
        }}
      />
      
      {/* Accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: isSpecial
            ? 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 100%)'
            : 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)'
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
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
    },
    // 🇺🇸 NOVO CARD - Projeto América
    {
      title: 'Projeto América',
      description: 'Investimentos estratégicos no mercado americano',
      icon: <StarIcon />,
      href: '/dashboard/internacional/projeto-america',
      isSpecial: true
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
