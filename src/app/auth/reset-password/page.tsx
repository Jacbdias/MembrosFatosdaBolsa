import * as React from 'react';
import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = { title: `Reset password | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <GuestGuard>
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
          <ResetPasswordForm />
        </Box>
      </Box>
    </GuestGuard>
  );
}
