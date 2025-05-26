'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function Page() {
  const recursos = [
    {
      title: 'Imposto de Renda',
      description: 'Ferramentas, calculadoras e guias completos',
      href: '/dashboard/recursos-exclusivos/imposto-de-renda',
      color: '#dc2626'
    },
    {
      title: 'Acesso ao Telegram', 
      description: 'Grupo exclusivo para discussões',
      href: '/dashboard/recursos-exclusivos/telegram',
      color: '#2563eb'
    },
    {
      title: 'Lives e Aulas',
      description: 'Biblioteca de vídeos educativos',
      href: '/dashboard/recursos-exclusivos/lives-e-aulas',
      color: '#7c3aed'
    },
    {
      title: 'Milhas Aéreas',
      description: 'Estratégias para acumular milhas',
      href: '/dashboard/recursos-exclusivos/milhas-aereas',
      color: '#059669'
    },
    {
      title: 'Ebooks',
      description: 'Material de estudo em PDF',
      href: '/dashboard/recursos-exclusivos/ebooks',
      color: '#ea580c'
    },
    {
      title: 'Planilhas',
      description: 'Templates para controle de carteira',
      href: '/dashboard/recursos-exclusivos/planilhas',
      color: '#0891b2'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Recursos Exclusivos
      </Typography>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {recursos.map((recurso, index) => (
          <Card
            key={index}
            onClick={() => window.location.href = recurso.href}
            sx={{
              cursor: 'pointer',
              height: '200px',
              backgroundColor: recurso.color,
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {recurso.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {recurso.description}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
