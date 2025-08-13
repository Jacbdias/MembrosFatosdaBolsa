'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface AccountInfoProps {
  user: any;
  onUpdate: (data: any) => void;
}

export function AccountInfo({ user, onUpdate }: AccountInfoProps): React.JSX.Element {
  const [uploading, setUploading] = React.useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const avatarData = e.target?.result as string;
        
        // Atualizar no servidor
        const userEmail = localStorage.getItem('user-email');
        const token = localStorage.getItem('custom-auth-token');

        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail || '',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: avatarData
          })
        });

        if (response.ok) {
          // Atualizar estado local
          onUpdate({ avatar: avatarData });
          
          // Atualizar localStorage
          let userData = localStorage.getItem('user-data');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            parsedUser.avatar = avatarData;
            localStorage.setItem('user-data', JSON.stringify(parsedUser));
          } else {
            const newUserData = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: avatarData
            };
            localStorage.setItem('user-data', JSON.stringify(newUserData));
          }
          
          // Disparar evento para outros componentes
          window.dispatchEvent(new Event('storage'));
          
        } else {
          alert('Erro ao fazer upload da foto');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const getPlanInfo = (plan: string) => {
    const planMap = {
      'VIP': { label: 'Close Friends VIP', color: '#8B5CF6', emoji: '👑' },
      'LITE': { label: 'Close Friends LITE', color: '#3B82F6', emoji: '⭐' },
      'RENDA_PASSIVA': { label: 'Projeto Renda Passiva', color: '#10B981', emoji: '💰' },
      'FIIS': { label: 'Projeto FIIs', color: '#F59E0B', emoji: '🏢' },
      'AMERICA': { label: 'Projeto América', color: '#EF4444', emoji: '🇺🇸' },
      'ADMIN': { label: 'Administrador', color: '#6B7280', emoji: '🛡️' }
    };
    return planMap[plan as keyof typeof planMap] || { label: plan, color: '#9CA3AF', emoji: '📋' };
  };

  const planInfo = getPlanInfo(user?.plan || 'LITE');

  return (
    <Card sx={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 3, 
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar 
              src={user?.avatar || '/assets/avatar-8.png'} 
              sx={{ 
                height: '80px', 
                width: '80px',
                border: '3px solid #E2E8F0'
              }} 
            />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#1E293B', fontWeight: '600' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ color: '#64748B' }}>
              {user?.email}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <span style={{ fontSize: '16px' }}>{planInfo.emoji}</span>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: planInfo.color,
                  fontWeight: '500'
                }}
              >
                {planInfo.label}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2 }}>
        <Button 
          component="label" 
          fullWidth 
          variant="text"
          disabled={uploading}
          sx={{
            color: '#3B82F6',
            '&:hover': { backgroundColor: '#EFF6FF' }
          }}
        >
          {uploading ? '📤 Enviando...' : '📷 Alterar Foto'}
          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </Button>
      </CardActions>
    </Card>
  );
}