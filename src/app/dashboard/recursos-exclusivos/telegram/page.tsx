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
          sx={{ alignSelf: 'flex-start' }}
        >
          ← Voltar para Recursos Exclusivos
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Acesso ao Telegram
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Entre no nosso grupo exclusivo para dicas, análises e discussões sobre investimentos
        </Typography>
        
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Página em construção 🚧
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Em breve disponibilizaremos o acesso ao grupo do Telegram.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
