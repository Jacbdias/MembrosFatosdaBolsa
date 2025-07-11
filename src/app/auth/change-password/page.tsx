'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Alert } from '@mui/material';
import { useUser } from '@/hooks/use-user';
import { ChangePasswordForm } from '@/components/auth/change-password-form';

export default function ChangePasswordPage(): React.JSX.Element {
  const router = useRouter();
  const { user, checkSession } = useUser();

  React.useEffect(() => {
    // Se não está logado, redirecionar para login
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    // Se não precisa mudar senha, redirecionar para dashboard
    if (!user.mustChangePassword) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  if (!user) {
    return (
      <Box
        sx={{
          backgroundColor: '#000',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#fff' }}>Redirecionando...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src="/assets/logo.svg"
          alt="Fatos da Bolsa"
          sx={{ width: 120, height: 120, margin: '0 auto', mb: 3 }}
        />
        
        <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
          🔐 Alterar Senha
        </Typography>
        
        <Typography sx={{ color: '#ccc', mb: 3 }}>
          Por segurança, você deve alterar sua senha antes de continuar.
        </Typography>

        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            backgroundColor: '#7C2D12', 
            border: '1px solid #F59E0B',
            color: '#FEF3C7',
            borderRadius: 2
          }}
        >
          <Typography variant="body2">
            <strong>⚠️ Primeiro acesso detectado</strong><br/>
            Por favor, defina uma nova senha para sua conta.
          </Typography>
        </Alert>
        
        <ChangePasswordForm 
          userEmail={user.email} 
          onSuccess={() => {
            checkSession?.(); // Atualizar dados do usuário
            router.push('/dashboard');
          }}
        />
      </Box>
    </Box>
  );
}