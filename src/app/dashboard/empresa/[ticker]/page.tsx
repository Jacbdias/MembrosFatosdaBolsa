'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ========================================
// COMPONENTE GERENCIADOR DE RELATÓRIOS
// ========================================
const GerenciadorRelatorios = React.memo(({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(1);
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    tipo: 'trimestral' as const,
    dataReferencia: '',
    arquivo: null as File | null,
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe' as const
  });

  const [arquivoPdfSelecionado, setArquivoPdfSelecionado] = useState<File | null>(null);

  const baixarPdf = useCallback((relatorio: Relatorio) => {
    console.log('⬇️ Iniciando download do PDF...');
    
    if (!relatorio.arquivoPdf) {
      alert('❌ Arquivo PDF não encontrado!');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = relatorio.arquivoPdf;
      link.download = relatorio.nomeArquivoPdf || `${relatorio.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('❌ Erro no download:', error);
      alert('❌ Erro ao baixar o arquivo. Tente novamente.');
    }
  }, []);
  
  useEffect(() => {
    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = localStorage.getItem(chave);
    
    if (relatoriosExistentes) {
      try {
        setRelatorios(JSON.parse(relatoriosExistentes));
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      }
    }
  }, [ticker]);

  const handleUploadPdf = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    
    if (!arquivo) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }
    
    if (arquivo.type !== 'application/pdf') {
      console.error('❌ Arquivo deve ser PDF');
      alert('Por favor, selecione apenas arquivos PDF');
      event.target.value = '';
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > maxSize) {
      console.error('❌ Arquivo muito grande (máximo 10MB)');
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    
    setArquivoPdfSelecionado(arquivo);
  }, []);

  const salvarPdfNoServidor = useCallback(async (arquivo: File): Promise<string> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const urlLocal = URL.createObjectURL(arquivo);
      return urlLocal;
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      throw new Error('Erro ao processar arquivo PDF');
    }
  }, []);

  const salvarRelatorio = useCallback(async () => {
    if (!novoRelatorio.nome) {
      alert('Digite o nome do relatório');
      return;
    }

    try {
      let relatorioParaSalvar: any = { ...novoRelatorio };
      
      if (arquivoPdfSelecionado) {
        const urlPdf = await salvarPdfNoServidor(arquivoPdfSelecionado);
        
        relatorioParaSalvar = {
          ...relatorioParaSalvar,
          arquivoPdf: urlPdf,
          nomeArquivoPdf: arquivoPdfSelecionado.name,
          tamanhoArquivo: arquivoPdfSelecionado.size,
          dataUploadPdf: new Date().toISOString(),
        };
      } else if (novoRelatorio.tipoVisualizacao === 'pdf') {
        alert('Por favor, selecione um arquivo PDF');
        return;
      }

      const relatorio: Relatorio = {
        id: Date.now().toString(),
        nome: relatorioParaSalvar.nome,
        tipo: relatorioParaSalvar.tipo,
        dataUpload: new Date().toISOString(),
        dataReferencia: relatorioParaSalvar.dataReferencia,
        tipoVisualizacao: relatorioParaSalvar.tipoVisualizacao,
        linkCanva: relatorioParaSalvar.linkCanva || undefined,
        linkExterno: relatorioParaSalvar.linkExterno || undefined,
        tamanho: relatorioParaSalvar.arquivo ? `${(relatorioParaSalvar.arquivo.size / 1024 / 1024).toFixed(1)} MB` : undefined,
        arquivoPdf: relatorioParaSalvar.arquivoPdf,
        nomeArquivoPdf: relatorioParaSalvar.nomeArquivoPdf,
        tamanhoArquivo: relatorioParaSalvar.tamanhoArquivo,
        dataUploadPdf: relatorioParaSalvar.dataUploadPdf
      };

      const chave = `relatorios_${ticker}`;
      const relatoriosExistentes = JSON.parse(localStorage.getItem(chave) || '[]');
      relatoriosExistentes.push(relatorio);
      localStorage.setItem(chave, JSON.stringify(relatoriosExistentes));
      
      setRelatorios(relatoriosExistentes);
      setDialogAberto(false);
      setNovoRelatorio({
        nome: '',
        tipo: 'trimestral',
        dataReferencia: '',
        arquivo: null,
        linkCanva: '',
        linkExterno: '',
        tipoVisualizacao: 'iframe'
      });
      setArquivoPdfSelecionado(null);
      setTabAtiva(1);
      
    } catch (error) {
      console.error('❌ Erro ao salvar relatório:', error);
      alert('Erro ao salvar relatório. Tente novamente.');
    }
  }, [novoRelatorio, ticker, arquivoPdfSelecionado, salvarPdfNoServidor]);

  const excluirRelatorio = useCallback((id: string) => {
    if (confirm('Excluir relatório?')) {
      const chave = `relatorios_${ticker}`;
      const relatoriosAtualizados = relatorios.filter(r => r.id !== id);
      localStorage.setItem(chave, JSON.stringify(relatoriosAtualizados));
      setRelatorios(relatoriosAtualizados);
    }
  }, [relatorios, ticker]);

  const getIconePorTipo = useCallback((tipo: string) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  }, []);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📋 Relatórios da Empresa
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setDialogAberto(true)}
            size="small"
          >
            + Adicionar Relatório
          </Button>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum relatório cadastrado para {ticker}
            </Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} sx={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: 2, 
                mb: 1,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f8fafc' }
              }}>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{getIconePorTipo(relatorio.tipoVisualizacao)}</span>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {relatorio.nome}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {relatorio.tipo} • {relatorio.dataReferencia}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    {relatorio.arquivoPdf && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => baixarPdf(relatorio)}
                        startIcon={<DownloadIconCustom />}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        PDF
                      </Button>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => excluirRelatorio(relatorio.id)}
                      color="error"
                      sx={{ 
                        backgroundColor: '#ffebee',
                        '&:hover': { backgroundColor: '#ffcdd2' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog para adicionar relatório */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Relatório</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Nome do Relatório"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
              />
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
              <TextField
                fullWidth
                label="Data de Referência"
                value={novoRelatorio.dataReferencia}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, dataReferencia: e.target.value }))}
                placeholder="Ex: Q1 2024"
              />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  📄 Upload de Arquivo PDF
                </Typography>
                
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="upload-pdf-input"
                  type="file"
                  onChange={handleUploadPdf}
                />
                <label htmlFor="upload-pdf-input">
                  <Button 
                    variant={arquivoPdfSelecionado ? 'outlined' : 'contained'}
                    component="span"
                    startIcon={<CloudUploadIconCustom />}
                    fullWidth
                    sx={{ mb: 2, py: 2 }}
                  >
                    {arquivoPdfSelecionado ? '✅ Arquivo Selecionado' : '📁 Selecionar Arquivo PDF'}
                  </Button>
                </label>
                
                {arquivoPdfSelecionado && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>📄 Arquivo:</strong> {arquivoPdfSelecionado.name}<br/>
                      <strong>Tamanho:</strong> {(arquivoPdfSelecionado.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogAberto(false);
              setArquivoPdfSelecionado(null);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={salvarRelatorio} 
              variant="contained"
              disabled={!novoRelatorio.nome}
            >
              💾 Salvar Relatório
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE AGENDA CORPORATIVA
// ========================================
const AgendaCorporativa = React.memo(({ ticker }: { ticker: string }) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  const calcularDiasAteEvento = useCallback((dataEvento: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento);
    evento.setHours(0, 0, 0, 0);
    
    const diffTime = evento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, []);

  const formatarProximidade = useCallback((dias: number) => {
    if (dias < 0) return 'Passou';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias <= 7) return `Em ${dias} dias`;
    if (dias <= 30) return `Em ${Math.ceil(dias / 7)} semanas`;
    return `Em ${Math.ceil(dias / 30)} meses`;
  }, []);

  const criarEventosEstimados = useCallback((ticker: string) => {
    const eventos: any[] = [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    let proximoResultado: Date;
    
    if (mesAtual <= 1) {
      proximoResultado = new Date(anoAtual, 3, 15);
    } else if (mesAtual <= 4) {
      proximoResultado = new Date(anoAtual, 5, 15);
    } else if (mesAtual <= 7) {
      proximoResultado = new Date(anoAtual, 8, 15);
    } else {
      proximoResultado = new Date(anoAtual, 11, 15);
    }
    
    if (proximoResultado <= hoje) {
      proximoResultado.setMonth(proximoResultado.getMonth() + 3);
      if (proximoResultado.getFullYear() > anoAtual) {
        proximoResultado = new Date(anoAtual + 1, 2, 15);
      }
    }
    
    eventos.push({
      id: 'resultado-estimado',
      tipo: 'resultado',
      titulo: 'Próximos Resultados',
      data: proximoResultado,
      descricao: 'Data estimada para divulgação de resultados trimestrais',
      estimado: true,
      cor: '#3b82f6'
    });

    const proximoDividendo = new Date(proximoResultado);
    proximoDividendo.setMonth(proximoDividendo.getMonth() + 2);
    
    eventos.push({
      id: 'dividendo-estimado',
      tipo: 'dividendo',
      titulo: 'Possível Data Ex-Dividendos',
      data: proximoDividendo,
      descricao: 'Estimativa baseada em padrões típicos do mercado brasileiro',
      estimado: true,
      cor: '#22c55e'
    });

    const dataAssembleia = new Date(anoAtual, 3, 30);
    if (dataAssembleia <= hoje) {
      dataAssembleia.setFullYear(anoAtual + 1);
    }
    
    eventos.push({
      id: 'assembleia-geral',
      tipo: 'assembleia',
      titulo: 'Assembleia Geral Ordinária',
      data: dataAssembleia,
      descricao: 'Data típica para aprovação das contas e eleição do conselho',
      estimado: true,
      cor: '#8b5cf6'
    });

    return eventos.sort((a, b) => a.data.getTime() - b.data.getTime());
  }, []);

  const buscarEventos = useCallback(async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);

      const eventosEstimados = criarEventosEstimados(ticker);
      setEventos(eventosEstimados);
      setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));

    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      const eventosEstimados = criarEventosEstimados(ticker);
      setEventos(eventosEstimados);
    } finally {
      setLoading(false);
    }
  }, [ticker, criarEventosEstimados]);

  useEffect(() => {
    buscarEventos();
  }, [buscarEventos]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📅 Agenda Corporativa
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {ultimaAtualizacao && (
              <Typography variant="caption" color="text.secondary">
                {ultimaAtualizacao}
              </Typography>
            )}
            <IconButton 
              size="small" 
              onClick={buscarEventos} 
              disabled={loading}
              title="Atualizar eventos"
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        {error && !loading && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              ⚠️ Usando estimativas padrão. {error}
            </Typography>
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : eventos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              📭 Nenhum evento encontrado para {ticker}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {eventos.slice(0, 4).map((evento, index) => {
              const diasAteEvento = calcularDiasAteEvento(evento.data);
              const proximidade = formatarProximidade(diasAteEvento);
              
              return (
                <Card key={evento.id} sx={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 2,
                  backgroundColor: diasAteEvento <= 7 ? '#fef3c7' : 'white',
                  '&:hover': { 
                    backgroundColor: diasAteEvento <= 7 ? '#fde68a' : '#f8fafc',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={4}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={3}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mb: 1,
                              color: '#1e293b'
                            }}>
                              {evento.titulo}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              fontSize: '0.9rem',
                              lineHeight: 1.5,
                              mb: 2
                            }}>
                              {evento.descricao}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={proximidade}
                                size="medium"
                                sx={{ 
                                  backgroundColor: diasAteEvento <= 7 ? '#f59e0b' : '#6b7280',
                                  color: 'white',
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  px: 1
                                }}
                              />
                              {evento.estimado && (
                                <Chip 
                                  label="Estimado"
                                  size="medium"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.8rem',
                                    borderColor: '#d1d5db',
                                    color: '#6b7280'
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>

                          <Box sx={{ 
                            textAlign: 'right',
                            minWidth: 140,
                            flexShrink: 0
                          }}>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700,
                              color: evento.cor,
                              fontSize: '1.3rem',
                              lineHeight: 1
                            }}>
                              {evento.data.getDate()}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600,
                              color: '#64748b',
                              fontSize: '0.9rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {evento.data.toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              fontSize: '0.75rem',
                              display: 'block',
                              mt: 0.5
                            }}>
                              {evento.data.toLocaleDateString('pt-BR', {
                                weekday: 'long'
                              })}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>ℹ️ Sobre as datas:</strong><br/>
            • 📊 <strong>Estimativas:</strong> Calculadas com padrões do mercado brasileiro<br/>
            • ⏰ <strong>Eventos próximos</strong> (≤7 dias) destacados em amarelo
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
});

// ========================================
// ÍCONES MOCK
// ========================================
const ArrowLeftIcon = () => <span>←</span>;
const TrendUpIcon = () => <span style={{ color: '#22c55e' }}>↗</span>;
const TrendDownIcon = () => <span style={{ color: '#ef4444' }}>↘</span>;
const RefreshIcon = () => <span>🔄</span>;
const WarningIcon = () => <span>⚠</span>;
const CheckIcon = () => <span>✓</span>;
const UploadIcon = () => <span>📤</span>;
const DownloadIconCustom = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;
const ViewIcon = () => <span>👁</span>;
const CloseIcon = () => <span>✕</span>;
const CloudUploadIconCustom = () => <span>☁️</span>;
const PictureAsPdfIconCustom = () => <span>📄</span>;

// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

// ========================================
// INTERFACES E TIPOS
// ========================================
interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
  dy?: number;
}

interface EmpresaCompleta {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  dataEntrada: string;
  precoIniciou: string;
  precoTeto: string;
  viesAtual: string;
  ibovespaEpoca: string;
  percentualCarteira: string;
  tipo?: 'FII';
  gestora?: string;
  dadosFinanceiros?: DadosFinanceiros;
  statusApi?: string;
  ultimaAtualizacao?: string;
}

export type TipoVisualizacao = 'iframe' | 'canva' | 'link' | 'pdf';

interface Relatorio {
  id: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataUpload: string;
  dataReferencia: string;
  arquivo?: string;
  linkCanva?: string;
  linkExterno?: string;
  tamanho?: string;
  tipoVisualizacao: TipoVisualizacao;
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  dataUploadPdf?: string;
}

// ========================================
// DADOS DE FALLBACK
// ========================================
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  'KEPL3': {
    ticker: 'KEPL3',
    nomeCompleto: 'Kepler Weber S.A.',
    setor: 'Agricultura',
    descricao: 'A Kepler Weber é uma empresa brasileira especializada em soluções para armazenagem e movimentação de grãos, líquidos e gases.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
    dataEntrada: '21/03/2021',
    precoIniciou: 'R$ 7,30',
    precoTeto: 'R$ 12,50',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '115.000',
    percentualCarteira: '2.1%'
  },
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Shoppings',
    descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '108.500',
    percentualCarteira: '4.2%'
  },
  'AGRO3': {
    ticker: 'AGRO3',
    nomeCompleto: 'BrasilAgro S.A.',
    setor: 'Agricultura',
    descricao: 'A BrasilAgro é uma empresa do agronegócio com foco na produção de commodities agrícolas como soja, milho, algodão e açúcar.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AGRO.png',
    dataEntrada: '15/08/2021',
    precoIniciou: 'R$ 24,80',
    precoTeto: 'R$ 35,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '125.000',
    percentualCarteira: '3.2%'
  }
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  try {
    const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace('.', '').replace(',', '.'));
    
    if (isNaN(precoTetoNum) || precoAtual <= 0) {
      return 'Aguardar';
    }
    
    const percentualDoTeto = (precoAtual / precoTetoNum) * 100;
    
    if (percentualDoTeto <= 80) {
      return 'Compra Forte';
    } else if (percentualDoTeto <= 95) {
      return 'Compra';
    } else if (percentualDoTeto <= 105) {
      return 'Neutro';
    } else if (percentualDoTeto <= 120) {
      return 'Aguardar';
    } else {
      return 'Venda';
    }
  } catch {
    return 'Aguardar';
  }
}

function formatarValor(valor: number | undefined, tipo: 'currency' | 'percent' | 'number' | 'millions' = 'currency'): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
  
  switch (tipo) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor);
    
    case 'percent':
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1000000000) {
        return `R$ ${(valor / 1000000000).toFixed(1).replace('.', ',')} bi`;
      } else if (valor >= 1000000) {
        return `R$ ${(valor / 1000000).toFixed(1).replace('.', ',')} mi`;
      } else {
        return formatarValor(valor, 'currency');
      }
    
    case 'number':
      return valor.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    
    default:
      return valor.toString();
  }
}

// ========================================
// HOOK PARA CALCULAR DIVIDEND YIELD
// ========================================
function useDividendYield(ticker: string, dataEntrada: string, precoAtual?: number, precoIniciou?: string) {
  const [dyData, setDyData] = useState({
    dy12Meses: 0,
    dyDesdeEntrada: 0
  });

  const parsePreco = useCallback((precoStr: string): number => {
    try {
      return parseFloat(precoStr.replace('R$ ', '').replace('.', '').replace(',', '.'));
    } catch {
      return 0;
    }
  }, []);

  const calcularDY = useCallback(() => {
    if (!ticker || !precoAtual || precoAtual <= 0 || !precoIniciou || !dataEntrada) {
      setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
      return;
    }

    try {
      const chaveStorage = `proventos_${ticker}`;
      const dadosSalvos = localStorage.getItem(chaveStorage);
      
      if (!dadosSalvos) {
        setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
        return;
      }

      const proventos = JSON.parse(dadosSalvos).map((item: any) => ({
        ...item,
        dataObj: new Date(item.dataObj)
      }));

      const hoje = new Date();
      const dataEntradaObj = new Date(dataEntrada.split('/').reverse().join('-'));
      const data12MesesAtras = new Date();
      data12MesesAtras.setFullYear(hoje.getFullYear() - 1);

      const proventos12Meses = proventos.filter((provento: any) => 
        provento.dataObj >= data12MesesAtras && provento.dataObj <= hoje
      );

      const proventosDesdeEntrada = proventos.filter((provento: any) => 
        provento.dataObj >= dataEntradaObj && provento.dataObj <= hoje
      );

      const totalProventos12Meses = proventos12Meses.reduce((sum: number, p: any) => sum + p.valor, 0);
      const totalProventosDesdeEntrada = proventosDesdeEntrada.reduce((sum: number, p: any) => sum + p.valor, 0);

      const dy12Meses = precoAtual > 0 ? (totalProventos12Meses / precoAtual) * 100 : 0;
      const precoEntrada = parsePreco(precoIniciou);
      const dyDesdeEntrada = precoEntrada > 0 ? (totalProventosDesdeEntrada / precoEntrada) * 100 : 0;

      setDyData({
        dy12Meses: isNaN(dy12Meses) ? 0 : dy12Meses,
        dyDesdeEntrada: isNaN(dyDesdeEntrada) ? 0 : dyDesdeEntrada
      });

    } catch (error) {
      console.error('Erro ao calcular performance:', error);
    }
    
    return 'N/A';
  }, [empresaCompleta]);

  if (!empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
        >
          Voltar à Lista
        </Button>
      </Box>
    );
  }

  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual) : empresaCompleta.precoIniciou;
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()} 
          variant="outlined"
        >
          Voltar
        </Button>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {dadosLoading ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Carregando...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Erro na API
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              Dados da API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Dados estáticos
            </Alert>
          )}
          
          <IconButton onClick={refetch} disabled={dadosLoading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresaCompleta.avatar} 
              alt={empresaCompleta.ticker} 
              sx={{ 
                width: { xs: 100, md: 120 }, 
                height: { xs: 100, md: 120 },
                backgroundColor: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#374151'
              }}
            >
              {empresaCompleta.ticker.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-start' }} 
                sx={{ mb: 1 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {empresaCompleta.ticker}
                </Typography>
                {empresaCompleta.tipo === 'FII' && (
                  <Chip label="FII" color="primary" />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ maxWidth: 600 }}>
                {empresaCompleta.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {precoAtualFormatado}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                  >
                    {tendencia && (
                      <>
                        {tendencia === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                        <Typography sx={{ 
                          color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                          fontWeight: 700, 
                          fontSize: '1.2rem'
                        }}>
                          {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas com DY - 6 CARDS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="COTAÇÃO" 
            value={precoAtualFormatado}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="VARIAÇÃO HOJE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="PERFORMANCE" 
            value={calcularPerformance()}
            subtitle="desde entrada"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/L" 
            value={dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DY 12 MESES" 
            value={dy12Meses > 0 ? `${dy12Meses.toFixed(2)}%` : 'N/A'}
            subtitle="últimos 12m"
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DY ENTRADA" 
            value={dyDesdeEntrada > 0 ? `${dyDesdeEntrada.toFixed(2)}%` : 'N/A'}
            subtitle="desde entrada"
            loading={dadosLoading}
          />
        </Grid>
      </Grid>

      {/* Histórico de Dividendos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <HistoricoDividendos ticker={ticker} dataEntrada={empresaCompleta.dataEntrada} />
        </Grid>
      </Grid>

      {/* Seções secundárias */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <GerenciadorRelatorios ticker={ticker} />
        </Grid>
        
        <Grid item xs={12}>
          <AgendaCorporativa ticker={ticker} />
        </Grid>
      </Grid>

      {/* Dados da Posição */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.dataEntrada}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.precoIniciou}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: dados?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: dados?.precoAtual ? '#22c55e' : 'inherit' }}>
                    {precoAtualFormatado}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de Viés */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                🎯 Análise de Viés
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Teto</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.precoTeto}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Viés Atual</Typography>
                  <Chip 
                    label={empresaCompleta.viesAtual}
                    size="small"
                    color={
                      empresaCompleta.viesAtual === 'Compra Forte' ? 'success' :
                      empresaCompleta.viesAtual === 'Compra' ? 'info' :
                      empresaCompleta.viesAtual === 'Neutro' ? 'warning' :
                      empresaCompleta.viesAtual === 'Venda' ? 'error' : 'default'
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">% da Carteira</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.percentualCarteira}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}error) {
      console.error('Erro ao calcular DY:', error);
      setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
    }
  }, [ticker, precoAtual, precoIniciou, dataEntrada, parsePreco]);

  useEffect(() => {
    calcularDY();
  }, [calcularDY]);

  return dyData;
}

// ========================================
// HOOK PERSONALIZADO - DADOS FINANCEIROS
// ========================================
function useDadosFinanceiros(ticker: string) {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  const buscarDados = React.useCallback(async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true`;
      
      const response = await fetch(quoteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Details-App',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const quote = data.results[0];
          
          const precoAtual = quote.regularMarketPrice || quote.currentPrice || quote.price || 0;
          const dividendYield = quote.dividendYield || 0;

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: precoAtual,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            dy: dividendYield,
            marketCap: quote.marketCap,
            pl: quote.priceEarnings || quote.pe
          };

          setDadosFinanceiros(dadosProcessados);
          setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
          
        } else {
          throw new Error('Nenhum resultado encontrado');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

// ========================================
// COMPONENTE DE MÉTRICA
// ========================================
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  showInfo = false
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  showInfo?: boolean;
}) => (
  <Card sx={{ 
    borderRadius: 3,
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-4px)', 
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
    },
    height: '100%'
  }}>
    <Box sx={{ 
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      py: 2,
      px: 2.5,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ 
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#64748b'
        }}>
          {title}
        </Typography>
        {showInfo && (
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#64748b',
            backgroundColor: 'white'
          }}>
            ?
          </Box>
        )}
      </Stack>
    </Box>

    <CardContent sx={{ 
      backgroundColor: 'white',
      p: 3,
      textAlign: 'center',
      '&:last-child': { pb: 3 }
    }}>
      {loading ? (
        <Skeleton variant="text" height={50} />
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              fontSize: '2rem',
              color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#1e293b',
              lineHeight: 1,
              letterSpacing: '-0.5px'
            }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ ml: 0.5 }}>
                {trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
              </Box>
            )}
          </Stack>
          
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              fontSize: '0.75rem',
              display: 'block',
              mt: 1,
              lineHeight: 1.3,
              fontWeight: 500
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
));

