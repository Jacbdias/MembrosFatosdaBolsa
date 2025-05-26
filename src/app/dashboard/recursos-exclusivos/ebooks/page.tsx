/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

export default function Page(): React.JSX.Element {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header com botão voltar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
          sx={{ color: 'text.secondary' }}
        >
          Voltar
        </Button>
        <Stack spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Ebooks
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Material de estudo em PDF sobre investimentos, análise fundamentalista e estratégias
          </Typography>
        </Stack>
      </Stack>

      {/* Conteúdo temporário */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Página em construção 🚧
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Em breve disponibilizaremos nossa biblioteca completa de Ebooks.
        </Typography>
      </Box>
    </Box>
  );
}
