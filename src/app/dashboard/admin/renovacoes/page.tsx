'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RenovacaoStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  expiringIn7Days: number;
  expiringIn15Days: number;
  expiringIn30Days: number;
  renewalsThisMonth: number;
  renewalsLastMonth: number;
  churnRate: number;
  retentionRate: number;
}

interface UserExpiring {
  id: string;
  name: string;
  email: string;
  plan: string;
  expirationDate: string;
  daysUntilExpiry: number;
  lastRenewal?: string;
  totalPurchases: number;
  status: 'ACTIVE' | 'INACTIVE';
  emailSent?: boolean;
}

interface MonthlyData {
  month: string;
  renovacoes: number;
  novosUsuarios: number;
  cancelamentos: number;
  receita: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RenovacoesDashboard() {
  const [stats, setStats] = useState<RenovacaoStats | null>(null);
  const [usersExpiring, setUsersExpiring] = useState<UserExpiring[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    daysBeforeExpiry: 7,
    subject: 'Sua assinatura expira em breve!',
    template: 'reminder'
  });

  useEffect(() => {
    loadRenovacaoData();
  }, []);

  const loadRenovacaoData = async () => {
    try {
      setLoading(true);
      
      // Simular dados de renovação
      const mockStats: RenovacaoStats = {
        totalUsers: 1247,
        activeUsers: 1156,
        inactiveUsers: 91,
        expiringIn7Days: 23,
        expiringIn15Days: 45,
        expiringIn30Days: 89,
        renewalsThisMonth: 67,
        renewalsLastMonth: 82,
        churnRate: 7.3,
        retentionRate: 92.7
      };

      const mockUsersExpiring: UserExpiring[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao.silva@email.com',
          plan: 'VIP',
          expirationDate: '2025-07-22',
          daysUntilExpiry: 7,
          lastRenewal: '2024-07-22',
          totalPurchases: 2400,
          status: 'ACTIVE',
          emailSent: false
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          plan: 'LITE',
          expirationDate: '2025-07-20',
          daysUntilExpiry: 5,
          lastRenewal: '2024-07-20',
          totalPurchases: 1200,
          status: 'ACTIVE',
          emailSent: true
        },
        {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro.costa@email.com',
          plan: 'VIP',
          expirationDate: '2025-07-18',
          daysUntilExpiry: 3,
          lastRenewal: '2024-07-18',
          totalPurchases: 2400,
          status: 'ACTIVE',
          emailSent: false
        },
        {
          id: '4',
          name: 'Ana Oliveira',
          email: 'ana.oliveira@email.com',
          plan: 'FIIS',
          expirationDate: '2025-07-25',
          daysUntilExpiry: 10,
          totalPurchases: 1800,
          status: 'ACTIVE',
          emailSent: false
        },
        // ✅ ADICIONADO: Usuário com LITE_V2
        {
          id: '5',
          name: 'Carlos Ferreira',
          email: 'carlos.ferreira@email.com',
          plan: 'LITE_V2',
          expirationDate: '2025-07-23',
          daysUntilExpiry: 8,
          lastRenewal: '2024-07-23',
          totalPurchases: 970,
          status: 'ACTIVE',
          emailSent: false
        }
      ];

      const mockMonthlyData: MonthlyData[] = [
        { month: 'Jan 2025', renovacoes: 45, novosUsuarios: 67, cancelamentos: 12, receita: 89400 },
        { month: 'Fev 2025', renovacoes: 52, novosUsuarios: 78, cancelamentos: 8, receita: 102300 },
        { month: 'Mar 2025', renovacoes: 61, novosUsuarios: 89, cancelamentos: 15, receita: 118900 },
        { month: 'Abr 2025', renovacoes: 58, novosUsuarios: 72, cancelamentos: 11, receita: 109800 },
        { month: 'Mai 2025', renovacoes: 74, novosUsuarios: 95, cancelamentos: 9, receita: 134200 },
        { month: 'Jun 2025', renovacoes: 82, novosUsuarios: 112, cancelamentos: 7, receita: 156700 },
        { month: 'Jul 2025', renovacoes: 67, novosUsuários: 89, cancelamentos: 13, receita: 124500 }
      ];

      setStats(mockStats);
      setUsersExpiring(mockUsersExpiring);
      setMonthlyData(mockMonthlyData);
    } catch (error) {
      console.error('Erro ao carregar dados de renovação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminderEmail = async (userId: string) => {
    try {
      // Simular envio de email
      setUsersExpiring(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, emailSent: true } : user
        )
      );
      alert('Email de lembrete enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email');
    }
  };

  const handleBulkSendEmails = async () => {
    try {
      const usersToEmail = usersExpiring.filter(user => 
        user.daysUntilExpiry <= 7 && !user.emailSent
      );
      
      // Simular envio em lote
      setUsersExpiring(prev => 
        prev.map(user => 
          user.daysUntilExpiry <= 7 ? { ...user, emailSent: true } : user
        )
      );
      
      alert(`${usersToEmail.length} emails enviados com sucesso!`);
    } catch (error) {
      console.error('Erro ao enviar emails em lote:', error);
    }
  };

  // ✅ FUNÇÃO ATUALIZADA COM LITE_V2
  const getPlanInfo = (plan: string) => {
    const planMap: Record<string, { label: string; color: string; emoji: string }> = {
      'VIP': { label: 'Close Friends VIP', color: '#7C3AED', emoji: '👑' },
      'LITE': { label: 'Close Friends LITE', color: '#2563EB', emoji: '⭐' },
      'LITE_V2': { label: 'Close Friends LITE 2.0', color: '#1d4ed8', emoji: '🌟' }, // ✅ ADICIONADO
      'RENDA_PASSIVA': { label: 'Projeto Renda Passiva', color: '#059669', emoji: '💰' },
      'FIIS': { label: 'Projeto FIIs', color: '#D97706', emoji: '🏢' },
      'AMERICA': { label: 'Projeto América', color: '#DC2626', emoji: '🇺🇸' }
    };
    return planMap[plan] || { label: plan, color: '#6B7280', emoji: '📋' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getExpiryColor = (days: number) => {
    if (days <= 3) return '#DC2626'; // Vermelho
    if (days <= 7) return '#D97706'; // Laranja
    if (days <= 15) return '#EAB308'; // Amarelo
    return '#059669'; // Verde
  };

  const pieData = [
    { name: 'Ativos', value: stats?.activeUsers || 0, fill: '#059669' },
    { name: 'Inativos', value: stats?.inactiveUsers || 0, fill: '#DC2626' }
  ];

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: 300, mb: 2 }} />
        <Typography>Carregando dados de renovação...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1E293B', fontWeight: '700' }}>
          📊 Dashboard de Renovações
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Acompanhe renovações, vencimentos e gerencie comunicação com assinantes
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2, fontSize: '20px' }}>
                  👥
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total de Usuários
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats?.totalUsers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#059669', mr: 2, fontSize: '20px' }}>
                  ✅
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Usuários Ativos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats?.activeUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669' }}>
                    {stats && ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FEF2F2', color: '#DC2626', mr: 2, fontSize: '20px' }}>
                  ⚠️
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Expiram em 7 dias
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats?.expiringIn7Days}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#DC2626' }}>
                    Ação necessária
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FFFBEB', color: '#D97706', mr: 2, fontSize: '20px' }}>
                  🔄
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Renovações Este Mês
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {stats?.renewalsThisMonth}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: (stats?.renewalsThisMonth || 0) > (stats?.renewalsLastMonth || 0) ? '#059669' : '#DC2626' 
                  }}>
                    {stats && stats.renewalsThisMonth > stats.renewalsLastMonth ? '+' : ''}
                    {stats && stats.renewalsLastMonth > 0 ? 
                      (((stats.renewalsThisMonth - stats.renewalsLastMonth) / stats.renewalsLastMonth) * 100).toFixed(1) : 0
                    }%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Box mb={4}>
        {stats && stats.expiringIn7Days > 0 && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleBulkSendEmails}>
                Enviar Lembretes
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: '500' }}>
              ⚠️ {stats.expiringIn7Days} usuários têm assinaturas expirando nos próximos 7 dias
            </Typography>
          </Alert>
        )}
        
        {stats && stats.churnRate > 10 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: '500' }}>
              🚨 Taxa de cancelamento alta: {stats.churnRate}% - considere campanhas de retenção
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="📊 Visão Geral" />
          <Tab label="⏰ Vencimentos" />
          <Tab label="📈 Relatórios" />
          <Tab label="📧 Comunicação" />
        </Tabs>
      </Box>

      {/* Tab 1: Visão Geral */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Gráfico de Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribuição de Usuários
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Métricas de Retenção */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métricas de Retenção
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Taxa de Retenção</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#059669' }}>
                      {stats?.retentionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.retentionRate || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#059669' }
                    }} 
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Taxa de Cancelamento</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#DC2626' }}>
                      {stats?.churnRate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats?.churnRate || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#DC2626' }
                    }} 
                  />
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                    Próximos Vencimentos:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: '#FEF2F2', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ color: '#DC2626', fontWeight: '700' }}>
                          {stats?.expiringIn7Days}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#DC2626' }}>
                          7 dias
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: '#FEF3C7', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ color: '#D97706', fontWeight: '700' }}>
                          {stats?.expiringIn15Days}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#D97706' }}>
                          15 dias
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={2} sx={{ backgroundColor: '#ECFDF5', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ color: '#059669', fontWeight: '700' }}>
                          {stats?.expiringIn30Days}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#059669' }}>
                          30 dias
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Vencimentos */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Usuários com Vencimento Próximo
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: '#D97706' }}
                onClick={handleBulkSendEmails}
              >
                📧 Enviar Lembretes em Lote
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: '600' }}>Usuário</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Plano</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Vencimento</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Dias Restantes</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Última Renovação</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: '600' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersExpiring.map((user) => {
                    const planInfo = getPlanInfo(user.plan);
                    
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <span style={{ fontSize: '16px' }}>{planInfo.emoji}</span>
                            <Chip
                              label={planInfo.label}
                              size="small"
                              sx={{ 
                                backgroundColor: `${planInfo.color}20`,
                                color: planInfo.color,
                                fontWeight: '500'
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.expirationDate).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${user.daysUntilExpiry} dias`}
                            size="small"
                            sx={{
                              backgroundColor: `${getExpiryColor(user.daysUntilExpiry)}20`,
                              color: getExpiryColor(user.daysUntilExpiry),
                              fontWeight: '600'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#64748B' }}>
                            {user.lastRenewal ? 
                              new Date(user.lastRenewal).toLocaleDateString('pt-BR') : 
                              'Primeira assinatura'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.emailSent ? 'Enviado' : 'Pendente'}
                            size="small"
                            color={user.emailSent ? 'success' : 'warning'}
                            sx={{ fontWeight: '500' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={user.emailSent}
                            onClick={() => handleSendReminderEmail(user.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            📧 Enviar Lembrete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Relatórios */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Renovações e Novos Usuários por Mês
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="renovacoes" name="Renovações" fill="#059669" />
                      <Bar dataKey="novosUsuarios" name="Novos Usuários" fill="#3B82F6" />
                      <Bar dataKey="cancelamentos" name="Cancelamentos" fill="#DC2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Receita Mensal
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="receita" name="Receita" stroke="#D97706" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Comunicação */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configurações de Email
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailSettings.enabled}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      />
                    }
                    label="Emails automáticos habilitados"
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Enviar lembrete antes de</InputLabel>
                    <Select
                      value={emailSettings.daysBeforeExpiry}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, daysBeforeExpiry: Number(e.target.value) }))}
                      label="Enviar lembrete antes de"
                    >
                      <MenuItem value={3}>3 dias</MenuItem>
                      <MenuItem value={7}>7 dias</MenuItem>
                      <MenuItem value={15}>15 dias</MenuItem>
                      <MenuItem value={30}>30 dias</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Assunto do Email"
                    value={emailSettings.subject}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ bgcolor: '#059669' }}
                    onClick={() => alert('Configurações salvas!')}
                  >
                    Salvar Configurações
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estatísticas de Email
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Emails enviados hoje</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                      12
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Emails enviados esta semana</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                      89
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Taxa de abertura</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#059669' }}>
                      73.4%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Taxa de renovação após email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#059669' }}>
                      42.1%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setOpenEmailDialog(true)}
                  >
                    📧 Enviar Email Customizado
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog de Email Customizado */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Enviar Email Customizado</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Assunto"
              fullWidth
              placeholder="Oferta especial de renovação"
            />
            
            <TextField
              label="Mensagem"
              fullWidth
              multiline
              rows={6}
              placeholder="Olá [NOME], sua assinatura expira em [DIAS] dias..."
            />
            
            <FormControl fullWidth>
              <InputLabel>Destinatários</InputLabel>
              <Select label="Destinatários">
                <MenuItem value="expiring7">Expirando em 7 dias</MenuItem>
                <MenuItem value="expiring15">Expirando em 15 dias</MenuItem>
                <MenuItem value="expired">Já expirados</MenuItem>
                <MenuItem value="all_active">Todos ativos</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" sx={{ bgcolor: '#059669' }}>
            📧 Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}