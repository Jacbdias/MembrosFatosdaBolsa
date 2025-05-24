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
import { Settings as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Settings';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { Shield as ShieldIcon } from '@phosphor-icons/react/dist/ssr/Shield';
import { Palette as PaletteIcon } from '@phosphor-icons/react/dist/ssr/Palette';

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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        ⚙️ Configurações
      </Typography>

      <Grid container spacing={3}>
        {/* Perfil do Usuário */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon size={24} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Perfil do Usuário
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 3, fontSize: '2rem' }}>
                  JS
                </Avatar>
                <Button variant="outlined" size="small">
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
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
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BellIcon size={24} style={{ marginRight: 8 }} />
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
                    />
                  }
                  label="Notificações por Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.push}
                      onChange={handleNotificationChange('push')}
                    />
                  }
                  label="Notificações Push"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.sms}
                      onChange={handleNotificationChange('sms')}
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
                    />
                  }
                  label="Alertas de Dividendos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.priceAlert}
                      onChange={handleNotificationChange('priceAlert')}
                    />
                  }
                  label="Alertas de Preço"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReport}
                      onChange={handleNotificationChange('weeklyReport')}
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
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon size={24} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Preferências
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.darkMode}
                      onChange={handlePreferenceChange('darkMode')}
                    />
                  }
                  label="Modo Escuro"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.autoRefresh}
                      onChange={handlePreferenceChange('autoRefresh')}
                    />
                  }
                  label="Atualização Automática"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.showPercentages}
                      onChange={handlePreferenceChange('showPercentages')}
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
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="Moeda"
                  value="BRL"
                  SelectProps={{ native: true }}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Segurança */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShieldIcon size={24} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Segurança
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  Alterar Senha
                </Button>
                <Button variant="outlined" fullWidth>
                  Configurar 2FA
                </Button>
                <Button variant="outlined" fullWidth>
                  Dispositivos Conectados
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button variant="outlined" color="error" fullWidth>
                  Desconectar de Todos os Dispositivos
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dados e Privacidade */}
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
