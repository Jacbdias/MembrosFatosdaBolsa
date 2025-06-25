'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
  Toolbar
} from '@mui/material';

// Ícones Mock (mantendo consistência com o padrão atual)
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑️</span>;
const RefreshIcon = () => <span>🔄</span>;
const ViewIcon = () => <span>👁️</span>;
const ArrowLeftIcon = () => <span>←</span>;
const MoreVertIcon = () => <span>⋮</span>;
const EditIcon = () => <span>✏️</span>;

// Configurações dos tipos de eventos
const TIPOS_EVENTO = {
  resultado: { icon: '📊', cor: '#3b82f6', label: 'Resultados' },
  dividendo: { icon: '💰', cor: '#22c55e', label: 'Dividendos' },
  rendimento: { icon: '💰', cor: '#f59e0b', label: 'Rendimentos' },
  assembleia: { icon: '🏛️', cor: '#8b5cf6', label: 'Assembleia' },
  conference_call: { icon: '📞', cor: '#06b6d4', label: 'Conference Call' },
  relatorio: { icon: '📄', cor: '#64748b', label: 'Relatório' },
  evento_especial: { icon: '⭐', cor: '#ec4899', label: 'Evento Especial' },
  fato_relevante: { icon: '⚠️', cor: '#ef4444', label: 'Fato Relevante' }
};

const STATUS_CONFIG = {
  confirmado: { cor: '#22c55e', label: 'Confirmado' },
  estimado: { cor: '#f59e0b', label: 'Estimado' },
  cancelado: { cor: '#ef4444', label: 'Cancelado' },
  adiado: { cor: '#8b5cf6', label: 'Adiado' }
};

interface EventoCorporativo {
  ticker: string;
  tipo_evento: string;
  titulo: string;
  data_evento: string;
  descricao: string;
  status: string;
  prioridade?: string;
  url_externo?: string;
  observacoes?: string;
  id?: string; // Adicionado para facilitar exclusões
}

