/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import DataUsageIcon from '@mui/icons-material/DataUsage';

export default function SettingsPage(): React.JSX.Element {
  const [notifications, setNotifications] = React.useState({
    email: true,
    push: false,
    sms: false,
    dividend: true,
    priceAlert: true,
    weeklyReport: false
  });

  const [profile, setProfile] = React.useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999'
  });

  const [preferences, setPreferences] = React.useState({
    darkMode: false,
    language: 'pt-BR',
    currency: 'BRL',
    autoRefresh: true,
    showPercentages: true
  });

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handlePreferenceChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Configurações
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Perfil do Usuário */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Perfil do Usuário
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3, 
                    fontSize: '2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  JS
                </Avatar>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                >
                  Alterar Foto
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    mr: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Salvar Alterações
                </Button>
                <Button variant="outlined">
                  Cancelar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificações */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ fontSize: 24, mr: 1, color: '#f59e0b' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notificações
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.email}
                      onChange={handleNotificationChange('email')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label="Notificações por Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.push}
                      onChange={handleNotificationChange('push')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label="Notificações Push"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.sms}
                      onChange={handleNotificationChange('sms')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#10b981',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#10b981',
                        },
                      }}
                    />
                  }
                  label="Notificações por SMS"
                />
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.dividend}
                      onChange={handleNotificationChange('dividend')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#8b5cf6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#8b5cf6',
                        },
                      }}
                    />
                  }
                  label="Alertas de Dividendos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.priceAlert}
                      onChange={handleNotificationChange('priceAlert')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ef4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ef4444',
                        },
                      }}
                    />
                  }
                  label="Alertas de Preço"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReport}
                      onChange={handleNotificationChange('weeklyReport')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label="Relatório Semanal"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferências */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ fontSize: 24, mr: 1, color: '#ec4899' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Preferências de Interface
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.darkMode}
                      onChange={handlePreferenceChange('darkMode')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1f2937',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#374151',
                        },
                      }}
                    />
                  }
                  label="Modo Escuro"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.autoRefresh}
                      onChange={handlePreferenceChange('autoRefresh')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#06b6d4',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#06b6d4',
                        },
                      }}
                    />
                  }
                  label="Atualização Automática"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.showPercentages}
                      onChange={handlePreferenceChange('showPercentages')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#f59e0b',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#f59e0b',
                        },
                      }}
                    />
                  }
                  label="Mostrar Percentuais"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Idioma"
                  value="pt-BR"
                  SelectProps={{ native: true }}
                  sx={{ mb: 2 }}
                  variant="outlined"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="Moeda Principal"
                  value="BRL"
                  SelectProps={{ native: true }}
                  variant="outlined"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Segurança */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 24, mr: 1, color: '#10b981' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Segurança & Privacidade
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#10b981',
                      backgroundColor: '#f0fdf4'
                    }
                  }}
                >
                  🔒 Alterar Senha
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      backgroundColor: '#faf5ff'
                    }
                  }}
                >
                  🛡️ Configurar Autenticação 2FA
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      backgroundColor: '#eff6ff'
                    }
                  }}
                >
                  📱 Gerenciar Dispositivos
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button 
                  variant="outlined" 
                  color="error" 
                  fullWidth
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#fef2f2'
                    }
                  }}
                >
                  🚪 Sair de Todos os Dispositivos
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dados e Backup */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DataUsageIcon sx={{ fontSize: 24, mr: 1, color: '#06b6d4' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Gestão de Dados & Backup
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      borderColor: '#e5e7eb',
                      color: '#374151',
                      '&:hover': {
                        borderColor: '#10b981',
                        backgroundColor: '#f0fdf4'
                      }
                    }}
                  >
                    📤 Exportar Dados
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      borderColor: '#e5e7eb',
                      color: '#374151',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: '#eff6ff'
                      }
                    }}
                  >
                    📥 Importar Dados
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      borderColor: '#e5e7eb',
                      color: '#374151',
                      '&:hover': {
                        borderColor: '#f59e0b',
                        backgroundColor: '#fffbeb'
                      }
                    }}
                  >
                    🧹 Limpar Cache
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#fef2f2'
                      }
                    }}
                  >
                    🗑️ Deletar Conta
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                        Hoje às 14:32
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Última Sincronização
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669', mb: 1 }}>
                        2.4 MB
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tamanho dos Dados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                        Ativo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Backup Automático
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} Dados e Privacidade */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados e Privacidade
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth>
                    Exportar Dados
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth>
                    Importar Dados
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth>
                    Limpar Cache
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" color="error" fullWidth>
                    Deletar Conta
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Última sincronização:</strong> Hoje às 14:32<br />
                  <strong>Tamanho dos dados:</strong> 2.4 MB<br />
                  <strong>Backup automático:</strong> Ativo
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
