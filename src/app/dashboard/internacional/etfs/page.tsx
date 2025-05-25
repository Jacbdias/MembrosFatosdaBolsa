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
  const etfsInternacionais = [
    {
      id: '1',
      rank: '1º',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      setor: 'Large Cap',
      dataEntrada: '03/06/2021',
      precoQueIniciou: 'US$383,95',
      precoAtual: 'US$532,40',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/vanguard.com',
    },
    {
      id: '2',
      rank: '2º',
      ticker: 'IJS',
      name: 'iShares Core S&P Small-Cap ETF',
      setor: 'Small Caps',
      dataEntrada: '21/07/2021',
      precoQueIniciou: 'US$101,96',
      precoAtual: 'US$94,43',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '3',
      rank: '3º',
      ticker: 'QUAL',
      name: 'iShares MSCI USA Quality Factor ETF',
      setor: 'Total Market',
      dataEntrada: '11/06/2021',
      precoQueIniciou: 'US$130,13',
      precoAtual: 'US$174,01',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '4',
      rank: '4º',
      ticker: 'QQQ',
      name: 'Invesco QQQ Trust ETF',
      setor: 'Large Cap',
      dataEntrada: '09/06/2021',
      precoQueIniciou: 'US$337,18',
      precoAtual: 'US$509,24',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/invesco.com',
    },
    {
      id: '5',
      rank: '5º',
      ticker: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      setor: 'Real Estate (USA)',
      dataEntrada: '12/07/2021',
      precoQueIniciou: 'US$105,96',
      precoAtual: 'US$87,09',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/vanguard.com',
    },
    {
      id: '6',
      rank: '6º',
      ticker: 'SCHP',
      name: 'Schwab U.S. TIPS ETF',
      setor: 'Renda Fixa',
      dataEntrada: '27/11/2021',
      precoQueIniciou: 'US$63,14',
      precoAtual: 'US$26,35',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/schwab.com',
    },
    {
      id: '7',
      rank: '7º',
      ticker: 'IAU',
      name: 'iShares Gold Trust ETF',
      setor: 'Ouro',
      dataEntrada: '07/06/2021',
      precoQueIniciou: 'US$36,04',
      precoAtual: 'US$63,38',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '8',
      rank: '8º',
      ticker: 'HERO',
      name: 'Global X Video Games & Esports ETF',
      setor: 'Games',
      dataEntrada: '15/07/2021',
      precoQueIniciou: 'US$31,28',
      precoAtual: 'US$28,81',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/globalxetfs.com',
    },
    {
      id: '9',
      rank: '9º',
      ticker: 'SOXX',
      name: 'iShares Semiconductor ETF',
      setor: 'Semicondutores',
      dataEntrada: '04/08/2021',
      precoQueIniciou: 'US$456,03',
      precoAtual: 'US$202,56',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '10',
      rank: '10º',
      ticker: 'MCHI',
      name: 'iShares MSCI China ETF',
      setor: 'Empresas Chinesas',
      dataEntrada: '01/02/2023',
      precoQueIniciou: 'US$53,58',
      precoAtual: 'US$54,78',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    },
    {
      id: '11',
      rank: '11º',
      ticker: 'TFLO',
      name: 'iShares Treasury Floating Rate Bond ETF',
      setor: 'Renda Fixa',
      dataEntrada: '21/03/2023',
      precoQueIniciou: 'US$50,50',
      precoAtual: 'US$50,64',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/ishares.com',
    }
  ];

  // Calcular estatísticas baseadas nos novos dados
  const totalETFs = etfsInternacionais.length;
  const compras = etfsInternacionais.filter(etf => etf.viesAtual === 'COMPRA').length;

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
            Exterior ETFs
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Fundos de índice diversificados para exposição global de mercados
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
          value="15,02%" 
          icon={<TrendUpIcon />}
          trend="up"
          diff={15.02}
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value="-0,05%" 
          icon={<ArrowDownIcon />}
          trend="down"
          diff={-0.05}
        />
        <StatCard 
          title="TOTAL DE ETFs" 
          value={totalETFs.toString()} 
          icon={<GlobeIcon />}
        />
        <StatCard 
          title="RECOMENDAÇÃO COMPRA" 
          value={compras.toString()} 
          icon={<ChartLineIcon />}
          trend="up"
          diff={Math.round((compras / totalETFs) * 100)}
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
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés Atual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {etfsInternacionais.map((row) => {
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
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{row.precoAtual}</TableCell>
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
          count={etfsInternacionais.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={etfsInternacionais.length}
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
