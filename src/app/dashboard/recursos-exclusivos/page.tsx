'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function Page() {
  const recursos = [
    {
      title: 'Dicas de Investimentos',
      description: 'Estratégias e insights exclusivos para maximizar seus retornos no mercado financeiro',
      href: '/dashboard/recursos-exclusivos/dicas-de-investimentos',
      color: '#f59e0b',
      badge: 'NOVO'
    },
    {
      title: 'Análise de Carteira',
      description: 'Relatórios detalhados e análises personalizadas da sua carteira de investimentos',
      href: '/dashboard/recursos-exclusivos/analise-de-carteira',
      color: '#10b981',
      badge: 'NOVO'
    },
    {
      title: 'Imposto de Renda',
      description: 'Ferramentas, calculadoras e guias completos para declaração do IR com investimentos',
      href: '/dashboard/recursos-exclusivos/imposto-de-renda',
      color: '#dc2626',
      badge: 'NOVIDADE'
    },
    {
      title: 'Acesso ao Telegram', 
      description: 'Entre no nosso grupo exclusivo para dicas, análises e discussões sobre investimentos',
      href: '/dashboard/recursos-exclusivos/telegram',
      color: '#2563eb',
      badge: 'ATIVO'
    },
    {
      title: 'Lives e Aulas',
      description: 'Biblioteca completa de vídeos educativos, webinars e aulas ao vivo gravadas',
      href: '/dashboard/recursos-exclusivos/lives-e-aulas',
      color: '#7c3aed'
    },
    {
      title: 'Milhas Aéreas',
      description: 'Estratégias e dicas para acumular milhas através de investimentos e cartões de crédito',
      href: '/dashboard/recursos-exclusivos/milhas-aereas',
      color: '#059669'
    },
    {
      title: 'Ebooks',
      description: 'Material de estudo em PDF sobre investimentos, análise fundamentalista e estratégias',
      href: '/dashboard/recursos-exclusivos/ebooks',
      color: '#ea580c'
    },
    {
      title: 'Planilhas',
      description: 'Templates exclusivos para controle de carteira, análise de ações e planejamento financeiro',
      href: '/dashboard/recursos-exclusivos/planilhas',
      color: '#0891b2',
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
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          maxWidth: '1600px'
        }}
      >
        {recursos.map((recurso, index) => (
          <Card
            key={index}
            onClick={() => window.location.href = recurso.href}
            sx={{
              cursor: 'pointer',
              height: '220px',
              background: `linear-gradient(135deg, ${recurso.color}dd, ${recurso.color})`,
              color: 'white',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            {/* Badge */}
            {recurso.badge && (
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
                {recurso.badge}
              </Box>
            )}

            <CardContent sx={{ p: 4, height: '100%' }}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    lineHeight: 1.2
                  }}
                >
                  {recurso.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {recurso.description}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
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
      </Box>
    </Box>
  );
}
