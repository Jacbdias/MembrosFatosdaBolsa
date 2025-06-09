'use client';

import * as React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';

export default function SettingsPage(): React.JSX.Element {
  const { fiis, loading, erro } = useFiisCotacoesBrapi();

  // Loading state
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

  // Error state
  if (erro) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Box textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>
            ⚠️ Erro ao carregar FIIs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {erro}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 2, color: '#64748b' }}>
            Usando preços de entrada como fallback
          </Typography>
        </Box>
      </Box>
    );
  }

  // Validation
  if (!Array.isArray(fiis) || fiis.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography variant="h6" color="text.secondary">
          📊 Nenhum FII encontrado na carteira
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SettingsTable 
        count={fiis.length} 
        rows={fiis}
      />
    </Box>
  );
}
