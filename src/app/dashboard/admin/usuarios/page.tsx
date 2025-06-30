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
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

import { useUser } from '@/hooks/use-user';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  plan: 'VIP' | 'LITE' | 'RENDA_PASSIVA' | 'FIIS' | 'AMERICA' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  hotmartCustomerId?: string;
  createdAt: string;
  lastLogin?: string;
  totalPurchases: number;
  purchaseCount: number;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterPlan, setFilterPlan] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [loading, setLoading] = React.useState(true);
  const [showUserDialog, setShowUserDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  });

  // Verificar se é admin
  React.useEffect(() => {
    if (user && 'plan' in user && user.plan !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  React.useEffect(() => {
    loadUsers();
  }, []);

  React.useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPlan !== 'ALL') {
      filtered = filtered.filter(user => user.plan === filterPlan);
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterPlan, filterStatus, users]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }
      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      
      // Calcular estatísticas
      const totalUsers = data.users?.length || 0;
      const activeUsers = data.users?.filter((u: User) => u.status === 'ACTIVE').length || 0;
      const totalRevenue = data.users?.reduce((sum: number, u: User) => sum + u.totalPurchases, 0) || 0;
      const newUsersThisMonth = data.users?.filter((u: User) => 
        new Date(u.createdAt).getMonth() === new Date().getMonth()
      ).length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalRevenue,
        newUsersThisMonth
      });
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus as any } : user
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status');
    }
  };

  const getPlanInfo = (plan: string) => {
    const planMap = {
      'VIP': { label: 'Close Friends VIP', color: '#9c27b0' },
      'LITE': { label: 'Close Friends LITE', color: '#2196f3' },
      'RENDA_PASSIVA': { label: 'Projeto Renda Passiva', color: '#4caf50' },
      'FIIS': { label: 'Projeto FIIs', color: '#ff9800' },
      'AMERICA': { label: 'Projeto América', color: '#f44336' },
      'ADMIN': { label: 'Administrador', color: '#424242' }
    };
    return planMap[plan as keyof typeof planMap] || { label: plan, color: '#757575' };
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Carregando usuários...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#00FF00', fontWeight: 'bold' }}>
          🛡️ Gerenciamento de Usuários
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc' }}>
          Gerencie usuários, planos e integrações com Hotmart
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#111', color: '#fff' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#00FF00', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography color="#ccc" variant="body2">
                    Total de Usuários
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: '#00FF00' }}>
                    {stats.totalUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#111', color: '#fff' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="#ccc" variant="body2">
                    Usuários Ativos
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: '#4caf50' }}>
                    {stats.activeUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#111', color: '#fff' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography color="#ccc" variant="body2">
                    Receita Total
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: '#ff9800' }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#111', color: '#fff' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                  <AddIcon />
                </Avatar>
                <Box>
                  <Typography color="#ccc" variant="body2">
                    Novos este mês
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: '#9c27b0' }}>
                    {stats.newUsersThisMonth}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3, backgroundColor: '#111' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#ccc' }} />
                    </InputAdornment>
                  ),
                  sx: { color: '#fff', backgroundColor: '#222' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>Plano</InputLabel>
                <Select
                  value={filterPlan}
                  label="Plano"
                  onChange={(e) => setFilterPlan(e.target.value)}
                  sx={{ color: '#fff', backgroundColor: '#222' }}
                >
                  <MenuItem value="ALL">Todos os Planos</MenuItem>
                  <MenuItem value="VIP">Close Friends VIP</MenuItem>
                  <MenuItem value="LITE">Close Friends LITE</MenuItem>
                  <MenuItem value="RENDA_PASSIVA">Projeto Renda Passiva</MenuItem>
                  <MenuItem value="FIIS">Projeto FIIs</MenuItem>
                  <MenuItem value="AMERICA">Projeto América</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ccc' }}>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ color: '#fff', backgroundColor: '#222' }}
                >
                  <MenuItem value="ALL">Todos os Status</MenuItem>
                  <MenuItem value="ACTIVE">Ativo</MenuItem>
                  <MenuItem value="INACTIVE">Inativo</MenuItem>
                  <MenuItem value="PENDING">Pendente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowUserDialog(true)}
                sx={{ 
                  height: 56,
                  backgroundColor: '#00FF00',
                  color: '#000',
                  '&:hover': { backgroundColor: '#00e600' }
                }}
              >
                Novo Usuário
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card sx={{ backgroundColor: '#111' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#ccc', fontWeight: 'bold' }}>Usuário</TableCell>
                <TableCell sx={{ color: '#ccc', fontWeight: 'bold' }}>Plano</TableCell>
                <TableCell sx={{ color: '#ccc', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#ccc', fontWeight: 'bold' }}>Hotmart ID</TableCell>
                <TableCell align="right" sx={{ color: '#ccc', fontWeight: 'bold' }}>Compras</TableCell>
                <TableCell sx={{ color: '#ccc', fontWeight: 'bold' }}>Último Login</TableCell>
                <TableCell align="center" sx={{ color: '#ccc', fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const planInfo = getPlanInfo(user.plan);
                return (
                  <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: '#222' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={user.avatar} 
                          sx={{ mr: 2, width: 40, height: 40, backgroundColor: '#00FF00' }}
                        >
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" sx={{ color: '#fff' }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#ccc' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={planInfo.label}
                        size="small"
                        sx={{ 
                          backgroundColor: `${planInfo.color}20`,
                          color: planInfo.color,
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status) as any}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#ccc' }}>
                        {user.hotmartCustomerId || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" sx={{ color: '#00FF00' }}>
                        {formatCurrency(user.totalPurchases)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ccc' }}>
                        {user.purchaseCount} compra(s)
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#ccc' }}>
                        {formatDate(user.lastLogin)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                          sx={{ color: '#00FF00' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            size="small"
                            sx={{ color: '#fff', backgroundColor: '#333' }}
                          >
                            <MenuItem value="ACTIVE">Ativo</MenuItem>
                            <MenuItem value="INACTIVE">Inativo</MenuItem>
                            <MenuItem value="PENDING">Pendente</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog para criar/editar usuário */}
      <Dialog 
        open={showUserDialog} 
        onClose={() => {
          setShowUserDialog(false);
          setSelectedUser(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#111', color: '#fff' }
        }}
      >
        <DialogTitle sx={{ color: '#00FF00' }}>
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              defaultValue={selectedUser?.firstName || ''}
              InputProps={{ sx: { color: '#fff', backgroundColor: '#222' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />
            <TextField
              label="Sobrenome"
              fullWidth
              defaultValue={selectedUser?.lastName || ''}
              InputProps={{ sx: { color: '#fff', backgroundColor: '#222' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              defaultValue={selectedUser?.email || ''}
              InputProps={{ sx: { color: '#fff', backgroundColor: '#222' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#ccc' }}>Plano</InputLabel>
              <Select
                defaultValue={selectedUser?.plan || 'VIP'}
                label="Plano"
                sx={{ color: '#fff', backgroundColor: '#222' }}
              >
                <MenuItem value="VIP">Close Friends VIP</MenuItem>
                <MenuItem value="LITE">Close Friends LITE</MenuItem>
                <MenuItem value="RENDA_PASSIVA">Projeto Renda Passiva</MenuItem>
                <MenuItem value="FIIS">Projeto FIIs</MenuItem>
                <MenuItem value="AMERICA">Projeto América</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Hotmart Customer ID"
              fullWidth
              defaultValue={selectedUser?.hotmartCustomerId || ''}
              InputProps={{ sx: { color: '#fff', backgroundColor: '#222' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowUserDialog(false);
              setSelectedUser(null);
            }}
            sx={{ color: '#ccc' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Implementar lógica de salvar
              console.log('Salvando usuário...');
              setShowUserDialog(false);
              setSelectedUser(null);
            }}
            sx={{ 
              backgroundColor: '#00FF00',
              color: '#000',
              '&:hover': { backgroundColor: '#00e600' }
            }}
          >
            {selectedUser ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}