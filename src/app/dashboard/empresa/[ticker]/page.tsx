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
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Settings as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Settings';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';

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
  // Dados dinâmicos da API
  precoAtual?: string;
  variacao?: string;
  variacaoHoje?: string;
  dy?: string;
  tendencia?: 'up' | 'down';
  rendProventos?: string;
  ibovespaVariacao?: string;
}

interface Empresa extends EmpresaBase {
  tipo?: never;
  marketCap: string;
  pl: string;
  pvp: string;
  roe: string;
}

interface FII extends EmpresaBase {
  tipo: 'FII';
  patrimonio: string;
  p_vp: string;
  vacancia: string;
  imoveis: number;
  gestora: string;
}

type EmpresaCompleta = Empresa | FII;

// Dados de fallback (seus dados originais) - serão usados se não houver dados no localStorage
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Consumo Cíclico',
    descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    precoAtual: 'R$ 21,75',
    variacao: '-18.5%',
    tendencia: 'down',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    dy: '5,96%',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Neutro',
    variacaoHoje: '-1.2%',
    rendProventos: '-16.6%',
    ibovespaEpoca: '108.500',
    ibovespaVariacao: '+12.8%',
    percentualCarteira: '4.2%',
    marketCap: 'R$ 8.2 bi',
    pl: '12.5',
    pvp: '0.8',
    roe: '15.2%',
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,45', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
      { tipo: 'JCP', valor: 'R$ 0,32', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
      { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
    ]
  },
  'MALL11': {
    ticker: 'MALL11',
    nomeCompleto: 'Shopping Outlets Premium FII',
    setor: 'Shopping',
    tipo: 'FII',
    descricao: 'O Shopping Outlets Premium FII é especializado em shopping centers premium e outlets.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
    precoAtual: 'R$ 109,23',
    variacao: '-7.65%',
    tendencia: 'down',
    dataEntrada: '26/01/2022',
    precoIniciou: 'R$ 118,27',
    dy: '10,09%',
    precoTeto: 'R$ 109,68',
    viesAtual: 'Compra',
    variacaoHoje: '-0.8%',
    rendProventos: '+12.4%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '8.5%',
    patrimonio: 'R$ 2.1 bilhões',
    p_vp: '1.08',
    vacancia: '4,2%',
    imoveis: 47,
    gestora: 'BTG Pactual',
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
      { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
    ]
  }
  // Adicione mais dados de fallback conforme necessário
};

