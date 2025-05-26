/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';

// Base de dados completa das empresas
const empresasData: { [key: string]: any } = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa integrada de energia, focada em óleo, gás natural e energia de baixo carbono.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    precoAtual: 'R$ 38,47',
    variacao: '+2.3%',
    tendencia: 'up',
    dataEntrada: '15/03/2022',
    precoIniciou: 'R$ 28,90',
    dy: '18.4%',
    precoTeto: 'R$ 45,00',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+24.7%',
    ibovespaEpoca: '112.200',
    ibovespaVariacao: '+18.2%',
    percentualCarteira: '12.5%',
    marketCap: 'R$ 512,8 bi',
    pl: '3.8',
    pvp: '1.2',
    roe: '31.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#', tipo: 'Anual' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', url: '#', tipo: 'Trimestral' },
      { nome: 'Demonstrações Financeiras Q3 2023', data: '2023-11-15', url: '#', tipo: 'Trimestral' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
      { tipo: 'Dividendo', valor: 'R$ 1,95', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
    ]
  },
  'VALE3': {
    ticker: 'VALE3',
    nomeCompleto: 'Vale S.A.',
    setor: 'Mineração',
    descricao: 'A Vale é uma empresa global de mineração, líder mundial na produção de minério de ferro e pelotas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    precoAtual: 'R$ 62,15',
    variacao: '+1.8%',
    tendencia: 'up',
    dataEntrada: '22/08/2021',
    precoIniciou: 'R$ 78,50',
    dy: '15.2%',
    precoTeto: 'R$ 85,00',
    viesAtual: 'Manter',
    variacaoHoje: '+0.9%',
    rendProventos: '+18.3%',
    ibovespaEpoca: '128.200',
    ibovespaVariacao: '+8.5%',
    percentualCarteira: '15.2%',
    marketCap: 'R$ 285,4 bi',
    pl: '4.2',
    pvp: '0.9',
    roe: '22.1%',
    relatorios: [
      { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-10', url: '#', tipo: 'Anual' },
      { nome: 'Resultados 4T23', data: '2024-02-22', url: '#', tipo: 'Trimestral' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 4,20', dataEx: '20/08/2024', dataPagamento: '05/09/2024', status: 'Aprovado' },
      { tipo: 'Dividendo', valor: 'R$ 3,85', dataEx: '15/05/2024', dataPagamento: '30/05/2024', status: 'Pago' }
    ]
  },
  'ITUB4': {
    ticker: 'ITUB4',
    nomeCompleto: 'Itaú Unibanco Holding S.A.',
    setor: 'Bancos',
    descricao: 'O Itaú Unibanco é o maior banco privado do Brasil e um dos maiores da América Latina.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ITUB.png',
    precoAtual: 'R$ 34,28',
    variacao: '-0.5%',
    tendencia: 'down',
    dataEntrada: '10/01/2023',
    precoIniciou: 'R$ 24,80',
    dy: '8.9%',
    precoTeto: 'R$ 38,00',
    viesAtual: 'Compra',
    variacaoHoje: '-0.2%',
    rendProventos: '+12.1%',
    ibovespaEpoca: '109.500',
    ibovespaVariacao: '+24.8%',
    percentualCarteira: '10.8%',
    marketCap: 'R$ 335,2 bi',
    pl: '9.8',
    pvp: '1.8',
    roe: '18.5%',
    relatorios: [
      { nome: 'Relatório Integrado 2023', data: '2024-03-28', url: '#', tipo: 'Anual' },
      { nome: 'Resultados 4T23', data: '2024-02-01', url: '#', tipo: 'Trimestral' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,75', dataEx: '10/07/2024', dataPagamento: '25/07/2024', status: 'Pago' },
      { tipo: 'JCP', valor: 'R$ 0,60', dataEx: '10/04/2024', dataPagamento: '25/04/2024', status: 'Pago' }
    ]
  },
  'BBDC4': {
    ticker: 'BBDC4',
    nomeCompleto: 'Banco Bradesco S.A.',
    setor: 'Bancos',
    descricao: 'O Bradesco é um dos maiores bancos do Brasil, oferecendo serviços financeiros completos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBDC.png',
    precoAtual: 'R$ 14,85',
    variacao: '+0.8%',
    tendencia: 'up',
    dataEntrada: '05/06/2022',
    precoIniciou: 'R$ 18,20',
    dy: '9.5%',
    precoTeto: 'R$ 20,00',
    viesAtual: 'Manter',
    variacaoHoje: '+0.3%',
    rendProventos: '+8.7%',
    ibovespaEpoca: '118.300',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '8.7%',
    marketCap: 'R$ 148,5 bi',
    pl: '7.2',
    pvp: '0.8',
    roe: '11.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-20', url: '#', tipo: 'Anual' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '28/06/2024', dataPagamento: '15/07/2024', status: 'Pago' }
    ]
  },
  'WEGE3': {
    ticker: 'WEGE3',
    nomeCompleto: 'WEG S.A.',
    setor: 'Máquinas e Equipamentos',
    descricao: 'A WEG é líder global em motores elétricos e soluções de automação industrial.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/WEGE.png',
    precoAtual: 'R$ 42,33',
    variacao: '+3.2%',
    tendencia: 'up',
    dataEntrada: '18/11/2021',
    precoIniciou: 'R$ 35,40',
    dy: '1.8%',
    precoTeto: 'R$ 50,00',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+2.5%',
    ibovespaEpoca: '125.800',
    ibovespaVariacao: '+12.3%',
    percentualCarteira: '9.3%',
    marketCap: 'R$ 112,8 bi',
    pl: '18.5',
    pvp: '4.2',
    roe: '22.8%',
    relatorios: [
      { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-05', url: '#', tipo: 'Anual' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,28', dataEx: '12/09/2024', dataPagamento: '26/09/2024', status: 'Aprovado' }
    ]
  }
};

// Base de dados dos FIIs
const fiisData: { [key: string]: any } = {
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
    administradora: 'Banco BTG Pactual S.A.',
    cnpj: '28.467.495/0001-85',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#', tipo: 'Mensal' },
      { nome: 'Informe Trimestral - Q4 2024', data: '2024-12-30', url: '#', tipo: 'Trimestral' }
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
      { tipo: 'Rendimento', valor: 'R$ 0,88', dataEx: '15/12/2024', dataPagamento: '30/12/2024', status: 'Pago' }
    ]
  },
  'HGLG11': {
    ticker: 'HGLG11',
    nomeCompleto: 'CSHG Logística FII',
    setor: 'Logística',
    tipo: 'FII',
    descricao: 'Fundo especializado em galpões logísticos e centros de distribuição.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png',
    precoAtual: 'R$ 158,45',
    variacao: '+2.1%',
    tendencia: 'up',
    dataEntrada: '12/07/2023',
    precoIniciou: 'R$ 142,30',
    dy: '8,7%',
    precoTeto: 'R$ 170,00',
    viesAtual: 'Manter',
    variacaoHoje: '+1.2%',
    rendProventos: '+9.8%',
    ibovespaEpoca: '116.800',
    ibovespaVariacao: '+18.5%',
    percentualCarteira: '6.2%',
    patrimonio: 'R$ 4.8 bilhões',
    p_vp: '0.95',
    vacancia: '2,1%',
    imoveis: 89,
    gestora: 'Credit Suisse Hedging-Griffo',
    administradora: 'Banco Credit Suisse S.A.',
    cnpj: '29.641.226/0001-53',
    relatorios: [
      { nome: 'Relatório Mensal - Janeiro 2025', data: '2025-01-15', url: '#', tipo: 'Mensal' }
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 1,15', dataEx: '15/02/2025', dataPagamento: '28/02/2025', status: 'Aprovado' }
    ]
  }
};

