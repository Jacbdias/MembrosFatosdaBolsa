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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Unstable_Grid2';

interface MarketIndicatorProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
  isLoading?: boolean;
  description?: string;
}

function MarketIndicator({ title, value, icon, trend, diff, isLoading, description }: MarketIndicatorProps): React.JSX.Element {
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  const trendSymbol = trend === 'up' ? '↗' : '↘';
  
  return (
    <Box 
      sx={{ 
        backgroundColor: '#ffffff',
        borderRadius: 2,
        p: 2.5,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#c7d2fe',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94a3b8',
                  display: 'block',
                  mt: 0.25,
                  fontSize: '0.7rem'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '16px'
          }}>
            {typeof icon === 'string' ? icon : '📊'}
          </Box>
        </Stack>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '1.75rem',
            lineHeight: 1
          }}
        >
          {isLoading ? '...' : value}
        </Typography>
        
        {!isLoading && diff !== undefined && trend && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
              color: trendColor,
              fontSize: '12px'
            }}>
              {trendSymbol}
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {diff > 0 ? '+' : ''}{typeof diff === 'number' ? diff.toFixed(2) : diff}%
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              hoje
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export interface Row {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  dy: string;
  precoTeto: string;
  vies: string;
  precoAtual?: string;
  performance?: number;
  variacao?: number;
  variacaoPercent?: number;
  volume?: number;
  statusApi?: string;
}

export interface CardsData {
  ibovespa?: { value: string; trend: 'up' | 'down'; diff: number };
  indiceSmall?: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraHoje?: { value: string; trend: 'up' | 'down'; diff?: number };
  dividendYield?: { value: string; trend: 'up' | 'down'; diff?: number };
  ibovespaPeriodo?: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraPeriodo?: { value: string; trend: 'up' | 'down'; diff: number };
}

export interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: Row[];
  rowsPerPage?: number;
  cardsData?: CardsData;
}

function getSetorIcon(setor: string): string {
  switch (setor.toLowerCase()) {
    case 'shopping':
      return '🏬';
    case 'papel':
      return '📄';
    case 'logística':
      return '🚛';
    case 'hedge fund':
      return '🏦';
    case 'fiagro':
      return '🌾';
    case 'fof':
      return '📊';
    case 'tijolo':
      return '🏢';
    case 'renda urbana':
      return '🏙️';
    case 'híbrido':
      return '🔀';
    default:
      return '💼';
  }
}

function getViesChip(vies: string, performance?: number): React.ReactNode {
  if (performance !== undefined) {
    const color = performance >= 0 ? 'success' : 'error';
    const label = performance >= 0 ? 'Lucro' : 'Prejuízo';
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  }

  return (
    <Chip
      label={vies}
      color="primary"
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem'
      }}
    />
  );
}