const MetricCard = ({ title, value, color = 'primary' }: { title: string; value: string; color?: string }) => (
  <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h5" sx={{ 
        fontWeight: 700, 
        color: color === 'success' ? '#22c55e' : color === 'error' ? '#ef4444' : 'inherit' 
      }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

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

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelatorio, setSelectedRelatorio] = useState<Relatorio | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        setLoading(true);
        setError(null);

        // Tentar carregar dados do localStorage (vindos do admin)
        const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
        
        if (dadosAdmin) {
          const ativos = JSON.parse(dadosAdmin);
          const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
          
          if (ativoEncontrado) {
            setEmpresa(ativoEncontrado);
            setDataSource('admin');
            setLoading(false);
            return;
          }
        }

        // Se não encontrou no admin, usar dados de fallback
        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          setLoading(false);
          return;
        }

        // Se não encontrou em lugar nenhum
        setDataSource('not_found');
        setLoading(false);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados da empresa');
        setLoading(false);
      }
    };

    carregarDados();
  }, [ticker]);

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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Carregando dados...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
        >
          Voltar
        </Button>
      </Box>
    );
  }

  if (!empresa || dataSource === 'not_found') {
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

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';
  const isFII = empresa.tipo === 'FII';

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
        
        <Stack direction="row" spacing={2}>
          {dataSource === 'fallback' && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Dados estáticos • Configure no Admin para dados dinâmicos
            </Alert>
          )}
          {dataSource === 'admin' && (
            <Alert severity="success" sx={{ py: 0.5 }}>
              🟢 Dados via Admin + API Brapi
            </Alert>
          )}
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
              src={empresa.avatar} 
              alt={empresa.ticker} 
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
                  {empresa.ticker}
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
                {empresa.nomeCompleto}
              </Typography>
              <Chip 
                label={empresa.setor} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'black',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {empresa.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'black' }}>
                {empresa.precoAtual || 'N/A'}
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
                <TrendIcon size={24} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 700, fontSize: '1.2rem' }}>
                  {empresa.variacao || 'N/A'}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                Variação hoje: {empresa.variacaoHoje || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Dividend Yield" 
            value={empresa.dy || 'N/A'} 
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Viés Atual" 
            value={empresa.viesAtual || 'N/A'}
            color={empresa.viesAtual === 'Compra' ? 'success' : empresa.viesAtual === 'Venda' ? 'error' : 'primary'}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="% Carteira" 
            value={empresa.percentualCarteira || 'N/A'} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title={isFII ? "P/VP" : "P/L"} 
            value={isFII ? (empresa as FII).p_vp : (empresa as Empresa).pl} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Preço Teto" 
            value={empresa.precoTeto || 'N/A'} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Rendimento" 
            value={empresa.rendProventos || 'N/A'}
            color="success" 
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
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.ibovespaEpoca}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa Variação</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                    {empresa.ibovespaVariacao || 'N/A'}
                  </Typography>
                </Box>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).patrimonio}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Vacância</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).vacancia}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Nº de Imóveis</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).imoveis}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Gestora</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).gestora}</Typography>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as Empresa).marketCap}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">P/VPA</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as Empresa).pvp}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">ROE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                        {(empresa as Empresa).roe}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção de proventos */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                💰 Histórico de Proventos
              </Typography>
              
              {empresa.proventos && empresa.proventos.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Data Ex</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pagamento</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {empresa.proventos.map((provento, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip 
                              label={provento.tipo} 
                              size="small" 
                              color={provento.tipo === 'Dividendo' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            {provento.valor}
                          </TableCell>
                          <TableCell>{provento.dataEx}</TableCell>
                          <TableCell>{provento.dataPagamento}</TableCell>
                          <TableCell>
                            <Chip 
                              label={provento.status} 
                              size="small"
                              sx={{ 
                                backgroundColor: provento.status === 'Pago' ? '#dcfce7' : '#dbeafe', 
                                color: provento.status === 'Pago' ? '#22c55e' : '#3b82f6', 
                                fontWeight: 600
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    📭 Nenhum provento encontrado para esta empresa.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Seção de relatórios */}
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
              
              {empresa.relatorios && empresa.relatorios.length > 0 ? (
                <Grid container spacing={2}>
                  {empresa.relatorios.map((relatorio, index) => (
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
                              
                              {/* Indicadores de disponibilidade */}
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
                            
                            {/* Botão de download direto */}
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
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    📭 Nenhum relatório encontrado para esta empresa.
                  </Typography>
                  {dataSource === 'admin' && (
                    <Button 
                      startIcon={<SettingsIcon />} 
                      onClick={() => window.open('/admin', '_blank')}
                      variant="outlined"
                      sx={{ mt: 2 }}
                      size="small"
                    >
                      Adicionar Relatórios no Admin
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                🎯 Análise de Performance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Performance vs Ibovespa
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {isFII ? 'FII' : 'Ação'}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.abs(parseFloat(empresa.rendProventos?.replace(/[^\d.-]/g, '') || '0'))} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1, 
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: empresa.rendProventos?.includes('-') ? '#ef4444' : '#22c55e'
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        minWidth: 60,
                        color: empresa.rendProventos?.includes('-') ? '#ef4444' : '#22c55e'
                      }}>
                        {empresa.rendProventos || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ibovespa no período
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Ibovespa</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.abs(parseFloat(empresa.ibovespaVariacao?.replace(/[^\d.-]/g, '') || '0'))} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="info"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        {empresa.ibovespaVariacao || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Resumo do Investimento
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Investido em:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Preço inicial:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Preço atual:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoAtual || 'N/A'}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Rendimento total:</Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 700, 
                          color: empresa.rendProventos?.includes('-') ? '#ef4444' : '#22c55e'
                        }}>
                          {empresa.rendProventos || 'N/A'}
                        </Typography>
                      </Box>
                      {dataSource === 'admin' && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Fonte dos dados:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                              Admin + API Brapi
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Ações rápidas */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#f8fafc' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🚀 Ações Rápidas
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  startIcon={<SettingsIcon />} 
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outlined"
                  size="small"
                >
                  Editar no Admin
                </Button>
                {dataSource === 'fallback' && (
                  <Button 
                    onClick={() => {
                      localStorage.removeItem('portfolioDataAdmin');
                      window.location.reload();
                    }}
                    variant="outlined"
                    size="small"
                    color="warning"
                  >
                    🔄 Resetar Cache
                  </Button>
                )}
                <Button 
                  onClick={() => window.open(`https://www.google.com/search?q=${empresa.ticker}+dividendos+${new Date().getFullYear()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  🔍 Pesquisar Dividendos
                </Button>
                <Button 
                  onClick={() => window.open(`https://statusinvest.com.br/${isFII ? 'fundos-imobiliarios' : 'acoes'}/${empresa.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📊 Ver no Status Invest
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
