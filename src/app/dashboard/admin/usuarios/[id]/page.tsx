'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  Avatar,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import { useUser } from '@/hooks/use-user';
import { useRouter, useParams } from 'next/navigation';

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
  expirationDate?: string;
  customPermissions?: string[];
}

interface Purchase {
  id: string;
  amount: number;
  date: string;
  product: string;
  status: string;
}

export default function EditUserPage() {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Lista de conteúdos disponíveis para liberação
  const availableContents = [
    { id: 'small-caps', label: 'Small Caps', category: 'Principal' },
    { id: 'micro-caps', label: 'Micro Caps', category: 'Principal' },
    { id: 'dividendos', label: 'Dividendos', category: 'Principal' },
    { id: 'fundos-imobiliarios', label: 'Fundos Imobiliários', category: 'Principal' },
    { id: 'rentabilidades', label: 'Rentabilidades', category: 'Principal' },
    
    { id: 'internacional-etfs', label: 'ETFs Internacionais', category: 'Internacional' },
    { id: 'internacional-stocks', label: 'Stocks', category: 'Internacional' },
    { id: 'internacional-dividendos', label: 'Dividendos Internacionais', category: 'Internacional' },
    { id: 'projeto-america', label: 'Projeto América', category: 'Internacional' },
    
    { id: 'recursos-dicas', label: 'Dicas de Investimentos', category: 'Recursos Exclusivos' },
    { id: 'recursos-analise', label: 'Análise de Carteira', category: 'Recursos Exclusivos' },
    { id: 'recursos-ebooks', label: 'E-books', category: 'Recursos Exclusivos' },
    { id: 'recursos-imposto', label: 'Imposto de Renda', category: 'Recursos Exclusivos' },
    { id: 'recursos-lives', label: 'Lives e Aulas', category: 'Recursos Exclusivos' },
    { id: 'recursos-milhas', label: 'Milhas Aéreas', category: 'Recursos Exclusivos' },
    { id: 'recursos-planilhas', label: 'Planilhas', category: 'Recursos Exclusivos' },
    { id: 'recursos-telegram', label: 'Telegram', category: 'Recursos Exclusivos' }
  ];

  // Verificar se é admin
  React.useEffect(() => {
    if (currentUser && 'plan' in currentUser && currentUser.plan !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  React.useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      console.log('🔍 Debug - Carregando usuário e compras:', userId);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('🔍 Debug - Error response:', errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      
      setUser(data.user);
      setPurchases(data.purchases || []);
      setError(null);
      
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      setError(`Erro ao carregar usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar usuário');
      }

      alert('✅ Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }

      alert('✅ Usuário excluído com sucesso!');
      router.push('/dashboard/admin/usuarios');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('❌ Erro ao excluir usuário');
    }
  };

  const handlePermissionChange = (contentId: string, checked: boolean) => {
    if (!user) return;

    const currentPermissions = user.customPermissions || [];
    const newPermissions = checked
      ? [...currentPermissions, contentId]
      : currentPermissions.filter(p => p !== contentId);

    setUser({ ...user, customPermissions: newPermissions });
  };

  // ✨ FUNÇÕES PARA PERMISSÕES - VERSÃO ÚNICA SEM DUPLICATAS
  const getPlanPermissions = (plan: string): string[] => {
    const planPermissionsMap = {
      'VIP': [
        'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
        'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'projeto-america',
        'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 'recursos-imposto',
        'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
      ],
      'LITE': [
        'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
        'internacional-etfs', 'internacional-stocks',
        'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
      ],
      'RENDA_PASSIVA': [
        'dividendos', 'fundos-imobiliarios', 'rentabilidades',
        'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
      ],
      'FIIS': [
        'fundos-imobiliarios', 'rentabilidades',
        'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
      ],
      'AMERICA': [
        'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'projeto-america',
        'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
      ],
      'ADMIN': [
        'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
        'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'projeto-america',
        'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 'recursos-imposto',
        'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
      ]
    };
    
    return planPermissionsMap[plan as keyof typeof planPermissionsMap] || [];
  };

  const isPermissionFromPlan = (contentId: string): boolean => {
    if (!user) return false;
    const planPermissions = getPlanPermissions(user.plan);
    return planPermissions.includes(contentId);
  };

  const isCustomPermission = (contentId: string): boolean => {
    if (!user) return false;
    const customPermissions = user.customPermissions || [];
    return customPermissions.includes(contentId);
  };

  const hasPermission = (contentId: string): boolean => {
    return isPermissionFromPlan(contentId) || isCustomPermission(contentId);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ backgroundColor: '#F8FAFC' }}>
        <Typography sx={{ color: '#64748B' }}>🔄 Carregando usuário...</Typography>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box p={4} sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        <Alert 
          severity="error"
          sx={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA',
            color: '#991B1B',
            borderRadius: 2
          }}
        >
          {error || 'Usuário não encontrado'}
        </Alert>
        <Button 
          onClick={() => router.push('/dashboard/admin/usuarios')} 
          sx={{ 
            mt: 2, 
            color: '#3B82F6',
            '&:hover': { backgroundColor: '#EFF6FF' }
          }}
        >
          ← Voltar para lista
        </Button>
      </Box>
    );
  }

  const planInfo = getPlanInfo(user.plan);
  const expired = isExpired(user.expirationDate);

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={5} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button 
            onClick={() => router.push('/dashboard/admin/usuarios')}
            sx={{ 
              color: '#3B82F6', 
              mb: 2,
              '&:hover': { backgroundColor: '#EFF6FF' },
              fontWeight: '500'
            }}
          >
            ← Voltar para lista
          </Button>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1E293B', fontWeight: '700', fontSize: '2rem' }}>
            ✏️ Editar Usuário
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1rem' }}>
            Gerencie dados, permissões e acesso do usuário
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => setShowDeleteDialog(true)}
            sx={{
              color: '#EF4444',
              borderColor: '#EF4444',
              '&:hover': { 
                backgroundColor: '#FEF2F2',
                borderColor: '#DC2626'
              },
              fontWeight: '500'
            }}
          >
            🗑️ Excluir
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
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
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {saving ? '💾 Salvando...' : '💾 Salvar'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: '600' }}>
                👤 Informações Básicas
              </Typography>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 60, 
                    height: 60,
                    backgroundColor: expired ? '#FEE2E2' : '#EFF6FF',
                    color: expired ? '#DC2626' : '#3B82F6',
                    fontSize: '24px',
                    fontWeight: '600'
                  }}
                >
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: '600' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{planInfo.emoji}</span>
                    <Chip
                      label={planInfo.label}
                      size="small"
                      sx={{ 
                        backgroundColor: `${planInfo.color}10`,
                        color: planInfo.color,
                        border: `1px solid ${planInfo.color}20`,
                        fontWeight: '500'
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    sx={{ 
                      '& .MuiInputBase-input': { color: '#1E293B' },
                      '& .MuiInputLabel-root': { color: '#64748B' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '2px' },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    sx={{ 
                      '& .MuiInputBase-input': { color: '#1E293B' },
                      '& .MuiInputLabel-root': { color: '#64748B' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '2px' },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    sx={{ 
                      '& .MuiInputBase-input': { color: '#1E293B' },
                      '& .MuiInputLabel-root': { color: '#64748B' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '2px' },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#64748B' }}>Plano</InputLabel>
                    <Select
                      value={user.plan}
                      onChange={(e) => setUser({ ...user, plan: e.target.value as any })}
                      sx={{ 
                        color: '#1E293B', 
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6', borderWidth: '2px' }
                      }}
                    >
                      <MenuItem value="VIP">👑 Close Friends VIP</MenuItem>
                      <MenuItem value="LITE">⭐ Close Friends LITE</MenuItem>
                      <MenuItem value="RENDA_PASSIVA">💰 Projeto Renda Passiva</MenuItem>
                      <MenuItem value="FIIS">🏢 Projeto FIIs</MenuItem>
                      <MenuItem value="AMERICA">🇺🇸 Projeto América</MenuItem>
                      <MenuItem value="ADMIN">🛡️ Administrador</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#64748B' }}>Status</InputLabel>
                    <Select
                      value={user.status}
                      onChange={(e) => setUser({ ...user, status: e.target.value as any })}
                      sx={{ 
                        color: '#1E293B', 
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6', borderWidth: '2px' }
                      }}
                    >
                      <MenuItem value="ACTIVE">✅ Ativo</MenuItem>
                      <MenuItem value="INACTIVE">❌ Inativo</MenuItem>
                      <MenuItem value="PENDING">⏳ Pendente</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Data de Vencimento do Acesso"
                    type="date"
                    value={formatDate(user.expirationDate)}
                    onChange={(e) => setUser({ ...user, expirationDate: e.target.value })}
                    InputLabelProps={{ shrink: true, style: { color: '#64748B' } }}
                    sx={{ 
                      '& .MuiInputBase-input': { color: '#1E293B' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '2px' },
                      }
                    }}
                    helperText={
                      user.expirationDate 
                        ? expired 
                          ? "🔴 Acesso expirado" 
                          : "⏰ Acesso válido até " + new Date(user.expirationDate).toLocaleDateString('pt-BR')
                        : "Sem data de vencimento - acesso ilimitado"
                    }
                    FormHelperTextProps={{
                      sx: { color: expired ? '#EF4444' : '#64748B' }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissões de Acesso */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: '600' }}>
                🔓 Permissões de Acesso
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                <strong>Plano atual:</strong> {getPlanInfo(user.plan).label} | 
                <strong> Permissões customizadas:</strong> Liberações extras independente do plano
              </Typography>

              {['Principal', 'Internacional', 'Recursos Exclusivos'].map(category => (
                <Box key={category} mb={2}>
                  <Typography variant="subtitle2" sx={{ color: '#F59E0B', mb: 1, fontWeight: '600' }}>
                    {category}:
                  </Typography>
                  <FormGroup>
                    {availableContents
                      .filter(content => content.category === category)
                      .map(content => {
                        const fromPlan = isPermissionFromPlan(content.id);
                        const fromCustom = isCustomPermission(content.id);
                        const hasAccess = hasPermission(content.id);
                        
                        return (
                          <Box key={content.id} display="flex" alignItems="center" gap={1}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={hasAccess}
                                  onChange={(e) => {
                                    if (!fromPlan) {
                                      handlePermissionChange(content.id, e.target.checked);
                                    }
                                  }}
                                  disabled={fromPlan}
                                  sx={{ 
                                    color: fromPlan ? '#94A3B8' : '#3B82F6', 
                                    '&.Mui-checked': { 
                                      color: fromPlan ? '#94A3B8' : '#3B82F6' 
                                    },
                                    '&.Mui-disabled': {
                                      color: '#CBD5E1'
                                    }
                                  }}
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography sx={{ 
                                    color: fromPlan ? '#94A3B8' : '#1E293B',
                                    fontSize: '0.875rem'
                                  }}>
                                    {content.label}
                                  </Typography>
                                  {fromPlan && (
                                    <Chip 
                                      label="Plano" 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: '#EFF6FF',
                                        color: '#3B82F6',
                                        fontSize: '10px',
                                        height: '20px',
                                        border: '1px solid #DBEAFE'
                                      }}
                                    />
                                  )}
                                  {fromCustom && !fromPlan && (
                                    <Chip 
                                      label="Extra" 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: '#F0FDF4',
                                        color: '#10B981',
                                        fontSize: '10px',
                                        height: '20px',
                                        border: '1px solid #BBF7D0'
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              sx={{ margin: 0 }}
                            />
                          </Box>
                        );
                      })}
                  </FormGroup>
                  <Divider sx={{ bgcolor: '#E2E8F0', my: 1 }} />
                </Box>
              ))}
              
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2, 
                  backgroundColor: '#EFF6FF', 
                  border: '1px solid #DBEAFE',
                  color: '#1E40AF'
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  ℹ️ <strong>Permissões do plano</strong> são automáticas e não podem ser removidas. 
                  <strong> Permissões extras</strong> podem ser adicionadas/removidas conforme necessário.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Histórico de Compras */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 3, 
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: '600' }}>
                💰 Histórico de Compras
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Data</TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Produto</TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Valor</TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <TableRow key={purchase.id} hover sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                          <TableCell sx={{ color: '#1E293B', borderBottom: '1px solid #F1F5F9' }}>
                            {new Date(purchase.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell sx={{ color: '#1E293B', borderBottom: '1px solid #F1F5F9' }}>{purchase.product}</TableCell>
                          <TableCell sx={{ color: '#1E293B', borderBottom: '1px solid #F1F5F9' }}>{formatCurrency(purchase.amount)}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #F1F5F9' }}>
                            <Chip
                              label={purchase.status}
                              size="small"
                              color={purchase.status === 'COMPLETED' ? 'success' : 'warning'}
                              sx={{ fontWeight: '500', fontSize: '0.75rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ color: '#64748B', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                          Nenhuma compra registrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E2E8F0'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1E293B', fontWeight: '600' }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748B' }}>
            Tem certeza que deseja excluir o usuário "{user.firstName} {user.lastName}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            sx={{ 
              color: '#64748B',
              '&:hover': { backgroundColor: '#F8FAFC' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            sx={{
              color: '#EF4444',
              '&:hover': { backgroundColor: '#FEF2F2' }
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}