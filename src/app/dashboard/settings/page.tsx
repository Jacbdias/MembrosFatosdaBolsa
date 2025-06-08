/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { Palette as PaletteIcon } from '@phosphor-icons/react/dist/ssr/Palette';
import { Database as DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications') === 'true';
    }
    return true;
  });
  
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  
  const [autoRefresh, setAutoRefresh] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoRefresh') !== 'false';
    }
    return true;
  });

  const handleNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setNotifications(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', value.toString());
    }
  };

  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setDarkMode(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', value.toString());
    }
  };

  const handleAutoRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setAutoRefresh(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoRefresh', value.toString());
    }
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleOpenAdmin = () => {
    if (typeof window !== 'undefined') {
      window.open('/admin', '_blank');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b'
        }}>
          <SettingsIcon size={24} weight="duotone" />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            ⚙️ Configurações
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Gerencie suas preferências e configurações do sistema
          </Typography>
        </Box>
      </Stack>

      {/* Cards de Configurações */}
      <Stack spacing={4}>
        {/* Notificações */}
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <BellIcon size={24} style={{ color: '#3b82f6' }} weight="duotone" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Notificações
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 3,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Notificações push
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receba alertas sobre mudanças importantes na sua carteira
                  </Typography>
                </Box>
                <Switch
                  checked={notifications}
                  onChange={handleNotificationsChange}
                  color="primary"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <PaletteIcon size={24} style={{ color: '#8b5cf6' }} weight="duotone" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Aparência
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 3,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Modo escuro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alterna entre tema claro e escuro (em desenvolvimento)
                  </Typography>
                </Box>
                <Switch
                  checked={darkMode}
                  onChange={handleDarkModeChange}
                  color="secondary"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <DatabaseIcon size={24} style={{ color: '#10b981' }} weight="duotone" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Sistema
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 3,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Atualização automática
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atualizar dados da API automaticamente a cada 5 minutos
                  </Typography>
                </Box>
                <Switch
                  checked={autoRefresh}
                  onChange={handleAutoRefreshChange}
                  color="success"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Ações do Sistema */}
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          backgroundColor: '#f8fafc'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
              🔧 Ações do Sistema
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                onClick={handleClearCache}
                sx={{ 
                  fontWeight: 600,
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: '#fee2e2'
                  }
                }}
              >
                🗑️ Limpar Cache Local
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleOpenAdmin}
                sx={{ 
                  fontWeight: 600,
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#dbeafe'
                  }
                }}
              >
                ⚙️ Abrir Painel Admin
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid #bfdbfe',
          backgroundColor: '#eff6ff'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1e40af' }}>
              ℹ️ Informações do Sistema
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Versão:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>1.0.0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">API FII:</Typography>
                <Chip 
                  label="Ativa" 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#dcfce7', 
                    color: '#166534',
                    fontWeight: 600
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Cache:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>5 minutos</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Dica */}
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            💡 <strong>Dica:</strong> Todas as configurações são salvas automaticamente no seu navegador local. 
            Use o painel Admin para gerenciar dados da carteira e configurações avançadas.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
}
