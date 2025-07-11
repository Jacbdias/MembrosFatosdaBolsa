'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function UsuariosAdminPage() {
  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#000', 
      minHeight: '100vh', 
      color: '#fff' 
    }}>
      <Typography variant="h4" sx={{ color: '#00FF00' }}>
        🛡️ Admin - Gerenciamento de Usuários
      </Typography>
      
      <Typography sx={{ color: '#ccc', mt: 2 }}>
        Esta é a página de administração de usuários.
      </Typography>
      
      <Typography sx={{ color: '#00FF00', mt: 3 }}>
        ✅ Página funcionando corretamente!
      </Typography>
    </Box>
  );
}