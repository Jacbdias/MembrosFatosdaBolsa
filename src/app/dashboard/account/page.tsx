'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { AccountSecurity } from '@/components/dashboard/account/account-security';
import { AccountSubscription } from '@/components/dashboard/account/account-subscription';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Carregar dados completos do perfil
  React.useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userEmail = localStorage.getItem('user-email');
        const token = localStorage.getItem('custom-auth-token');

        if (!userEmail || !token) return;

        const response = await fetch('/api/user/profile', {
          headers: {
            'X-User-Email': userEmail,
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const handleProfileUpdate = (updatedData: any) => {
    setUserProfile(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700' }}>
          Carregando...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      <div>
        <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700' }}>
          Minha Conta
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', mt: 1 }}>
          Gerencie suas informações pessoais e configurações de segurança
        </Typography>
      </div>

      <Grid container spacing={3}>
        {/* Informações do perfil */}
        <Grid lg={4} md={6} xs={12}>
          <Stack spacing={3}>
            <AccountInfo 
              user={userProfile || user} 
              onUpdate={handleProfileUpdate}
            />
            <AccountSubscription 
              user={userProfile || user} 
            />
          </Stack>
        </Grid>

        {/* Formulários */}
        <Grid lg={8} md={6} xs={12}>
          <Stack spacing={3}>
            <AccountDetailsForm 
              user={userProfile || user}
              onUpdate={handleProfileUpdate}
            />
            <AccountSecurity 
              user={userProfile || user}
            />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}