// Componente para cartões de métricas
const MetricCard = ({ title, value, subtitle, color = 'primary' }: any) => (
  <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: color === 'success' ? '#22c55e' : color === 'error' ? '#ef4444' : 'inherit' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Componente para status dos proventos
const getStatusChip = (status: string) => {
  const configs = {
    'Pago': { color: '#22c55e', bg: '#dcfce7' },
    'Aprovado': { color: '#3b82f6', bg: '#dbeafe' },
    'Aguardando': { color: '#f59e0b', bg: '#fef3c7' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.Aguardando;
  
  return (
    <Chip 
      label={status} 
      size="small"
      sx={{ 
        backgroundColor: config.bg, 
        color: config.color, 
        fontWeight: 600,
        border: 'none'
      }} 
    />
  );
};

export default function EmpresaDetalhes(): React.JSX.Element {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  // Busca nos dados de empresas e FIIs
  const empresa = empresasData[ticker] || fiisData[ticker];

  // Se não encontrar, mostra página de erro
  if (!empresa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados. 
          Verifique se o código está correto ou tente outro ticker.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
          sx={{ alignSelf: 'center' }}
        >
          Voltar à Lista
        </Button>
      </Box>
    );
  }

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';
  const isFII = empresa.tipo === 'FII';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowLeftIcon />} 
        onClick={() => window.history.back()} 
        variant="outlined" 
        sx={{ mb: 3 }}
      >
        Voltar
      </Button>

      {/* Header da Empresa */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
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
              <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 1 }}>
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
                  color: 'white',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {empresa.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#fff' }}>
                {empresa.precoAtual}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-end' }}>
                <TrendIcon size={24} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 700, fontSize: '1.2rem' }}>
                  {empresa.variacao}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                Variação hoje: {empresa.variacaoHoje}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Dividend Yield" 
            value={empresa.dy} 
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Viés Atual" 
            value={empresa.viesAtual}
            color={empresa.viesAtual === 'Compra' ? 'success' : empresa.viesAtual === 'Venda' ? 'error' : 'primary'}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="% Carteira" 
            value={empresa.percentualCarteira} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title={isFII ? "P/VP" : "P/L"} 
            value={isFII ? empresa.p_vp : empresa.pl} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Preço Teto" 
            value={empresa.precoTeto} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Rendimento" 
            value={empresa.rendProventos}
            color="success" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Dados da Posição */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
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
                      {empresa.proventos.map((provento: any, index: number) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip 
                              label={provento.tipo} 
                              size="small" 
                              color={provento.tipo === 'Dividendo' ? 'primary' : provento.tipo === 'JCP' ? 'secondary' : 'info'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            {provento.valor}
                          </TableCell>
                          <TableCell>{provento.dataEx}</TableCell>
                          <TableCell>{provento.dataPagamento}</TableCell>
                          <TableCell>
                            {getStatusChip(provento.status)}
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

        {/* Relatórios */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                📄 Relatórios e Documentos
              </Typography>
              {empresa.relatorios && empresa.relatorios.length > 0 ? (
                <Grid container spacing={2}>
                  {empresa.relatorios.map((relatorio: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          '&:hover': { 
                            transform: 'translateY(-2px)', 
                            boxShadow: 3 
                          },
                          border: '1px solid #e5e7eb'
                        }}
                        onClick={() => window.open(relatorio.url, '_blank')}
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
                            </Box>
                            <DownloadIcon size={20} style={{ color: '#6b7280' }} />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    📋 Nenhum relatório disponível no momento.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
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
                        <Typography variant="caption" color="text.secondary">Ação</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.abs(parseFloat(empresa.variacao.replace('%', '').replace('+', '')))} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color={empresa.tendencia === 'up' ? 'success' : 'error'}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        {empresa.variacao}
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
                          value={Math.abs(parseFloat(empresa.ibovespaVariacao.replace('%', '').replace('+', '')))} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="info"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        {empresa.ibovespaVariacao}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoAtual}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Rendimento total:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                          {empresa.rendProventos}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}: 600, display: 'flex', alignItems: 'center' }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.ibovespaEpoca}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa Variação</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>{empresa.ibovespaVariacao}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Dados Fundamentalistas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                📈 {isFII ? 'Dados do Fundo' : 'Dados Fundamentalistas'}
              </Typography>
              <Stack spacing={2}>
                {isFII ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Patrimônio</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.patrimonio}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Vacância</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.vacancia}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Nº de Imóveis</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.imoveis}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Gestora</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.gestora}</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.marketCap}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">P/VPA</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.pvp}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">ROE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>{empresa.roe}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Proventos */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight
