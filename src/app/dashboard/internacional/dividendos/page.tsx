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
  const dividendosInternacionais = [
    {
      id: '1',
      rank: '1º',
      ticker: 'OXY',
      name: 'Occidental Petroleum Corporation',
      setor: 'STOCK - Petroleum',
      dataEntrada: '14/04/2023',
      precoQueIniciou: 'US$37,92',
      precoAtual: 'US$41,29',
      dy: '2,34%',
      precoTeto: 'US$60,10',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/oxy.com',
    },
    {
      id: '2',
      rank: '2º',
      ticker: 'ADC',
      name: 'Agree Realty Corporation',
      setor: 'REIT - Retail',
      dataEntrada: '19/01/2023',
      precoQueIniciou: 'US$73,74',
      precoAtual: 'US$75,04',
      dy: '5,34%',
      precoTeto: 'US$99,01',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/agreerealty.com',
    },
    {
      id: '3',
      rank: '3º',
      ticker: 'VZ',
      name: 'Verizon Communications Inc.',
      setor: 'Stock - Telecom',
      dataEntrada: '28/03/2022',
      precoQueIniciou: 'US$51,17',
      precoAtual: 'US$43,32',
      dy: '6,57%',
      precoTeto: 'US$51,12',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/verizon.com',
    },
    {
      id: '4',
      rank: '4º',
      ticker: 'O',
      name: 'Realty Income Corporation',
      setor: 'REIT - Net Lease',
      dataEntrada: '01/02/2024',
      precoQueIniciou: 'US$54,39',
      precoAtual: 'US$55,53',
      dy: '6,13%',
      precoTeto: 'US$58,91',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/realtyincome.com',
    },
    {
      id: '5',
      rank: '5º',
      ticker: 'AVB',
      name: 'AvalonBay Communities Inc.',
      setor: 'REIT - Apartamentos',
      dataEntrada: '10/02/2022',
      precoQueIniciou: 'US$242,00',
      precoAtual: 'US$198,03',
      dy: '3,96%',
      precoTeto: 'US$340,00',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/avalonbay.com',
    },
    {
      id: '6',
      rank: '6º',
      ticker: 'STAG',
      name: 'Stag Industrial Inc.',
      setor: 'REIT - Industrial',
      dataEntrada: '24/03/2022',
      precoQueIniciou: 'US$40,51',
      precoAtual: 'US$34,07',
      dy: '4,55%',
      precoTeto: 'US$42,87',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/stagindustrial.com',
    }
  ];

  // Calcular estatísticas baseadas nos novos dados
  const totalAtivos = dividendosInternacionais.length;
  const compras = dividendosInternacionais.filter(item => item.viesAtual === 'COMPRA').length;

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
            Exterior Dividendos
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Ações pagadoras de dividendos consistentes e REITs internacionais
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
          title="CARTEIRA NO PERÍODO" 
          value="-8,44%" 
          icon={<ArrowDownIcon />}
          trend="down"
          diff={-8.44}
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value="-0,29%" 
          icon={<ArrowDownIcon />}
          trend="down"
          diff={-0.29}
        />
        <StatCard 
          title="DIVIDEND YIELD" 
          value="4,88%" 
          icon={<CurrencyDollarIcon />}
          trend="up"
          diff={4.88}
        />
        <StatCard 
          title="S&P 500 NO PERÍODO" 
          value="25,13%" 
          icon={<TrendUpIcon />}
          trend="up"
          diff={25.13}
        />
      </Box>
      
      {/* Tabela */}
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '1200px' }}>
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
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Teto</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés Atual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dividendosInternacionais.map((row) => {
                const precoIniciou = parseFloat(row.precoQueIniciou.replace('US$', ''));
                const precoAtual = parseFloat(row.precoAtual.replace('US$', ''));
                const variacao = ((precoAtual - precoIniciou) / precoIniciou) * 100;
                const isPositive = variacao >= 0;
                
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
                    <TableCell sx={{ textAlign: 'center' }}>{row.setor}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoQueIniciou}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.precoAtual}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isPositive ? 'success.main' : 'error.main',
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        >
                          {isPositive ? '+' : ''}{variacao.toFixed(2)}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'success.main',
                          fontWeight: 600,
                          backgroundColor: '#e8f5e8',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {row.dy}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoTeto}</TableCell>
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
          count={dividendosInternacionais.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={dividendosInternacionais.length}
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
