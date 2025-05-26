/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Chat as ChatIcon } from '@phosphor-icons/react/dist/ssr/Chat';
import { VideoCamera as VideoCameraIcon } from '@phosphor-icons/react/dist/ssr/VideoCamera';
import { Airplane as AirplaneIcon } from '@phosphor-icons/react/dist/ssr/Airplane';
import { BookOpen as BookOpenIcon } from '@phosphor-icons/react/dist/ssr/BookOpen';
import { Table as TableIcon } from '@phosphor-icons/react/dist/ssr/Table';
import { ArrowUpRight as ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';

interface RecursoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  gradient: string;
  badge?: string;
}

function RecursoCard({ 
  title, 
  description, 
  icon, 
  href,
  onClick,
  gradient,
  badge
}: RecursoCardProps): React.JSX.Element {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: '220px',
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
      {/* Badge opcional */}
      {badge && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            px: 2,
            py: 0.5,
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 3,
          }}
        >
          {badge}
        </Box>
      )}

      {/* Background decorativo */}
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
        <Box
          sx={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '60px',
            height: '25px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            transform: 'rotate(12deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            left: '10px',
            width: '50px',
            height: '20px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            transform: 'rotate(-8deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60px',
            left: '70%',
            width: '40px',
            height: '15px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: '4px',
            transform: 'rotate(20deg)',
          }}
        />
      </Box>

      <CardContent sx={{ p: 4, height: '100%', position: 'relative', zIndex: 2 }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Header com ícone e título */}
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
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {title}
              </Typography>
            </Box>
            <ArrowUpRightIcon size={24} style={{ opacity: 0.7 }} />
          </Stack>

          {/* Description */}
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: '0.95rem',
              lineHeight: 1.5,
              textAlign: 'left',
              flex: 1,
              display: 'flex',
              alignItems: 'center'
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
  const recursos = [
    {
      title: 'Imposto de Renda',
      description: 'Ferramentas, calculadoras e guias completos para declaração do IR com investimentos',
      icon: <FileTextIcon />,
      href: '/dashboard/recursos-exclusivos/imposto-de-renda',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      badge: 'NOVIDADE'
    },
    {
      title: 'Acesso ao Telegram',
      description: 'Entre no nosso grupo exclusivo para dicas, análises e discussões sobre investimentos',
      icon: <ChatIcon />,
      href: '/dashboard/recursos-exclusivos/telegram',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      badge: 'ATIVO'
    },
    {
      title: 'Lives e Aulas',
      description: 'Biblioteca completa de vídeos educativos, webinars e aulas ao vivo gravadas',
      icon: <VideoCameraIcon />,
      href: '/dashboard/recursos-exclusivos/lives-e-aulas',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
    {
      title: 'Milhas Aéreas',
      description: 'Estratégias e dicas para acumular milhas através de investimentos e cartões de crédito',
      icon: <AirplaneIcon />,
      href: '/dashboard/recursos-exclusivos/milhas-aereas',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    {
      title: 'Ebooks',
      description: 'Material de estudo em PDF sobre investimentos, análise fundamentalista e estratégias',
      icon: <BookOpenIcon />,
      href: '/dashboard/recursos-exclusivos/ebooks',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    },
    {
      title: 'Planilhas',
      description: 'Templates exclusivos para controle de carteira, análise de ações e planejamento financeiro',
      icon: <TableIcon />,
      href: '/dashboard/recursos-exclusivos/planilhas',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
      badge: 'POPULAR'
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
          Recursos Exclusivos
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '1.1rem',
            maxWidth: '800px'
          }}
        >
          Acesse ferramentas, conteúdos e recursos exclusivos para potencializar seus investimentos e conhecimento no mercado financeiro.
        </Typography>
      </Stack>

      {/* Recursos Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          maxWidth: '1400px'
        }}
      >
        {recursos.map((recurso, index) => (
          <RecursoCard
            key={index}
            title={recurso.title}
            description={recurso.description}
            icon={recurso.icon}
            href={recurso.href}
            gradient={recurso.gradient}
            badge={recurso.badge}
          />
        ))}
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          mt: 6, 
          p: 4, 
          backgroundColor: 'grey.50', 
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Precisa de ajuda com algum recurso?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Nossa equipe está pronta para te ajudar a aproveitar ao máximo todos os recursos disponíveis.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#374151',
            '&:hover': { backgroundColor: '#1f2937' }
          }}
        >
          Entrar em Contato
        </Button>
      </Box>
    </Box>
  );
}
