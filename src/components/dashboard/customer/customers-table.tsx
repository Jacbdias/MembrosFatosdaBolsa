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
                backgroundColor: 'var(--mui-palette-primary-main)', 
                height: 32, 
                width: 32,
                '& svg': { fontSize: 16 }
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
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {/* Trend indicator */}
          {diff !== undefined && (
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

export interface Ativo {
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

interface AtivosTableProps {
  count?: number;
  page?: number;
  rows?: Ativo[];
  rowsPerPage?: number;
}

export function AtivosTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: AtivosTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((ativo) => ativo.id), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

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
          value="137k" 
          icon={<CurrencyDollarIcon />} 
          trend="up" 
          diff={1.6} 
        />
        <StatCard 
          title="ÍNDICE SMALL" 
          value="2.155k" 
          icon={<UsersThreeIcon />} 
          trend="up" 
          diff={-0.46} 
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value="75.5%" 
          icon={<ListBulletsIcon />} 
        />
        <StatCard 
          title="DIVIDEND YIELD" 
          value="5.2%" 
          icon={<ChartBarIcon />} 
        />
        <StatCard 
          title="IBOVESPA PERÍODO" 
          value="3.4%" 
          icon={<CurrencyDollarIcon />} 
          trend="up" 
          diff={3.4} 
        />
        <StatCard 
          title="CARTEIRA PERÍODO" 
          value="4.7%" 
          icon={<ChartBarIcon />} 
          trend="up" 
          diff={4.7} 
        />
      </Box>
      
      {/* Tabela */}
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      if (event.target.checked) selectAll();
                      else deselectAll();
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Preço que Iniciou</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Preço Teto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                row.vies = 'Compra';
                const isSelected = selected?.has(row.id);
                return (
                  <TableRow 
                    hover 
                    key={row.id} 
                    selected={isSelected}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) selectOne(row.id);
                          else deselectOne(row.id);
                        }}
                      />
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
                      <Box
                        sx={{
                          backgroundColor: row.vies === 'Compra' ? '#e8f5e8' : 'transparent',
                          color: row.vies === 'Compra' ? '#2e7d32' : 'inherit',
                          border: row.vies === 'Compra' ? '1px solid #4caf50' : '1px solid transparent',
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
