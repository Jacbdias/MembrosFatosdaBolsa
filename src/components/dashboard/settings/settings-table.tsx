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

function noop() {}

export interface SettingsData {
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
  performance?: number;
  variacao?: number;
  variacaoPercent?: number;
  volume?: number;
  statusApi?: 'success' | 'fallback';
}

interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: SettingsData[];
  rowsPerPage?: number;
}

export function SettingsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: SettingsTableProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell align="center">Setor</TableCell>
              <TableCell align="center">Entrada</TableCell>
              <TableCell align="center">Preço Inicial</TableCell>
              <TableCell align="center">Preço Atual</TableCell>
              <TableCell align="center">DY</TableCell>
              <TableCell align="center">Teto</TableCell>
              <TableCell align="center">Viés</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
              const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
              const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
              const vies = precoAtualNum < parseFloat(row.precoTeto.replace('R$ ', '').replace(',', '.'))
                ? 'Compra'
                : 'Aguardar';

              return (
                <TableRow hover key={row.id}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={row.avatar} alt={row.ticker} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {row.ticker}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: performance >= 0 ? '#059669' : '#dc2626' }}
                        >
                          {performance > 0 ? '+' : ''}
                          {performance.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={row.setor} size="small" />
                  </TableCell>
                  <TableCell align="center">{row.dataEntrada}</TableCell>
                  <TableCell align="center">{row.precoEntrada}</TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: performance >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {row.precoAtual}
                  </TableCell>
                  <TableCell align="center">{row.dy}</TableCell>
                  <TableCell align="center">{row.precoTeto}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={vies}
                      size="small"
                      sx={{
                        backgroundColor: vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                        color: vies === 'Compra' ? '#059669' : '#d97706',
                        fontWeight: 700,
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
      />
    </Card>
  );
}
