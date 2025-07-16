'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  plan: 'VIP' | 'LITE' | 'LITE_V2' | 'RENDA_PASSIVA' | 'FIIS' | 'AMERICA' | 'ADMIN'; // ✅ ADICIONADO LITE_V2
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  hotmartCustomerId?: string;
  createdAt: string;
  lastLogin?: string;
  totalPurchases: number;
  purchaseCount: number;
  expirationDate?: string;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Verificar se é admin
  React.useEffect(() => {
    if (user && 'plan' in user && user.plan !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carregamento de usuários...');
      
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      console.log('📋 Dados de autenticação:', { 
        hasToken: !!token, 
        userEmail,
        tokenLength: token?.length 
      });
      
      if (!userEmail) {
        throw new Error('Email do usuário não encontrado. Faça login novamente.');
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${token || ''}`,
          'x-user-email': userEmail,
          'content-type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Verificar se a resposta é realmente JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Resposta não é JSON:', textResponse.substring(0, 500));
        throw new Error(`Servidor retornou ${response.status}: Resposta não é JSON válido`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos:', {
        success: data.success,
        usersCount: data.users?.length || 0,
        total: data.total
      });
      
      setUsers(data.users || []);
      setError(null);
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao carregar usuários';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('not valid JSON')) {
        errorMessage = 'Erro de comunicação com o servidor. A API pode estar indisponível.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    router.push(`/dashboard/admin/usuarios/${userId}`);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;

    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'x-user-email': userEmail || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('✅ Usuário excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert(`❌ Erro ao excluir usuário: ${error.message}`);
    }
  };

  // ✅ FUNÇÃO ATUALIZADA COM LITE_V2
  const getPlanInfo = (plan: string) => {
    const planMap = {
      'VIP': { label: 'Close Friends VIP', color: '#7C3AED', emoji: '👑' },
      'LITE': { label: 'Close Friends LITE', color: '#2563EB', emoji: '⭐' },
      'LITE_V2': { label: 'Close Friends LITE 2.0', color: '#1d4ed8', emoji: '🌟' }, // ✅ ADICIONADO
      'RENDA_PASSIVA': { label: 'Projeto Renda Passiva', color: '#059669', emoji: '💰' },
      'FIIS': { label: 'Projeto FIIs', color: '#D97706', emoji: '🏢' },
      'AMERICA': { label: 'Projeto América', color: '#DC2626', emoji: '🇺🇸' },
      'ADMIN': { label: 'Administrador', color: '#4B5563', emoji: '🛡️' }
    };
    return planMap[plan as keyof typeof planMap] || { label: plan, color: '#6B7280', emoji: '📋' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch {
      return 'R$ 0,00';
    }
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    try {
      return new Date(expirationDate) < new Date();
    } catch {
      return false;
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ STATS ATUALIZADAS INCLUINDO LITE_V2
  const planStats = React.useMemo(() => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      byPlan: {
        VIP: users.filter(u => u.plan === 'VIP').length,
        LITE: users.filter(u => u.plan === 'LITE').length,
        LITE_V2: users.filter(u => u.plan === 'LITE_V2').length, // ✅ ADICIONADO
        FIIS: users.filter(u => u.plan === 'FIIS').length,
        RENDA_PASSIVA: users.filter(u => u.plan === 'RENDA_PASSIVA').length,
        AMERICA: users.filter(u => u.plan === 'AMERICA').length,
        ADMIN: users.filter(u => u.plan === 'ADMIN').length
      }
    };
    return stats;
  }, [users]);

  // Debug info para desenvolvimento
  const debugInfo = React.useMemo(() => {
    const token = localStorage.getItem('custom-auth-token');
    const userEmail = localStorage.getItem('user-email');
    
    return {
      hasToken: !!token,
      userEmail,
      currentUser: user,
      usersCount: users.length,
      planStats: planStats.byPlan,
      apiUrl: '/api/admin/users'
    };
  }, [user, users.length, planStats]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" sx={{ backgroundColor: '#F8FAFC' }}>
        <CircularProgress size={40} sx={{ color: '#3B82F6', mb: 2 }} />
        <Typography sx={{ color: '#64748B' }}>🔄 Carregando usuários...</Typography>
        
        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={3} p={2} sx={{ backgroundColor: '#FFF3CD', borderRadius: 2, maxWidth: 500 }}>
            <Typography variant="caption" sx={{ color: '#856404' }}>
              Debug: {JSON.stringify(debugInfo, null, 2)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1E293B', fontWeight: '700', fontSize: '2rem' }}>
          🛡️ Gerenciamento de Usuários
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1rem' }}>
          Gerencie usuários, planos e integrações com Hotmart/Kiwify
        </Typography>
      </Box>

      {/* ✅ ALERTA MOSTRANDO STATS DOS PLANOS */}
      {planStats.byPlan.LITE_V2 > 0 && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
            🌟 Close Friends LITE 2.0 Detectado!
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {planStats.byPlan.LITE_V2} usuário(s) com plano LITE 2.0 encontrado(s). 
            LITE Original: {planStats.byPlan.LITE} | VIP: {planStats.byPlan.VIP} | FIIs: {planStats.byPlan.FIIS}
          </Typography>
        </Alert>
      )}

      {/* Debug info em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            backgroundColor: '#EBF8FF', 
            border: '1px solid #BEE3F8',
            color: '#2A69AC'
          }}
        >
          <Typography variant="caption">
            Debug Info: API: {debugInfo.apiUrl} | Token: {debugInfo.hasToken ? '✅' : '❌'} | Email: {debugInfo.userEmail || 'N/A'} | Users: {debugInfo.usersCount}
            <br />
            Planos: VIP({planStats.byPlan.VIP}) LITE({planStats.byPlan.LITE}) LITE_V2({planStats.byPlan.LITE_V2}) FIIS({planStats.byPlan.FIIS})
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA',
            color: '#991B1B',
            borderRadius: 2
          }} 
          action={
            <Button color="inherit" size="small" onClick={loadUsers} disabled={loading}>
              Tentar Novamente
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
          
          {/* Sugestões de solução */}
          <Box mt={2}>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
              Possíveis soluções:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
              • Verifique se a API `/api/admin/users` está funcionando
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
              • Confirme se você está logado como administrador
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
              • Verifique a conexão com o banco de dados
            </Typography>
          </Box>
        </Alert>
      )}

      {!error && users.length > 0 && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            backgroundColor: '#F0FDF4', 
            border: '1px solid #BBF7D0',
            color: '#166534',
            borderRadius: 2
          }}
        >
          ✅ Conectado à API - {users.length} usuários carregados do banco de dados
        </Alert>
      )}

      {/* Busca e Botões */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" gap={3}>
        <TextField
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span style={{ color: '#64748B' }}>🔍</span>
              </InputAdornment>
            ),
          }}
          sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 2,
            minWidth: '320px',
            '& .MuiInputBase-input': { 
              color: '#1E293B',
              fontSize: '0.95rem'
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '2px' },
            }
          }}
        />
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderColor: '#10B981', 
              color: '#10B981', 
              fontWeight: '600',
              '&:hover': { 
                borderColor: '#059669', 
                backgroundColor: '#F0FDF4',
                color: '#059669'
              },
              '&:disabled': { 
                borderColor: '#94A3B8',
                color: '#94A3B8'
              },
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: 'none'
            }}
            onClick={() => router.push('/dashboard/admin/import-usuarios')}
          >
            📤 Importar em Massa
          </Button>
          
          <Button
            variant="contained"
            disabled={loading}
            sx={{ 
              bgcolor: '#3B82F6', 
              color: '#FFFFFF', 
              fontWeight: '600',
              '&:hover': { bgcolor: '#2563EB' },
              '&:disabled': { bgcolor: '#94A3B8' },
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => router.push('/dashboard/admin/usuarios/novo')}
          >
            ➕ Novo Usuário
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2, fontSize: '20px', width: 48, height: 48 }}>
                  👥
                </Avatar>
                <Box>
                  <Typography color="#64748B" variant="body2" sx={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Total de Usuários
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700', fontSize: '1.75rem' }}>
                    {users.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#059669', mr: 2, fontSize: '20px', width: 48, height: 48 }}>
                  📈
                </Avatar>
                <Box>
                  <Typography color="#64748B" variant="body2" sx={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Usuários Ativos
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700', fontSize: '1.75rem' }}>
                    {users.filter(u => u.status === 'ACTIVE').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FFFBEB', color: '#D97706', mr: 2, fontSize: '20px', width: 48, height: 48 }}>
                  💰
                </Avatar>
                <Box>
                  <Typography color="#64748B" variant="body2" sx={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Receita Total
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700', fontSize: '1.75rem' }}>
                    {formatCurrency(users.reduce((sum, u) => sum + (u.totalPurchases || 0), 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FAF5FF', color: '#7C3AED', mr: 2, fontSize: '20px', width: 48, height: 48 }}>
                  📅
                </Avatar>
                <Box>
                  <Typography color="#64748B" variant="body2" sx={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Este Mês
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1E293B', fontWeight: '700', fontSize: '1.75rem' }}>
                    {users.filter(u => {
                      try {
                        return new Date(u.createdAt).getMonth() === new Date().getMonth();
                      } catch {
                        return false;
                      }
                    }).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Usuários */}
      <Card sx={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: 3, 
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Usuário
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Plano
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Criado em
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Último Login
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Compras
                </TableCell>
                <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0', py: 2 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const planInfo = getPlanInfo(user.plan);
                const expired = isExpired(user.expirationDate);
                
                return (
                  <TableRow key={user.id} hover sx={{ 
                    '&:hover': { backgroundColor: '#F8FAFC' },
                    borderBottom: '1px solid #F1F5F9'
                  }}>
                    <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 2 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          mr: 2, 
                          backgroundColor: expired ? '#FEE2E2' : '#EFF6FF',
                          color: expired ? '#DC2626' : '#3B82F6',
                          fontWeight: '600',
                          width: 40,
                          height: 40
                        }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: '500', fontSize: '0.9rem' }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                            {user.email}
                          </Typography>
                          {user.expirationDate && (
                            <Typography variant="caption" sx={{ 
                              color: expired ? '#DC2626' : '#D97706',
                              fontSize: '0.75rem'
                            }}>
                              {expired ? '🔴 Expirado' : '⏰ Expira'}: {formatDate(user.expirationDate)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '16px' }}>{planInfo.emoji}</span>
                        <Chip
                          label={planInfo.label}
                          size="small"
                          sx={{ 
                            backgroundColor: `${planInfo.color}10`,
                            color: planInfo.color,
                            border: `1px solid ${planInfo.color}20`,
                            fontWeight: '500',
                            fontSize: '0.75rem'
                          }}
                        />
                        {/* ✅ BADGE ESPECIAL PARA LITE_V2 */}
                        {user.plan === 'LITE_V2' && (
                          <Chip
                            label="NOVO"
                            size="small"
                            sx={{ 
                              backgroundColor: '#1d4ed8',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '10px',
                              height: '18px'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 2 }}>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status) as any}
                        sx={{ fontWeight: '500', fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', borderBottom: '1px solid #F1F5F9', py: 2, fontSize: '0.875rem' }}>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', borderBottom: '1px solid #F1F5F9', py: 2, fontSize: '0.875rem' }}>
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', borderBottom: '1px solid #F1F5F9', py: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: '500', color: '#1E293B', fontSize: '0.875rem' }}>
                          {formatCurrency(user.totalPurchases)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                          {user.purchaseCount} compras
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 2 }}>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user.id)}
                          sx={{ 
                            color: '#3B82F6',
                            backgroundColor: '#EFF6FF',
                            '&:hover': { backgroundColor: '#DBEAFE' },
                            width: 32,
                            height: 32
                          }}
                          title="Editar usuário"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          sx={{ 
                            color: '#DC2626',
                            backgroundColor: '#FEF2F2',
                            '&:hover': { backgroundColor: '#FEE2E2' },
                            width: 32,
                            height: 32
                          }}
                          title="Excluir usuário"
                        >
                          🗑️
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredUsers.length === 0 && !loading && (
          <Box p={4} textAlign="center">
            <Typography sx={{ color: '#64748B' }}>
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}