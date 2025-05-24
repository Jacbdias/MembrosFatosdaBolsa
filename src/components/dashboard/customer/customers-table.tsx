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

import { useSelection } from '@/hooks/use-selection';

function noop(): void {}

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
                    if (event.target.checked) selectAll();
                    else deselectAll();
                  }}
                />
              </TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Data de Entrada</TableCell>
              <TableCell>Preço que Iniciou</TableCell>
              <TableCell>Preço Atual</TableCell>
              <TableCell>DY</TableCell>
              <TableCell>Preço Teto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
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
                      <Avatar src={row.avatar} />
                      <Typography variant="subtitle2">{row.ticker}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.setor}</TableCell>
                  <TableCell>{row.dataEntrada}</TableCell>
                  <TableCell>{row.precoEntrada}</TableCell>
                  <TableCell>{row.precoAtual}</TableCell>
                  <TableCell>{row.dy}</TableCell>
                  <TableCell>{row.precoTeto}</TableCell>
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
      />
    </Card>
  );
}
