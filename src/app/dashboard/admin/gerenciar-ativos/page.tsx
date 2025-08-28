'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Upload,
  Download,
  Search,
  FilterList,
  ExpandMore,
  Refresh,
  Info,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';

interface AtivoInformacao {
  id: string;
  codigo: string;
  nome: string;
  setor: string;
  subsetor?: string;
  tipo: string;
  qualidade: number;
  risco: string;
  recomendacao: string;
  fundamentosResumo?: string;
  pontosFortes?: string[];
  pontosFracos?: string[];
  observacoes?: string;
  segmento?: string;
  governanca?: string;
  dividend_yield?: number;
  ativo: boolean;
  ultimaRevisao: string;
  createdAt: string;
  updatedAt: string;
}

const riscoColors = {
  BAIXO: '#10b981',
  MEDIO: '#f59e0b', 
  ALTO: '#ef4444'
};

const recomendacaoColors = {
  COMPRA: '#10b981',
  MANTER: '#3b82f6',
  NEUTRO: '#6b7280',
  VENDA: '#ef4444'
};

export default function AdminAtivosPage() {
  const [ativos, setAtivos] = useState<AtivoInformacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterRisco, setFilterRisco] = useState('');
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAtivo, setSelectedAtivo] = useState<AtivoInformacao | null>(null);
  
  // Estados para formulário
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    setor: '',
    subsetor: '',
    tipo: 'ACAO',
    qualidade: 7,
    risco: 'MEDIO',
    recomendacao: 'NEUTRO',
    fundamentosResumo: '',
    pontosFortes: [''],
    pontosFracos: [''],
    observacoes: '',
    segmento: '',
    governanca: '',
    dividend_yield: null as number | null
  });
  
  // Estados para upload CSV
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    acoes: 0,
    fiis: 0,
    etfs: 0,
    qualidadeMedia: 0
  });

  useEffect(() => {
    loadAtivos();
  }, [searchTerm, filterTipo, filterRisco]);

  const loadAtivos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterTipo) params.append('tipo', filterTipo);
      if (filterRisco) params.append('risco', filterRisco);
      
      const response = await fetch(`/api/admin/ativos-informacao?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setAtivos(data.ativos);
        
        // Calcular estatísticas
        const total = data.ativos.length;
        const acoes = data.ativos.filter((a: AtivoInformacao) => a.tipo === 'ACAO').length;
        const fiis = data.ativos.filter((a: AtivoInformacao) => a.tipo === 'FII').length;
        const etfs = data.ativos.filter((a: AtivoInformacao) => a.tipo === 'ETF').length;
        const qualidadeMedia = total > 0 ? 
          data.ativos.reduce((sum: number, a: AtivoInformacao) => sum + a.qualidade, 0) / total : 0;
        
        setStats({ total, acoes, fiis, etfs, qualidadeMedia });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao carregar ativos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAtivo = async () => {
    try {
      const response = await fetch('/api/admin/ativos-informacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ativos: [formData] 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Ativo criado com sucesso!');
        setShowCreateModal(false);
        resetForm();
        loadAtivos();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao criar ativo');
    }
  };

  const handleUpdateAtivo = async () => {
    if (!selectedAtivo) return;
    
    try {
      const response = await fetch('/api/admin/ativos-informacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedAtivo.id,
          ...formData 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Ativo atualizado com sucesso!');
        setShowEditModal(false);
        setSelectedAtivo(null);
        resetForm();
        loadAtivos();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao atualizar ativo');
    }
  };

  const handleDeleteAtivo = async (id: string, codigo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o ativo ${codigo}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/ativos-informacao?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Ativo excluído com sucesso!');
        loadAtivos();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao excluir ativo');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('arquivo', csvFile);
      
      // Processar CSV no frontend primeiro para preview
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const ativosFromCsv = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const ativo: any = {};
          headers.forEach((header, index) => {
            ativo[header] = values[index] || '';
          });
          return ativo;
        });
      
      // Enviar dados processados
      const response = await fetch('/api/admin/ativos-informacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativos: ativosFromCsv })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Upload concluído! ${data.processados} ativos processados.`);
        setShowUploadModal(false);
        setCsvFile(null);
        loadAtivos();
      } else {
        setError(data.error);
      }
      
    } catch (err) {
      setError('Erro no upload do CSV');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      setor: '',
      subsetor: '',
      tipo: 'ACAO',
      qualidade: 7,
      risco: 'MEDIO',
      recomendacao: 'NEUTRO',
      fundamentosResumo: '',
      pontosFortes: [''],
      pontosFracos: [''],
      observacoes: '',
      segmento: '',
      governanca: '',
      dividend_yield: null
    });
  };

  const openEditModal = (ativo: AtivoInformacao) => {
    setSelectedAtivo(ativo);
    setFormData({
      codigo: ativo.codigo,
      nome: ativo.nome,
      setor: ativo.setor,
      subsetor: ativo.subsetor || '',
      tipo: ativo.tipo,
      qualidade: ativo.qualidade,
      risco: ativo.risco,
      recomendacao: ativo.recomendacao,
      fundamentosResumo: ativo.fundamentosResumo || '',
      pontosFortes: ativo.pontosFortes || [''],
      pontosFracos: ativo.pontosFracos || [''],
      observacoes: ativo.observacoes || '',
      segmento: ativo.segmento || '',
      governanca: ativo.governanca || '',
      dividend_yield: ativo.dividend_yield
    });
    setShowEditModal(true);
  };

  const exportCsvTemplate = () => {
    const csvContent = [
      'codigo,nome,setor,tipo,qualidade,risco,recomendacao,fundamentosResumo',
      'ITUB4,Itaú Unibanco,Bancário,ACAO,8,MEDIO,MANTER,Banco sólido com boa governança',
      'PETR4,Petrobras,Petróleo,ACAO,6,ALTO,NEUTRO,Empresa estatal com riscos políticos'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_ativos.csv';
    a.click();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Carregando banco de dados...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Banco de Dados de Ativos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as informações pré-definidas dos ativos para análise automática
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.acoes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ações
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.fiis}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                FIIs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.etfs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ETFs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {stats.qualidadeMedia.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Qualidade Média
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Gerenciar Ativos</Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={exportCsvTemplate}
                size="small"
              >
                Template CSV
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setShowUploadModal(true)}
                size="small"
              >
                Upload CSV
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowCreateModal(true)}
              >
                Novo Ativo
              </Button>
              
              <IconButton onClick={loadAtivos}>
                <Refresh />
              </IconButton>
            </Stack>
          </Box>
          
          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por código, nome ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ACAO">Ações</MenuItem>
                  <MenuItem value="FII">FIIs</MenuItem>
                  <MenuItem value="ETF">ETFs</MenuItem>
                  <MenuItem value="OUTRO">Outros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Risco</InputLabel>
                <Select
                  value={filterRisco}
                  onChange={(e) => setFilterRisco(e.target.value)}
                  label="Risco"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="BAIXO">Baixo</MenuItem>
                  <MenuItem value="MEDIO">Médio</MenuItem>
                  <MenuItem value="ALTO">Alto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Ativos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Qualidade</TableCell>
              <TableCell>Risco</TableCell>
              <TableCell>Recomendação</TableCell>
              <TableCell>Última Revisão</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ativos.map((ativo) => (
              <TableRow key={ativo.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {ativo.codigo}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {ativo.nome}
                  </Typography>
                  {ativo.subsetor && (
                    <Typography variant="caption" color="text.secondary">
                      {ativo.subsetor}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {ativo.setor}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={ativo.tipo} 
                    size="small"
                    color={
                      ativo.tipo === 'ACAO' ? 'primary' :
                      ativo.tipo === 'FII' ? 'secondary' :
                      ativo.tipo === 'ETF' ? 'info' : 'default'
                    }
                  />
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={ativo.qualidade / 2} readOnly size="small" />
                    <Typography variant="caption">
                      {ativo.qualidade}/10
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={ativo.risco}
                    size="small"
                    sx={{ 
                      bgcolor: riscoColors[ativo.risco as keyof typeof riscoColors],
                      color: 'white'
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={ativo.recomendacao}
                    size="small"
                    sx={{ 
                      bgcolor: recomendacaoColors[ativo.recomendacao as keyof typeof recomendacaoColors],
                      color: 'white'
                    }}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="caption">
                    {new Date(ativo.ultimaRevisao).toLocaleDateString('pt-BR')}
                  </Typography>
                </TableCell>
                
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small"
                        onClick={() => openEditModal(ativo)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteAtivo(ativo.id, ativo.codigo)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Criar/Editar Ativo */}
      <Dialog 
        open={showCreateModal || showEditModal} 
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {showCreateModal ? 'Criar Novo Ativo' : 'Editar Ativo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código do Ativo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  codigo: e.target.value.toUpperCase()
                }))}
                fullWidth
                placeholder="Ex: ITUB4"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome da Empresa"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  nome: e.target.value
                }))}
                fullWidth
                placeholder="Ex: Itaú Unibanco"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Setor"
                value={formData.setor}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  setor: e.target.value
                }))}
                fullWidth
                placeholder="Ex: Bancário"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subsetor"
                value={formData.subsetor}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  subsetor: e.target.value
                }))}
                fullWidth
                placeholder="Ex: Bancos Múltiplos"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    tipo: e.target.value
                  }))}
                  label="Tipo"
                >
                  <MenuItem value="ACAO">Ação</MenuItem>
                  <MenuItem value="FII">FII</MenuItem>
                  <MenuItem value="ETF">ETF</MenuItem>
                  <MenuItem value="OUTRO">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Risco</InputLabel>
                <Select
                  value={formData.risco}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    risco: e.target.value
                  }))}
                  label="Risco"
                >
                  <MenuItem value="BAIXO">Baixo</MenuItem>
                  <MenuItem value="MEDIO">Médio</MenuItem>
                  <MenuItem value="ALTO">Alto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Recomendação</InputLabel>
                <Select
                  value={formData.recomendacao}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    recomendacao: e.target.value
                  }))}
                  label="Recomendação"
                >
                  <MenuItem value="COMPRA">Compra</MenuItem>
                  <MenuItem value="MANTER">Manter</MenuItem>
                  <MenuItem value="NEUTRO">Neutro</MenuItem>
                  <MenuItem value="VENDA">Venda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Qualidade (0-10)"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={formData.qualidade}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  qualidade: Number(e.target.value)
                }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dividend Yield (%)"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={formData.dividend_yield || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  dividend_yield: e.target.value ? Number(e.target.value) : null
                }))}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Resumo dos Fundamentos"
                value={formData.fundamentosResumo}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  fundamentosResumo: e.target.value
                }))}
                fullWidth
                multiline
                rows={3}
                placeholder="Breve resumo da situação fundamental da empresa..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Observações Gerais"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  observacoes: e.target.value
                }))}
                fullWidth
                multiline
                rows={2}
                placeholder="Observações adicionais sobre o ativo..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={showCreateModal ? handleCreateAtivo : handleUpdateAtivo}
            variant="contained"
          >
            {showCreateModal ? 'Criar Ativo' : 'Atualizar Ativo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Upload CSV */}
      <Dialog 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload de Ativos via CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Use o template CSV para garantir o formato correto. Os dados serão atualizados se o código já existir.
            </Alert>
            
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              style={{ marginBottom: '16px' }}
            />
            
            {csvFile && (
              <Typography variant="body2" color="text.secondary">
                Arquivo selecionado: {csvFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button onClick={exportCsvTemplate} variant="outlined">
            Download Template
          </Button>
          <Button 
            onClick={handleCsvUpload}
            variant="contained"
            disabled={!csvFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
          >
            {uploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}