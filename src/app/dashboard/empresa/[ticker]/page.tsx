'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import Paper from '@mui/material/Paper';
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
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { WarningCircle as WarningIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { FileText as FileIcon } from '@phosphor-icons/react/dist/ssr/FileText';

// 🔑 TOKEN BRAPI VALIDADO
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
  pvp?: number;
  roe?: number;
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

interface Relatorio {
  id: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataUpload: string;
  dataReferencia: string;
  arquivo: string; // Base64 ou URL
  tamanho: string;
}

interface Dividendo {
  paymentDate: string;
  rate: number;
  type: string;
}

// 🚀 HOOK PARA BUSCAR DADOS FINANCEIROS
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

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      
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
          
          let dividendYield = 0;
          if (quote.dividendYield) {
            dividendYield = quote.dividendYield;
          } else if (quote.dividendsData?.yield) {
            dividendYield = quote.dividendsData.yield;
          }

          const pl = quote.priceEarnings || quote.pe;
          const pvp = quote.priceToBook;
          const roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined;
          const marketCap = quote.marketCap;

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: precoAtual,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            dy: dividendYield,
            marketCap: marketCap,
            pl: pl,
            pvp: pvp,
            roe: roe
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

// 🚀 HOOK PARA BUSCAR DIVIDENDOS
function useDividendos(ticker: string) {
  const [dividendos, setDividendos] = useState<Dividendo[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarDividendos = React.useCallback(async () => {
    if (!ticker) return;
    
    setLoading(true);
    try {
      const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results?.[0]?.dividendsData?.cashDividends) {
        setDividendos(data.results[0].dividendsData.cashDividends.slice(0, 8));
      }
    } catch (error) {
      console.error('Erro ao buscar dividendos:', error);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    buscarDividendos();
  }, [buscarDividendos]);

  return { dividendos, loading, refetch: buscarDividendos };
}

// 🎯 FUNÇÃO PARA CALCULAR VIÉS
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
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
}

// 🔥 FUNÇÃO PARA FORMATAR VALORES
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

// 📊 COMPONENTE DE MÉTRICA NO ESTILO MODERNO
const MetricCard = ({ 
  title, 
  value, 
  color = 'primary', 
  subtitle, 
  loading = false,
  trend,
  highlight = false,
  showInfo = false
}: { 
  title: string; 
  value: string; 
  color?: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  highlight?: boolean;
  showInfo?: boolean;
}) => (
  <Card sx={{ 
    borderRadius: 2,
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': { 
      transform: 'translateY(-2px)', 
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)' 
    }
  }}>
    {/* Header com título */}
    <Box sx={{ 
      backgroundColor: '#374151',
      color: 'white',
      py: 1.5,
      px: 2,
      position: 'relative'
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </Typography>
        {showInfo && (
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            ?
          </Box>
        )}
      </Stack>
    </Box>

    {/* Conteúdo principal */}
    <CardContent sx={{ 
      backgroundColor: 'white',
      p: 2.5,
      textAlign: 'center',
      '&:last-child': { pb: 2.5 }
    }}>
      {loading ? (
        <Skeleton variant="text" height={40} />
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              fontSize: '1.75rem',
              color: '#1f2937',
              lineHeight: 1
            }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ ml: 0.5 }}>
                {trend === 'up' ? (
                  <TrendUpIcon size={16} style={{ color: '#10b981' }} />
                ) : (
                  <TrendDownIcon size={16} style={{ color: '#ef4444' }} />
                )}
              </Box>
            )}
          </Stack>
          
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#6b7280',
              fontSize: '0.7rem',
              display: 'block',
              mt: 0.5,
              lineHeight: 1.2
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// 📄 COMPONENTE PARA UPLOAD DE RELATÓRIOS PDF
const GerenciadorRelatorios = ({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    tipo: 'trimestral' as const,
    dataReferencia: '',
    arquivo: null as File | null
  });

  // Carregar relatórios do localStorage
  useEffect(() => {
    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = localStorage.getItem(chave);
    if (relatoriosExistentes) {
      setRelatorios(JSON.parse(relatoriosExistentes));
    }
  }, [ticker]);

  const salvarRelatorio = () => {
    if (novoRelatorio.arquivo && novoRelatorio.nome) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const relatorio: Relatorio = {
          id: Date.now().toString(),
          nome: novoRelatorio.nome,
          tipo: novoRelatorio.tipo,
          dataUpload: new Date().toISOString(),
          dataReferencia: novoRelatorio.dataReferencia,
          arquivo: e.target?.result as string, // Base64
          tamanho: `${(novoRelatorio.arquivo!.size / 1024 / 1024).toFixed(1)} MB`
        };

        const chave = `relatorios_${ticker}`;
        const relatoriosExistentes = JSON.parse(localStorage.getItem(chave) || '[]');
        relatoriosExistentes.push(relatorio);
        localStorage.setItem(chave, JSON.stringify(relatoriosExistentes));
        
        setRelatorios(relatoriosExistentes);
        setDialogAberto(false);
        setNovoRelatorio({ nome: '', tipo: 'trimestral', dataReferencia: '', arquivo: null });
      };
      reader.readAsDataURL(novoRelatorio.arquivo);
    }
  };

  const excluirRelatorio = (id: string) => {
    const chave = `relatorios_${ticker}`;
    const relatoriosAtualizados = relatorios.filter(r => r.id !== id);
    localStorage.setItem(chave, JSON.stringify(relatoriosAtualizados));
    setRelatorios(relatoriosAtualizados);
  };

  const baixarRelatorio = (relatorio: Relatorio) => {
    const link = document.createElement('a');
    link.href = relatorio.arquivo;
    link.download = `${relatorio.nome}.pdf`;
    link.click();
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📄 Relatórios e Apresentações
          </Typography>
          <Button 
            startIcon={<UploadIcon />}
            onClick={() => setDialogAberto(true)}
            variant="contained"
            size="small"
          >
            Adicionar PDF
          </Button>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <FileIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography>Nenhum relatório cadastrado ainda</Typography>
            <Typography variant="caption">Clique em "Adicionar PDF" para começar</Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} divider sx={{ px: 0 }}>
                <ListItemText
                  primary={relatorio.nome}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={relatorio.tipo} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption">
                        {relatorio.dataReferencia} • {relatorio.tamanho}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => baixarRelatorio(relatorio)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => excluirRelatorio(relatorio.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog para upload */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Novo Relatório</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nome do Relatório"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, nome: e.target.value})}
                fullWidth
                placeholder="Ex: Resultados 3T24"
              />
              
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio({...novoRelatorio, tipo: e.target.value as any})}
                >
                  <MenuItem value="trimestral">Resultado Trimestral</MenuItem>
                  <MenuItem value="anual">Resultado Anual</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="outros">Outros</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Data de Referência"
                type="date"
                value={novoRelatorio.dataReferencia}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, dataReferencia: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <Box>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    if (arquivo) {
                      setNovoRelatorio({...novoRelatorio, arquivo});
                    }
                  }}
                  style={{ display: 'none' }}
                  id="upload-pdf"
                />
                <label htmlFor="upload-pdf">
                  <Button component="span" variant="outlined" fullWidth startIcon={<UploadIcon />}>
                    {novoRelatorio.arquivo ? novoRelatorio.arquivo.name : 'Selecionar PDF'}
                  </Button>
                </label>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarRelatorio} 
              variant="contained" 
              disabled={!novoRelatorio.arquivo || !novoRelatorio.nome}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// 💰 COMPONENTE DE HISTÓRICO DE DIVIDENDOS
