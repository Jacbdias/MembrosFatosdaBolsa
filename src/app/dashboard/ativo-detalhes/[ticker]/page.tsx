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
// Importa o token da API do arquivo original
import { BRAPI_TOKEN } from '../../empresa-exterior/[ticker]/page'; // Ajuste o caminho conforme a localização real do seu arquivo original

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
  // ibovespaEpoca: string; // Isso pode ser ajustado ou removido para ativos estrangeiros
  referenciaIndiceEpoca: string; // Um nome mais genérico para índices globais
  percentualCarteira: string;
  tipo?: 'FII' | 'Stock' | 'ETF' | 'REIT'; // Adicionado tipos para exterior
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
  solicitarReupload?: boolean;
  hashArquivo?: string;
}

interface DadosFII { // Pode ser adaptado para REITs ou outros equivalentes
  valorPatrimonial?: number;
  patrimonio?: number;
  pvp?: number;
  valorMercado?: number;
  valorCaixa?: number;
  numeroCotas?: number;
  ultimoRendimento?: number;
  dataUltimoRendimento?: string;
  dyCagr3Anos?: number;
  numeroCotistas?: number;
  fonte: 'api' | 'manual' | 'misto';
  ultimaAtualizacao?: string;
}

// ========================================
// DADOS DE FALLBACK PARA ATIVOS NO EXTERIOR
// ========================================
const dadosFallbackForeign: { [key: string]: EmpresaCompleta } = {
  // Preencha esta seção com os seus dados de ativos no exterior.
  // Exemplo:
  // 'AAPL': {
  //   ticker: 'AAPL',
  //   nomeCompleto: 'Apple Inc.',
  //   setor: 'Tecnologia',
  //   descricao: 'Empresa multinacional americana de tecnologia com foco em eletrônicos de consumo, software e serviços online.',
  //   avatar: 'https://cdn.icon-icons.com/icons2/2402/PNG/512/apple_logo_icon_145913.png',
  //   dataEntrada: '01/01/2023',
  //   precoIniciou: '$150.00',
  //   precoTeto: '$200.00',
  //   viesAtual: 'Comprar',
  //   referenciaIndiceEpoca: 'S&P 500: 4500', // Exemplo de referência de índice estrangeiro
  //   percentualCarteira: '5.0%',
  //   tipo: 'Stock',
  //   dadosFinanceiros: {
  //     precoAtual: 180.00,
  //     variacao: 2.50,
  //     variacaoPercent: 1.41,
  //     volume: 80000000,
  //     marketCap: 2800000000000,
  //     pl: 30,
  //     dy: 0.5
  //   }
  // },
  // 'MSFT': {
  //   ticker: 'MSFT',
  //   nomeCompleto: 'Microsoft Corp.',
  //   setor: 'Tecnologia',
  //   descricao: 'Empresa multinacional americana de tecnologia que desenvolve, fabrica, licencia, oferece suporte e vende software de computador, eletrônicos de consumo, computadores pessoais e serviços relacionados.',
  //   avatar: 'https://cdn.icon-icons.com/icons2/2402/PNG/512/microsoft_logo_icon_145920.png',
  //   dataEntrada: '15/02/2023',
  //   precoIniciou: '$250.00',
  //   precoTeto: '$350.00',
  //   viesAtual: 'Comprar',
  //   referenciaIndiceEpoca: 'NASDAQ: 15000',
  //   percentualCarteira: '4.5%',
  //   tipo: 'Stock',
  //   dadosFinanceiros: {
  //     precoAtual: 300.00,
  //     variacao: 5.00,
  //     variacaoPercent: 1.69,
  //     volume: 60000000,
  //     marketCap: 2200000000000,
  //     pl: 35,
  //     dy: 0.7
  //   }
  // }
};

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + ' T';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + ' B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + ' M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + ' K';
  return num.toString();
};

