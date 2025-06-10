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
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';
import { Refresh as RefreshIcon } from '@phosphor-icons/react/dist/ssr/Refresh';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';

// 🔑 TOKEN BRAPI VALIDADO
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

interface Provento {
  tipo: string;
  valor: string;
  dataEx: string;
  dataPagamento: string;
  status: string;
}

interface Relatorio {
  nome: string;
  data: string;
  tipo: string;
  canvaUrl?: string;
  downloadUrl?: string;
}

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
  ebitda?: number;
  dividaLiquida?: number;
  patrimonio?: number;
  vacancia?: number;
  rendimento12m?: number;
  valorPatrimonial?: number;
  ultimoRendimento?: number;
}

interface EmpresaBase {
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
  proventos?: Provento[];
  relatorios?: Relatorio[];
  dadosFinanceiros?: DadosFinanceiros;
  statusApi?: 'loading' | 'success' | 'error' | 'not_found';
  ultimaAtualizacao?: string;
}

interface Empresa extends EmpresaBase {
  tipo?: never;
}

interface FII extends EmpresaBase {
  tipo: 'FII';
  gestora: string;
  imoveis?: number;
}

type EmpresaCompleta = Empresa | FII;

// 🚀 HOOK PARA BUSCAR DADOS FINANCEIROS COMPLETOS VIA BRAPI
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

      console.log(`🔍 Buscando dados completos para ${ticker}...`);

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      
      const response = await fetch(quoteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Details-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 Dados recebidos para ${ticker}:`, data);

        if (data.results && data.results.length > 0) {
          const quote = data.results[0];
          const summaryDetail = quote.summaryDetail || {};
          const defaultStatistics = quote.defaultStatistics || {};
          
          const isFII = ticker.includes('11') || ticker.includes('FII') || 
                       quote.quoteType === 'TRUST' || 
                       quote.longName?.includes('Fundo');

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: quote.regularMarketPrice || 0,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            
            ...(!isFII && {
              marketCap: summaryDetail.marketCap,
              pl: summaryDetail.trailingPE || summaryDetail.forwardPE,
              pvp: summaryDetail.priceToBook,
              roe: defaultStatistics.returnOnEquity ? defaultStatistics.returnOnEquity * 100 : undefined,
              ebitda: quote.financialData?.ebitda,
              dividaLiquida: quote.financialData?.totalDebt
            }),
            
            ...(isFII && {
              patrimonio: summaryDetail.totalAssets || summaryDetail.marketCap,
              valorPatrimonial: summaryDetail.bookValue || summaryDetail.navPrice,
              pvp: summaryDetail.priceToBook || (quote.regularMarketPrice / (summaryDetail.bookValue || 1)),
              rendimento12m: quote.dividendsData?.yield || summaryDetail.yield
            }),
            
            dy: quote.dividendsData?.yield || summaryDetail.dividendYield || summaryDetail.yield
          };

          console.log(`✅ Dados processados para ${ticker}:`, dadosProcessados);
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
      console.error(`❌ Erro ao buscar dados para ${ticker}:`, err);
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

// 🎯 FUNÇÃO PARA CALCULAR VIÉS BASEADO EM DADOS REAIS
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  
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

// 🔥 FUNÇÃO PARA FORMATAR VALORES FINANCEIROS
function formatarValor(valor: number | undefined, tipo: 'currency' | 'percent' | 'number' | 'millions' = 'currency'): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
  
  switch (tipo) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(valor);
    
    case 'percent':
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1000000000) {
        return `R$ ${(valor / 1000000000).toFixed(1)} bi`;
      } else if (valor >= 1000000) {
        return `R$ ${(valor / 1000000).toFixed(1)} mi`;
      } else {
        return formatarValor(valor, 'currency');
      }
    
    case 'number':
      return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    
    default:
      return valor.toString();
  }
}

// 📊 COMPONENTE DE MÉTRICA MELHORADO
const MetricCard = ({ 
  title, 
  value, 
  color = 'primary', 
  subtitle, 
  loading = false,
  icon,
  trend 
}: { 
  title: string; 
  value: string; 
  color?: string; 
  subtitle?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}) => (
  <Card sx={{ height: '100%', border: '1px solid #e5e7eb', position: 'relative' }}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      {loading ? (
        <>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={20} />
        </>
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
            {icon}
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: color === 'success' ? '#22c55e' : color === 'error' ? '#ef4444' : 'inherit' 
            }}>
              {value}
            </Typography>
            {trend && (
              <Box>
                {trend === 'up' ? (
                  <TrendUpIcon size={20} style={{ color: '#22c55e' }} />
                ) : (
                  <TrendDownIcon size={20} style={{ color: '#ef4444' }} />
                )}
              </Box>
            )}
          </Stack>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// Modal para relatórios
const RelatorioModal = ({ relatorio, open, onClose }: { 
  relatorio: Relatorio | null; 
  open: boolean; 
  onClose: () => void; 
}) => {
  if (!relatorio) return null;

  const handleDownload = () => {
    if (relatorio.downloadUrl) {
      const link = document.createElement('a');
      link.href = relatorio.downloadUrl;
      link.download = `${relatorio.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {relatorio.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {relatorio.data} • {relatorio.tipo}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon size={24} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {relatorio.canvaUrl ? (
          <iframe
            src={relatorio.canvaUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              minHeight: '600px'
            }}
            title={relatorio.nome}
            allowFullScreen
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column'
          }}>
            <FileTextIcon size={64} style={{ color: '#9ca3af', marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">
              Visualização não disponível
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este relatório pode ser baixado diretamente
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
        >
          Fechar
        </Button>
        {relatorio.downloadUrl && (
          <Button 
            onClick={handleDownload}
            variant="contained"
            startIcon={<DownloadIcon size={20} />}
          >
            Baixar PDF
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Dados de fallback alinhados com a tabela
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
    percentualCarteira: '4.2%',
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,45', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
      { tipo: 'JCP', valor: 'R$ 0,32', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
    ]
  },
  'TUPY3': {
    ticker: 'TUPY3',
    nomeCompleto: 'Tupy S.A.',
    setor: 'Industrial',
    descricao: 'A Tupy é uma das maiores fundições de ferro do mundo.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
    dataEntrada: '04/11/2020',
    precoIniciou: 'R$ 20,36',
    precoTeto: 'R$ 31,50',
    viesAtual: 'Compra',
    ibovespaEpoca: '105.200',
    percentualCarteira: '3.8%'
  },
  'RECV3': {
    ticker: 'RECV3',
    nomeCompleto: 'Recam S.A.',
    setor: 'Petróleo',
    descricao: 'A Recam atua no segmento de exploração e produção de petróleo.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    dataEntrada: '23/07/2023',
    precoIniciou: 'R$ 22,29',
    precoTeto: 'R$ 31,37',
    viesAtual: 'Compra',
    ibovespaEpoca: '115.800',
    percentualCarteira: '5.1%'
  },
  'PRIO3': {
    ticker: 'PRIO3',
    nomeCompleto: 'PetroRio S.A.',
    setor: 'Petróleo',
    descricao: 'A PetroRio é uma empresa brasileira de exploração e produção de petróleo e gás natural.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PRIO.png',
    dataEntrada: '04/08/2022',
    precoIniciou: 'R$ 23,35',
    precoTeto: 'R$ 48,70',
    viesAtual: 'Compra',
    ibovespaEpoca: '108.200',
    percentualCarteira: '12.3%'
  },
  'MALL11': {
    ticker: 'MALL11',
    nomeCompleto: 'Shopping Outlets Premium FII',
    setor: 'Shopping',
    tipo: 'FII',
    descricao: 'O Shopping Outlets Premium FII é especializado em shopping centers premium e outlets.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
    dataEntrada: '26/01/2022',
    precoIniciou: 'R$ 118,27',
    precoTeto: 'R$ 109,68',
    viesAtual: 'Compra',
    ibovespaEpoca: '114.200',
    percentualCarteira: '8.5%',
    gestora: 'BTG Pactual',
    imoveis: 47,
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
    ]
  }
};

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  const [selectedRelatorio, setSelectedRelatorio] = useState<Relatorio | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 🚀 BUSCAR DADOS FINANCEIROS REAIS
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        // Tentar carregar dados do localStorage (admin)
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

        // Usar dados de fallback
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

  // 🔥 COMBINAR DADOS BASE COM DADOS FINANCEIROS REAIS
  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;
    
    let empresaAtualizada = { ...empresa };
    
    if (dadosFinanceiros) {
      const precoEntradaNum = parseFloat(empresa.precoIniciou.replace('R$ ', '').replace(',', '.'));
      
      // 📊 CALCULAR PERFORMANCE
      const performance = dadosFinanceiros.precoAtual > 0 ? 
        ((dadosFinanceiros.precoAtual - precoEntradaNum) / precoEntradaNum) * 100 : 0;
      
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    }
    
    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  const handleRelatorioClick = (relatorio: Relatorio) => {
    setSelectedRelatorio(relatorio);
    setModalOpen(true);
  };

  const handleDirectDownload = (relatorio: Relatorio, event: React.MouseEvent) => {
    event.stopPropagation();
    if (relatorio.downloadUrl) {
      const link = document.createElement('a');
      link.href = relatorio.downloadUrl;
      link.download = `${relatorio.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
          <Button 
            startIcon={<SettingsIcon />} 
            onClick={() => window.open('/admin', '_blank')}
            variant="outlined"
            size="large"
          >
            Adicionar no Admin
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
          {/* Status dos dados */}
          {dadosLoading ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Carregando dados da API...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              <WarningIcon size={16} />
              Usando dados estáticos
            </Alert>
          ) : dados ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              <CheckIcon size={16} />
              Dados atualizados via API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Dados estáticos
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
                    <Typography sx={{ 
                      color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                      fontWeight: 700, 
                      fontSize: '1.2rem' 
                    }}>
                      {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                    Volume: {dados?.volume ? formatarValor(dados.volume, 'number') : 'N/A'}
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Dividend Yield" 
            value={dados?.dy ? formatarValor(dados.dy, 'percent') : 'N/A'}
            color="success"
            loading={dadosLoading}
            subtitle="Baseado no preço atual"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Viés Atual" 
            value={empresaCompleta.viesAtual}
            color={
              empresaCompleta.viesAtual.includes('Compra') ? 'success' : 
              empresaCompleta.viesAtual === 'Venda' ? 'error' : 'primary'
            }
            loading={dadosLoading}
            subtitle="Calculado automaticamente"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="% Carteira" 
            value={empresaCompleta.percentualCarteira || 'N/A'} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title={isFII ? "P/VP" : "P/L"} 
            value={dados?.pl || dados?.pvp ? formatarValor(dados.pl || dados.pvp, 'number') : 'N/A'}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Preço Teto" 
            value={empresaCompleta.precoTeto} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Performance" 
            value={dados?.precoAtual ? 
              formatarValor(
                ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) / 
                parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) * 100, 
                'percent'
              ) : 'N/A'}
            color={dados?.precoAtual && 
              ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) >= 0) ? 
              'success' : 'error'}
            loading={dadosLoading}
            trend={dados?.precoAtual && 
              ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) >= 0) ? 
              'up' : 'down'}
          />
        </Grid>
      </Grid>

      {/* Dados da posição e fundamentalistas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
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
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
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
                {dados && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">Volume Médio</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatarValor(dados.volume, 'number')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
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
                  {isFII ? (
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="text.secondary">Patrimônio</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dados?.patrimonio ? formatarValor(dados.patrimonio, 'millions') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="text.secondary">P/VP</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="text.secondary">Rendimento 12M</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                          {dados?.rendimento12m ? formatarValor(dados.rendimento12m, 'percent') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="text.secondary">Gestora</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(empresaCompleta as FII).gestora || 'N/A'}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: '#f8fafc', 
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
                        backgroundColor: '#f8fafc', 
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
                        backgroundColor: '#f8fafc', 
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
                        backgroundColor: '#f8fafc', 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2" color="text.secondary">ROE</Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: '#22c55e'
                        }}>
                          {dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
                        </Typography>
                      </Box>
                      {dados?.ebitda && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          p: 2, 
                          backgroundColor: '#e8f5e8', 
                          borderRadius: 1 
                        }}>
                          <Typography variant="body2" color="text.secondary">EBITDA</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatarValor(dados.ebitda, 'millions')}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análise de performance melhorada */}
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
                🎯 Análise de Performance Detalhada
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {dados && (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Performance vs Preço de Entrada
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {empresaCompleta.ticker}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(Math.abs(
                                ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) / 
                                parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) * 100
                              ), 100)} 
                              sx={{ 
                                height: 12, 
                                borderRadius: 1, 
                                backgroundColor: '#e5e7eb',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) >= 0) ? '#22c55e' : '#ef4444'
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            minWidth: 80,
                            color: ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) >= 0) ? '#22c55e' : '#ef4444'
                          }}>
                            {formatarValor(
                              ((dados.precoAtual - parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) / 
                              parseFloat(empresaCompleta.precoIniciou.replace('R$ ', '').replace(',', '.'))) * 100, 
                              'percent'
                            )}
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
                    </>
                  )}
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
                        <Typography variant="body2" color="text.secondary">DY atualizado:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                          {dados?.dy ? formatarValor(dados.dy, 'percent') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Fonte dos dados:</Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: dados ? '#22c55e' : '#f59e0b' 
                        }}>
                          {dados ? 'API BRAPI' : 'Estático'}
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

      {/* Seção de proventos se disponível */}
      {empresaCompleta.proventos && empresaCompleta.proventos.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  💰 Histórico de Proventos
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Data Ex</TableCell>
                        <TableCell>Pagamento</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {empresaCompleta.proventos.map((provento, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={provento.tipo} 
                              size="small"
                              color={provento.tipo === 'Dividendo' ? 'success' : 'primary'}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{provento.valor}</TableCell>
                          <TableCell>{provento.dataEx}</TableCell>
                          <TableCell>{provento.dataPagamento}</TableCell>
                          <TableCell>
                            <Chip 
                              label={provento.status} 
                              size="small"
                              color={provento.status === 'Pago' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Seção de relatórios */}
      {empresaCompleta.relatorios && empresaCompleta.relatorios.length > 0 && (
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
                  📄 Relatórios e Documentos
                </Typography>
                
                <Grid container spacing={2}>
                  {empresaCompleta.relatorios.map((relatorio, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          '&:hover': { 
                            transform: 'translateY(-2px)', 
                            boxShadow: 3 
                          },
                          border: '1px solid #e5e7eb',
                          position: 'relative'
                        }}
                        onClick={() => handleRelatorioClick(relatorio)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <FileTextIcon size={24} style={{ color: '#3b82f6', marginTop: 4 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                {relatorio.nome}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <CalendarIcon size={16} style={{ color: '#6b7280' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {relatorio.data}
                                </Typography>
                              </Stack>
                              <Chip 
                                label={relatorio.tipo} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                              
                              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                {relatorio.canvaUrl && (
                                  <Chip 
                                    label="👁️ Visualizar" 
                                    size="small" 
                                    sx={{ fontSize: '0.7rem' }}
                                    color="info"
                                  />
                                )}
                                {relatorio.downloadUrl && (
                                  <Chip 
                                    label="⬇️ Download" 
                                    size="small" 
                                    sx={{ fontSize: '0.7rem' }}
                                    color="success"
                                  />
                                )}
                              </Stack>
                            </Box>
                            
                            {relatorio.downloadUrl && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleDirectDownload(relatorio, e)}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                                  } 
                                }}
                              >
                                <DownloadIcon size={20} style={{ color: '#22c55e' }} />
                              </IconButton>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
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

      {/* Modal de relatório */}
      <RelatorioModal 
        relatorio={selectedRelatorio}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
}
