'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Divider
} from '@mui/material';

// Ícones simples seguindo o padrão
const ArrowLeftIcon = () => <span style={{ fontSize: '16px' }}>←</span>;
const UploadIcon = () => <span style={{ fontSize: '16px' }}>📤</span>;
const DownloadIcon = () => <span style={{ fontSize: '16px' }}>📥</span>;
const DeleteIcon = () => <span style={{ fontSize: '16px' }}>🗑</span>;
const EditIcon = () => <span style={{ fontSize: '16px' }}>✏️</span>;
const SaveIcon = () => <span style={{ fontSize: '16px' }}>💾</span>;
const AddIcon = () => <span style={{ fontSize: '16px' }}>➕</span>;
const FileIcon = () => <span style={{ fontSize: '16px' }}>📄</span>;
const CloudUploadIcon = () => <span style={{ fontSize: '16px' }}>☁️</span>;
const BackupIcon = () => <span style={{ fontSize: '16px' }}>💿</span>;
const RestoreIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;
const CheckIcon = () => <span style={{ fontSize: '16px' }}>✅</span>;
const DatabaseIcon = () => <span style={{ fontSize: '16px' }}>🗃️</span>;

// Importar sistema IndexedDB real
import { useRelatoriosDB } from '../../../utils/relatoriosDB';

interface RelatorioAdmin {
  id: string;
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  dataUpload: string;
  linkCanva?: string;
  linkExterno?: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  tipoPdf?: 'base64' | 'referencia';
  hashArquivo?: string;
  solicitarReupload?: boolean;
}

interface NovoRelatorio {
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  linkCanva: string;
  linkExterno: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  arquivoPdf: File | null;
}

const LIMITE_BASE64 = 3 * 1024 * 1024; // 3MB
const TICKERS_DISPONIVEIS = [
  'KEPL3', 'AGRO3', 'LEVE3', 'BBAS3', 'BRSR6', 'ABCB4', 'SANB11',
  'TASA4', 'ROMI3', 'EZTC3', 'EVEN3', 'TRIS3', 'FESA4', 'CEAB3'
];

const calcularHash = async (arquivo: File): Promise<string> => {
  const arrayBuffer = await arquivo.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const converterParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
};

const processarPdfHibrido = async (arquivo: File): Promise<any> => {
  if (arquivo.size <= LIMITE_BASE64) {
    const base64 = await converterParaBase64(arquivo);
    return {
      arquivoPdf: base64,
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      tipoPdf: 'base64'
    };
  } else {
    const hash = await calcularHash(arquivo);
    return {
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      hashArquivo: hash,
      tipoPdf: 'referencia',
      solicitarReupload: true
    };
  }
};

