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

// Ícones do Material-UI
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import ShowChartIcon from '@mui/icons-material/ShowChart';

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
  const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  
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
            color: '#64748b'
          }}>
            {icon}
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
              color: trendColor
            }}>
              <TrendIcon sx={{ fontSize: 12 }} />
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

function getSetorIcon(setor: string): React.ReactNode {
  switch (setor.toLowerCase()) {
    case 'shopping':
      return <BusinessIcon sx={{ fontSize: 16 }} />;
    case 'papel':
      return <BarChartIcon sx={{ fontSize: 16 }} />;
    case 'logística':
      return <ShowChartIcon sx={{ fontSize: 16 }} />;
    default:
      return <AttachMoneyIcon sx={{ fontSize: 16 }} />;
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
            icon={<BarChartIcon sx={{ fontSize: 16 }} />}
            trend={cardsData.ibovespa?.trend || "up"}
            diff={cardsData.ibovespa?.diff || 0}
            description="Hoje"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="IFIX"
            value={cardsData.indiceSmall?.value || "2.1k"}
            icon={<BusinessIcon sx={{ fontSize: 16 }} />}
            trend={cardsData.indiceSmall?.trend || "up"}
            diff={cardsData.indiceSmall?.diff || 0}
            description="Índice FIIs"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="CARTEIRA"
            value={cardsData.carteiraHoje?.value || "R$ 0"}
            icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
            trend={cardsData.carteiraHoje?.trend || "up"}
            diff={cardsData.carteiraHoje?.diff || 0}
            description="Hoje"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="DY MÉDIO"
            value={cardsData.dividendYield?.value || "0%"}
            icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
            trend={cardsData.dividendYield?.trend || "up"}
            diff={cardsData.dividendYield?.diff || 0}
            description="Dividend Yield"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="IFIX PERÍODO"
            value={cardsData.ibovespaPeriodo?.value || "0%"}
            icon={<ShowChartIcon sx={{ fontSize: 16 }} />}
            trend={cardsData.ibovespaPeriodo?.trend || "up"}
            diff={cardsData.ibovespaPeriodo?.diff || 0}
            description="30 dias"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <MarketIndicator
            title="CARTEIRA PERÍODO"
            value={cardsData.carteiraPeriodo?.value || "0%"}
            icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
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
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                  FII
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                  Setor
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Entrada
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Preço Atual
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Performance
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  DY
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Teto
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Viés
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
                    cursor: 'pointer'
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ width: 32, height: 32, backgroundColor: '#e2e8f0', color: '#64748b' }}>
                        {getSetorIcon(row.setor)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {row.ticker}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {row.dataEntrada}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.setor}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {row.precoEntrada}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: row.precoAtual !== row.precoEntrada ? '#059669' : '#64748b'
                      }}
                    >
                      {row.precoAtual || row.precoEntrada}
                    </Typography>
                    {row.variacaoPercent !== undefined && row.variacaoPercent !== 0 && (
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        {row.variacaoPercent >= 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 12, color: '#10b981' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: row.variacaoPercent >= 0 ? '#10b981' : '#ef4444',
                            fontSize: '0.7rem'
                          }}
                        >
                          {row.variacaoPercent > 0 ? '+' : ''}{row.variacaoPercent.toFixed(2)}%
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {row.performance !== undefined && row.performance !== 0 ? (
                      <Stack alignItems="center" spacing={0.5}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: row.performance >= 0 ? '#10b981' : '#ef4444'
                          }}
                        >
                          {row.performance > 0 ? '+' : ''}{row.performance.toFixed(2)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.abs(row.performance), 100)}
                          sx={{
                            width: 60,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: row.performance >= 0 ? '#10b981' : '#ef4444',
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        --
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#059669',
                        backgroundColor: '#dcfce7',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.8rem'
                      }}
                    >
                      {row.dy}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                      {row.precoTeto}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {getViesChip(row.vies, row.performance)}
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