// ========================================
// COMPONENTE HISTÓRICO DE DIVIDENDOS
// ========================================
const HistoricoDividendos = React.memo(({ ticker, dataEntrada }: { ticker: string; dataEntrada: string }) => {
  const [proventos, setProventos] = useState<any[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticker && typeof window !== 'undefined') {
      setLoading(true);
      const chaveStorage = `proventos_${ticker}`;
      const dadosSalvos = localStorage.getItem(chaveStorage);
      
      if (dadosSalvos) {
        try {
          const proventosSalvos = JSON.parse(dadosSalvos);
          if (Array.isArray(proventosSalvos)) {
            const proventosLimitados = proventosSalvos.slice(0, 500).map((item: any) => ({
              ...item,
              dataObj: item.dataObj ? new Date(item.dataObj) : new Date()
            }));
            proventosLimitados.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
            setProventos(proventosLimitados);
          }
        } catch (err) {
          console.error('Erro ao carregar proventos salvos:', err);
          localStorage.removeItem(chaveStorage);
        }
      }
      setLoading(false);
    }
  }, [ticker]);

  const { totalProventos, mediaProvento, ultimoProvento } = useMemo(() => {
    const total = proventos.reduce((sum, item) => sum + item.valor, 0);
    const media = proventos.length > 0 ? total / proventos.length : 0;
    const ultimo = proventos.length > 0 ? proventos[0] : null;

    return {
      totalProventos: total,
      mediaProvento: media,
      ultimoProvento: ultimo
    };
  }, [proventos]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💰 Histórico de Proventos
          </Typography>
        </Stack>

        {proventos.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum provento carregado para {ticker}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              📅 Data de entrada: {dataEntrada}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                    {proventos.length}
                  </Typography>
                  <Typography variant="caption">Pagamentos</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
                    {formatarValor(totalProventos).replace('R$ ', '')}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fefce8', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#eab308' }}>
                    {formatarValor(mediaProvento).replace('R$ ', '')}
                  </Typography>
                  <Typography variant="caption">Média</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fdf4ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7' }}>
                    {ultimoProvento ? ultimoProvento.dataFormatada.replace(/\/\d{4}/, '') : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Último</Typography>
                </Box>
              </Grid>
            </Grid>
            
            {proventos.length > 10 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setMostrarTodos(!mostrarTodos)}
                  sx={{
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  {mostrarTodos 
                    ? `📋 Mostrar apenas 10 recentes` 
                    : `📋 Mostrar todos os ${proventos.length} proventos`
                  }
                </Button>
              </Box>
            )}
            
            <TableContainer sx={{ 
              backgroundColor: 'white', 
              borderRadius: 1,
              maxHeight: mostrarTodos ? '400px' : 'auto',
              overflowY: mostrarTodos ? 'auto' : 'visible'
            }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(mostrarTodos ? proventos : proventos.slice(0, 10)).map((provento, index) => (
                    <TableRow key={`${provento.data}-${index}`}>
                      <TableCell sx={{ fontWeight: 500 }}>{provento.dataFormatada}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        {provento.valorFormatado}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={provento.tipo}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {proventos.length > 10 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {mostrarTodos 
                    ? `Mostrando todos os ${proventos.length} proventos com rolagem`
                    : `Mostrando os 10 mais recentes • Total: ${proventos.length}`
                  }
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE PRINCIPAL - DETALHES DA EMPRESA
// ========================================
export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker as string) || '';
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  const { dy12Meses, dyDesdeEntrada } = useDividendYield(
    ticker, 
    empresa?.dataEntrada || '', 
    dadosFinanceiros?.precoAtual, 
    empresa?.precoIniciou || ''
  );

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        if (typeof window !== 'undefined') {
          const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
          
          if (dadosAdmin) {
            const ativos = JSON.parse(dadosAdmin);
            const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
            
            if (ativoEncontrado) {
              setEmpresa(ativoEncontrado);
              setDataSource('admin');
              return;
            }
          }
        }

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;
    
    let empresaAtualizada = { ...empresa };
    
    if (dadosFinanceiros && dadosFinanceiros.precoAtual > 0) {
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    } else {
      empresaAtualizada.statusApi = 'error';
    }
    
    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  const calcularPerformance = useCallback(() => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    try {
      const precoEntradaStr = empresaCompleta.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.');
      const precoEntrada = parseFloat(precoEntradaStr);
      const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
      
      if (precoEntrada > 0 && precoAtual > 0) {
        const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
        return formatarValor(performance, 'percent');
      }
    } catch (
