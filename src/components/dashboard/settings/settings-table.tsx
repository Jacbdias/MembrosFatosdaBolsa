'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

interface FII {
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

interface SettingsTableProps {
  count: number;
  rows: FII[];
  page: number;
  rowsPerPage: number;
}

function parsePrice(price: string): number {
  if (!price || typeof price !== 'string') return 0;
  return parseFloat(price.replace('R$ ', '').replace(',', '.')) || 0;
}

function calculatePerformance(precoEntrada: string, precoAtual: string): number {
  const entrada = parsePrice(precoEntrada);
  const atual = parsePrice(precoAtual);
  if (entrada <= 0) return 0;
  return ((atual - entrada) / entrada) * 100;
}

export function SettingsTable({ count, rows }: { count: number; rows: FII[] }): React.JSX.Element {
  // Sem necessidade de estados de paginação
  // const [page, setPage] = React.useState(initialPage);
  // const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  // Validation
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography variant="h6" color="text.secondary">
          📊 Nenhum FII encontrado na carteira
        </Typography>
      </Box>
    );
  }

  // Sem handlers de paginação necessários
  // const handleChangePage = (event: unknown, newPage: number) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  // Mostrar todos os FIIs sem paginação
  const paginatedFiis = rows;

  return (
    <Card sx={{
      borderRadius: 4,
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        p: 4,
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.5rem', mb: 0.5 }}>
              Carteira de FIIs Premium
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1rem' }}>
              {count} fundos imobiliários • Viés calculado automaticamente
            </Typography>
          </Box>
          <Box sx={{
            background: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            {count} FIIs
          </Box>
        </Stack>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Ativo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Setor</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Entrada</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Preço Inicial</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Preço Atual</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>DY</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Teto</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' }}>Viés</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFiis.map((row, index) => {
              // Validation for each row
              if (!row || !row.id || !row.ticker) {
                console.warn('Invalid FII row:', row);
                return null;
              }

              try {
                const performance = calculatePerformance(row.precoEntrada || '', row.precoAtual || '');
                const globalIndex = index + 1; // Índice simples sem paginação

                return (
                  <TableRow hover key={row.id}>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>
                      {globalIndex}
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar || ''} 
                          alt={row.ticker || ''} 
                          sx={{ width: 40, height: 40 }}
                        >
                          {row.ticker ? row.ticker.substring(0, 2) : '??'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {row.ticker || 'N/A'}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: performance >= 0 ? '#059669' : '#dc2626', 
                              fontWeight: 600 
                            }}
                          >
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip 
                        label={row.setor || 'N/A'} 
                        size="small" 
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }} 
                      />
                    </TableCell>
                    
                    <TableCell align="center" sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {row.dataEntrada || 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {row.precoEntrada || 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center" sx={{ 
                      fontWeight: 700, 
                      color: performance >= 0 ? '#10b981' : '#ef4444' 
                    }}>
                      {row.precoAtual || 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {row.dy || 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {row.precoTeto || 'N/A'}
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={row.vies || 'Aguardar'}
                        size="small"
                        sx={{
                          backgroundColor: (row.vies === 'Compra') ? '#dcfce7' : '#fef3c7',
                          color: (row.vies === 'Compra') ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              } catch (error) {
                console.error('Erro ao renderizar linha do FII:', {
                  fii: row,
                  error: error instanceof Error ? error.message : 'Erro desconhecido'
                });
                return null;
              }
            })}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Itens por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 2
        }}
      />
    </Card>
  );
}
