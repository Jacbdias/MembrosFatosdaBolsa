'use client';

import * as React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';

export default function SettingsPage(): React.JSX.Element {
  const { fiis, loading } = useFiisCotacoesBrapi();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} />
        <Box ml={2} sx={{ fontSize: '1.1rem' }}>
          🏢 Carregando carteira de FIIs...
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SettingsTable 
        count={fiis.length} 
        rows={fiis}
        page={0} 
        rowsPerPage={10}
      />
    </Box>
  );
}