export function SettingsTable({
  count = 0,
  page = 0,
  rows = [],
  rowsPerPage = 5,
  cardsData = {}
}: SettingsTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentRowsPerPage, setCurrentRowsPerPage] = React.useState(rowsPerPage);

  const handlePageChange = (event: unknown, newPage: number): void => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const paginatedRows = rows.slice(
    currentPage * currentRowsPerPage,
    currentPage * currentRowsPerPage + currentRowsPerPage
  );

  return (
    <Stack spacing={3}>
      {/* Cards de indicadores */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="IBOVESPA"
            value={cardsData.ibovespa?.value || "150k"}
            icon="📈"
            trend={cardsData.ibovespa?.trend || "up"}
            diff={cardsData.ibovespa?.diff || 0}
            description="Hoje"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="IFIX"
            value={cardsData.indiceSmall?.value || "2.1k"}
            icon="🏢"
            trend={cardsData.indiceSmall?.trend || "up"}
            diff={cardsData.indiceSmall?.diff || 0}
            description="Índice FIIs"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="CARTEIRA"
            value={cardsData.carteiraHoje?.value || "R$ 0"}
            icon="💰"
            trend={cardsData.carteiraHoje?.trend || "up"}
            diff={cardsData.carteiraHoje?.diff || 0}
            description="Hoje"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="DY MÉDIO"
            value={cardsData.dividendYield?.value || "0%"}
            icon="💎"
            trend={cardsData.dividendYield?.trend || "up"}
            diff={cardsData.dividendYield?.diff || 0}
            description="Dividend Yield"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="IFIX PERÍODO"
            value={cardsData.ibovespaPeriodo?.value || "0%"}
            icon="📊"
            trend={cardsData.ibovespaPeriodo?.trend || "up"}
            diff={cardsData.ibovespaPeriodo?.diff || 0}
            description="30 dias"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="CARTEIRA PERÍODO"
            value={cardsData.carteiraPeriodo?.value || "0%"}
            icon="⬆️"
            trend={cardsData.carteiraPeriodo?.trend || "up"}
            diff={cardsData.carteiraPeriodo?.diff || 0}
            description="30 dias"
          />
        </Grid>
      </Grid>

      {/* Tabela */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2
                }}>
                  ATIVO
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  SETOR
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  ENTRADA
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  PREÇO INICIAL
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  PREÇO ATUAL
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  DY
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  TETO
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  py: 2
                }}>
                  VIÉS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow 
                  key={row.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                    },
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  {/* COLUNA ATIVO */}
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: row.performance && row.performance >= 0 ? '#dcfce7' : '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        position: 'relative'
                      }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 700,
                          color: '#1e293b',
                          fontSize: '12px'
                        }}>
                          {row.ticker.substring(0, 4)}
                        </Typography>
                        {row.performance !== undefined && row.performance !== 0 && (
                          <Box sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            backgroundColor: row.performance >= 0 ? '#10b981' : '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            fontWeight: 700
                          }}>
                            {row.performance >= 0 ? '↗' : '↘'}
                          </Box>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 700, 
                          color: '#1e293b',
                          fontSize: '14px'
                        }}>
                          {row.ticker}
                        </Typography>
                        {row.performance !== undefined && row.performance !== 0 && (
                          <Typography variant="caption" sx={{ 
                            color: row.performance >= 0 ? '#10b981' : '#ef4444',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {row.performance > 0 ? '+' : ''}{row.performance.toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* COLUNA SETOR */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Chip
                      label={row.setor}
                      size="small"
                      sx={{
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </TableCell>

                  {/* COLUNA ENTRADA (DATA) */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: 500
                    }}>
                      {row.dataEntrada}
                    </Typography>
                  </TableCell>

                  {/* COLUNA PREÇO INICIAL */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: '#1e293b',
                      fontSize: '14px'
                    }}>
                      {row.precoEntrada}
                    </Typography>
                  </TableCell>

                  {/* COLUNA PREÇO ATUAL */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: row.precoAtual !== row.precoEntrada ? (
                          row.performance && row.performance >= 0 ? '#10b981' : '#ef4444'
                        ) : '#64748b',
                        fontSize: '14px'
                      }}
                    >
                      {row.precoAtual || row.precoEntrada}
                    </Typography>
                  </TableCell>

                  {/* COLUNA DY */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#059669',
                        fontSize: '14px'
                      }}
                    >
                      {row.dy}
                    </Typography>
                  </TableCell>

                  {/* COLUNA TETO */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: '#64748b',
                      fontSize: '13px'
                    }}>
                      {row.precoTeto}
                    </Typography>
                  </TableCell>

                  {/* COLUNA VIÉS */}
                  <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Chip
                      label={row.vies.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: row.vies.toLowerCase() === 'compra' ? '#dcfce7' : '#fee2e2',
                        color: row.vies.toLowerCase() === 'compra' ? '#059669' : '#dc2626',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        height: 24,
                        minWidth: 70,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        
        <Divider />
        
        <TablePagination
          component="div"
          count={count}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={currentPage}
          rowsPerPage={currentRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`}
          sx={{
            '& .MuiTablePagination-toolbar': {
              padding: 2
            }
          }}
        />
      </Card>
    </Stack>
  );
}
