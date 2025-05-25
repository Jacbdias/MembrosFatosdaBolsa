'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // Função vazia para props obrigatórias
}

export interface ExteriorAsset {
  id: string;
  avatar: string;
  name: string;
  ticker: string;
  sector: string;
  country: string;
  currency: string;
  entryDate: Date;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface ExteriorTableProps {
  count?: number;
  page?: number;
  rows?: ExteriorAsset[];
  rowsPerPage?: number;
}

export function ExteriorTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: ExteriorTableProps): React.JSX.Element {
  // Dados de exemplo para investimentos no exterior
  const defaultRows: ExteriorAsset[] = [
    {
      id: 'USR-001',
      avatar: '/assets/avatar-1.png',
      name: 'Apple Inc.',
      ticker: 'AAPL',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      entryDate: dayjs().subtract(6, 'months').toDate(),
      entryPrice: 180.50,
      currentPrice: 195.30,
      quantity: 50,
      totalValue: 9765.00,
      gainLoss: 740.00,
      gainLossPercent: 8.2
    },
    {
      id: 'USR-002',
      avatar: '/assets/avatar-2.png',
      name: 'Microsoft Corporation',
      ticker: 'MSFT',
      sector: 'Technology',
      country: 'USA',
      currency: 'USD',
      entryDate: dayjs().subtract(8, 'months').toDate(),
      entryPrice: 320.00,
      currentPrice: 378.85,
      quantity: 25,
      totalValue: 9471.25,
      gainLoss: 1471.25,
      gainLossPercent: 18.4
    },
    {
      id: 'USR-003',
      avatar: '/assets/avatar-3.png',
      name: 'Tesla Inc.',
      ticker: 'TSLA',
      sector: 'Automotive',
      country: 'USA',
      currency: 'USD',
      entryDate: dayjs().subtract(4, 'months').toDate(),
      entryPrice: 250.00,
      currentPrice: 238.45,
      quantity: 30,
      totalValue: 7153.50,
      gainLoss: -346.50,
      gainLossPercent: -4.6
    },
    {
      id: 'USR-004',
      avatar: '/assets/avatar-4.png',
      name: 'ASML Holding',
      ticker: 'ASML',
      sector: 'Technology',
      country: 'Netherlands',
      currency: 'EUR',
      entryDate: dayjs().subtract(10, 'months').toDate(),
      entryPrice: 650.00,
      currentPrice: 742.30,
      quantity: 15,
      totalValue: 11134.50,
      gainLoss: 1384.50,
      gainLossPercent: 14.2
    },
    {
      id: 'USR-005',
      avatar: '/assets/avatar-5.png',
      name: 'Shopify Inc.',
      ticker: 'SHOP',
      sector: 'E-commerce',
      country: 'Canada',
      currency: 'CAD',
      entryDate: dayjs().subtract(7, 'months').toDate(),
      entryPrice: 85.00,
      currentPrice: 92.15,
      quantity: 100,
      totalValue: 9215.00,
      gainLoss: 715.00,
      gainLossPercent: 8.4
    }
  ];

  const rowsToShow = rows.length > 0 ? rows : defaultRows;
  const rowIds = React.useMemo(() => rowsToShow.map((asset) => asset.id), [rowsToShow]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rowsToShow.length;
  const selectedAll = rowsToShow.length > 0 && selected?.size === rowsToShow.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell>País</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Moeda</TableCell>
              <TableCell>Data Entrada</TableCell>
              <TableCell>Preço Entrada</TableCell>
              <TableCell>Preço Atual</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Ganho/Perda</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToShow.map((row) => {
              const isSelected = selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Avatar src={row.avatar} />
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">{row.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {row.ticker}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.country}</TableCell>
                  <TableCell>{row.sector}</TableCell>
                  <TableCell>{row.currency}</TableCell>
                  <TableCell>{dayjs(row.entryDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    {row.currency} {row.entryPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {row.currency} {row.currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>
                    {row.currency} {row.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: row.gainLoss >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 500
                        }}
                      >
                        {row.currency} {Math.abs(row.gainLoss).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: row.gainLoss >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 500
                        }}
                      >
                        ({row.gainLoss >= 0 ? '+' : ''}{row.gainLossPercent.toFixed(1)}%)
                      </Typography>
                    </Stack>
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
      />
    </Card>
  );
}
