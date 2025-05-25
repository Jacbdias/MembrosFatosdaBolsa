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
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { Storefront } from '@phosphor-icons/react/dist/ssr/Storefront';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { Truck } from '@phosphor-icons/react/dist/ssr/Truck';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';
import { TrendUp } from '@phosphor-icons/react/dist/ssr/TrendUp';

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
    <Card sx={{
      minHeight: 120,
      flex: '1 1 200px',
      maxWidth: { xs: '100%', sm: '300px' },
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
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
            <Avatar sx={{ 
              backgroundColor: '#374151',
              height: 32, 
              width: 32,
              '& svg': { 
                fontSize: 16,
                color: 'white'
              }
            }}>
              {icon}
            </Avatar>
          </Stack>
          
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: trend && diff !== undefined ? 
                  (trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)') 
                  : 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {diff !== undefined && trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendIcon size={16} style={{ color: trendColor }} />
              <Typography sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
                {diff > 0 ? '+' : ''}{diff}%
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                no período
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function getSetorIcon(setor: string): React.ReactNode {
  const iconStyle = { fontSize: 20, color: '#6b7280' };
  
  switch (setor.toLowerCase()) {
    case 'shopping':
    case 'shoppings':
      return <Storefront style={iconStyle} />;
    case 'papel':
    case 'papel e celulose':
      return <FileText style={iconStyle} />;
    case 'logística':
    case 'logistico':
      return <Truck style={iconStyle} />;
    case 'fii':
    case 'fiis':
    case 'híbrido':
    case 'hibrido':
      return <Buildings style={iconStyle} />;
    case 'pdf':
      return <FileText style={iconStyle} />;
    case 'renda fixa':
      return <TrendUp style={iconStyle} />;
    default:
      return <CurrencyDollarIcon style={iconStyle} />;
  }
}

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
}

interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: SettingsData[];
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

export function SettingsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: SettingsTableProps): React.JSX.Element {
  
  // Dados reais dos ativos baseados na tabela fornecida
  const dadosReais: SettingsData[] = [
    {
      id: "1",
      avatar: "",
      ticker: "MALL11",
      setor: "Shopping",
      dataEntrada: "26/01/2022",
      precoEntrada: "R$ 118,27",
      precoAtual: "R$ 109,23",
      dy: "10,09%",
      precoTeto: "R$ 109,68",
      vies: "Compra"
    },
    {
      id: "2",
      avatar: "",
      ticker: "KNSC11",
      setor: "Papel",
      dataEntrada: "26/01/2022",
      precoEntrada: "R$ 9,21",
      precoAtual: "R$ 9,87",
      dy: "11,22%",
      precoTeto: "R$ 9,14",
      vies: "Compra"
    },
    {
      id: "3",
      avatar: "",
      ticker: "HGBS11",
      setor: "Shopping",
      dataEntrada: "07/01/2023",
      precoEntrada: "R$ 118,08",
      precoAtual: "R$ 119,36",
      dy: "10,77%",
      precoTeto: "R$ 119,30",
      vies: "Compra"
    },
    {
      id: "4",
      avatar: "",
      ticker: "RURA11",
      setor: "Papel",
      dataEntrada: "14/01/2023",
      precoEntrada: "R$ 10,25",
      precoAtual: "R$ 9,67",
      dy: "12,73%",
      precoTeto: "R$ 8,70",
      vies: "Compra"
    },
    {
      id: "5",
      avatar: "",
      ticker: "HSLG11",
      setor: "Híbrido",
      dataEntrada: "13/01/2024",
      precoEntrada: "R$ 10,08",
      precoAtual: "R$ 10,36",
      dy: "11,09%",
      precoTeto: "R$ 10,81",
      vies: "Compra"
    },
    {
      id: "6",
      avatar: "",
      ticker: "BPFF11",
      setor: "PDF",
      dataEntrada: "08/01/2024",
      precoEntrada: "R$ 72,12",
      precoAtual: "R$ 82,40",
      dy: "12,20%",
      precoTeto: "R$ 66,34",
      vies: "Compra"
    },
    {
      id: "7",
      avatar: "",
      ticker: "HGFF11",
      setor: "FII",
      dataEntrada: "03/01/2023",
      precoEntrada: "R$ 69,18",
      precoAtual: "R$ 71,40",
      dy: "11,12%",
      precoTeto: "R$ 73,59",
      vies: "Compra"
    },
    {
      id: "8",
      avatar: "",
      ticker: "RBCO11",
      setor: "Logística",
      dataEntrada: "03/01/2022",
      precoEntrada: "R$ 59,25",
      precoAtual: "R$ 108,66",
      dy: "10,18%",
      precoTeto: "R$ 109,89",
      vies: "Compra"
    },
    {
      id: "9",
      avatar: "",
      ticker: "SNAG11",
      setor: "Logística",
      dataEntrada: "03/01/2022",
      precoEntrada: "R$ 93,12",
      precoAtual: "R$ 163,44",
      dy: "10,41%",
      precoTeto: "R$ 136,00",
      vies: "Compra"
    },
    {
      id: "10",
      avatar: "",
      ticker: "HSOG11",
      setor: "Logística",
      dataEntrada: "27/01/2020",
      precoEntrada: "R$ 141,80",
      precoAtual: "R$ 157,72",
      dy: "8,62%",
      precoTeto: "R$ 148,67",
      vies: "Compra"
    },
    {
      id: "11",
      avatar: "",
      ticker: "USIM11",
      setor: "Shopping",
      dataEntrada: "14/04/2022",
      precoEntrada: "R$ 78,00",
      precoAtual: "R$ 81,67",
      dy: "10,95%",
      precoTeto: "R$ 93,40",
      vies: "Compra"
    },
    {
      id: "12",
      avatar: "",
      ticker: "AFHI11",
      setor: "Papel",
      dataEntrada: "05/07/2022",
      precoEntrada: "R$ 99,91",
      precoAtual: "R$ 91,79",
      dy: "12,25%",
      precoTeto: "R$ 93,30",
      vies: "Compra"
    },
    {
      id: "13",
      avatar: "",
      ticker: "BTLG11",
      setor: "Logística",
      dataEntrada: "08/01/2022",
      precoEntrada: "R$ 100,14",
      precoAtual: "R$ 100,20",
      dy: "9,58%",
      precoTeto: "R$ 104,09",
      vies: "Compra"
    },
    {
      id: "14",
      avatar: "",
      ticker: "VGTA11",
      setor: "Papel",
      dataEntrada: "27/12/2022",
      precoEntrada: "R$ 49,20",
      precoAtual: "R$ 51,18",
      dy: "12,50%",
      precoTeto: "R$ 54,23",
      vies: "Compra"
    },
    {
      id: "15",
      avatar: "",
      ticker: "HCRJ11",
      setor: "Híbrido",
      dataEntrada: "21/09/2020",
      precoEntrada: "R$ 113,95",
      precoAtual: "R$ 126,97",
      dy: "10,01%",
      precoTeto: "R$ 120,25",
      vies: "Compra"
    },
    {
      id: "16",
      avatar: "",
      ticker: "KCRJ11",
      setor: "Renda Fixa",
      dataEntrada: "17/08/2022",
      precoEntrada: "R$ 113,00",
      precoAtual: "R$ 124,86",
      dy: "10,35%",
      precoTeto: "R$ 138,57",
      vies: "Compra"
    },
    {
      id: "17",
      avatar: "",
      ticker: "ALRZ11",
      setor: "Híbrido",
      dataEntrada: "03/02/2022",
      precoEntrada: "R$ 113,99",
      precoAtual: "R$ 110,07",
      dy: "9,14%",
      precoTeto: "R$ 110,16",
      vies: "Compra"
    },
    {
      id: "18",
      avatar: "",
      ticker: "RZNJJ11",
      setor: "Papel",
      dataEntrada: "20/11/2021",
      precoEntrada: "R$ 104,73",
      precoAtual: "R$ 114,12",
      dy: "9,31%",
      precoTeto: "R$ 97,91",
      vies: "Compra"
    },
    {
      id: "19",
      avatar: "",
      ticker: "BNFS11",
      setor: "Híbrido",
      dataEntrada: "20/10/2022",
      precoEntrada: "R$ 82,17",
      precoAtual: "R$ 148,19",
      dy: "12,67%",
      precoTeto: "R$ 115,66",
      vies: "Compra"
    },
    {
      id: "20",
      avatar: "",
      ticker: "HGMJ11",
      setor: "Papel",
      dataEntrada: "05/01/2022",
      precoEntrada: "R$ 107,04",
      precoAtual: "R$ 49,30",
      dy: "12,21%",
      precoTeto: "R$ 73,20",
      vies: "Compra"
    },
    {
      id: "21",
      avatar: "",
      ticker: "XVED11",
      setor: "Papel",
      dataEntrada: "12/07/2022",
      precoEntrada: "R$ 9,69",
      precoAtual: "R$ 9,02",
      dy: "12,91%",
      precoTeto: "R$ 9,90",
      vies: "Compra"
    }
  ];

  console.log("✅ SettingsTable iniciado!");
  console.log("📊 Dados dos FIIs:", dadosReais.length, "itens");
  console.log("🎯 Primeiro ativo:", dadosReais[0]?.ticker);

  // ✅ SEMPRE usar dados internos dos FIIs - CORREÇÃO PRINCIPAL
  const dadosParaUsar = dadosReais;
  
  const rowIds = React.useMemo(() => dadosParaUsar.map((item) => item.id), [dadosParaUsar]);

  const defaultCards = {
    ibovespa: { value: "158.268", trend: "up" as const, diff: 10.09 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "R$ 118,27", trend: "up" as const, diff: 10.09 },
    dividendYield: { value: "10,9%", trend: "up" as const, diff: 10.9 },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}>
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
      
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '80px' }}>
                  Posição
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço que Iniciou</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Teto</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosParaUsar.map((row, index) => {
                row.vies = 'Compra';
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {index + 1}º
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0'
                        }}>
                          {getSetorIcon(row.setor)}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {row.ticker}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'normal', 
                      textAlign: 'center', 
                      lineHeight: 1.2,
                      fontSize: '0.875rem'
                    }}>
                      {row.setor}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoAtual}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.dy}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.precoTeto}</TableCell>
                    <TableCell>
                      <Box sx={{
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
                      }}>
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
          count={count || dadosParaUsar.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage || dadosParaUsar.length}
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
