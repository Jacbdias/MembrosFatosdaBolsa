/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
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
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';

import { useSelection } from '@/hooks/use-selection';

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
          {/* Header com título e ícone */}
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
                backgroundColor: '#374151', // Cinza escuro elegante
                height: 32, 
                width: 32,
                '& svg': { 
                  fontSize: 16,
                  color: 'white' // Ícone branco para contraste perfeito
                }
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          
          {/* Valor principal */}
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
          
          {/* Trend indicator */}
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

export interface OverviewData {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  dy: string;
  precoTeto: string;
  vies: string;
}

interface OverviewTableProps {
  count?: number;
  page?: number;
  rows?: OverviewData[];
  rowsPerPage?: number;
  cardsData?: {
    ibovespa?: { value: string; trend?: 'up' | 'down'; diff?: number };
    indiceSmall?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraHoje?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dividendYield?: { value: string; trend?: 'up' | 'down'; diff?: number };
    ibovespaPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function OverviewTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: OverviewTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((item) => item.id), [rows]);

  // Valores padrão para os cards do Overview (diferentes do customer)
  const defaultCards = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
    dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  // Mescla os dados padrão com os dados passados via props
  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      {/* Cards de estatísticas com grid responsivo */}
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
          title="IBOVESPA" 
          value={cards.ibovespa.value} 
          icon={<CurrencyDollarIcon />} 
          trend={cards.ibovespa.trend} 
          diff={cards.ibovespa.diff} 
        />
        <StatCard 
          title="ÍNDICE SMALL" 
          value={cards.indiceSmall.value} 
          icon={<UsersThreeIcon />} 
          trend={cards.indiceSmall.trend} 
          diff={cards.indiceSmall.diff} 
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value={cards.carteiraHoje.value} 
          icon={<ListBulletsIcon />}
          trend={cards.carteiraHoje.trend}
          diff={cards.carteiraHoje.diff}
        />
        <StatCard 
          title="DIVIDEND YIELD" 
          value={cards.dividendYield.value} 
          icon={<ChartBarIcon />}
          trend={cards.dividendYield.trend}
          diff={cards.dividendYield.diff}
        />
        <StatCard 
          title="IBOVESPA PERÍODO" 
          value={cards.ibovespaPeriodo.value} 
          icon={<CurrencyDollarIcon />} 
          trend={cards.ibovespaPeriodo.trend} 
          diff={cards.ibovespaPeriodo.diff} 
        />
        <StatCard 
          title="CARTEIRA PERÍODO" 
          value={cards.carteiraPeriodo.value} 
          icon={<ChartBarIcon />} 
          trend={cards.carteiraPeriodo.trend} 
          diff={cards.carteiraPeriodo.diff} 
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
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço que Iniciou</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Teto</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                // 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum)) {
                    return 'Aguardar';
                  }
                  
                  return precoTetoNum > precoAtualNum ? 'Compra' : 'Aguardar';
                };
                
                // 🎨 FUNÇÃO PARA DEFINIR CORES DO VIÉS
                const getViesStyle = (vies: string) => {
                  if (vies === 'Compra') {
                    return {
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      border: '1px solid #4caf50'
                    };
                  } else {
                    return {
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      border: '1px solid #ffc107'
                    };
                  }
                };
                
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                const estiloVies = getViesStyle(viesCalculado);
                
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
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {row.ticker}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        whiteSpace: 'normal', 
                        textAlign: 'center', 
                        lineHeight: 1.2,
                        fontSize: '0.875rem'
                      }}
                    >
                      {row.setor}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.dy}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoTeto}</TableCell>
                    <TableCell>
                      {/* 🔥 VIÉS CALCULADO AUTOMATICAMENTE COM CORES VERDE/AMARELO */}
                      <Box sx={{
                        ...estiloVies, // ✅ USA O ESTILO CALCULADO
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
                      }}>
                        {viesCalculado} {/* ✅ USA O VIÉS CALCULADO */}
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
          count={count}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage}
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
