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
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

const empresasData: { [key: string]: any } = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa de energia, focada em óleo, gás natural e energia de baixo carbono.',
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
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    ]
  },
  'DEXP3': {
    ticker: 'DEXP3',
    nomeCompleto: 'Dexxos Participações S.A.',
    setor: 'Nanocap/Químico',
    descricao: 'Empresa especializada em soluções químicas inovadoras.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
    precoAtual: 'R$ 9,33',
    variacao: '+5.9%',
    tendencia: 'up',
    dataEntrada: '27/01/2023',
    precoIniciou: 'R$ 7,96',
    dy: '5.91%',
    precoTeto: 'R$ 13,10',
    viesAtual: 'Compra',
    variacaoHoje: '+3.2%',
    rendProventos: '+17.2%',
    ibovespaEpoca: '108.500',
    ibovespaVariacao: '+19.1%',
    percentualCarteira: '8.7%',
    marketCap: 'R$ 1,2 bi',
    pl: '12.3',
    pvp: '0.8',
    roe: '15.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-10', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/05/2024', dataPagamento: '30/05/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 0,38', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' },
    ]
  },
  // Add all other empresa entries here...
};

// Base de dados dos FIIs (novos dados adicionados)
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
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },
  // Add all other FII entries here...
};

export default function EmpresaDetalhes(): React.JSX.Element {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  // Check both empresasData and fiisData
  const empresa = empresasData[ticker] || fiisData[ticker];

  if (!empresa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Empresa não encontrada</Typography>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()}>
          Voltar
        </Button>
      </Box>
    );
  }

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()} variant="outlined" sx={{ mb: 2 }}>
        Voltar
      </Button>

      {/* Header da Empresa */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Avatar src={empresa.avatar} alt={empresa.ticker} sx={{ width: 80, height: 80 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{empresa.ticker}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>{empresa.nomeCompleto}</Typography>
              <Chip label={empresa.setor} color="primary" variant="outlined" sx={{ mb: 2 }} />
              <Typography variant="body1">{empresa.descricao}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: trendColor }}>{empresa.precoAtual}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <TrendIcon size={20} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 600 }}>{empresa.variacao}</Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Dados da Posição */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Dados da Posição na Carteira</Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'SETOR', value: empresa.setor },
                  { label: 'DATA DE ENTRADA', value: empresa.dataEntrada },
                  { label: 'PREÇO QUE INICIOU', value: empresa.precoIniciou },
                  { label: 'PREÇO ATUAL', value: empresa.precoAtual },
                  { label: 'DIVIDEND YIELD', value: empresa.dy },
                  { label: 'PREÇO TETO', value: empresa.precoTeto },
                  { label: 'VIÉS ATUAL', value: empresa.viesAtual },
                  { label: 'VARIAÇÃO HOJE', value: empresa.variacaoHoje }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                      {item.label === 'VIÉS ATUAL' ? (
                        <Chip label={item.value} sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }} />
                      ) : (
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance e Indicadores */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Performance e Benchmark</Typography>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Rendimento com Proventos', value: empresa.rendProventos, color: '#22c55e' },
                      { label: 'Ibovespa na Época da Compra', value: empresa.ibovespaEpoca, color: '#3b82f6' },
                      { label: 'Variação Ibovespa no Período', value: empresa.ibovespaVariacao, color: '#10b981' },
                      { label: 'Percentual na Carteira', value: empresa.percentualCarteira, color: '#8b5cf6' }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: item.color, mb: 1 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Indicadores Financeiros</Typography>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Market Cap', value: empresa.marketCap || empresa.patrimonio, color: '#22c55e' },
                      { label: 'P/L', value: empresa.pl || empresa.p_vp },
                      { label: 'P/VP', value: empresa.pvp || empresa.p_vp },
                      { label: 'ROE', value: empresa.roe || empresa.vacancia }
                    ].map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: item.color || 'inherit' }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Agenda de Proventos */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>📅 Agenda de Proventos</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      {['Tipo', 'Valor por Ação', 'Data Ex-Dividendo', 'Data Pagamento', 'Status'].map(header => (
                        <th key={header} style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 600,
                          borderBottom: '1px solid #e5e7eb',
                          color: '#374151'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empresa.proventos.map((provento: any, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Chip
                            label={provento.tipo}
                            size="small"
                            sx={{
                              backgroundColor: provento.tipo === 'Dividendo' ? '#dbeafe' : '#fef3c7',
                              color: provento.tipo === 'Dividendo' ? '#1e40af' : '#92400e',
                              fontWeight: 600
                            }}
                          />
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                          {provento.valor}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>{provento.dataEx}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>{provento.dataPagamento}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Chip
                            label={provento.status}
                            size="small"
                            sx={{
                              backgroundColor: provento.status === 'Pago' ? '#d1fae5' : '#dbeafe',
                              color: provento.status === 'Pago' ? '#065f46' : '#1e40af',
                              fontWeight: 600
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* Resumo dos Proventos */}
              <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  💰 Resumo de Proventos (Últimos 12 meses)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                        {empresa.ticker === 'PETR4' ? 'R$ 9,25' : 'R$ 1,44'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total por Ação</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                        {empresa.ticker === 'PETR4' ? '5' : '2'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Pagamentos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                        {empresa.dy}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Dividend Yield</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza + Relatórios */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Participação na Carteira</Typography>
                  <Box sx={{ width: 200, height: 200, margin: '0 auto', position: 'relative' }}>
                    <Box sx={{
                      width: 180,
                      height: 180,
                      borderRadius: '50%',
                      background: `conic-gradient(#8b5cf6 0% ${parseFloat(empresa.percentualCarteira)}%, #e5e7eb ${parseFloat(empresa.percentualCarteira)}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                          {empresa.percentualCarteira}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">da carteira</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#8b5cf6', borderRadius: '50%' }} />
                        <Typography variant="caption">{empresa.ticker}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#e5e7eb', borderRadius: '50%' }} />
                        <Typography variant="caption">Outros</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Relatórios Financeiros</Typography>
                  <Stack spacing={2}>
                    {empresa.relatorios.map((relatorio: any, index: number) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{relatorio.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">{relatorio.data}</Typography>
                          </Box>
                          <Button size="small" startIcon={<DownloadIcon />}>Download</Button>
                        </Stack>
                        {index < empresa.relatorios.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
