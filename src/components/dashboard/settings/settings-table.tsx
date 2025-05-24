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
    <Card 
      sx={{ 
        minHeight: 120,
        flex: '1 1 200px',
        maxWidth: { xs: '100%', sm: '300px' },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Header com título e ícone */}
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
            <Avatar 
              sx={{ 
                backgroundColor: '#374151',
                height: 32, 
                width: 32,
                '& svg': { 
                  fontSize: 16,
                  color: 'white'
                }
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          
          {/* Valor principal */}
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
          
          {/* Trend indicator */}
          {diff !== undefined && trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendIcon 
                size={16} 
                style={{ color: trendColor }} 
              />
              <Typography 
                sx={{ 
                  color: trendColor,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                {diff > 0 ? '+' : ''}{diff}%
              </Typography>
              <Typography 
                color="text.secondary" 
                sx={{ fontSize: '0.75rem' }}
              >
                no período
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Função para obter ícone baseado no setor
function getSetorIcon(setor: string): React.ReactNode {
  const iconStyle = { fontSize: 20 };
  
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
  const rowIds = React.useMemo(() => rows.map((item) => item.id), [rows]);

  // Valores específicos para DIVIDENDOS (diferentes dos outros)
  const defaultCards = {
    ibovespa: { value: "158k", trend: "up" as const, diff: 3.2 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "92.1%", trend: "up" as const, diff: 92.1 },
    dividendYield: { value: "8.8%", trend: "up" as const, diff: 8.8 },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  // Mescla os dados padrão com os dados passados via props
  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      {/* Cards de estatísticas com grid responsivo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm
