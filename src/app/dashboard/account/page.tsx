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

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      console.log('🎯 1. Iniciando atualização:', updatedData);
      
      const userEmail = localStorage.getItem('user-email');
      const token = localStorage.getItem('custom-auth-token');
      
      if (!userEmail) return;

      // 1. Salva no banco via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🎯 2. API respondeu:', result.user);
        
        // 2. Atualiza estado local da página
        setUserProfile(prev => ({ ...prev, ...result.user }));
        
        // 3. Atualiza localStorage (se o useUser lê de lá)
        const currentUserData = localStorage.getItem('user-data');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          const updatedUserData = { ...userData, ...result.user };
          localStorage.setItem('user-data', JSON.stringify(updatedUserData));
        }
        
        // 4. 🔥 CHAVE: Dispara evento para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
          detail: result.user 
        }));
        console.log('🎯 3. Evento disparado!');
        
        console.log('✅ Perfil atualizado e sincronizado!');
        
      } else {
        console.error('❌ Erro na API:', await response.text());
        // Fallback: só atualiza local se API falhar
        setUserProfile(prev => ({ ...prev, ...updatedData }));
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      // Fallback: só atualiza local se tiver erro
      setUserProfile(prev => ({ ...prev, ...updatedData }));
    }
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