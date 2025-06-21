'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';

// ========================================
// ÍCONES MOCK
// ========================================
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const EditIcon = () => <span>✏️</span>;
const SaveIcon = () => <span>💾</span>;
const AddIcon = () => <span>➕</span>;
const FileIcon = () => <span>📄</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const BackupIcon = () => <span>💿</span>;
const RestoreIcon = () => <span>🔄</span>;

// ========================================
// INTERFACES E TIPOS
// ========================================
export interface RelatorioAdmin {
  id: string;
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  dataUpload: string;
  linkCanva?: string;
  linkExterno?: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  // PDF System (Híbrido)
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

// ========================================
// CONSTANTES
// ========================================
const LIMITE_BASE64 = 3 * 1024 * 1024; // 3MB
const TICKERS_DISPONIVEIS = [
  'KEPL3', 'AGRO3', 'LEVE3', 'BBAS3', 'BRSR6', 'ABCB4', 'SANB11',
  'TASA4', 'ROMI3', 'EZTC3', 'EVEN3', 'TRIS3', 'FESA4', 'CEAB3',
  'CSED3', 'YDUQ3', 'ALUP11', 'NEOE3', 'EGIE3', 'ELET3', 'ISAE4',
  'CPLE6', 'BBSE3', 'B3SA3', 'TUPY3', 'RAPT4', 'SHUL4', 'SIMH3',
  'LOGG3', 'VALE3', 'CGRA4', 'RSUL4', 'DEXP3', 'RANI3', 'KLBN11',
  'RECV3', 'PRIO3', 'PETR4', 'UNIP6', 'SAPR4', 'CSMG3', 'FLRY3',
  'ODPV3', 'WIZC3', 'SMTO3', 'JALL3', 'POSI3', 'VIVT3', 'ALOS3'
];

// ========================================
// FUNÇÕES UTILITÁRIAS - SISTEMA HÍBRIDO PDF
// ========================================
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
    // PDF pequeno: salvar em Base64
    const base64 = await converterParaBase64(arquivo);
    return {
      arquivoPdf: base64,
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      tipoPdf: 'base64'
    };
  } else {
    // PDF grande: salvar referência
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function CentralRelatorios() {
  const [relatorios, setRelatorios] = useState<RelatorioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogBackup, setDialogBackup] = useState(false);
  
  // Estados para upload em lote
  const [uploadsLote, setUploadsLote] = useState<NovoRelatorio[]>([]);
  
  // Estados para upload individual
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

  // ========================================
  // CARREGAMENTO DE DADOS
  // ========================================
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = useCallback(() => {
    try {
      const dadosCentralizados = localStorage.getItem('relatorios_central');
      if (dadosCentralizados) {
        const dados = JSON.parse(dadosCentralizados);
        
        // Converter estrutura para lista flat
        const listaRelatorios: RelatorioAdmin[] = [];
        Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
          relatoriosTicker.forEach(relatorio => {
            listaRelatorios.push({
              ...relatorio,
              ticker
            });
          });
        });
        
        setRelatorios(listaRelatorios);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  }, []);

  // ========================================
  // SALVAR DADOS CENTRALIZADOS
  // ========================================
  const salvarDadosCentralizados = useCallback((novaLista: RelatorioAdmin[]) => {
    try {
      // Converter lista flat para estrutura por ticker
      const dadosEstruturados: { [ticker: string]: any[] } = {};
      
      novaLista.forEach(relatorio => {
        if (!dadosEstruturados[relatorio.ticker]) {
          dadosEstruturados[relatorio.ticker] = [];
        }
        
        const { ticker, ...relatorioSemTicker } = relatorio;
        dadosEstruturados[relatorio.ticker].push(relatorioSemTicker);
      });
      
      localStorage.setItem('relatorios_central', JSON.stringify(dadosEstruturados));
      setRelatorios(novaLista);
      
    } catch (error) {
      console.error('Erro ao salvar relatórios:', error);
      alert('Erro ao salvar dados. Verifique o espaço disponível.');
    }
  }, []);

  // ========================================
  // UPLOAD INDIVIDUAL
  // ========================================
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
      salvarDadosCentralizados(novaLista);
      
      // Reset form
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

  // ========================================
  // UPLOAD EM LOTE
  // ========================================
  const adicionarLinhaLote = useCallback(() => {
    setUploadsLote(prev => [...prev, {
      ticker: '',
      nome: '',
      tipo: 'trimestral',
      dataReferencia: '',
      linkCanva: '',
      linkExterno: '',
      tipoVisualizacao: 'iframe',
      arquivoPdf: null
    }]);
  }, []);

  const atualizarLinhaLote = useCallback((index: number, campo: keyof NovoRelatorio, valor: any) => {
    setUploadsLote(prev => {
      const nova = [...prev];
      nova[index] = { ...nova[index], [campo]: valor };
      return nova;
    });
  }, []);

  const removerLinhaLote = useCallback((index: number) => {
    setUploadsLote(prev => prev.filter((_, i) => i !== index));
  }, []);

  const salvarLoteCompleto = useCallback(async () => {
    const linhasValidas = uploadsLote.filter(upload => upload.ticker && upload.nome);
    
    if (linhasValidas.length === 0) {
      alert('Adicione pelo menos um relatório válido (ticker + nome)');
      return;
    }

    try {
      setLoading(true);
      const novosRelatorios: RelatorioAdmin[] = [];

      for (const upload of linhasValidas) {
        let dadosPdf = {};
        if (upload.arquivoPdf) {
          dadosPdf = await processarPdfHibrido(upload.arquivoPdf);
        }

        const novoId = `${upload.ticker}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        novosRelatorios.push({
          id: novoId,
          ticker: upload.ticker,
          nome: upload.nome,
          tipo: upload.tipo,
          dataReferencia: upload.dataReferencia,
          dataUpload: new Date().toISOString(),
          linkCanva: upload.linkCanva || undefined,
          linkExterno: upload.linkExterno || undefined,
          tipoVisualizacao: upload.tipoVisualizacao,
          ...dadosPdf
        });
      }

      const novaLista = [...relatorios, ...novosRelatorios];
      salvarDadosCentralizados(novaLista);
      
      setUploadsLote([]);
      alert(`✅ ${novosRelatorios.length} relatórios salvos com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      alert('Erro ao processar lote de relatórios');
    } finally {
      setLoading(false);
    }
  }, [uploadsLote, relatorios, salvarDadosCentralizados]);

  // ========================================
  // OUTRAS FUNÇÕES
  // ========================================
  const excluirRelatorio = useCallback((id: string) => {
    if (confirm('Excluir este relatório?')) {
      const novaLista = relatorios.filter(r => r.id !== id);
      salvarDadosCentralizados(novaLista);
    }
  }, [relatorios, salvarDadosCentralizados]);

  const exportarDados = useCallback(() => {
    const dados = localStorage.getItem('relatorios_central');
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
  }, []);

  const importarDados = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string);
        localStorage.setItem('relatorios_central', JSON.stringify(dados));
        carregarDados();
        alert('✅ Dados importados com sucesso!');
        setDialogBackup(false);
      } catch (error) {
        alert('❌ Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [carregarDados]);

  // ========================================
  // ESTATÍSTICAS
  // ========================================
  const estatisticas = useMemo(() => {
    const totalRelatorios = relatorios.length;
    const relatoriosPorTicker = Object.groupBy(relatorios, r => r.ticker);
    const tickersComRelatorios = Object.keys(relatoriosPorTicker || {}).length;
    
    const relatoriosComPdf = relatorios.filter(r => r.arquivoPdf || r.nomeArquivoPdf).length;
    const tamanhoTotal = relatorios.reduce((sum, r) => sum + (r.tamanhoArquivo || 0), 0);
    
    return {
      totalRelatorios,
      tickersComRelatorios,
      relatoriosComPdf,
      tamanhoTotalMB: (tamanhoTotal / 1024 / 1024).toFixed(1)
    };
  }, [relatorios]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📋 Central de Relatórios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie relatórios de todas as empresas em um só lugar
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={() => setDialogBackup(true)}
          >
            Backup/Restore
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogAberto(true)}
          >
            Novo Relatório
          </Button>
        </Stack>
      </Stack>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                {estatisticas.totalRelatorios}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Relatórios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e', mb: 1 }}>
                {estatisticas.tickersComRelatorios}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tickers com Relatórios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                {estatisticas.relatoriosComPdf}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Relatórios com PDF
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 1 }}>
                {estatisticas.tamanhoTotalMB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MB Armazenados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs value={tabAtiva} onChange={(_, newValue) => setTabAtiva(newValue)}>
          <Tab label="📋 Lista de Relatórios" />
          <Tab label="📤 Upload em Lote" />
        </Tabs>
        <Divider />

        {/* Tab 0: Lista de Relatórios */}
        {tabAtiva === 0 && (
          <CardContent>
            {relatorios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  📭 Nenhum relatório cadastrado
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                  Comece adicionando um novo relatório
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogAberto(true)}
                >
                  Adicionar Primeiro Relatório
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Referência</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Visualização</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>PDF</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.map((relatorio) => (
                      <TableRow key={relatorio.id}>
                        <TableCell>
                          <Chip 
                            label={relatorio.ticker} 
                            size="small" 
                            color="primary"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {relatorio.nome}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={relatorio.tipo} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{relatorio.dataReferencia}</TableCell>
                        <TableCell>
                          {relatorio.tipoVisualizacao === 'canva' && '🎨'}
                          {relatorio.tipoVisualizacao === 'iframe' && '🖼️'}
                          {relatorio.tipoVisualizacao === 'link' && '🔗'}
                          {relatorio.tipoVisualizacao === 'pdf' && '📄'}
                          {' '}
                          {relatorio.tipoVisualizacao}
                        </TableCell>
                        <TableCell>
                          {relatorio.nomeArquivoPdf ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${(relatorio.tamanhoArquivo! / 1024 / 1024).toFixed(1)}MB`}
                                size="small"
                                color={relatorio.tipoPdf === 'base64' ? 'success' : 'warning'}
                              />
                              {relatorio.tipoPdf === 'referencia' && '⚠️'}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sem PDF
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => excluirRelatorio(relatorio.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
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
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                📤 Upload em Lote
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={adicionarLinhaLote}
                >
                  Adicionar Linha
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={salvarLoteCompleto}
                  disabled={uploadsLote.length === 0 || loading}
                >
                  {loading ? 'Processando...' : `Salvar ${uploadsLote.length} Relatórios`}
                </Button>
              </Stack>
            </Stack>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {uploadsLote.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>📝 Upload em Lote:</strong><br/>
                  • Clique em "Adicionar Linha" para começar<br/>
                  • Preencha ticker, nome e outros dados<br/>
                  • Faça upload de PDFs (sistema híbrido automático)<br/>
                  • Salve tudo de uma vez
                </Typography>
              </Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker *</TableCell>
                      <TableCell>Nome *</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Referência</TableCell>
                      <TableCell>Visualização</TableCell>
                      <TableCell>Link</TableCell>
                      <TableCell>PDF</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadsLote.map((upload, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={upload.ticker}
                              onChange={(e) => atualizarLinhaLote(index, 'ticker', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">Selecione...</MenuItem>
                              {TICKERS_DISPONIVEIS.map(ticker => (
                                <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={upload.nome}
                            onChange={(e) => atualizarLinhaLote(index, 'nome', e.target.value)}
                            placeholder="Nome do relatório"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={upload.tipo}
                              onChange={(e) => atualizarLinhaLote(index, 'tipo', e.target.value)}
                            >
                              <MenuItem value="trimestral">Trimestral</MenuItem>
                              <MenuItem value="anual">Anual</MenuItem>
                              <MenuItem value="apresentacao">Apresentação</MenuItem>
                              <MenuItem value="outros">Outros</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={upload.dataReferencia}
                            onChange={(e) => atualizarLinhaLote(index, 'dataReferencia', e.target.value)}
                            placeholder="Q1 2024"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={upload.tipoVisualizacao}
                              onChange={(e) => atualizarLinhaLote(index, 'tipoVisualizacao', e.target.value)}
                            >
                              <MenuItem value="iframe">🖼️ Iframe</MenuItem>
                              <MenuItem value="canva">🎨 Canva</MenuItem>
                              <MenuItem value="link">🔗 Link</MenuItem>
                              <MenuItem value="pdf">📄 PDF</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={
                              upload.tipoVisualizacao === 'canva' 
                                ? upload.linkCanva 
                                : upload.linkExterno
                            }
                            onChange={(e) => {
                              const campo = upload.tipoVisualizacao === 'canva' ? 'linkCanva' : 'linkExterno';
                              atualizarLinhaLote(index, campo, e.target.value);
                            }}
                            placeholder="https://..."
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            id={`upload-pdf-${index}`}
                            onChange={(e) => {
                              const arquivo = e.target.files?.[0];
                              if (arquivo) {
                                atualizarLinhaLote(index, 'arquivoPdf', arquivo);
                              }
                            }}
                          />
                          <label htmlFor={`upload-pdf-${index}`}>
                            <Button
                              component="span"
                              size="small"
                              variant={upload.arquivoPdf ? "outlined" : "contained"}
                              startIcon={<FileIcon />}
                              sx={{ minWidth: 80 }}
                            >
                              {upload.arquivoPdf ? '✅' : 'PDF'}
                            </Button>
                          </label>
                          {upload.arquivoPdf && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                              {(upload.arquivoPdf.size / 1024 / 1024).toFixed(1)}MB
                              {upload.arquivoPdf.size > LIMITE_BASE64 ? ' (Ref)' : ' (B64)'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removerLinhaLote(index)}
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
      </Card>

      {/* Dialog - Novo Relatório Individual */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>➕ Adicionar Novo Relatório</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ticker *</InputLabel>
                <Select
                  value={novoRelatorio.ticker}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
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
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Visualização</InputLabel>
                <Select
                  value={novoRelatorio.tipoVisualizacao}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipoVisualizacao: e.target.value as any }))}
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
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                📄 Upload de PDF (Sistema Híbrido)
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>🔧 Sistema Híbrido:</strong><br/>
                  • <strong>≤3MB:</strong> Armazenado em Base64 (acesso instantâneo)<br/>
                  • <strong>&gt;3MB:</strong> Armazenado como referência (re-upload quando necessário)<br/>
                  • <strong>Máximo:</strong> 10MB por arquivo
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
                  variant={novoRelatorio.arquivoPdf ? "outlined" : "contained"}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {novoRelatorio.arquivoPdf ? '✅ PDF Selecionado' : '📁 Selecionar PDF'}
                </Button>
              </label>
              
              {novoRelatorio.arquivoPdf && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                    <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>💾 Estratégia:</strong> {novoRelatorio.arquivoPdf.size <= LIMITE_BASE64 ? 'Base64 (Instantâneo)' : 'Referência (Re-upload)'}
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvarRelatorioIndividual}
            disabled={!novoRelatorio.ticker || !novoRelatorio.nome || loading}
          >
            {loading ? 'Salvando...' : '💾 Salvar Relatório'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Backup/Restore */}
      <Dialog open={dialogBackup} onClose={() => setDialogBackup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💿 Backup & Restore</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>💡 Backup/Restore:</strong><br/>
                • <strong>Exportar:</strong> Baixa todos os dados em JSON<br/>
                • <strong>Importar:</strong> Restaura dados de um backup<br/>
                • <strong>Importante:</strong> PDFs em Base64 são incluídos no backup
              </Typography>
            </Alert>
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                📤 Exportar Dados
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={exportarDados}
              >
                💾 Baixar Backup Completo
              </Button>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
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
                  variant="outlined"
                  fullWidth
                  startIcon={<RestoreIcon />}
                >
                  🔄 Restaurar do Backup
                </Button>
              </label>
            </Box>
            
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>⚠️ Atenção:</strong> Importar dados irá <strong>substituir</strong> todos os relatórios existentes!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogBackup(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Global */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
}
