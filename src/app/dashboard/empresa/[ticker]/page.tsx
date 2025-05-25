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

// Dados das empresas - versão mínima para o build funcionar
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
      { nome: 'Balanço Q4 2023', data: '2024-02-28', url: '#' }
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
    ]
  }
};

// Dados dos FIIs - versão mínima para o build funcionar
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
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' }
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' }
    ]
  }
};

export default function EmpresaDetalhes(): React.JSX.Element {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  // Busca nos dados de empresas e FIIs
  const empresa = empresasData[ticker] || fiisData[ticker];

  // Se não encontrar, mostra página de erro
  if (!empresa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Empresa não encontrada</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          Ticker "{ticker}" não foi encontrado na base de dados.
        </Typography>
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

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowLeftIcon />} 
        onClick={() => window.history.back()} 
        variant="outlined" 
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      {/* Header da Empresa */}
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
                color="primary" 
                variant="outlined" 
                sx={{ mb: 2 }} 
              />
              <Typography variant="body1">{empresa.descricao}</Typography>
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

      {/* Resto do componente - simplificado para garantir que funcione */}
      <Grid container spacing={3}>
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
                      {empresa.precoAtual}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PREÇO ATUAL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {empresa.dy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DIVIDEND YIELD
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Chip 
                      label={empresa.viesAtual} 
                      sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      VIÉS ATUAL
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Seção de Proventos */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📅 Últimos Proventos
              </Typography>
              {empresa.proventos && empresa.proventos.length > 0 ? (
                empresa.proventos.map((provento: any, index: number) => (
                  <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Chip 
                          label={provento.tipo} 
                          size="small" 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                          Valor: <strong>{provento.valor}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Ex: {provento.dataEx}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Pag: {provento.dataPagamento}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum provento encontrado.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
