/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
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

export interface ExteriorAsset {
  id: string;
  avatar: string;
  ticker: string;
  name: string;
  country: string;
  currency: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  quantity: string;
  totalValue: string;
  gainLoss: string;
  gainLossPercent: string;
  vies: string;
}

interface ExteriorTableProps {
  count?: number;
  page?: number;
  rows?: ExteriorAsset[];
  rowsPerPage?: number;
  cardsData?: {
    sp500?: { value: string; trend?: 'up' | 'down'; diff?: number };
    nasdaq?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraExterior?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dollarRate?: { value: string; trend?: 'up' | 'down'; diff?: number };
    totalInvested?: { value: string; trend?: 'up' | 'down'; diff?: number };
    totalReturn?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function ExteriorTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: ExteriorTableProps): React.JSX.Element {
  
  // Dados de exemplo para investimentos no exterior
  const dadosReais: ExteriorAsset[] = [
    {
      id: "1",
      avatar: "",
      ticker: "AAPL",
      name: "Apple Inc.",
      country: "USA",
      currency: "USD",
      dataEntrada: "15/03/2024",
      precoEntrada: "USD 180,50",
      precoAtual: "USD 195,30",
      quantity: "50",
      totalValue: "USD 9.765,00",
      gainLoss: "USD 740,00",
      gainLossPercent: "+8,2%",
      vies: "Compra"
    },
    {
      id: "2",
      avatar: "",
      ticker: "MSFT",
      name: "Microsoft Corporation",
      country: "USA",
      currency: "USD",
      dataEntrada: "10/02/2024",
      precoEntrada: "USD 320,00",
      precoAtual: "USD 378,85",
      quantity: "25",
      totalValue: "USD 9.471,25",
      gainLoss: "USD 1.471,25",
      gainLossPercent: "+18,4%",
      vies: "Compra"
    },
    {
      id: "3",
      avatar: "",
      ticker: "TSLA",
      name: "Tesla Inc.",
      country: "USA",
      currency: "USD",
      dataEntrada: "20/04/2024",
      precoEntrada: "USD 250,00",
      precoAtual: "USD 238,45",
      quantity: "30",
      totalValue: "USD 7.153,50",
      gainLoss: "USD -346,50",
      gainLossPercent: "-4,6%",
      vies: "Venda"
    },
    {
      id: "4",
      avatar: "",
      ticker: "ASML",
      name: "ASML Holding",
      country: "Netherlands",
      currency: "EUR",
      dataEntrada: "05/01/2024",
      precoEntrada: "EUR 650,00",
      precoAtual: "EUR 742,30",
      quantity: "15",
      totalValue: "EUR 11.134,50",
      gainLoss: "EUR 1.384,50",
      gainLossPercent: "+14,2%",
      vies: "Compra"
    },
    {
      id: "5",
      avatar: "",
      ticker: "SHOP",
      name: "Shopify Inc.",
      country: "Canada",
      currency: "CAD",
      dataEntrada: "12/03/2024",
      precoEntrada: "CAD 85,00",
      precoAtual: "CAD 92,15",
      quantity: "100",
      totalValue: "CAD 9.215,00",
      gainLoss: "CAD 715,00",
      gainLossPercent: "+8,4%",
      vies: "Compra"
    }
  ];

  // Sempre usar dados internos
  const dadosParaUsar = rows.length > 0 ? rows : dadosReais;

  // Valores padrão para os cards
  const defaultCards = {
    sp500: { value: "5.870", trend: "up" as const, diff: 2.3 },
    nasdaq: { value: "19.280", trend: "up" as const, diff: 1.8 },
    carteiraExterior: { value: "USD 45.739", trend: "up" as const, diff: 12.5 },
    dollarRate: { value: "R$ 5,42", trend: "down" as const, diff: -1.2 },
    totalInvested: { value: "USD 38.500", trend: "up" as const, diff: 0.0 },
    totalReturn: { value: "+18,8%", trend: "up" as const, diff: 18.8 },
  };

  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
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
          value={cards.sp500.value} 
          icon={<CurrencyDollarIcon />} 
          trend={cards.sp500.trend} 
          diff={cards.sp500.diff} 
        />
        <StatCard 
          title="NASDAQ" 
          value={cards.nasdaq.value} 
          icon={<TrendUpIcon />} 
          trend={cards.nasdaq.trend} 
          diff={cards.nasdaq.diff} 
        />
        <StatCard 
          title="CARTEIRA EXTERIOR" 
          value={cards.carteiraExterior.value} 
          icon={<GlobeIcon />}
          trend={cards.carteiraExterior.trend}
          diff={cards.carteiraExterior.diff}
        />
        <StatCard 
          title="COTAÇÃO DÓLAR" 
          value={cards.dollarRate.value} 
          icon={<CurrencyDollarIcon />}
          trend={cards.dollarRate.trend}
          diff={cards.dollarRate.diff}
        />
        <StatCard 
          title="TOTAL INVESTIDO" 
          value={cards.totalInvested.value} 
          icon={<ChartBarIcon />} 
          trend={cards.totalInvested.trend} 
          diff={cards.totalInvested.diff} 
        />
        <StatCard 
          title="RETORNO TOTAL" 
          value={cards.totalReturn.value} 
          icon={<TrendUpIcon />} 
          trend={cards.totalReturn.trend} 
          diff={cards.totalReturn.diff} 
        />
      </Box>
      
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
              {dadosParaUsar.map((row, index) => {
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
                          src={row.avatar} 
                          alt={row.ticker}
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
          count={count || dadosParaUsar.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage || dadosParaUsar.length}
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
