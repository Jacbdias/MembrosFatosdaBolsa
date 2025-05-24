/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

export default function Page(): React.JSX.Element {
  // DADOS DOS CARDS ESPECÍFICOS PARA DIVIDENDOS
  const dadosCards = {
    ibovespa: { value: "158k", trend: "up" as const, diff: 3.2 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "92.1%", trend: "up" as const },
    dividendYield: { value: "8.8%", trend: "up" as const },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  return (
    <Grid container spacing={3}>
      {/* Filtros */}
      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      {/* Tabela principal com dados dos FIIs (MALL11, KNSC11, etc.) */}
      <Grid xs={12}>
        <SettingsTable 
          cardsData={dadosCards}
        />
      </Grid>
    </Grid>
  );
}
