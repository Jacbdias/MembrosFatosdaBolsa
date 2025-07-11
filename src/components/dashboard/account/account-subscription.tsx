'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface AccountSubscriptionProps {
  user: any;
}

export function AccountSubscription({ user }: AccountSubscriptionProps): React.JSX.Element {
  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Acesso vitalício';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusInfo = () => {
    if (!user?.expirationDate) {
      return {
        label: 'Ativo - Vitalício',
        color: 'success' as const,
        icon: '♾️'
      };
    }

    const expired = isExpired(user.expirationDate);
    if (expired) {
      return {
        label: 'Expirado',
        color: 'error' as const,
        icon: '🔴'
      };
    }

    const daysLeft = Math.ceil((new Date(user.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return {
        label: `Expira em ${daysLeft} dias`,
        color: 'warning' as const,
        icon: '⚠️'
      };
    }

    return {
      label: 'Ativo',
      color: 'success' as const,
      icon: '✅'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card sx={{ 
      backgroundColor: '#FFFFFF', 
      borderRadius: 3, 
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <CardHeader 
        title="Assinatura"
        sx={{
          '& .MuiCardHeader-title': {
            color: '#1E293B',
            fontWeight: '600',
            fontSize: '1.1rem'
          }
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
              Status
            </Typography>
            <Chip
              icon={<span>{statusInfo.icon}</span>}
              label={statusInfo.label}
              color={statusInfo.color}
              sx={{ fontWeight: '500' }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
              Vencimento
            </Typography>
            <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: '500' }}>
              {formatDate(user?.expirationDate)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
              Membro desde
            </Typography>
            <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: '500' }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              }) : 'N/A'}
            </Typography>
          </Box>

          {user?.totalPurchases > 0 && (
            <Box>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                Total investido
              </Typography>
              <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: '500' }}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(user.totalPurchases)}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}