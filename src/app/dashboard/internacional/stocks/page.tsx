/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

function noop(): void {
  // Função vazia para props obrigatórias
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
}

function StatCard({ title, value, icon, trend, diff }: StatCardProps): React.JSX.Element {
  const TrendIconComponent = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  
  return (
    <Card 
      sx={{ 
        minHeight: 120,
        flex: '1 1 200px',
        maxWidth: { xs: '100%', sm: '300px' },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography 
              color="text.secondary" 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
            <Avatar 
              sx={{ 
                backgroundColor: '#374151',
                height: 32, 
                width: 32,
                '& svg': { 
                  fontSize: 16,
                  color: 'white'
                }
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: trend && diff !== undefined ? 
                  (trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)') 
                  : 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {diff !== undefined && trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendIconComponent 
                size={16} 
                style={{ color: trendColor }} 
              />
              <Typography 
                sx={{ 
                  color: trendColor,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                {diff > 0 ? '+' : ''}{diff}%
              </Typography>
              <Typography 
                color="text.secondary" 
                sx={{ fontSize: '0.75rem' }}
              >
                no período
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Page(): React.JSX.Element {
  const stocksInternacionais = [
    {
      id: '1',
      rank: '1º',
      ticker: 'XP',
      name: 'XP Inc.',
      sector: 'Financial Services',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '26/05/2023',
      precoQueIniciou: 'US$18,41',
      precoAtual: 'US$18,64',
      precoAlvo: 'US$24,34',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/xpinc.com',
    },
    {
      id: '2',
      rank: '2º',
      ticker: 'HD',
      name: 'Home Depot Inc.',
      sector: 'Varejo',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '24/02/2023',
      precoQueIniciou: 'US$299,31',
      precoAtual: 'US$362,71',
      precoAlvo: 'US$366,78',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/homedepot.com',
    },
    {
      id: '3',
      rank: '3º',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '05/05/2022',
      precoQueIniciou: 'US$156,77',
      precoAtual: 'US$195,27',
      precoAlvo: 'US$170,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/apple.com',
    },
    {
      id: '4',
      rank: '4º',
      ticker: 'FIVE',
      name: 'Five Below Inc.',
      sector: 'Varejo',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '17/03/2022',
      precoQueIniciou: 'US$163,41',
      precoAtual: 'US$107,27',
      precoAlvo: 'US$179,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/fivebelow.com',
    },
    {
      id: '5',
      rank: '5º',
      ticker: 'AMAT',
      name: 'Applied Materials Inc.',
      sector: 'Semicondutores',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '07/04/2022',
      precoQueIniciou: 'US$122,40',
      precoAtual: 'US$157,51',
      precoAlvo: 'US$151,30',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/appliedmaterials.com',
    },
    {
      id: '6',
      rank: '6º',
      ticker: 'COST',
      name: 'Costco Wholesale Corp.',
      sector: 'Consumer Discretionary',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '23/06/2022',
      precoQueIniciou: 'US$459,00',
      precoAtual: 'US$1.008,50',
      precoAlvo: 'US$571,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/costco.com',
    },
    {
      id: '7',
      rank: '7º',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '03/03/2022',
      precoQueIniciou: 'US$131,83',
      precoAtual: 'US$168,47',
      precoAlvo: 'US$133,29',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/google.com',
    },
    {
      id: '8',
      rank: '8º',
      ticker: 'META',
      name: 'Meta Platforms Inc.',
      sector: 'Tecnologia',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '17/02/2022',
      precoQueIniciou: 'US$213,92',
      precoAtual: 'US$627,06',
      precoAlvo: 'US$322,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/meta.com',
    },
    {
      id: '9',
      rank: '9º',
      ticker: 'BRKB',
      name: 'Berkshire Hathaway Inc.',
      sector: 'Holding',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '11/05/2021',
      precoQueIniciou: 'US$286,35',
      precoAtual: 'US$503,46',
      precoAlvo: 'US$300,00',
      viesAtual: 'AGUARDAR',
      avatar: 'https://logo.clearbit.com/berkshirehathaway.com',
    }
  ];

  // Calcular estatísticas baseadas nos novos dados
  const totalAtivos = stocksInternacionais.length;
  const compras = stocksInternacionais.filter(stock => stock.viesAtual === 'COMPRA').length;
  const aguardar = stocksInternacionais.filter(stock => stock.viesAtual === 'AGUARDAR').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com botão voltar */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeftIcon />}
          onClick={() => window.location.href = '/dashboard/internacional'}
          sx={{ color: 'text.secondary' }}
        >
          Voltar
        </Button>
        <Divider orientation="vertical" flexItem />
        <Stack spacing={1}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Exterior Stocks
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Ações internacionais de empresas de tecnologia, crescimento e valor
          </Typography>
        </Stack>
      </Stack>

      {/* Cards de estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard 
          title="TOTAL DE ATIVOS" 
          value={totalAtivos.toString()} 
          icon={<GlobeIcon />}
        />
        <StatCard 
          title="RECOMENDAÇÃO COMPRA" 
          value={compras.toString()} 
          icon={<TrendUpIcon />} 
          trend="up" 
          diff={Math.round((compras / totalAtivos) * 100)} 
        />
        <StatCard 
          title="AGUARDAR" 
          value={aguardar.toString()} 
          icon={<ChartLineIcon />}
        />
        <StatCard 
          title="MERCADO" 
          value="EUA" 
          icon={<CurrencyDollarIcon />}
        />
      </Box>
      
      {/* Tabela */}
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '1000px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '80px' }}>
                  Rank
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço que Iniciou</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Alvo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés Atual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocksInternacionais.map((row) => {
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {row.rank}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar}
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontWeight: 600
                          }}
                        >
                          {row.ticker.charAt(0)}
                        </Avatar>
                        <Stack spacing={0}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.name}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.sector}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoQueIniciou}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoAlvo}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          backgroundColor: row.viesAtual === 'COMPRA' ? '#e8f5e8' : '#fff3e0',
                          color: row.viesAtual === 'COMPRA' ? '#2e7d32' : '#f57c00',
                          border: row.viesAtual === 'COMPRA' ? '1px solid #4caf50' : '1px solid #ff9800',
                          px: 2,
                          py: 0.75,
                          borderRadius: '20px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          textAlign: 'center',
                          minWidth: '80px',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {row.viesAtual}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={stocksInternacionais.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={stocksInternacionais.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
        />
      </Card>
    </Box>
  );
}
