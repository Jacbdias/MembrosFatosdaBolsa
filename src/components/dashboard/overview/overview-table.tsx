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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';

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

// 🎨 CARD ESTATÍSTICO COMPLETAMENTE REDESENHADO
function StatCard({ title, value, icon, trend, diff }: StatCardProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? TrendUp : TrendDown;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  const bgGradient = trend === 'up' 
    ? 'linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)'
    : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
  
  return (
    <Card 
      sx={{ 
        minHeight: 140,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: trend === 'up' 
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : 'linear-gradient(90deg, #ef4444, #dc2626)',
        }
      }}
    >
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Stack spacing={3} sx={{ height: '100%' }}>
          {/* Header refinado */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography 
                color="text.secondary" 
                variant="caption" 
                sx={{ 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  fontSize: '0.7rem',
                  color: '#64748b'
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}>
              <Box sx={{ color: 'white', fontSize: 20 }}>
                {icon}
              </Box>
            </Box>
          </Stack>
          
          {/* Valor principal com estilo aprimorado */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: '#1e293b',
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                lineHeight: 1,
                letterSpacing: '-0.025em'
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {/* Indicador de tendência melhorado */}
          {diff !== undefined && trend && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: 1.5,
              borderRadius: 2,
              background: bgGradient,
              border: '1px solid',
              borderColor: trend === 'up' ? '#bbf7d0' : '#fecaca',
            }}>
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: trendColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <TrendIcon size={14} weight="bold" />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography 
                  sx={{ 
                    color: trendColor,
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  {diff > 0 ? '+' : ''}{diff}%
                </Typography>
                <Typography 
                  color="text.secondary" 
                  sx={{ fontSize: '0.8rem', fontWeight: 500 }}
                >
                  período
                </Typography>
              </Stack>
            </Box>
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

  const defaultCards = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
    dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      {/* Grid de cards mais elegante */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 3,
          mb: 4,
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
      
      {/* Tabela redesenhada */}
      <Card sx={{ 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.2)'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            fontSize: '1.1rem'
          }}>
            📊 Carteira de Investimentos
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#64748b',
            mt: 0.5
          }}>
            {rows.length} ativos • Viés calculado automaticamente
          </Typography>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  width: '80px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Entrada</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Preço Inicial</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Teto</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum)) {
                    return 'Aguardar';
                  }
                  
                  return precoTetoNum > precoAtualNum ? 'Compra' : 'Aguardar';
                };
                
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                
                // Calcular performance
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.04)',
                        cursor: 'pointer',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      color: '#6366f1'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar} 
                          alt={row.ticker}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            border: '2px solid',
                            borderColor: 'rgba(99, 102, 241, 0.2)'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '0.95rem'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontSize: '0.75rem'
                          }}>
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.85rem'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {row.precoEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: performance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#6366f1'
                    }}>
                      {row.dy}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {row.precoTeto}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={viesCalculado}
                        size="small"
                        sx={{
                          backgroundColor: viesCalculado === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      />
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
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            '& .MuiTablePagination-toolbar': {
              color: '#475569'
            }
          }}
        />
      </Card>
    </Box>
  );
}
