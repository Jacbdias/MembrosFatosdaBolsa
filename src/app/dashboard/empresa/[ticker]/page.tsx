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

// Dados mockados das empresas (em um app real, viria de uma API)
const empresasData = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa de energia, focada em óleo, gás natural e energia de baixo carbono.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    // Dados básicos
    precoAtual: 'R$ 38,47',
    variacao: '+2.3%',
    tendencia: 'up',
    // Dados detalhados
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
    // Indicadores tradicionais
    marketCap: 'R$ 512,8 bi',
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
    nomeCompleto: 'Dexxos Participações S.A.',
    setor: 'Nanocap/Químico',
    descricao: 'Empresa especializada em soluções químicas inovadoras e participações estratégicas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
    // Dados básicos
    precoAtual: 'R$ 9,33',
    variacao: '+5.9%',
    tendencia: 'up',
    // Dados detalhados
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
    // Indicadores tradicionais
    marketCap: 'R$ 1,2 bi',
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
        {/* Dados da Carteira - Seção Principal */}
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
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
                      {empresa.dy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DIVIDEND YIELD
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {empresa.precoTeto}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PREÇO TETO
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Chip 
                      label={empresa.viesAtual}
                      sx={{ 
                        backgroundColor: '#e8f5e8',
                        color: '#2e7d32',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      VIÉS ATUAL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: trendColor }}>
                      {empresa.variacaoHoje}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      VARIAÇÃO HOJE
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance e Benchmarks */}
        <Grid item xs={12} md={8}>
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
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                      {empresa.ibovespaEpoca}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ibovespa na Época da Compra
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                      {empresa.ibovespaVariacao}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Variação Ibovespa no Período
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

              {/* Indicadores Financeiros */}
              <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600 }}>
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
                      {empresa.pvp}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P/VP
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

        {/* Gráfico de Pizza + Relatórios */}
        <Grid item xs={12} md={4}>
          {/* Gráfico de Pizza */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Participação na Carteira
              </Typography>
              <Box sx={{ 
                width: 200, 
                height: 200, 
                margin: '0 auto',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Gráfico de Pizza Simples com CSS */}
                <Box sx={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `conic-gradient(
                    #8b5cf6 0% ${parseFloat(empresa.percentualCarteira)}%, 
                    #e5e7eb ${parseFloat(empresa.percentualCarteira)}% 100%
                  )`,
                  position: 'relative',
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
                    <Typography variant="caption" color="text.secondary">
                      da carteira
                    </Typography>
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

          {/* Relatórios */}
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
