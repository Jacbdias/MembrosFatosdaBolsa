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
import { ArrowBack as ArrowBackIcon } from '@phosphor-icons/react/dist/ssr/ArrowBack';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

// Dados mockados das empresas (em um app real, viria de uma API)
const empresasData = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa de energia, focada em óleo, gás natural e energia de baixo carbono.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    precoAtual: 'R$ 38,47',
    variacao: '+2.3%',
    tendencia: 'up',
    marketCap: 'R$ 512,8 bi',
    dividendYield: '18.4%',
    pl: '3.8',
    pvp: '1.2',
    roe: '31.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', url: '#' },
      { nome: 'DFP 2023', data: '2024-03-20', url: '#' },
      { nome: 'Relatório de Sustentabilidade', data: '2024-04-10', url: '#' },
    ]
  },
  'DEXP3': {
    ticker: 'DEXP3',
    nomeCompleto: 'DeepTech Expansão S.A.',
    setor: 'Nanocap/Químico',
    descricao: 'Empresa especializada em soluções químicas inovadoras.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
    precoAtual: 'R$ 9,33',
    variacao: '+5.9%',
    tendencia: 'up',
    marketCap: 'R$ 1,2 bi',
    dividendYield: '5.9%',
    pl: '12.3',
    pvp: '0.8',
    roe: '15.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-10', url: '#' },
      { nome: 'Balanço Q4 2023', data: '2024-02-25', url: '#' },
    ]
  }
  // Adicione mais empresas conforme necessário
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
          startIcon={<ArrowBackIcon />} 
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
          startIcon={<ArrowBackIcon />} 
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
        {/* Indicadores Financeiros */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Indicadores Financeiros
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>
                      {empresa.marketCap}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Market Cap
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {empresa.dividendYield}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dividend Yield
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {empresa.pl}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P/L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {empresa.roe}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ROE
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Relatórios */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Relatórios Financeiros
              </Typography>
              <Stack spacing={2}>
                {empresa.relatorios.map((relatorio, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {relatorio.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {relatorio.data}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => window.open(relatorio.url, '_blank')}
                      >
                        Download
                      </Button>
                    </Stack>
                    {index < empresa.relatorios.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
