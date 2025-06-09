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
import LinearProgress from '@mui/material/LinearProgress';
import { CircularProgress } from '@mui/material';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';

function noop() {}

export default function SettingsPage(): React.JSX.Element {
  const { fiis, loading } = useFiisCotacoesBrapi();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} />
        <Box ml={2} sx={{ fontSize: '1.1rem' }}>
          🏢 Carregando carteira de FIIs...
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{
        borderRadius: 4,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
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
                {fiis.length} fundos imobiliários • Viés calculado automaticamente
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
              {fiis.length} FIIs
            </Box>
          </Stack>
        </Box>

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
              {fiis.map((row, index) => {
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                const vies = precoAtualNum < parseFloat(row.precoTeto.replace('R$ ', '').replace(',', '.')) ? 'Compra' : 'Aguardar';

                return (
                  <TableRow hover key={row.id}>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{index + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={row.avatar} alt={row.ticker} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>{row.ticker}</Typography>
                          <Typography variant="caption" sx={{ color: performance >= 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={row.setor} size="small" sx={{ fontSize: '0.75rem', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.875rem', color: '#64748b' }}>{row.dataEntrada}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{row.precoEntrada}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: performance >= 0 ? '#10b981' : '#ef4444' }}>{row.precoAtual}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{row.dy}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>{row.precoTeto}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={vies}
                        size="small"
                        sx={{
                          backgroundColor: vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: vies === 'Compra' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase'
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
          count={fiis.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={0}
          rowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página:"
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: 2
          }}
        />
      </Card>
    </Box>
  );
}
