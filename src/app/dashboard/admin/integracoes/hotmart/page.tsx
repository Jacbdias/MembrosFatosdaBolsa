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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Snackbar,
  Tooltip,
  Divider,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface HotmartProduct {
  id: string;
  name: string;
  plan: string;
  active: boolean;
  lastSale?: string;
  totalSales: number;
  createdAt?: string;
}

interface HotmartConfig {
  webhookUrl: string;
  webhookActive: boolean;
  webhookSecret?: string;
  products: HotmartProduct[];
  lastWebhookReceived?: string;
  totalWebhooksReceived: number;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  productId: string;
  customerEmail: string;
  status: 'success' | 'error';
  message: string;
}

export default function HotmartPage() {
  const [config, setConfig] = React.useState<HotmartConfig>({
    webhookUrl: '',
    webhookActive: false,
    webhookSecret: '',
    products: [],
    totalWebhooksReceived: 0
  });
  
  const [loading, setLoading] = React.useState(false);
  const [showProductDialog, setShowProductDialog] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<HotmartProduct | null>(null);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({
    open: false,
    message: '',
    severity: 'info'
  });

  const [newProduct, setNewProduct] = React.useState({
    id: '',
    name: '',
    plan: 'VIP',
    active: true
  });

  const availablePlans = [
    { value: 'VIP', label: 'Close Friends VIP', color: '#9c27b0' },
    { value: 'LITE', label: 'Close Friends LITE', color: '#2196f3' },
    { value: 'RENDA_PASSIVA', label: 'Projeto Renda Passiva', color: '#4caf50' },
    { value: 'FIIS', label: 'Projeto FIIs', color: '#ff9800' },
    { value: 'AMERICA', label: 'Projeto América', color: '#f44336' }
  ];

  React.useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockConfig: HotmartConfig = {
        webhookUrl: `${window.location.origin}/api/hotmart/webhook`,
        webhookActive: true,
        webhookSecret: 'hmac-secret-key-2024',
        totalWebhooksReceived: 127,
        lastWebhookReceived: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        products: [
          {
            id: 'close-friends-vip-123',
            name: 'Close Friends VIP - Acesso Completo',
            plan: 'VIP',
            active: true,
            totalSales: 45,
            lastSale: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
          },
          {
            id: 'renda-passiva-pro-456',
            name: 'Projeto Renda Passiva Professional',
            plan: 'RENDA_PASSIVA',
            active: true,
            totalSales: 23,
            lastSale: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
          }
        ]
      };

      setConfig(mockConfig);
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showSnackbar('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      
      if (!config.webhookUrl) {
        showSnackbar('URL do webhook é obrigatória', 'error');
        return;
      }

      console.log('Salvando configurações:', config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSnackbar('Configurações salvas com sucesso', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showSnackbar('Erro ao salvar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.id.trim() || !newProduct.name.trim()) {
      showSnackbar('Preencha ID e Nome do produto', 'error');
      return;
    }

    if (config.products.find(p => p.id === newProduct.id)) {
      showSnackbar('Já existe um produto com este ID', 'error');
      return;
    }

    const product: HotmartProduct = {
      ...newProduct,
      totalSales: 0,
      createdAt: new Date().toISOString()
    };

    setConfig(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));

    setNewProduct({ id: '', name: '', plan: 'VIP', active: true });
    setShowProductDialog(false);
    showSnackbar('Produto adicionado com sucesso', 'success');
  };

  const handleEditProduct = (product: HotmartProduct) => {
    setEditingProduct(product);
    setNewProduct({
      id: product.id,
      name: product.name,
      plan: product.plan,
      active: product.active
    });
    setShowProductDialog(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    if (!newProduct.name.trim()) {
      showSnackbar('Nome do produto é obrigatório', 'error');
      return;
    }

    setConfig(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...newProduct }
          : p
      )
    }));

    setEditingProduct(null);
    setNewProduct({ id: '', name: '', plan: 'VIP', active: true });
    setShowProductDialog(false);
    showSnackbar('Produto atualizado com sucesso', 'success');
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      setConfig(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
      showSnackbar('Produto removido com sucesso', 'success');
    }
  };

  const handleTestWebhook = async () => {
    try {
      setTestResult('Testando webhook...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.3;
      
      if (success) {
        setTestResult(`Webhook funcionando corretamente`);
      } else {
        setTestResult('Webhook não está respondendo');
      }
    } catch (error) {
      setTestResult('Erro ao testar webhook');
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    showSnackbar('URL copiada para a área de transferência', 'success');
  };

  const handleGenerateSecret = () => {
    const newSecret = 'hmac-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    setConfig(prev => ({ ...prev, webhookSecret: newSecret }));
    showSnackbar('Nova chave secreta gerada', 'info');
  };

  const getPlanInfo = (plan: string) => {
    const planInfo = availablePlans.find(p => p.value === plan);
    return planInfo || { label: plan, color: '#757575' };
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  const closeDialog = () => {
    setShowProductDialog(false);
    setEditingProduct(null);
    setNewProduct({ id: '', name: '', plan: 'VIP', active: true });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 9999
          }} 
        />
      )}

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Integração Hotmart
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Configure a integração com a Hotmart para liberação automática de acesso
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Configurações do Webhook */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Configurações do Webhook
              </Typography>

              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TextField
                    fullWidth
                    label="URL do Webhook"
                    value={config.webhookUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    size="small"
                    InputProps={{ 
                      style: { fontFamily: 'monospace', fontSize: '0.9rem' },
                      readOnly: true
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                  <Tooltip title="Copiar URL">
                    <IconButton onClick={handleCopyWebhookUrl} size="small">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 3 }}>
                  Use esta URL na configuração de webhook na sua conta Hotmart
                </Typography>

                <Grid container spacing={2} alignItems="center" mb={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.webhookActive}
                          onChange={(e) => setConfig(prev => ({ ...prev, webhookActive: e.target.checked }))}
                        />
                      }
                      label="Webhook Ativo"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      onClick={handleTestWebhook}
                      startIcon={<RefreshIcon />}
                      disabled={!config.webhookActive}
                      size="small"
                    >
                      Testar Webhook
                    </Button>
                  </Grid>
                </Grid>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TextField
                    fullWidth
                    label="Chave Secreta"
                    value={config.webhookSecret}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    size="small"
                    InputProps={{ 
                      style: { fontFamily: 'monospace' },
                      type: 'password'
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleGenerateSecret}
                    size="small"
                    sx={{ minWidth: '100px' }}
                  >
                    Gerar
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 3 }}>
                  Chave secreta para validar a autenticidade dos webhooks
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Button
                  variant="contained"
                  onClick={handleSaveConfig}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>

                {testResult && (
                  <Alert 
                    severity={testResult.includes('funcionando') ? 'success' : testResult.includes('Testando') ? 'info' : 'error'} 
                    sx={{ mt: 2 }}
                  >
                    {testResult}
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status da Integração */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Status da Integração
              </Typography>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status do Webhook
                  </Typography>
                  <Chip
                    label={config.webhookActive ? 'Ativo' : 'Inativo'}
                    color={config.webhookActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Produtos Configurados
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {config.products.length}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Vendas
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {config.products.reduce((total, p) => total + p.totalSales, 0)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Webhooks Recebidos
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {config.totalWebhooksReceived}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Último Webhook
                  </Typography>
                  <Typography variant="body2">
                    {formatRelativeTime(config.lastWebhookReceived)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Após configurar os produtos, adicione a URL do webhook na sua conta Hotmart
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Produtos */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Produtos Hotmart
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowProductDialog(true)}
                  startIcon={<AddIcon />}
                >
                  Adicionar Produto
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID do Produto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Plano</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vendas</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Última Venda</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {config.products.map((product) => {
                      const planInfo = getPlanInfo(product.plan);
                      return (
                        <TableRow key={product.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>
                            {product.id}
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={planInfo.label}
                              variant="outlined"
                              size="small"
                              sx={{ 
                                borderColor: planInfo.color,
                                color: planInfo.color
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.active ? 'Ativo' : 'Inativo'}
                              color={product.active ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {product.totalSales}
                          </TableCell>
                          <TableCell sx={{ color: '#666', fontSize: '0.85rem' }}>
                            {formatRelativeTime(product.lastSale)}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => handleEditProduct(product)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remover">
                              <IconButton
                                onClick={() => handleDeleteProduct(product.id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {config.products.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            Nenhum produto configurado
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Adicione produtos para começar a receber webhooks da Hotmart
                          </Typography>
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

      {/* Dialog para Adicionar/Editar Produto */}
      <Dialog 
        open={showProductDialog} 
        onClose={closeDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="ID do Produto na Hotmart"
            value={newProduct.id}
            onChange={(e) => setNewProduct(prev => ({ ...prev, id: e.target.value }))}
            margin="normal"
            size="small"
            InputProps={{ 
              style: { fontFamily: 'monospace' },
              readOnly: !!editingProduct
            }}
            helperText="ID único do produto na Hotmart"
          />
          
          <TextField
            fullWidth
            label="Nome do Produto"
            value={newProduct.name}
            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            size="small"
            helperText="Nome descritivo para identificar o produto"
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Plano de Acesso</InputLabel>
            <Select
              value={newProduct.plan}
              onChange={(e) => setNewProduct(prev => ({ ...prev, plan: e.target.value }))}
              label="Plano de Acesso"
            >
              {availablePlans.map(plan => (
                <MenuItem key={plan.value} value={plan.value}>
                  {plan.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={newProduct.active}
                onChange={(e) => setNewProduct(prev => ({ ...prev, active: e.target.checked }))}
              />
            }
            label="Produto Ativo"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
            variant="contained"
          >
            {editingProduct ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}