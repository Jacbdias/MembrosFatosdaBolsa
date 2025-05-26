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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

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
}

interface EmpresaBase {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  precoAtual: string;
  variacao: string;
  tendencia: 'up' | 'down';
  dataEntrada: string;
  precoIniciou: string;
  dy: string;
  precoTeto: string;
  viesAtual: string;
  variacaoHoje: string;
  rendProventos: string;
  ibovespaEpoca: string;
  ibovespaVariacao: string;
  percentualCarteira: string;
  proventos?: Provento[];
  relatorios?: Relatorio[];
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

const empresasData: { [key: string]: Empresa } = {
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
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
      { tipo: 'Dividendo', valor: 'R$ 1,95', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', tipo: 'Anual' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', tipo: 'Trimestral' },
      { nome: 'Demonstrações Financeiras Q3 2023', data: '2023-11-15', tipo: 'Trimestral' }
    ]
  }
};

const fiisData: { [key: string]: FII } = {
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

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const empresa = empresasData[ticker] || fiisData[ticker];

  if (!empresa) {
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
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#fff' }}>
                {empresa.precoAtual}
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
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
            value={isFII ? (empresa as FII).p_vp : (empresa as Empresa).pl} 
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
                    {empresa.ibovespaVariacao}
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
                {empresa.relatorios && empresa.relatorios.map((relatorio, index) => (
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
                      onClick={() => alert('Abrir relatório: ' + relatorio.nome)}
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
            </CardContent>
          </Card>
        </Grid>

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
                        <Typography variant="caption" color="text.secondary">Ação</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={25} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="success"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        +24.7%
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
                          value={18} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="info"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        +18.2%
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
}
