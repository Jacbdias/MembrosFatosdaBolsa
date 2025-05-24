import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { OverviewTable } from '@/components/dashboard/overview/overview-table';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      <Grid xs={12}>
        <OverviewTable />
      </Grid>
    </Grid>
  );
}
