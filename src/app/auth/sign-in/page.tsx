'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginPage() {
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
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src="/assets/logo.svg"
          alt="Fatos da Bolsa"
          sx={{ width: 120, height: 120, margin: '0 auto', mb: 1 }}
        />

        {/* Aqui você usa o SignInForm que já contém toda a lógica de login */}
        <SignInForm />
      </Box>
    </Box>
  );
}
