'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useIfixRealTime } from '@/hooks/useIfixRealTime'; // ← Hook externo

function SettingsPage(): React.JSX.Element {
  const { fiis, loading: fiisLoading, erro: fiisError } = useFiisCotacoesBrapi();
  const { marketData, loading: marketLoading, error: marketError } = useFinancialData();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIfixRealTime(); // ← Hook externo

  const dadosCards = {
    dividendYield: { value: '7.4%', trend: 'up' as const },
    carteiraHoje: { value: '88.7%', trend: 'up' as const },
    ibovespa: { value: '136.985', trend: 'down' as const, diff: -0.02 },
    ifix: ifixData ? {
      value: ifixData.valorFormatado,
      trend: ifixData.trend,
      diff: ifixData.variacaoPercent
    } : { value: '3.435', trend: 'up' as const, diff: 0.24 }
  };

  if (fiisLoading || marketLoading || ifixLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando dados reais do IFIX e FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (fiisError) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="error" gutterBottom>
              ⚠️ Erro ao carregar FIIs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fiisError}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (!Array.isArray(fiis) || fiis.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="text.secondary">
              📊 Nenhum FII encontrado na carteira
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <SettingsTable 
          count={fiis.length} 
          rows={fiis}
          cardsData={dadosCards}
          ifixReal={ifixData}
        />
      </Grid>
    </Grid>
  );
}

export default SettingsPage;
