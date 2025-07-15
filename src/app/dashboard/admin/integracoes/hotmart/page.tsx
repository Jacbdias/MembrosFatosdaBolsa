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
  Paper
} from '@mui/material';

interface HotmartIntegration {
  id: string;
  productName: string;
  token: string;
  plan: string;
  webhookUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  totalSales?: number;
}

export default function IntegracoesPage() {
  const [integrations, setIntegrations] = useState<HotmartIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<HotmartIntegration | null>(null);

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
      // Simular dados das integrações (você implementará a API real)
      const mockIntegrations: HotmartIntegration[] = [
        {
          id: '124159',
          productName: 'Projeto Trump',
          token: 'EtgWA9f64vpgWvg6m9oSSnpn',
          plan: 'VIP',
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/EtgWA9f64vpgWvg6m9oSSnpn`,
          status: 'ACTIVE',
          createdAt: '2024-01-15',
          totalSales: 45
        },
        {
          id: '99519',
          productName: 'Troca de Plano - VIP',
          token: 'Abc123def456ghi789jkl012',
          plan: 'VIP',
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/Abc123def456ghi789jkl012`,
          status: 'ACTIVE',
          createdAt: '2024-02-20',
          totalSales: 23
        },
        {
          id: '99516',
          productName: 'Projeto FIIs',
          token: 'Xyz789uvw456rst123opq890',
          plan: 'FIIS',
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/Xyz789uvw456rst123opq890`,
          status: 'ACTIVE',
          createdAt: '2024-03-10',
          totalSales: 67
        },
        {
          id: '85078',
          productName: 'Close Friends LITE 2024',
          token: 'Mno345pqr678stu901vwx234',
          plan: 'LITE',
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/Mno345pqr678stu901vwx234`,
          status: 'ACTIVE',
          createdAt: '2024-04-05',
          totalSales: 89
        },
        {
          id: '85075',
          productName: 'Close Friends VIP 2024',
          token: 'Def567ghi890jkl123mno456',
          plan: 'VIP',
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/Def567ghi890jkl123mno456`,
          status: 'ACTIVE',
          createdAt: '2024-04-05',
          totalSales: 156
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = () => {
    setEditingIntegration(null);
    setFormData({ productName: '', plan: 'VIP' });
    setOpenDialog(true);
  };

  const handleEditIntegration = (integration: HotmartIntegration) => {
    setEditingIntegration(integration);
    setFormData({
      productName: integration.productName,
      plan: integration.plan
    });
    setOpenDialog(true);
  };

  const handleSaveIntegration = async () => {
    try {
      // Gerar token único para a integração
      const token = generateUniqueToken();
      
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
        const integrationId = Math.random().toString().slice(2, 8);
        const newIntegration: HotmartIntegration = {
          id: integrationId,
          ...formData,
          token: token,
          webhookUrl: `${window.location.origin}/api/webhooks/hotmart/${token}`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
          totalSales: 0
        };
        
        setIntegrations(prev => [...prev, newIntegration]);
        
        // Salvar no backend (implementar depois)
        console.log('✅ Nova integração criada:', newIntegration);
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar integração:', error);
    }
  };

  // Função para gerar token único
  const generateUniqueToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
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

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiada para a área de transferência!');
  };

  const getPlanInfo = (plan: string) => {
    const planMap: Record<string, { label: string; color: string; emoji: string }> = {
      'VIP': { label: 'Close Friends VIP', color: '#7C3AED', emoji: '👑' },
      'LITE': { label: 'Close Friends LITE', color: '#2563EB', emoji: '⭐' },
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
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1E293B', fontWeight: '700' }}>
          🔥 Integrações Hotmart
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Configure webhooks específicos para cada produto da Hotmart
        </Typography>
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
                    Instaladas
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
                    Total de Vendas
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
                <Avatar sx={{ bgcolor: '#FEF2F2', color: '#DC2626', mr: 2, fontSize: '20px' }}>
                  📊
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Disponíveis
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    ∞
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: '600' }}>
          Suas Integrações ({integrations.length})
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateIntegration}
          sx={{ 
            bgcolor: '#059669', 
            '&:hover': { bgcolor: '#047857' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: '600'
          }}
        >
          🔗 Nova Integração
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
                          bgcolor: '#FEF2F2', 
                          color: '#DC2626', 
                          mr: 2, 
                          width: 32, 
                          height: 32 
                        }}>
                          🔥
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            Webhook Hotmart #{integration.id}
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
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {integration.webhookUrl}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyWebhookUrl(integration.webhookUrl)}
                          sx={{ color: '#3B82F6' }}
                          title="Copiar URL"
                        >
                          📋
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
                          sx={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }}
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
              🔗 Nenhuma integração configurada
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Crie sua primeira integração com a Hotmart para começar a receber vendas automaticamente.
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateIntegration}
              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
            >
              Criar Primeira Integração
            </Button>
          </Box>
        )}
      </Card>

      {/* Dialog para criar/editar integração */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Editar Integração' : 'Nova Integração Hotmart'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Nome do Produto/Configuração"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              fullWidth
              placeholder="Ex: Projeto Trump, Close Friends VIP 2024"
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
                <MenuItem value="RENDA_PASSIVA">💰 Projeto Renda Passiva</MenuItem>
                <MenuItem value="FIIS">🏢 Projeto FIIs</MenuItem>
                <MenuItem value="AMERICA">🇺🇸 Projeto América</MenuItem>
              </Select>
            </FormControl>
            
            {!editingIntegration && (
              <Alert severity="info">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>📋 Como configurar na Hotmart:</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  1. Vá em <strong>Ferramentas → Webhook (API e Notificações)</strong><br/>
                  2. Crie uma nova configuração<br/>
                  3. Use a URL gerada automaticamente<br/>
                  4. Marque todos os eventos de venda
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
            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
          >
            {editingIntegration ? 'Salvar Alterações' : 'Criar Integração'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}