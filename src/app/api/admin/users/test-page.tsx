'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useUser } from '@/hooks/use-user';

export default function TestAdminPage() {
  const { user } = useUser();

  return (
    <Box sx={{ p: 3, backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <Typography variant="h4" sx={{ color: '#00FF00' }}>
        🛡️ Teste Admin
      </Typography>
      <Typography sx={{ color: '#ccc', mt: 2 }}>
        Usuário: {user?.firstName} {user?.lastName}
      </Typography>
      <Typography sx={{ color: '#ccc' }}>
        Email: {user?.email}
      </Typography>
      <Typography sx={{ color: '#ccc' }}>
        Plano: {(user as any)?.plan}
      </Typography>
    </Box>
  );
}