export default function ForeignAssetDetails(): React.JSX.Element {
  const params = useParams<{ foreignTicker: string }>();
  const ticker = params?.foreignTicker?.toUpperCase();

  const [ativo, setAtivo] = useState<EmpresaCompleta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [isRelatoriosLoading, setIsRelatoriosLoading] = useState<boolean>(false);
  const [relatoriosError, setRelatoriosError] = useState<string | null>(null);
  const [selectedRelatorio, setSelectedRelatorio] = useState<Relatorio | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dadosFII, setDadosFII] = useState<DadosFII | null>(null); // Pode ser adaptado para REITs

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchAtivoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simula um delay para a busca de dados
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundAtivo = dadosFallbackForeign[ticker];

      if (foundAtivo) {
        setAtivo(foundAtivo);

        // Exemplo de como você usaria o BRAPI_TOKEN para buscar dados estrangeiros
        // Adapte a URL da API para o endpoint de dados estrangeiros
        // const response = await fetch(`SUA_API_DE_DADOS_ESTRANGEIROS/${ticker}?token=${BRAPI_TOKEN}`);
        // if (!response.ok) {
        //   throw new Error('Erro ao buscar dados financeiros do ativo estrangeiro.');
        // }
        // const apiData = await response.json();
        // setAtivo(prev => ({
        //   ...prev,
        //   dadosFinanceiros: {
        //     precoAtual: apiData.price,
        //     variacao: apiData.change,
        //     variacaoPercent: apiData.changesPercentage,
        //     volume: apiData.volume,
        //     marketCap: apiData.marketCap,
        //     pl: apiData.pe,
        //     dy: apiData.dividendYield,
        //   },
        //   statusApi: 'Dados em tempo real',
        //   ultimaAtualizacao: new Date().toLocaleString(),
        // }));

        // Se não houver API real para dados estrangeiros, usa dados de fallback
        setAtivo(foundAtivo);
        setAtivo(prev => ({
          ...prev,
          statusApi: 'Dados estáticos (fallback)',
          ultimaAtualizacao: new Date().toLocaleString(),
        }));
      } else {
        setError('Ativo não encontrado.');
      }
    } catch (err) {
      console.error("Erro ao buscar dados do ativo:", err);
      setError('Falha ao carregar dados do ativo.');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    if (ticker) {
      fetchAtivoData();
    }
  }, [ticker, fetchAtivoData]);

  const fetchRelatorios = useCallback(async () => {
    setIsRelatoriosLoading(true);
    setRelatoriosError(null);
    try {
      // Simular uma chamada de API para buscar relatórios
      await new Promise(resolve => setTimeout(resolve, 800));

      // Dados mock de relatórios para o ativo estrangeiro
      const mockRelatorios: Relatorio[] = [
        {
          id: 'report-1-foreign',
          nome: `${ticker} - Relatório Anual 2023`,
          tipo: 'anual',
          dataUpload: '2024-03-15',
          dataReferencia: '2023-12-31',
          tipoVisualizacao: 'pdf',
          nomeArquivoPdf: `${ticker}_Relatorio_Anual_2023.pdf`,
          tamanhoArquivo: 5242880, // 5MB
          dataUploadPdf: '2024-03-15T10:00:00Z',
          hashArquivo: 'abc123def456',
        },
        {
          id: 'report-2-foreign',
          nome: `${ticker} - Apresentação de Resultados Q4 2023`,
          tipo: 'apresentacao',
          dataUpload: '2024-02-20',
          dataReferencia: '2023-12-31',
          tipoVisualizacao: 'link',
          linkExterno: 'https://investor.exemplo.com/presentations/q4-2023',
        },
        {
          id: 'report-3-foreign',
          nome: `${ticker} - Relatório Trimestral Q1 2024`,
          tipo: 'trimestral',
          dataUpload: '2024-05-10',
          dataReferencia: '2024-03-31',
          tipoVisualizacao: 'canva',
          linkCanva: 'https://www.canva.com/design/exemplo-relatorio-q1-2024',
        },
      ];
      setRelatorios(mockRelatorios);
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
      setRelatoriosError('Falha ao carregar relatórios.');
    } finally {
      setIsRelatoriosLoading(false);
    }
  }, [ticker]);

  const fetchDadosFII = useCallback(async () => {
    if (ativo?.tipo === 'REIT') { // Adaptação para REITs
      // Simula uma chamada de API para buscar dados específicos de REITs
      // Se houver uma API de REITs que use o mesmo token, adicione a lógica aqui.
      // const response = await fetch(`SUA_API_DE_REITS/${ticker}?token=${BRAPI_TOKEN}`);
      // if (!response.ok) {
      //   throw new Error('Erro ao buscar dados do REIT.');
      // }
      // const apiData = await response.json();
      // setDadosFII({
      //   valorPatrimonial: apiData.bookValue,
      //   patrimonio: apiData.bookValue * apiData.sharesOutstanding,
      //   pvp: apiData.priceToBook,
      //   valorMercado: apiData.marketCap,
      //   valorCaixa: apiData.totalCash,
      //   numeroCotas: apiData.sharesOutstanding,
      //   ultimoRendimento: apiData.lastDividendValue,
      //   dataUltimoRendimento: apiData.lastDividendDate,
      //   dyCagr3Anos: 0, // Placeholder
      //   numeroCotistas: 0, // Placeholder
      //   fonte: 'api',
      //   ultimaAtualizacao: new Date().toLocaleString(),
      // });

      // Dados mock para REITs
      setDadosFII({
        valorPatrimonial: 85.50,
        patrimonio: 85.50 * 10000000, // Exemplo
        pvp: 1.15,
        valorMercado: 1200000000,
        valorCaixa: 50000000,
        numeroCotas: 10000000,
        ultimoRendimento: 0.75,
        dataUltimoRendimento: '2024-06-01',
        dyCagr3Anos: 8.2,
        numeroCotistas: 150000,
        fonte: 'manual',
        ultimaAtualizacao: new Date().toLocaleString(),
      });
    }
  }, [ativo?.tipo, ticker]);

  useEffect(() => {
    fetchRelatorios();
    fetchDadosFII();
  }, [fetchRelatorios, fetchDadosFII]);

  const handleOpenModal = (relatorio: Relatorio) => {
    setSelectedRelatorio(relatorio);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRelatorio(null);
  };

  const renderVisualizacaoRelatorio = () => {
    if (!selectedRelatorio) return null;

    switch (selectedRelatorio.tipoVisualizacao) {
      case 'iframe':
      case 'pdf': // Para PDFs que podem ser visualizados em iframe (se o link for direto)
        if (selectedRelatorio.arquivoPdf) {
          return (
            <iframe
              src={selectedRelatorio.arquivoPdf}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title={selectedRelatorio.nome}
            />
          );
        }
        return <Alert severity="warning">Nenhum PDF disponível para visualização.</Alert>;
      case 'canva':
        if (selectedRelatorio.linkCanva) {
          return (
            <iframe
              src={selectedRelatorio.linkCanva}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title={selectedRelatorio.nome}
              allowFullScreen
            />
          );
        }
        return <Alert severity="warning">Nenhum link do Canva disponível.</Alert>;
      case 'link':
        if (selectedRelatorio.linkExterno) {
          return (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Clique no botão abaixo para acessar o relatório externo:
              </Typography>
              <Button
                variant="contained"
                href={selectedRelatorio.linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<ViewIcon />}
              >
                Ver Relatório
              </Button>
            </Box>
          );
        }
        return <Alert severity="warning">Nenhum link externo disponível.</Alert>;
      default:
        return <Alert severity="info">Tipo de visualização não suportado para este relatório.</Alert>;
    }
  };

  const relatorioTipos: { [key: string]: string } = {
    trimestral: 'Trimestral',
    anual: 'Anual',
    apresentacao: 'Apresentação',
    outros: 'Outros',
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={150} />
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ativo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Ativo não encontrado. Verifique o ticker na URL.</Alert>
      </Box>
    );
  }

  const getViesColor = (vies: string) => {
    switch (vies.toLowerCase()) {
      case 'comprar':
        return 'success';
      case 'neutro':
        return 'info';
      case 'aguardar':
        return 'warning';
      case 'vender':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendUpIcon />;
    }
    if (change < 0) {
      return <TrendDownIcon />;
    }
    return null;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Stack spacing={3}>
        <div>
          <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
              <Avatar
                src={ativo.avatar}
                alt={ativo.nomeCompleto}
                sx={{ width: 100, height: 100, mr: 2 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {ativo.nomeCompleto} ({ativo.ticker})
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Setor: {ativo.setor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ativo.descricao}
                </Typography>
              </Box>
              <Stack direction="column" spacing={1} alignItems="flex-end">
                <Chip label={`Vies Atual: ${ativo.viesAtual}`} color={getViesColor(ativo.viesAtual)} />
                <Typography variant="caption" color="text.secondary">
                  Entrada na Carteira: {ativo.dataEntrada}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  % da Carteira: {ativo.percentualCarteira}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {ativo.dadosFinanceiros && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Dados Financeiros
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Preço Atual:{' '}
                    <Typography component="span" fontWeight="bold">
                      {formatCurrency(ativo.dadosFinanceiros.precoAtual, 'USD')}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Variação:{' '}
                    <Typography component="span" fontWeight="bold" color={ativo.dadosFinanceiros.variacao > 0 ? 'success.main' : 'error.main'}>
                      {getPriceChangeIcon(ativo.dadosFinanceiros.variacao)} {formatCurrency(ativo.dadosFinanceiros.variacao, 'USD')} ({formatPercentage(ativo.dadosFinanceiros.variacaoPercent)})
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Volume:{' '}
                    <Typography component="span" fontWeight="bold">
                      {formatLargeNumber(ativo.dadosFinanceiros.volume)}
                    </Typography>
                  </Typography>
                </Grid>
                {ativo.dadosFinanceiros.marketCap && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      Valor de Mercado:{' '}
                      <Typography component="span" fontWeight="bold">
                        {formatCurrency(ativo.dadosFinanceiros.marketCap, 'USD')}
                      </Typography>
                    </Typography>
                  </Grid>
                )}
                {ativo.dadosFinanceiros.pl && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      P/L:{' '}
                      <Typography component="span" fontWeight="bold">
                        {ativo.dadosFinanceiros.pl.toFixed(2)}x
                      </Typography>
                    </Typography>
                  </Grid>
                )}
                {ativo.dadosFinanceiros.dy !== undefined && ( // Allow 0 as a valid value
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1">
                      Dividend Yield:{' '}
                      <Typography component="span" fontWeight="bold">
                        {formatPercentage(ativo.dadosFinanceiros.dy)}
                      </Typography>
                    </Typography>
                  </Grid>
                )}
              </Grid>
              <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
                Status da API: {ativo.statusApi || 'Não disponível'} (Última atualização: {ativo.ultimaAtualizacao || 'N/A'})
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="asset details tabs">
              <Tab label="Dados Essenciais" />
              <Tab label="Relatórios e Documentos" />
              {ativo.tipo === 'REIT' && <Tab label="Dados de REIT" />}
            </Tabs>
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      Preço de Início na Carteira: <Typography component="span" fontWeight="bold">{ativo.precoIniciou}</Typography>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      Preço Teto Sugerido: <Typography component="span" fontWeight="bold">{ativo.precoTeto}</Typography>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      {ativo.tipo === 'REIT' ? 'Gestora do REIT' : 'Empresa Principal'}: <Typography component="span" fontWeight="bold">{ativo.gestora || 'N/A'}</Typography>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      Referência de Índice (Época de Entrada): <Typography component="span" fontWeight="bold">{ativo.referenciaIndiceEpoca || 'N/A'}</Typography>
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Relatórios e Documentos
                  </Typography>
                  {isRelatoriosLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : relatoriosError ? (
                    <Alert severity="error">{relatoriosError}</Alert>
                  ) : relatorios.length === 0 ? (
                    <Alert severity="info">Nenhum relatório disponível para este ativo.</Alert>
                  ) : (
                    <TableContainer component={Card}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Data de Referência</TableCell>
                            <TableCell>Data de Upload</TableCell>
                            <TableCell align="right">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {relatorios.map((relatorio) => (
                            <TableRow key={relatorio.id}>
                              <TableCell>{relatorio.nome}</TableCell>
                              <TableCell>
                                <Chip label={relatorioTipos[relatorio.tipo] || 'Desconhecido'} size="small" />
                              </TableCell>
                              <TableCell>{relatorio.dataReferencia}</TableCell>
                              <TableCell>{relatorio.dataUpload}</TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  {relatorio.tipoVisualizacao === 'pdf' && relatorio.nomeArquivoPdf && (
                                    <Tooltip title="Baixar PDF">
                                      <IconButton color="primary" href={relatorio.arquivoPdf} download={relatorio.nomeArquivoPdf}>
                                        <DownloadIconCustom />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Visualizar">
                                    <IconButton color="primary" onClick={() => handleOpenModal(relatorio)}>
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {/* Botões de upload/reupload/delete podem ser adicionados aqui */}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
              {tabValue === 2 && ativo.tipo === 'REIT' && dadosFII && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dados Específicos de REIT
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Valor Patrimonial: <Typography component="span" fontWeight="bold">{formatCurrency(dadosFII.valorPatrimonial, 'USD')}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Patrimônio Total: <Typography component="span" fontWeight="bold">{formatCurrency(dadosFII.patrimonio, 'USD')}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        P/VP: <Typography component="span" fontWeight="bold">{dadosFII.pvp.toFixed(2)}x</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Valor de Mercado: <Typography component="span" fontWeight="bold">{formatCurrency(dadosFII.valorMercado, 'USD')}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Valor em Caixa: <Typography component="span" fontWeight="bold">{formatCurrency(dadosFII.valorCaixa, 'USD')}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Número de Cotas: <Typography component="span" fontWeight="bold">{formatLargeNumber(dadosFII.numeroCotas)}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Último Rendimento (por cota): <Typography component="span" fontWeight="bold">{formatCurrency(dadosFII.ultimoRendimento, 'USD')}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Data Último Rendimento: <Typography component="span" fontWeight="bold">{dadosFII.dataUltimoRendimento}</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        DY CAGR 3 Anos: <Typography component="span" fontWeight="bold">{dadosFII.dyCagr3Anos.toFixed(2)}%</Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Número de Cotistas: <Typography component="span" fontWeight="bold">{formatLargeNumber(dadosFII.numeroCotistas)}</Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Fonte dos Dados: {dadosFII.fonte} (Última atualização: {dadosFII.ultimaAtualizacao || 'N/A'})
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRelatorio?.nome}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {renderVisualizacaoRelatorio()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
