/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

export default function RentabilidadesPage(): React.JSX.Element {
  console.log('🚀 PÁGINA RENTABILIDADES CARREGADA!');

  const [loading, setLoading] = React.useState(true);

  // Simular carregamento
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="400px"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress size={50} />
            <Typography variant="h6" color="text.secondary">
              📊 Carregando análise de rentabilidades...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Header Temporário */}
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 3 }}>
            🎉 <strong>Página de Rentabilidades criada com sucesso!</strong> 
            <br />Em breve, aqui teremos análises completas de performance, gráficos e relatórios.
          </Alert>
        </Grid>

        {/* Conteúdo Temporário */}
        <Grid xs={12}>
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              border: '2px dashed #e2e8f0'
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
              📈 Rentabilidades
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Análise completa da performance dos seus investimentos
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, minWidth: 200 }}>
                <Typography variant="h4" color="primary">+23.8%</Typography>
                <Typography variant="body2">Rentabilidade Total</Typography>
              </Box>
              <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, minWidth: 200 }}>
                <Typography variant="h4" color="success.main">R$ 45.200</Typography>
                <Typography variant="body2">Dividendos Recebidos</Typography>
              </Box>
              <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, minWidth: 200 }}>
                <Typography variant="h4" color="info.main">18.5%</Typography>
                <Typography variant="body2">Rentabilidade Anualizada</Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
              🚧 Em desenvolvimento: Gráficos, comparações com benchmarks, análise de risco e relatórios detalhados.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
