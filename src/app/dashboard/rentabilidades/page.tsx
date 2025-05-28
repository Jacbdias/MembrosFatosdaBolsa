/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// Importar o header
import { RentabilidadeHeader } from '@/components/dashboard/rentabilidades/rentabilidade-header';

// Importar o hook (temporário)
import { useRentabilidadeCompleta } from '@/hooks/useRentabilidadeCompleta';

export default function RentabilidadesPage(): React.JSX.Element {
  console.log('🚀 PÁGINA RENTABILIDADES COM HEADER FUNCIONAL!');

  const {
    loading,
    error,
    resumoGeral,
    metricas,
    refetchDados
  } = useRentabilidadeCompleta();

  // Error state
  if (error) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetchDados}>
                🔄 Tentar Novamente
              </Button>
            }
          >
            <strong>Erro ao carregar dados:</strong> {error}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Grid container spacing={4}>
        {/* 🔝 HEADER - Cards com dados reais */}
        <Grid xs={12}>
          <RentabilidadeHeader 
            resumoGeral={resumoGeral}
            metricas={metricas}
            loading={loading}
          />
        </Grid>

        {/* 🚧 Seções em desenvolvimento */}
        {!loading && (
          <>
            <Grid xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>🎯 Próximos componentes em desenvolvimento:</strong>
                <br />• Filtros interativos • Gráfico de evolução • Tabela de performance • Comparação com benchmarks
              </Alert>
            </Grid>

            <Grid xs={12}>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: 3,
                  border: '2px dashed #e2e8f0',
                  mt: 2
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  🔄 Em Desenvolvimento
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Os próximos componentes serão implementados aqui:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                      <Typography variant="h6" color="primary">📊</Typography>
                      <Typography variant="body2">Filtros Avançados</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                      <Typography variant="h6" color="success.main">📈</Typography>
                      <Typography variant="body2">Gráfico Evolução</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                      <Typography variant="h6" color="warning.main">🏆</Typography>
                      <Typography variant="body2">Ranking Ativos</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                      <Typography variant="h6" color="info.main">⚖️</Typography>
                      <Typography variant="body2">Benchmarks</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
                  💡 <strong>Dica:</strong> Os cards acima já estão funcionais com dados reais e animações!
                </Typography>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}
