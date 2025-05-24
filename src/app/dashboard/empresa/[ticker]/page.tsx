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

// Dados das empresas
const empresasData = {
  'PETR4': {
    ticker: 'PETR4', nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras', setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa de energia, focada em óleo, gás natural e energia de baixo carbono.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    precoAtual: 'R$ 38,47', variacao: '+2.3%', tendencia: 'up',
    dataEntrada: '15/03/2022', precoIniciou: 'R$ 28,90', dy: '18.4%', precoTeto: 'R$ 45,00', viesAtual: 'Compra',
    variacaoHoje: '+1.8%', rendProventos: '+24.7%', ibovespaEpoca: '112.200', ibovespaVariacao: '+18.2%', percentualCarteira: '12.5%',
    marketCap: 'R$ 512,8 bi', pl: '3.8', pvp: '1.2', roe: '31.5%',
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
    ticker: 'DEXP3', nomeCompleto: 'Dexxos Participações S.A.', setor: 'Nanocap/Químico',
    descricao: 'Empresa especializada em soluções químicas inovadoras e participações estratégicas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
    precoAtual: 'R$ 9,33', variacao: '+5.9%', tendencia: 'up',
    dataEntrada: '27/01/2023', precoIniciou: 'R$ 7,96', dy: '5.91%', precoTeto: 'R$ 13,10', viesAtual: 'Compra',
    variacaoHoje: '+3.2%', rendProventos: '+17.2%', ibovespaEpoca: '108.500', ibovespaVariacao: '+19.1%', percentualCarteira: '8.7%',
    marketCap: 'R$ 1,2 bi', pl: '12.3', pvp: '0.8', roe: '15.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-10', url: '#' },
      { nome: 'Balanço Q4 2023', data: '2024-02-25', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/05/2024', dataPagamento: '30/05/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 0,38', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' },
    ]
  },
  'KEPL3': {
    ticker: 'KEPL3', nomeCompleto: 'Kepler Weber S.A.', setor: 'Agricultura',
    descricao: 'Empresa líder em equipamentos e serviços para armazenagem de grãos e beneficiamento de sementes.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
    precoAtual: 'R$ 7,65', variacao: '-3.1%', tendencia: 'down',
    dataEntrada: '21/12/2020', precoIniciou: 'R$ 9,16', dy: '7.76%', precoTeto: 'R$ 11,00', viesAtual: 'Compra',
    variacaoHoje: '-1.2%', rendProventos: '+8.9%', ibovespaEpoca: '119.000', ibovespaVariacao: '+8.7%', percentualCarteira: '6.3%',
    marketCap: 'R$ 2,1 bi', pl: '8.9', pvp: '1.1', roe: '12.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-12', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,58', dataEx: '15/04/2024', dataPagamento: '30/04/2024', status: 'Aprovado' },
    ]
  }
};

export default function EmpresaDetalhes(): React.JSX.Element {
  const params = useParams();
  const ticker = params?.ticker as string;
  const empresa = empresasData[ticker as keyof typeof empresasData];

  if (!empresa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Empresa não encontrada</Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com botão voltar */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
      </Box>

      {/* Informações principais da empresa */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Avatar 
              src={empresa.avatar} 
              alt={empresa.ticker}
              sx={{ width: 80, height: 80 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {empresa.ticker}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {empresa.nomeCompleto}
              </Typography>
              <Chip 
                label={empresa.setor} 
                sx={{ mb: 2 }}
                color="primary"
                variant="outlined"
              />
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {empresa.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: trendColor }}>
                {empresa.precoAtual}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <TrendIcon size={20} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 600 }}>
                  {empresa.variacao}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Dados da Carteira */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Dados da Posição na Carteira
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {empresa.setor}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SETOR
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {empresa.dataEntrada}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DATA DE ENTRADA
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {empresa.precoIniciou}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PREÇO QUE INICIOU
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: trendColor }}>
                      {empresa.precoAtual}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PREÇO ATUAL
                    </Typography>
                  </Box>
                </Grid>
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
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Performance e Benchmark
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e', mb: 1 }}>
                          {empresa.rendProventos}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rendimento com Proventos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 1 }}>
                          {empresa.percentualCarteira}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Percentual na Carteira
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Indicadores Financeiros
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>
                          {empresa.marketCap}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Market Cap
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {empresa.pl}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          P/L
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Proventos */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📅 Agenda de Proventos
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                        Tipo
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                        Valor por Ação
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                        Data Ex-Dividendo
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresa.proventos.map((provento, index) => (
                      <tr key={index}>
                        <td style={{ padding: '16px' }}>
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
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {provento.dataEx}
                        </td>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
