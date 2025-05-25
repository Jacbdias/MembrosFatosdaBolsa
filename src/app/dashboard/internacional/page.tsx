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
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '15/03/2024',
      precoEntrada: 'USD 180,50',
      precoAtual: 'USD 195,30',
      quantity: '50',
      totalValue: 'USD 9.765,00',
      gainLoss: 'USD 740,00',
      gainLossPercent: '+8,2%',
      vies: 'Compra',
    },
    {
      id: '2',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '10/02/2024',
      precoEntrada: 'USD 320,00',
      precoAtual: 'USD 378,85',
      quantity: '25',
      totalValue: 'USD 9.471,25',
      gainLoss: 'USD 1.471,25',
      gainLossPercent: '+18,4%',
      vies: 'Compra',
    },
    {
      id: '3',
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '28/01/2024',
      precoEntrada: 'USD 145,20',
      precoAtual: 'USD 158,75',
      quantity: '40',
      totalValue: 'USD 6.350,00',
      gainLoss: 'USD 542,00',
      gainLossPercent: '+9,3%',
      vies: 'Compra',
    },
    {
      id: '4',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '18/12/2023',
      precoEntrada: 'USD 485,00',
      precoAtual: 'USD 892,50',
      quantity: '10',
      totalValue: 'USD 8.925,00',
      gainLoss: 'USD 4.075,00',
      gainLossPercent: '+84,0%',
      vies: 'Compra',
    },
    {
      id: '5',
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      sector: 'Consumer Discretionary',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '22/11/2023',
      precoEntrada: 'USD 148,30',
      precoAtual: 'USD 182,90',
      quantity: '35',
      totalValue: 'USD 6.401,50',
      gainLoss: 'USD 1.211,00',
      gainLossPercent: '+23,3%',
      vies: 'Compra',
    },
    {
      id: '6',
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      sector: 'Consumer Discretionary',
      country: 'USA',
      currency: 'USD',
      dataEntrada: '20/04/2024',
      precoEntrada: 'USD 250,00',
      precoAtual: 'USD 238,45',
      quantity: '30',
      totalValue: 'USD 7.153,50',
      gainLoss: 'USD -346,50',
      gainLossPercent: '-4,6%',
      vies: 'Venda',
    }
  ];

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
          title="TOTAL INVESTIDO" 
          value="USD 45.230" 
          icon={<CurrencyDollarIcon />} 
          trend="up" 
          diff={0} 
        />
        <StatCard 
          title="VALOR ATUAL" 
          value="USD 53.650" 
          icon={<TrendUpIcon />} 
          trend="up" 
          diff={18.6} 
        />
        <StatCard 
          title="GANHO/PERDA" 
          value="USD +8.420" 
          icon={<ChartLineIcon />}
          trend="up"
          diff={18.6}
        />
        <StatCard 
          title="Nº DE ATIVOS" 
          value="6" 
          icon={<GlobeIcon />}
        />
      </Box>
      
      {/* Tabela */}
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '80px' }}>
                  Posição
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>País</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Valor Total</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ganho/Perda</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocksInternacionais.map((row, index) => {
                const isGain = row.gainLossPercent.includes('+');
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
                      {index + 1}º
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ width: 32, height: 32, backgroundColor: '#f8fafc' }}
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
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.country}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.quantity}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.totalValue}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isGain ? 'success.main' : 'error.main',
                            fontWeight: 500 
                          }}
                        >
                          {row.gainLoss}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isGain ? 'success.main' : 'error.main',
                            fontWeight: 500 
                          }}
                        >
                          {row.gainLossPercent}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          backgroundColor: row.vies === 'Compra' ? '#e8f5e8' : '#ffebee',
                          color: row.vies === 'Compra' ? '#2e7d32' : '#c62828',
                          border: row.vies === 'Compra' ? '1px solid #4caf50' : '1px solid #f44336',
                          px: 2,
                          py: 0.75,
                          borderRadius: '20px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          textAlign: 'center',
                          minWidth: '70px',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {row.vies}
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
