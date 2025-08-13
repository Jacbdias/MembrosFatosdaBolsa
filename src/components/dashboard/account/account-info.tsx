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
    console.log('🚀 handleAvatarUpload chamado!');
    
    const file = event.target.files?.[0];
    console.log('📁 Arquivo selecionado:', file);
    
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      console.log('❌ Arquivo muito grande:', file.size);
      alert('Arquivo muito grande. Máximo 5MB');
      return;
    }

    console.log('✅ Arquivo válido, iniciando upload...');
    setUploading(true);

    try {
      // Converter para base64 para armazenamento simples
      const reader = new FileReader();
      reader.onload = async (e) => {
        console.log('📸 Arquivo convertido para base64');
        const avatarData = e.target?.result as string;
        
        // Atualizar no servidor
        const userEmail = localStorage.getItem('user-email');
        const token = localStorage.getItem('custom-auth-token');
        
        console.log('📧 Email do usuário:', userEmail);
        console.log('🔑 Token:', token ? 'Existe' : 'Não existe');

        console.log('🌐 Fazendo requisição para /api/user/profile...');
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

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (response.ok) {
          console.log('✅ Upload bem-sucedido!');
          onUpdate({ avatar: avatarData });
onUpdate({ avatar: avatarData });

// 🔥 NOVO: Disparar o evento correto também
window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
  detail: { avatar: avatarData }
}));
          
          // 🔥 CORRIGIDO: Criar user-data se não existir
          let userData = localStorage.getItem('user-data');
          if (userData) {
            // Se existir, atualizar
            const parsedUser = JSON.parse(userData);
            parsedUser.avatar = avatarData;
            localStorage.setItem('user-data', JSON.stringify(parsedUser));
            console.log('💾 localStorage user-data atualizado!');
          } else {
            // Se NÃO existir, criar novo
            const newUserData = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: avatarData
            };
            localStorage.setItem('user-data', JSON.stringify(newUserData));
            console.log('💾 localStorage user-data CRIADO!');
          }
          
          // Disparar evento customizado
          console.log('🎯 Disparando evento user-data-updated...');
window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
  detail: { avatar: avatarData }
}));
          console.log('✅ Evento disparado!');
        } else {
          console.log('❌ Erro na resposta:', response.status);
          alert('Erro ao fazer upload da foto');
        }
      }; // ← LINHA CRUCIAL QUE ESTAVA FALTANDO!
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('💥 Erro no upload:', error);
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