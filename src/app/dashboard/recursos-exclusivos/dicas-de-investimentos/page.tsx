'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function Page() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Button
          onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
          sx={{ 
            alignSelf: 'flex-start',
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          ← Voltar para Recursos Exclusivos
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dicas de Investimentos
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Estratégias e insights exclusivos para maximizar seus retornos no mercado financeiro
        </Typography>
        
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Página em construção 🚧
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Em breve disponibilizaremos dicas exclusivas de investimentos.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
