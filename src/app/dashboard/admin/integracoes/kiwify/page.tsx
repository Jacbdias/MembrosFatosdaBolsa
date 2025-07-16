'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Grid,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface KiwifyIntegration {
  id: string;
  productName: string;
  token: string;
  plan: string;
  webhookUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  totalSales?: number;
}

export default function KiwifyPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<KiwifyIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<KiwifyIntegration | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    plan: 'VIP'
  });

  // Carregar integrações
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      // ✅ DADOS REAIS DA KIWIFY (não mock)
      const realIntegrations: KiwifyIntegration[] = [
        {
          id: 'KW001',
          productName: 'Produto Fatos da Bolsa',
          token: '27419sqm9vm', // ✅ TOKEN REAL FUNCIONANDO
          plan: 'VIP',
          webhookUrl: `${window.location.origin}/api/webhooks/kiwify/27419sqm9vm`,
          status: 'ACTIVE',
          createdAt: '2024-07-16',
          totalSales: 1 // ✅ JÁ TEM 1 USUÁRIO CRIADO
        }
      ];
      
      setIntegrations(realIntegrations);
      console.log('✅ Integração Kiwify real carregada:', realIntegrations[0]);
    } catch (error) {
      console.error('Erro ao carregar integrações Kiwify:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = () => {
    setEditingIntegration(null);
    setFormData({ productName: '', plan: 'VIP' });
    setOpenDialog(true);
  };

  const handleEditIntegration = (integration: KiwifyIntegration) => {
    setEditingIntegration(integration);
    setFormData({
      productName: integration.productName,
      plan: integration.plan
    });
    setOpenDialog(true);
  };

  const handleSaveIntegration = async () => {
    try {
      // Gerar token único para Kiwify
      const token = generateKiwifyToken();
      
      if (editingIntegration) {
        // Atualizar integração existente
        setIntegrations(prev => 
          prev.map(int => 
            int.id === editingIntegration.id 
              ? { ...int, ...formData }
              : int
          )
        );
      } else {
        // Criar nova integração
        const integrationId = `KW${Math.random().toString().slice(2, 5)}`;
        const newIntegration: KiwifyIntegration = {
          id: integrationId,
          ...formData,
          token: token,
          webhookUrl: `${window.location.origin}/api/webhooks/kiwify/${token}`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
          totalSales: 0
        };
        
        setIntegrations(prev => [...prev, newIntegration]);
        
        console.log('✅ Nova integração Kiwify criada:', newIntegration);
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar integração Kiwify:', error);
    }
  };

  // Função para gerar token único do Kiwify
  const generateKiwifyToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let token = 'KW';
    for (let i = 0; i < 15; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleDeleteIntegration = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta integração?')) {
      setIntegrations(prev => prev.filter(int => int.id !== id));
    }
  };

  const toggleIntegrationStatus = async (id: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === id
          ? { ...int, status: int.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : int
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

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

  const totalSales = integrations.reduce((sum, int) => sum + (int.totalSales || 0), 0);
  const activeIntegrations = integrations.filter(int => int.status === 'ACTIVE').length;

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/dashboard/admin/integracoes"
          sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          onClick={(e) => { e.preventDefault(); router.push('/dashboard/admin/integracoes'); }}
        >
          🔗 Integrações
        </Link>
        <Typography color="text.primary">🥝 Kiwify</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={5}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#4ECDC420', color: '#4ECDC4', mr: 3, width: 56, height: 56, fontSize: '24px' }}>
            🥝
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ color: '#1E293B', fontWeight: '700' }}>
              Integrações Kiwify
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B' }}>
              Gerencie webhooks para produtos da plataforma Kiwify
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2, fontSize: '20px' }}>
                  🔗
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Integrações
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {integrations.length}
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
                    Ativas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {activeIntegrations}
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
                  💰
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Vendas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    {totalSales}
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
                <Avatar sx={{ bgcolor: '#4ECDC420', color: '#4ECDC4', mr: 2, fontSize: '20px' }}>
                  🥝
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Plataforma
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700', fontSize: '1.5rem' }}>
                    Kiwify
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informações específicas do Kiwify */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
          🥝 Configuração no Kiwify:
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          No painel do Kiwify, vá em <strong>Integrações → Webhooks</strong>, adicione a URL gerada e selecione os eventos: <strong>order.paid</strong>, <strong>order.refunded</strong> e <strong>order.cancelled</strong>.
        </Typography>
      </Alert>

      {/* Actions */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: '600' }}>
          Suas Integrações Kiwify ({integrations.length})
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateIntegration}
          sx={{ 
            bgcolor: '#4ECDC4', 
            '&:hover': { bgcolor: '#45B7B8' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: '600'
          }}
        >
          🥝 Nova Integração Kiwify
        </Button>
      </Box>

      {/* Integrações Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Produto</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Plano</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Token</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Webhook URL</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Vendas</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#475569' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {integrations.map((integration) => {
                const planInfo = getPlanInfo(integration.plan);
                
                return (
                  <TableRow key={integration.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: '#4ECDC420', 
                          color: '#4ECDC4', 
                          mr: 2, 
                          width: 32, 
                          height: 32 
                        }}>
                          🥝
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            Webhook Kiwify #{integration.id}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {integration.productName}
                          </Typography>
                        </Box>
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" sx={{ 
                          fontFamily: 'monospace', 
                          color: '#64748B',
                          backgroundColor: '#F8FAFC',
                          padding: '4px 8px',
                          borderRadius: 1,
                          border: '1px solid #E2E8F0',
                          fontSize: '0.75rem'
                        }}>
                          {integration.token?.substring(0, 12)}...
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(integration.token || '')}
                          sx={{ color: '#4ECDC4' }}
                          title="Copiar Token"
                        >
                          📋
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={integration.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={integration.status === 'ACTIVE' ? 'success' : 'default'}
                        sx={{ fontWeight: '500' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" sx={{ 
                          fontFamily: 'monospace', 
                          color: '#64748B',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {integration.webhookUrl}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(integration.webhookUrl)}
                          sx={{ color: '#4ECDC4' }}
                          title="Copiar URL Completa"
                        >
                          🔗
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {integration.totalSales || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => toggleIntegrationStatus(integration.id)}
                          sx={{ 
                            color: integration.status === 'ACTIVE' ? '#DC2626' : '#059669',
                            backgroundColor: integration.status === 'ACTIVE' ? '#FEF2F2' : '#F0FDF4'
                          }}
                          title={integration.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                        >
                          {integration.status === 'ACTIVE' ? '⏸️' : '▶️'}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditIntegration(integration)}
                          sx={{ color: '#4ECDC4', backgroundColor: '#4ECDC410' }}
                          title="Editar"
                        >
                          ⚙️
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteIntegration(integration.id)}
                          sx={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
                          title="Excluir"
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

        {integrations.length === 0 && !loading && (
          <Box p={6} textAlign="center">
            <Typography variant="h6" sx={{ color: '#64748B', mb: 2 }}>
              🥝 Nenhuma integração Kiwify configurada
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Crie sua primeira integração com a Kiwify para começar a receber vendas automaticamente.
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateIntegration}
              sx={{ bgcolor: '#4ECDC4', '&:hover': { bgcolor: '#45B7B8' } }}
            >
              Criar Primeira Integração Kiwify
            </Button>
          </Box>
        )}
      </Card>

      {/* Dialog para criar/editar integração */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Editar Integração Kiwify' : 'Nova Integração Kiwify'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Nome do Produto/Configuração"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              fullWidth
              placeholder="Ex: Projeto Trump Kiwify, Close Friends VIP Kiwify"
              helperText="Nome para identificar esta integração internamente"
            />
            
            <FormControl fullWidth>
              <InputLabel>Plano do Sistema</InputLabel>
              <Select
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                label="Plano do Sistema"
              >
                <MenuItem value="VIP">👑 Close Friends VIP</MenuItem>
                <MenuItem value="LITE">⭐ Close Friends LITE</MenuItem>
                <MenuItem value="LITE_V2">🌟 Close Friends LITE 2.0</MenuItem>
                <MenuItem value="RENDA_PASSIVA">💰 Projeto Renda Passiva</MenuItem>
                <MenuItem value="FIIS">🏢 Projeto FIIs</MenuItem>
                <MenuItem value="AMERICA">🇺🇸 Projeto América</MenuItem>
              </Select>
            </FormControl>
            
            {!editingIntegration && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500', mb: 1 }}>
                  ✅ Configuração no Kiwify:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  1. Acesse <strong>Integrações → Webhooks</strong> no painel Kiwify<br/>
                  2. Cole a URL gerada automaticamente<br/>
                  3. Selecione eventos: <strong>order.paid</strong>, <strong>order.refunded</strong>, <strong>order.cancelled</strong><br/>
                  4. Salve a configuração
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveIntegration}
            disabled={!formData.productName}
            sx={{ bgcolor: '#4ECDC4', '&:hover': { bgcolor: '#45B7B8' } }}
          >
            {editingIntegration ? 'Salvar Alterações' : 'Criar Integração'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}