export default function CentralRelatorios() {
  const router = useRouter();
  
  // Usar o hook do IndexedDB
  const { 
    loading: dbLoading, 
    error: dbError, 
    salvarRelatorios, 
    carregarRelatorios, 
    exportarBackup, 
    importarBackup 
  } = useRelatoriosDB();

  const [relatorios, setRelatorios] = useState<RelatorioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogBackup, setDialogBackup] = useState(false);
  const [migracaoFeita, setMigracaoFeita] = useState(false);
  
  const [uploadsLote, setUploadsLote] = useState<NovoRelatorio[]>([]);
  
  const [novoRelatorio, setNovoRelatorio] = useState<NovoRelatorio>({
    ticker: '',
    nome: '',
    tipo: 'trimestral',
    dataReferencia: '',
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe',
    arquivoPdf: null
  });

  // Carregar dados na inicialização
  useEffect(() => {
    inicializarDados();
  }, []);

  const inicializarDados = useCallback(async () => {
    try {
      // Verificar se existe dados no localStorage para migrar
      const dadosLocalStorage = localStorage.getItem('relatorios_central');
      if (dadosLocalStorage && !migracaoFeita) {
        const confirmarMigracao = window.confirm(
          '🔄 Detectamos dados no localStorage.\n\n' +
          'Deseja migrar para o novo sistema IndexedDB?\n' +
          '(Recomendado para melhor performance e capacidade)'
        );
        
        if (confirmarMigracao) {
          await migrarDados(dadosLocalStorage);
        }
        setMigracaoFeita(true);
      }
      
      // Carregar dados do IndexedDB
      const dadosCarregados = await carregarRelatorios();
      setRelatorios(dadosCarregados);
      
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    }
  }, [carregarRelatorios, migracaoFeita]);

  const migrarDados = useCallback(async (dadosLocalStorage: string) => {
    try {
      setLoading(true);
      
      // Converter estrutura localStorage para lista flat
      const dados = JSON.parse(dadosLocalStorage);
      const listaRelatorios: RelatorioAdmin[] = [];
      
      Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
        relatoriosTicker.forEach(relatorio => {
          listaRelatorios.push({
            ...relatorio,
            ticker
          });
        });
      });
      
      // Salvar no IndexedDB
      const sucesso = await salvarRelatorios(listaRelatorios);
      
      if (sucesso) {
        // Fazer backup do localStorage
        const blob = new Blob([dadosLocalStorage], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_localStorage_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Remover do localStorage
        localStorage.removeItem('relatorios_central');
        
        alert('✅ Migração concluída!\nBackup do localStorage foi baixado automaticamente.');
      }
      
    } catch (error) {
      console.error('Erro na migração:', error);
      alert('❌ Erro na migração. Dados preservados no localStorage.');
    } finally {
      setLoading(false);
    }
  }, [salvarRelatorios]);

  const salvarDadosCentralizados = useCallback(async (novaLista: RelatorioAdmin[]) => {
    const sucesso = await salvarRelatorios(novaLista);
    if (sucesso) {
      setRelatorios(novaLista);
    } else {
      alert('❌ Erro ao salvar dados. Tente novamente.');
    }
  }, [salvarRelatorios]);

  const salvarRelatorioIndividual = useCallback(async () => {
    if (!novoRelatorio.ticker || !novoRelatorio.nome) {
      alert('Preencha ticker e nome do relatório');
      return;
    }

    try {
      setLoading(true);
      
      let dadosPdf = {};
      if (novoRelatorio.arquivoPdf) {
        dadosPdf = await processarPdfHibrido(novoRelatorio.arquivoPdf);
      }

      const novoId = `${novoRelatorio.ticker}_${Date.now()}`;
      const relatorioCompleto: RelatorioAdmin = {
        id: novoId,
        ticker: novoRelatorio.ticker,
        nome: novoRelatorio.nome,
        tipo: novoRelatorio.tipo,
        dataReferencia: novoRelatorio.dataReferencia,
        dataUpload: new Date().toISOString(),
        linkCanva: novoRelatorio.linkCanva || undefined,
        linkExterno: novoRelatorio.linkExterno || undefined,
        tipoVisualizacao: novoRelatorio.tipoVisualizacao,
        ...dadosPdf
      };

      const novaLista = [...relatorios, relatorioCompleto];
      await salvarDadosCentralizados(novaLista);
      
      setNovoRelatorio({
        ticker: '',
        nome: '',
        tipo: 'trimestral',
        dataReferencia: '',
        linkCanva: '',
        linkExterno: '',
        tipoVisualizacao: 'iframe',
        arquivoPdf: null
      });
      
      setDialogAberto(false);
      
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      alert('Erro ao processar relatório');
    } finally {
      setLoading(false);
    }
  }, [novoRelatorio, relatorios, salvarDadosCentralizados]);

  const excluirRelatorio = useCallback((id: string) => {
    if (confirm('Excluir este relatório?')) {
      const novaLista = relatorios.filter(r => r.id !== id);
      salvarDadosCentralizados(novaLista);
    }
  }, [relatorios, salvarDadosCentralizados]);

  const exportarDados = useCallback(async () => {
    const dados = await exportarBackup();
    if (!dados) {
      alert('Nenhum dado para exportar');
      return;
    }

    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorios_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportarBackup]);

  const importarDados = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dados = e.target?.result as string;
        const sucesso = await importarBackup(dados);
        
        if (sucesso) {
          const dadosCarregados = await carregarRelatorios();
          setRelatorios(dadosCarregados);
          alert('✅ Dados importados com sucesso!');
          setDialogBackup(false);
        }
      } catch (error) {
        alert('❌ Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importarBackup, carregarRelatorios]);

  const estatisticas = useMemo(() => {
    const totalRelatorios = relatorios.length;
    const relatoriosPorTicker = Object.groupBy?.(relatorios, r => r.ticker) || {};
    const tickersComRelatorios = Object.keys(relatoriosPorTicker).length;
    
    const relatoriosComPdf = relatorios.filter(r => r.arquivoPdf || r.nomeArquivoPdf).length;
    const tamanhoTotal = relatorios.reduce((sum, r) => sum + (r.tamanhoArquivo || 0), 0);
    
    return {
      totalRelatorios,
      tickersComRelatorios,
      relatoriosComPdf,
      tamanhoTotalMB: (tamanhoTotal / 1024 / 1024).toFixed(1)
    };
  }, [relatorios]);

  const isCarregando = loading || dbLoading;

  return (
    <Box sx={{ 
      p: 4, 
      maxWidth: 1400, 
      mx: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header com botão voltar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button 
          onClick={() => router.back()} 
          startIcon={<ArrowLeftIcon />} 
          sx={{
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '8px 16px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f1f5f9',
              borderColor: '#cbd5e1'
            }
          }}
        >
          Voltar
        </Button>
      </Stack>

      {/* Card principal com título e estatísticas */}
      <Card sx={{ 
        mb: 4, 
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box mb={3}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                mb: 1,
                fontSize: '2rem'
              }}
            >
              🗃️ Central de Relatórios (IndexedDB)
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b', 
                fontWeight: 400,
                fontSize: '1.125rem'
              }}
            >
              Sistema aprimorado com IndexedDB - Sem limitações de espaço
            </Typography>
            {dbError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2'
                }}
              >
                ⚠️ {dbError}
              </Alert>
            )}
          </Box>

          {/* Estatísticas */}
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#3b82f6',
                    mb: 0.5
                  }}
                >
                  {estatisticas.totalRelatorios}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Total de Relatórios
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#22c55e',
                    mb: 0.5
                  }}
                >
                  {estatisticas.tickersComRelatorios}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Tickers com Relatórios
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#f59e0b',
                    mb: 0.5
                  }}
                >
                  {estatisticas.relatoriosComPdf}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Relatórios com PDF
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#8b5cf6',
                    mb: 0.5
                  }}
                >
                  {estatisticas.tamanhoTotalMB}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  MB Armazenados
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Button 
            fullWidth 
            onClick={() => setDialogAberto(true)} 
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            Novo Relatório
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button 
            fullWidth 
            onClick={() => setDialogBackup(true)} 
            startIcon={<BackupIcon />}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Backup/Restore
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button 
            fullWidth 
            onClick={inicializarDados} 
            startIcon={<RestoreIcon />}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Atualizar
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ 
        mb: 4,
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}>
        <Tabs 
          value={tabAtiva} 
          onChange={(_, newValue) => setTabAtiva(newValue)}
          sx={{
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#3b82f6',
                backgroundColor: '#f0f9ff'
              }
            }
          }}
        >
          <Tab label="📋 Lista de Relatórios" />
          <Tab label="📤 Upload em Lote" />
        </Tabs>

        {/* Loading indicator */}
        {isCarregando && (
          <LinearProgress 
            sx={{
              height: 2,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3b82f6'
              }
            }}
          />
        )}

        {/* Tab 0: Lista de Relatórios */}
        {tabAtiva === 0 && (
          <CardContent sx={{ p: 4 }}>
            {relatorios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <DatabaseIcon />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1e293b', 
                    fontWeight: 600, 
                    mb: 1, 
                    mt: 2 
                  }}
                >
                  🗃️ Nenhum relatório cadastrado
                </Typography>
                <Typography 
                  sx={{ 
                    color: '#64748b', 
                    mb: 4,
                    fontSize: '0.95rem'
                  }}
                >
                  Comece adicionando um novo relatório no sistema IndexedDB
                </Typography>
                <Button
                  onClick={() => setDialogAberto(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }
                  }}
                >
                  Adicionar Primeiro Relatório
                </Button>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Ticker</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Referência</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Visualização</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>PDF</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.map((relatorio) => (
                      <TableRow 
                        key={relatorio.id} 
                        sx={{ 
                          '&:hover': { backgroundColor: '#f8fafc' },
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={relatorio.ticker} 
                            size="small" 
                            sx={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontWeight: 500,
                              borderRadius: '8px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {relatorio.nome}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={relatorio.tipo} 
                            size="small" 
                            variant="outlined"
                            sx={{
                              borderColor: '#e2e8f0',
                              color: '#64748b',
                              borderRadius: '8px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#64748b' }}>
                          {relatorio.dataReferencia}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {relatorio.tipoVisualizacao === 'canva' && '🎨'}
                            {relatorio.tipoVisualizacao === 'iframe' && '🖼️'}
                            {relatorio.tipoVisualizacao === 'link' && '🔗'}
                            {relatorio.tipoVisualizacao === 'pdf' && '📄'}
                            <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {relatorio.tipoVisualizacao}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {relatorio.nomeArquivoPdf ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`${(relatorio.tamanhoArquivo! / 1024 / 1024).toFixed(1)}MB`}
                                size="small"
                                sx={{
                                  backgroundColor: relatorio.tipoPdf === 'base64' ? '#dcfce7' : '#fef3c7',
                                  color: relatorio.tipoPdf === 'base64' ? '#166534' : '#92400e',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem'
                                }}
                              />
                              {relatorio.tipoPdf === 'referencia' && (
                                <span style={{ fontSize: '14px' }}>⚠️</span>
                              )}
                            </Box>
                          ) : (
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                              Sem PDF
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => excluirRelatorio(relatorio.id)}
                            sx={{
                              color: '#dc2626',
                              '&:hover': {
                                backgroundColor: '#fef2f2'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}

        {/* Tab 1: Upload em Lote */}
        {tabAtiva === 1 && (
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ color: '#3b82f6', mb: 2, fontSize: '3rem' }}>
                <DatabaseIcon />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1e293b', 
                  fontWeight: 600, 
                  mb: 1 
                }}
              >
                Sistema IndexedDB Ativo
              </Typography>
              <Typography 
                sx={{ 
                  color: '#64748b', 
                  mb: 4,
                  fontSize: '0.95rem',
                  maxWidth: '500px',
                  mx: 'auto'
                }}
              >
                • Capacidade muito maior que localStorage<br/>
                • Performance aprimorada para grandes volumes<br/>
                • Suporte a transações e consultas avançadas<br/>
                • Sistema híbrido Base64/Referência funcional
              </Typography>
              <Button
                onClick={() => setDialogAberto(true)}
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }
                }}
              >
                Começar com Novo Relatório
              </Button>
            </Box>
          </CardContent>
        )}
      </Card>

      {/* Dialog - Novo Relatório Individual */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => !isCarregando && setDialogAberto(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          ➕ Adicionar Novo Relatório
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ticker *</InputLabel>
                <Select
                  value={novoRelatorio.ticker}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  {TICKERS_DISPONIVEIS.map(ticker => (
                    <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Relatório *"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="outros">Outros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Referência"
                value={novoRelatorio.dataReferencia}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, dataReferencia: e.target.value }))}
                placeholder="Q1 2024"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Visualização</InputLabel>
                <Select
                  value={novoRelatorio.tipoVisualizacao}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipoVisualizacao: e.target.value as any }))}
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  <MenuItem value="iframe">🖼️ Iframe Genérico</MenuItem>
                  <MenuItem value="canva">🎨 Canva</MenuItem>
                  <MenuItem value="link">🔗 Link Externo</MenuItem>
                  <MenuItem value="pdf">📄 PDF para Download</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {novoRelatorio.tipoVisualizacao === 'canva' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link do Canva"
                  value={novoRelatorio.linkCanva}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkCanva: e.target.value }))}
                  placeholder="https://www.canva.com/design/..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
            )}
            
            {(novoRelatorio.tipoVisualizacao === 'iframe' || novoRelatorio.tipoVisualizacao === 'link') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link Externo"
                  value={novoRelatorio.linkExterno}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkExterno: e.target.value }))}
                  placeholder="https://..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b',
                  fontSize: '1rem'
                }}
              >
                📄 Upload de PDF (Sistema Híbrido IndexedDB)
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  border: '1px solid #dbeafe',
                  backgroundColor: '#f0f9ff'
                }}
              >
                <Typography sx={{ fontSize: '0.875rem' }}>
                  <strong>🗃️ Sistema IndexedDB:</strong><br/>
                  • <strong>≤3MB:</strong> Base64 (acesso instantâneo)<br/>
                  • <strong>&gt;3MB:</strong> Referência (re-upload quando necessário)<br/>
                  • <strong>Vantagem:</strong> Muito mais espaço disponível que localStorage
                </Typography>
              </Alert>
              
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="upload-pdf-individual"
                type="file"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) {
                    if (arquivo.size > 10 * 1024 * 1024) {
                      alert('Arquivo muito grande! Máximo 10MB.');
                      e.target.value = '';
                      return;
                    }
                    setNovoRelatorio(prev => ({ ...prev, arquivoPdf: arquivo }));
                  }
                }}
              />
              <label htmlFor="upload-pdf-individual">
                <Button
                  component="span"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    color: novoRelatorio.arquivoPdf ? '#16a34a' : '#64748b',
                    backgroundColor: novoRelatorio.arquivoPdf ? '#f0fdf4' : '#f8fafc',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#94a3b8'
                    }
                  }}
                >
                  {novoRelatorio.arquivoPdf ? '✅ PDF Selecionado' : '📁 Selecionar PDF'}
                </Button>
              </label>
              
              {novoRelatorio.arquivoPdf && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mt: 2,
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4'
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                    <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>💾 Estratégia:</strong> {novoRelatorio.arquivoPdf.size <= LIMITE_BASE64 ? 'Base64 (Instantâneo)' : 'Referência (Re-upload)'}
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogAberto(false)}
            disabled={isCarregando}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={salvarRelatorioIndividual}
            disabled={!novoRelatorio.ticker || !novoRelatorio.nome || isCarregando}
            startIcon={isCarregando ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:disabled': {
                backgroundColor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {isCarregando ? 'Salvando...' : 'Salvar Relatório'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Backup/Restore */}
      <Dialog 
        open={dialogBackup} 
        onClose={() => setDialogBackup(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          💿 Backup & Restore (IndexedDB)
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert 
              severity="info" 
              sx={{
                borderRadius: '12px',
                border: '1px solid #dbeafe',
                backgroundColor: '#f0f9ff'
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>
                <strong>💡 Sistema IndexedDB:</strong><br/>
                • Backup inclui dados binários (PDFs em Base64)<br/>
                • Compatível com formato localStorage anterior<br/>
                • Restauração automática de estruturas
              </Typography>
            </Alert>
            
            <Box>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b' 
                }}
              >
                📤 Exportar Dados
              </Typography>
              <Button
                fullWidth
                onClick={exportarDados}
                startIcon={<DownloadIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }
                }}
              >
                Baixar Backup Completo
              </Button>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1e293b' 
                }}
              >
                📥 Importar Dados
              </Typography>
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-backup"
                type="file"
                onChange={importarDados}
              />
              <label htmlFor="import-backup">
                <Button
                  component="span"
                  fullWidth
                  startIcon={<RestoreIcon />}
                  sx={{
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  Restaurar do Backup
                </Button>
              </label>
            </Box>
            
            <Alert 
              severity="warning" 
              sx={{
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                backgroundColor: '#fffbeb'
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>
                <strong>⚠️ Atenção:</strong> Importar dados irá <strong>substituir</strong> todos os relatórios existentes no IndexedDB!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogBackup(false)}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Global */}
      {isCarregando && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress 
            sx={{
              height: 3,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3b82f6'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}