const HistoricoDividendos = ({ ticker }: { ticker: string }) => {
  const { dividendos, loading } = useDividendos(ticker);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          💰 Histórico de Dividendos
        </Typography>

        {loading ? (
          <Stack spacing={1}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={40} />
            ))}
          </Stack>
        ) : dividendos.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="right">Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dividendos.map((div, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(div.paymentDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell align="right">{formatarValor(div.rate)}</TableCell>
                    <TableCell align="right">
                      <Chip label={div.type} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Nenhum histórico de dividendos disponível
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// 📈 COMPONENTE DE RESUMO EXECUTIVO
const ResumoExecutivo = ({ empresa, dados }: { empresa: EmpresaCompleta; dados: DadosFinanceiros | null }) => {
  const calcularResumo = () => {
    const precoEntrada = parseFloat(empresa.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const precoTeto = parseFloat(empresa.precoTeto.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const precoAtual = dados?.precoAtual || precoEntrada;
    
    const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
    const potencialTeto = ((precoTeto - precoAtual) / precoAtual) * 100;
    
    return {
      performance,
      potencialTeto,
      statusInvestimento: performance > 0 ? 'Lucro' : 'Prejuízo',
      recomendacao: potencialTeto > 20 ? 'Oportunidade' : potencialTeto > 0 ? 'Neutro' : 'Atenção'
    };
  };

  const resumo = calcularResumo();

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      mb: 4
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          📈 Resumo Executivo
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatarValor(resumo.performance, 'percent')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Performance Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatarValor(resumo.potencialTeto, 'percent')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Potencial até Teto
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={resumo.statusInvestimento}
                sx={{ 
                  backgroundColor: resumo.performance > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                Status Atual
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={resumo.recomendacao}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                Recomendação
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// 🔥 DADOS BASE
const ativosBase = [
  {
    ticker: 'ALOS3',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
    setor: 'Shoppings'
  }
];

// Dados de fallback
const dadosFallback: { [key: string]: EmpresaCompleta } = {
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
  }
};

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  // 📊 BUSCAR DY DOS DADOS DA TABELA PRINCIPAL
  const buscarDYDaTabela = (ticker: string): string => {
    try {
      const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
      
      if (dadosAdmin) {
        const ativos = JSON.parse(dadosAdmin);
        const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
        
        if (ativoEncontrado && ativoEncontrado.dy) {
          return ativoEncontrado.dy;
        }
      }

      const ativoBase = ativosBase?.find(a => a.ticker === ticker);
      if (ativoBase && ativoBase.dy) {
        return ativoBase.dy;
      }

      if (ticker === 'ALOS3') return '5,95%';
      
      return 'N/A';
    } catch (err) {
      return 'N/A';
    }
  };

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
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

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  // 🔥 COMBINAR DADOS
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

  // 📊 CALCULAR PERFORMANCE
  const calcularPerformance = () => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    const precoEntradaStr = empresaCompleta.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.');
    const precoEntrada = parseFloat(precoEntradaStr);
    const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
    
    if (precoEntrada > 0 && precoAtual > 0) {
      const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
      return formatarValor(performance, 'percent');
    }
    
    return 'N/A';
  };

  const dyDaTabela = buscarDYDaTabela(ticker);

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
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            startIcon={<ArrowLeftIcon />} 
            onClick={() => window.history.back()}
            variant="contained"
            size="large"
          >
            Voltar à Lista
          </Button>
        </Stack>
      </Box>
    );
  }

  const isFII = empresaCompleta.tipo === 'FII';
  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual) : empresaCompleta.precoIniciou;
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : 'up';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header com navegação */}
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
              Carregando dados da API...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              <WarningIcon size={16} />
              Erro na API: {dadosError}
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              <CheckIcon size={16} />
              Dados atualizados via API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Usando dados estáticos
            </Alert>
          )}
          
          <Tooltip title="Atualizar dados">
            <IconButton onClick={refetch} disabled={dadosLoading}>
              <RefreshIcon size={20} />
            </IconButton>
          </Tooltip>
          
          <Button 
            startIcon={<SettingsIcon />} 
            onClick={() => window.open('/admin', '_blank')}
            variant="outlined"
            size="small"
          >
            Gerenciar
          </Button>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
        color: 'black' 
      }}>
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
                border: '4px solid rgba(255,255,255,0.2)'
              }} 
            />
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
                {isFII && (
                  <Chip 
                    label="FII" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'black',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {empresaCompleta.descricao}
              </Typography>
              {ultimaAtualizacao && (
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  Última atualização: {ultimaAtualizacao}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'black' }}>
                    {precoAtualFormatado}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                  >
                    {tendencia === 'up' ? (
                      <TrendUpIcon size={24} style={{ color: '#22c55e' }} />
                    ) : (
                      <TrendDownIcon size={24} style={{ color: '#ef4444' }} />
                    )}
                    <Box>
                      <Typography sx={{ 
                        color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                        fontWeight: 700, 
                        fontSize: '1.2rem',
                        lineHeight: 1
                      }}>
                        {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        display: 'block',
                        textAlign: { xs: 'center', md: 'right' }
                      }}>
                        variação hoje
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* NOVO: Resumo Executivo */}
      <ResumoExecutivo empresa={empresaCompleta} dados={dados} />

      {/* Cards de métricas - ESTILO MODERNO */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="COTAÇÃO" 
            value={precoAtualFormatado.replace('R$ ', 'R$ ')}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="VARIAÇÃO HOJE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
            subtitle="variação hoje"
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="VARIAÇÃO (12M)" 
            value={calcularPerformance()}
            loading={dadosLoading}
            trend={calcularPerformance().includes('-') ? 'down' : 'up'}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/L" 
            value={dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/VP" 
            value={dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DY" 
            value={dyDaTabela}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
      </Grid>

      {/* Cards adicionais - Segunda linha */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="VIÉS ATUAL" 
            value={empresaCompleta.viesAtual}
            color={
              empresaCompleta.viesAtual.includes('Compra') ? 'success' : 
              empresaCompleta.viesAtual === 'Venda' ? 'error' : 'primary'
            }
            loading={dadosLoading}
            subtitle="Automático"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="% CARTEIRA" 
            value={empresaCompleta.percentualCarteira || 'N/A'} 
            subtitle="Participação"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="PREÇO TETO" 
            value={empresaCompleta.precoTeto} 
            subtitle="Meta definida"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="ROE" 
            value={dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
            loading={dadosLoading}
            subtitle="Retorno patrimônio"
          />
        </Grid>
      </Grid>

      {/* NOVAS SEÇÕES EM GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Upload de Relatórios */}
        <Grid item xs={12} md={6}>
          <GerenciadorRelatorios ticker={ticker} />
        </Grid>
        
        {/* Histórico de Dividendos */}
        <Grid item xs={12} md={6}>
          <HistoricoDividendos ticker={ticker} />
        </Grid>
      </Grid>

      {/* Dados da posição */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.dataEntrada}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.precoIniciou}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: dados?.precoAtual ? '#e8f5e8' : '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: dados?.precoAtual ? '#22c55e' : 'inherit' 
                  }}>
                    {precoAtualFormatado}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.ibovespaEpoca}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📈 {isFII ? 'Dados do Fundo' : 'Dados Fundamentalistas'}
              </Typography>
              
              {dadosLoading ? (
                <Stack spacing={2}>
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={50} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.marketCap ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.marketCap ? formatarValor(dados.marketCap, 'millions') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.pl ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">P/L</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.pvp ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">P/VPA</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.roe ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">ROE</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: dados?.roe ? '#22c55e' : 'inherit'
                    }}>
                      {dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análise de performance */}
      {dados && dados.precoAtual > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  🎯 Análise de Performance com Dados Reais
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Performance vs Preço de Entrada
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {empresaCompleta.ticker} - {calcularPerformance()}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(Math.abs(
                              parseFloat(calcularPerformance().replace('%', '').replace(',', '.')) || 0
                            ), 100)} 
                            sx={{ 
                              height: 12, 
                              borderRadius: 1, 
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          minWidth: 80,
                          color: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e'
                        }}>
                          {calcularPerformance()}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Distância do Preço Teto
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Potencial até o teto
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 100)} 
                            sx={{ 
                              height: 12, 
                              borderRadius: 1, 
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          minWidth: 80,
                          color: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444'
                        }}>
                          {formatarValor((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 'percent')}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        💡 Resumo da Análise
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Viés calculado:</Typography>
                          <Chip 
                            label={empresaCompleta.viesAtual} 
                            size="small"
                            color={
                              empresaCompleta.viesAtual.includes('Compra') ? 'success' : 
                              empresaCompleta.viesAtual === 'Venda' ? 'error' : 'default'
                            }
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">DY da tabela:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                            {dyDaTabela}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Fonte dos dados:</Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: dados && dados.precoAtual > 0 ? '#22c55e' : '#f59e0b' 
                          }}>
                            {dados && dados.precoAtual > 0 ? 'API BRAPI' : 'Estático'}
                          </Typography>
                        </Box>
                        {ultimaAtualizacao && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Atualizado:</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ultimaAtualizacao.split(' ')[1]}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Ações rápidas */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#f8fafc' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🚀 Ações Rápidas
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  startIcon={<RefreshIcon />} 
                  onClick={refetch}
                  variant="contained"
                  size="small"
                  disabled={dadosLoading}
                >
                  {dadosLoading ? 'Atualizando...' : 'Atualizar Dados'}
                </Button>
                <Button 
                  startIcon={<SettingsIcon />} 
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outlined"
                  size="small"
                >
                  Editar no Admin
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.google.com/search?q=${empresaCompleta.ticker}+dividendos+${new Date().getFullYear()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  🔍 Pesquisar Dividendos
                </Button>
                <Button 
                  onClick={() => window.open(`https://statusinvest.com.br/${isFII ? 'fundos-imobiliarios' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📊 Ver no Status Invest
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.investidor10.com.br/${isFII ? 'fiis' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📈 Ver no Investidor10
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