// Hook para gerenciar dados da agenda central
const useAgendaCentral = () => {
  const [eventos, setEventos] = useState<EventoCorporativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');
  const [totalTickers, setTotalTickers] = useState(0);

  const carregarEventos = useCallback(() => {
    try {
      const dadosSalvos = localStorage.getItem('agenda_corporativa_central');
      
      if (dadosSalvos) {
        const eventosCarregados = JSON.parse(dadosSalvos);
        setEventos(eventosCarregados);
        
        // Calcular estatísticas
        const tickersUnicos = new Set(eventosCarregados.map((e: EventoCorporativo) => e.ticker));
        setTotalTickers(tickersUnicos.size);
        
        // Data da última atualização
        const timestamp = localStorage.getItem('agenda_corporativa_timestamp');
        if (timestamp) {
          setUltimaAtualizacao(new Date(parseInt(timestamp)).toLocaleString('pt-BR'));
        }
      } else {
        setEventos([]);
        setTotalTickers(0);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEventos([]);
    }
  }, []);

  const salvarEventos = useCallback((novosEventos: EventoCorporativo[]) => {
    try {
      localStorage.setItem('agenda_corporativa_central', JSON.stringify(novosEventos));
      localStorage.setItem('agenda_corporativa_timestamp', Date.now().toString());
      setEventos(novosEventos);
      
      const tickersUnicos = new Set(novosEventos.map(e => e.ticker));
      setTotalTickers(tickersUnicos.size);
      setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Erro ao salvar eventos:', error);
      throw error;
    }
  }, []);

  // 🗑️ NOVA: Função para excluir evento individual
  const excluirEvento = useCallback((eventoIndex: number) => {
    const eventosAtualizados = eventos.filter((_, index) => index !== eventoIndex);
    salvarEventos(eventosAtualizados);
  }, [eventos, salvarEventos]);

  // 🗑️ NOVA: Função para excluir múltiplos eventos
  const excluirEventos = useCallback((indices: number[]) => {
    const eventosAtualizados = eventos.filter((_, index) => !indices.includes(index));
    salvarEventos(eventosAtualizados);
  }, [eventos, salvarEventos]);

  // 🗑️ NOVA: Função para excluir todos eventos de um ticker
  const excluirPorTicker = useCallback((ticker: string) => {
    const eventosAtualizados = eventos.filter(evento => evento.ticker !== ticker);
    salvarEventos(eventosAtualizados);
  }, [eventos, salvarEventos]);

  const limparEventos = useCallback(() => {
    localStorage.removeItem('agenda_corporativa_central');
    localStorage.removeItem('agenda_corporativa_timestamp');
    setEventos([]);
    setTotalTickers(0);
    setUltimaAtualizacao('');
  }, []);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  return {
    eventos,
    loading,
    setLoading,
    ultimaAtualizacao,
    totalTickers,
    salvarEventos,
    limparEventos,
    excluirEvento,
    excluirEventos,
    excluirPorTicker,
    refetch: carregarEventos
  };
};

// Componente principal da página
export default function CentralAgendaPage() {
  const {
    eventos,
    loading,
    setLoading,
    ultimaAtualizacao,
    totalTickers,
    salvarEventos,
    limparEventos,
    excluirEvento,
    excluirEventos,
    excluirPorTicker,
    refetch
  } = useAgendaCentral();

  const [tabAtual, setTabAtual] = useState(0);
  const [dialogLimpar, setDialogLimpar] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 🗑️ NOVO: Estados para exclusão
  const [eventoParaExcluir, setEventoParaExcluir] = useState<number | null>(null);
  const [tickerParaExcluir, setTickerParaExcluir] = useState<string | null>(null);
  const [eventosSelecionados, setEventosSelecionados] = useState<number[]>([]);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuEventoIndex, setMenuEventoIndex] = useState<number | null>(null);

  // Processar upload de CSV
const handleUploadCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const arquivo = event.target.files?.[0];
  if (!arquivo) return;

  setUploading(true);
  setLoading(true);

  try {
    const texto = await arquivo.text();
    const linhas = texto.split('\n').filter(linha => linha.trim());
    
    if (linhas.length < 2) {
      throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
    }

    const cabecalho = linhas[0].split(',').map(col => col.trim());
    console.log('Cabeçalho encontrado:', cabecalho);

    // Mapeamento de colunas flexível
    const mapeamentoColunas: { [key: string]: string } = {
      'tipo': 'tipo_evento',
      'tipo_evento': 'tipo_evento',
      'data': 'data_evento', 
      'data_evento': 'data_evento',
      'categoria': 'tipo_evento'
    };

    // Validar colunas obrigatórias com mapeamento flexível
    const colunasObrigatorias = ['ticker', 'titulo', 'descricao', 'status'];
    const colunasTipoEvento = ['tipo', 'tipo_evento', 'categoria'];
    const colunasDataEvento = ['data', 'data_evento'];

    const colunasFaltantes = colunasObrigatorias.filter(col => !cabecalho.includes(col));
    
    // Verificar se existe pelo menos uma coluna de tipo_evento
    const temTipoEvento = colunasTipoEvento.some(col => cabecalho.includes(col));
    if (!temTipoEvento) {
      colunasFaltantes.push('tipo_evento (ou tipo)');
    }

    // Verificar se existe pelo menos uma coluna de data_evento  
    const temDataEvento = colunasDataEvento.some(col => cabecalho.includes(col));
    if (!temDataEvento) {
      colunasFaltantes.push('data_evento (ou data)');
    }
    
    if (colunasFaltantes.length > 0) {
      throw new Error(`Colunas obrigatórias faltantes: ${colunasFaltantes.join(', ')}`);
    }

    // Processar dados
    const eventosNovos: EventoCorporativo[] = [];
    
    for (let i = 1; i < linhas.length; i++) {
      const valores = linhas[i].split(',').map(val => val.trim());
      
      if (valores.length < cabecalho.length) {
        console.warn(`Linha ${i + 1} incompleta, pulando...`);
        continue;
      }

      const evento: any = {};
      
      // Mapear colunas do CSV para o formato esperado
      cabecalho.forEach((coluna, index) => {
        const colunaDestino = mapeamentoColunas[coluna] || coluna;
        evento[colunaDestino] = valores[index] || '';
      });

      // Adicionar ID único
      evento.id = `${evento.ticker}-${evento.data_evento}-${i}`;

      // Validar dados obrigatórios
      if (!evento.ticker || !evento.data_evento || !evento.titulo) {
        console.warn(`Linha ${i + 1} com dados obrigatórios faltantes, pulando...`);
        continue;
      }

      // Validar data
      const dataEvento = new Date(evento.data_evento);
      if (isNaN(dataEvento.getTime())) {
        console.warn(`Linha ${i + 1} com data inválida: ${evento.data_evento}`);
        continue;
      }

      eventosNovos.push(evento as EventoCorporativo);
    }

    if (eventosNovos.length === 0) {
      throw new Error('Nenhum evento válido encontrado no arquivo');
    }

    // Salvar dados
    salvarEventos(eventosNovos);
    
    alert(`✅ ${eventosNovos.length} eventos carregados com sucesso!\n\nTickers processados: ${new Set(eventosNovos.map(e => e.ticker)).size}`);
    
  } catch (error) {
    console.error('Erro no upload:', error);
    alert(`❌ Erro ao processar arquivo:\n${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    setUploading(false);
    setLoading(false);
    event.target.value = '';
  }
};

  // Download do template
const downloadTemplate = () => {
  const template = `ticker,tipo_evento,titulo,data_evento,descricao,status,prioridade,url_externo,observacoes
VALE3,resultado,Resultados 1T25,2025-05-15,Divulgação dos resultados do primeiro trimestre,confirmado,alta,,
PETR4,dividendo,Ex-Dividendos,2025-06-10,Data ex-dividendos referente aos resultados,estimado,media,,
MALL11,rendimento,Rendimento Jun/25,2025-06-15,Distribuição mensal de rendimentos,confirmado,alta,,
HSML11,assembleia,AGO 2025,2025-04-28,Assembleia Geral de Cotistas,confirmado,alta,https://hsml11.com.br,
BTLG11,conference_call,Conference Call 1T25,2025-05-16,Apresentação dos resultados trimestrais,confirmado,media,,Às 16h00
VALE3,fato_relevante,Comunicado Importante,2025-07-01,Comunicado sobre operações especiais,estimado,baixa,,`;

  const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_agenda_corporativa.csv';
  a.click();
  URL.revokeObjectURL(url);
};

  // 🗑️ NOVAS: Funções de exclusão
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchor(event.currentTarget);
    setMenuEventoIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuEventoIndex(null);
  };

  const handleExcluirEvento = (index: number) => {
    setEventoParaExcluir(index);
    handleMenuClose();
  };

  const confirmarExclusaoEvento = () => {
    if (eventoParaExcluir !== null) {
      excluirEvento(eventoParaExcluir);
      setEventoParaExcluir(null);
      alert('✅ Evento excluído com sucesso!');
    }
  };

  const handleExcluirTicker = (ticker: string) => {
    setTickerParaExcluir(ticker);
  };

  const confirmarExclusaoTicker = () => {
    if (tickerParaExcluir) {
      const eventosDoTicker = eventos.filter(e => e.ticker === tickerParaExcluir).length;
      excluirPorTicker(tickerParaExcluir);
      setTickerParaExcluir(null);
      alert(`✅ ${eventosDoTicker} eventos do ticker ${tickerParaExcluir} excluídos!`);
    }
  };

  const handleSelecionar = (index: number) => {
    setEventosSelecionados(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelecionarTodos = () => {
    if (eventosSelecionados.length === eventos.length) {
      setEventosSelecionados([]);
    } else {
      setEventosSelecionados(eventos.map((_, index) => index));
    }
  };

  const excluirSelecionados = () => {
    if (eventosSelecionados.length > 0) {
      excluirEventos(eventosSelecionados);
      setEventosSelecionados([]);
      setModoSelecao(false);
      alert(`✅ ${eventosSelecionados.length} eventos excluídos!`);
    }
  };

  // Estatísticas por ticker
  const estatisticasPorTicker = React.useMemo(() => {
    const stats: { [ticker: string]: { total: number; proximos: number } } = {};
    const hoje = new Date();
    
    eventos.forEach(evento => {
      if (!stats[evento.ticker]) {
        stats[evento.ticker] = { total: 0, proximos: 0 };
      }
      stats[evento.ticker].total++;
      
      const dataEvento = new Date(evento.data_evento);
      const diffDays = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) {
        stats[evento.ticker].proximos++;
      }
    });

    return Object.entries(stats)
      .map(([ticker, data]) => ({ ticker, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [eventos]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📅 Central da Agenda Corporativa
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie eventos corporativos de todos os ativos através de planilhas
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<ArrowLeftIcon />}
            onClick={() => window.history.back()}
            variant="outlined"
          >
            Voltar
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetch}
            disabled={loading}
          >
            Atualizar
          </Button>
          
          {eventos.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDialogLimpar(true)}
            >
              Limpar Tudo
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                {eventos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Eventos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
                {totalTickers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tickers Únicos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {eventos.filter(e => {
                  const hoje = new Date();
                  const dataEvento = new Date(e.data_evento);
                  const diffDays = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                  return diffDays >= 0 && diffDays <= 30;
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Próximos 30 Dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Última Atualização
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ultimaAtualizacao || 'Nunca'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Área de Upload */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            📤 Importar Eventos
          </Typography>
          
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>📋 Como usar:</strong><br/>
                1. Baixe o template CSV abaixo<br/>
                2. Preencha com os dados dos eventos corporativos<br/>
                3. Faça upload do arquivo preenchido<br/>
                4. Os dados aparecerão automaticamente nas páginas dos ativos
              </Typography>
            </Alert>

            <Stack direction="row" spacing={2} alignItems="center">
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="upload-csv-agenda"
                type="file"
                onChange={handleUploadCSV}
                disabled={uploading}
              />
              <label htmlFor="upload-csv-agenda">
                <Button
                  component="span"
                  variant="contained"
                  startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                  disabled={uploading}
                  size="large"
                >
                  {uploading ? 'Processando...' : 'Upload CSV'}
                </Button>
              </label>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                size="large"
              >
                Baixar Template
              </Button>
            </Stack>

            {uploading && (
              <Box>
                <LinearProgress />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Processando arquivo...
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs de Visualização */}
      {eventos.length > 0 && (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabAtual} onChange={(_, newValue) => setTabAtual(newValue)}>
              <Tab label={`📊 Eventos (${eventos.length})`} />
              <Tab label={`🏢 Por Ticker (${totalTickers})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Tab 1: Lista de Eventos */}
            {tabAtual === 0 && (
              <>
                {/* 🗑️ NOVA: Toolbar de ações */}
                <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Button
                      size="small"
                      variant={modoSelecao ? "contained" : "outlined"}
                      onClick={() => {
                        setModoSelecao(!modoSelecao);
                        setEventosSelecionados([]);
                      }}
                    >
                      {modoSelecao ? 'Cancelar Seleção' : 'Selecionar Múltiplos'}
                    </Button>

                    {modoSelecao && (
                      <>
                        <Button
                          size="small"
                          onClick={handleSelecionarTodos}
                        >
                          {eventosSelecionados.length === eventos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                        </Button>

                        {eventosSelecionados.length > 0 && (
                          <Button
                            size="small"
                            color="error"
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            onClick={excluirSelecionados}
                          >
                            Excluir Selecionados ({eventosSelecionados.length})
                          </Button>
                        )}
                      </>
                    )}
                  </Stack>
                </Toolbar>

                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {modoSelecao && <TableCell padding="checkbox">Sel.</TableCell>}
                        <TableCell>Ticker</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Título</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Status</TableCell>

                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventos
                        .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
                        .map((evento, index) => {
                          const config = TIPOS_EVENTO[evento.tipo_evento as keyof typeof TIPOS_EVENTO] || 
                                       { icon: '📅', cor: '#64748b', label: evento.tipo_evento };
                          const statusConfig = STATUS_CONFIG[evento.status as keyof typeof STATUS_CONFIG] || 
                                              { cor: '#64748b', label: evento.status };
                          
                          return (
                            <TableRow key={index} hover>
                              {modoSelecao && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={eventosSelecionados.includes(index)}
                                    onChange={() => handleSelecionar(index)}
                                  />
                                </TableCell>
                              )}
                              <TableCell sx={{ fontWeight: 600 }}>
                                {evento.ticker}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={<span>{config.icon}</span>}
                                  label={config.label}
                                  size="small"
                                  sx={{
                                    backgroundColor: config.cor,
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {evento.titulo}
                                  </Typography>
                                  {evento.observacoes && (
                                    <Typography variant="caption" color="text.secondary">
                                      📝 {evento.observacoes}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={statusConfig.label}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: statusConfig.cor,
                                    color: statusConfig.cor,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Tooltip title="Mais opções">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuClick(e, index)}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Tab 2: Estatísticas por Ticker */}
            {tabAtual === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {estatisticasPorTicker.map(({ ticker, total, proximos }) => (
                    <Grid item xs={12} sm={6} md={4} key={ticker}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {ticker}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${total} total`}
                                size="small"
                                color="primary"
                              />
                              {proximos > 0 && (
                                <Chip
                                  label={`${proximos} próximos`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                              <Tooltip title="Excluir todos eventos deste ticker">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleExcluirTicker(ticker)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🗑️ NOVO: Menu de contexto para ações do evento */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuEventoIndex !== null && handleExcluirEvento(menuEventoIndex)}>
          <DeleteIcon /> &nbsp; Excluir Evento
        </MenuItem>
      </Menu>

      {/* 🗑️ NOVO: Dialog de confirmação para exclusão individual */}
      <Dialog 
        open={eventoParaExcluir !== null} 
        onClose={() => setEventoParaExcluir(null)}
      >
        <DialogTitle>🗑️ Excluir Evento</DialogTitle>
        <DialogContent>
          {eventoParaExcluir !== null && (
            <Typography>
              Tem certeza que deseja excluir o evento:
              <br/><br/>
              <strong>{eventos[eventoParaExcluir]?.titulo}</strong>
              <br/>
              <em>{eventos[eventoParaExcluir]?.ticker} - {new Date(eventos[eventoParaExcluir]?.data_evento).toLocaleDateString('pt-BR')}</em>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventoParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={confirmarExclusaoEvento}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🗑️ NOVO: Dialog de confirmação para exclusão por ticker */}
      <Dialog 
        open={tickerParaExcluir !== null} 
        onClose={() => setTickerParaExcluir(null)}
      >
        <DialogTitle>🗑️ Excluir Todos Eventos do Ticker</DialogTitle>
        <DialogContent>
          {tickerParaExcluir && (
            <Typography>
              Tem certeza que deseja excluir todos os{' '}
              <strong>{eventos.filter(e => e.ticker === tickerParaExcluir).length} eventos</strong>{' '}
              do ticker <strong>{tickerParaExcluir}</strong>?
              <br/><br/>
              Esta ação não pode ser desfeita.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTickerParaExcluir(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={confirmarExclusaoTicker}
          >
            Excluir Todos
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação para Limpar Tudo */}
      <Dialog open={dialogLimpar} onClose={() => setDialogLimpar(false)}>
        <DialogTitle>🗑️ Limpar Todos os Dados</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja limpar todos os {eventos.length} eventos carregados?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogLimpar(false)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => {
              limparEventos();
              setDialogLimpar(false);
              alert('✅ Todos os dados foram limpos!');
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Estado vazio */}
      {eventos.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            📭 Nenhum evento carregado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Faça upload de um arquivo CSV para começar a gerenciar os eventos corporativos
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
          >
            Baixar Template
          </Button>
        </Paper>
      )}
    </Box>
  );
}
