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
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';

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
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
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
              <TrendIcon 
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
  const investimentosExterior = [
    {
      id: '1',
      ticker: 'AAPL',
      name: 'Apple Inc.',
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
      ticker: 'TSLA',
      name: 'Tesla Inc.',
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
    },
    {
      id: '4',
      ticker: 'ASML',
      name: 'ASML Holding',
      country: 'Netherlands',
      currency: 'EUR',
      dataEntrada: '05/01/2024',
      precoEntrada: 'EUR 650,00',
      precoAtual: 'EUR 742,30',
      quantity: '15',
      totalValue: 'EUR 11.134,50',
      gainLoss: 'EUR 1.384,50',
      gainLossPercent: '+14,2%',
      vies: 'Compra',
    },
    {
      id: '5',
      ticker: 'SHOP',
      name: 'Shopify Inc.',
      country: 'Canada',
      currency: 'CAD',
      dataEntrada: '12/03/2024',
      precoEntrada: 'CAD 85,00',
      precoAtual: 'CAD 92,15',
      quantity: '100',
      totalValue: 'CAD 9.215,00',
      gainLoss: 'CAD 715,00',
      gainLossPercent: '+8,4%',
      vies: 'Compra',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Cards de estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard 
          title="S&P 500" 
          value="5.870" 
          icon={<CurrencyDollarIcon />} 
          trend="up" 
          diff={2.3} 
        />
        <StatCard 
          title="NASDAQ" 
          value="19.280" 
          icon={<TrendUpIcon />} 
          trend="up" 
          diff={1.8} 
        />
        <StatCard 
          title="CARTEIRA EXTERIOR" 
          value="USD 45.739" 
          icon={<GlobeIcon />}
          trend="up"
          diff={12.5}
        />
        <StatCard 
          title="COTAÇÃO DÓLAR" 
          value="R$ 5,42" 
          icon={<CurrencyDollarIcon />}
          trend="down"
          diff={-1.2}
        />
        <StatCard 
          title="TOTAL INVESTIDO" 
          value="USD 38.500" 
          icon={<ChartBarIcon />} 
          trend="up" 
          diff={0.0} 
        />
        <StatCard 
          title="RETORNO TOTAL" 
          value="+18,8%" 
          icon={<TrendUpIcon />} 
          trend="up" 
          diff={18.8} 
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
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>País</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Moeda</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Valor Total</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ganho/Perda</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investimentosExterior.map((row, index) => {
                const isGain = row.gainLossPercent.includes('+');
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
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
                    <TableCell sx={{ textAlign: 'center' }}>{row.country}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.currency}</TableCell>
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
          count={investimentosExterior.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={investimentosExterior.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
        />
      </Card>
    </div>
  );
}
