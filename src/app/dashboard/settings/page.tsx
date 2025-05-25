/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      <Grid xs={12}>
        <SettingsTable />
      </Grid>
    </Grid>
  );
}
