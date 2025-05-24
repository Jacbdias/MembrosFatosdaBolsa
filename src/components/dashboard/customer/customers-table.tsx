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

function noop(): undefined {
  return undefined;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
}

function StatCard({ title, value, icon, trend, diff }: StatCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  return (
    <Card sx={{ height: 88, flex: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="overline" sx={{ display: 'block', lineHeight: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Box>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: 36, width: 36 }}>
            {icon}
          </Avatar>
        </Stack>
        {diff !== undefined && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <TrendIcon color={trendColor} fontSize="small" />
            <Typography color={trendColor} variant="body2">
              {diff}%
            </Typography>
            <Typography color="text.secondary" variant="caption">
              no período
            </Typography>
          </Stack>
        )}
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
      <Stack spacing={2} direction="row" useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
        <StatCard title="IBOVESPA" value="129k" icon={<CurrencyDollarIcon />} trend="up" diff={1.6} />
        <StatCard title="ÍNDICE SMALL" value="18k" icon={<UsersThreeIcon />} trend="down" diff={3.2} />
        <StatCard title="CARTEIRA HOJE" value="75.5%" icon={<ListBulletsIcon />} />
        <StatCard title="DIVIDEND YELD" value="5.2%" icon={<ChartBarIcon />} />
        <StatCard title="IBOVESPA NO PERÍODO" value="3.4%" icon={<CurrencyDollarIcon />} trend="up" diff={3.4} />
        <StatCard title="CARTEIRA NO PERÍODO" value="4.7%" icon={<ChartBarIcon />} trend="up" diff={4.7} />
      </Stack>
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
                <TableCell>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                row.vies = 'Compra';
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
                        <Avatar src={row.avatar} alt={row.ticker} />
                        <Typography variant="subtitle2">{row.ticker}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2 }}>{row.setor}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.precoEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dy}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.precoTeto}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          backgroundColor: row.vies === 'Compra' ? '#4dfb01' : 'transparent',
                          color: row.vies === 'Compra' ? '#000' : 'inherit',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '16px',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          textAlign: 'center',
                          minWidth: '60px',
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
        />
      </Card>
    </Box>
  );
}
