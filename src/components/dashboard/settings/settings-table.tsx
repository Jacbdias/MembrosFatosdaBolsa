'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

interface CardsData {
  ibovespa?: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
  ifix?: {
    value: string;
    trend: 'up' | 'down';
    diff: number;
  };
  carteiraHoje?: {
    value: string;
    trend: 'up' | 'down';
    diff?: number;
  };
  dividendYield?: {
    value: string;
    trend: 'up' | 'down';
    diff?: number;
  };
}

interface SettingsTableProps {
  count: number;
  rows: FII[];
  cardsData?: CardsData;
  ibovespaReal?: any;
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

// 🔥 COMPONENTE DE CARD INDIVIDUAL
function MarketCard({ 
  title, 
  subtitle, 
  value, 
  trend, 
  diff, 
  icon 
}: {
  title: string;
  subtitle: string;
  value: string;
  trend: 'up' | 'down';
  diff?: number;
  icon?: React.ReactNode;
}) {
  const isPositive = trend === 'up';
  
  return (
    <Card sx={{
      p: 3,
      borderRadius: 3,
      border: '1px solid rgba(148, 163, 184, 0.2)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1)',
      }
    }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 800, 
              fontSize: '1.1rem',
              color: '#1e293b',
              lineHeight: 1.2
            }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#64748b',
              fontSize: '0.85rem',
              mt: 0.5
            }}>
              {subtitle}
            </Typography>
          </Box>
          
          {icon && (
            <Box sx={{
              background: isPositive ? 
                'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 
                'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
              color: isPositive ? '#059669' : '#dc2626',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          )}
        </Stack>

        {/* Valor Principal */}
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 900,
            fontSize: '2rem',
            color: '#1e293b',
            lineHeight: 1,
            letterSpacing: '-0.025em'
          }}>
            {value}
          </Typography>
          
          {/* Variação */}
          {diff !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              {isPositive ? (
                <TrendingUp size={16} color="#059669" />
              ) : (
                <TrendingDown size={16} color="#dc2626" />
              )}
              <Typography variant="body2" sx={{
                color: isPositive ? '#059669' : '#dc2626',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                {isPositive ? '+' : ''}{diff.toFixed(2)}%
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

export function SettingsTable({ count, rows, cardsData, ibovespaReal }: SettingsTableProps): React.JSX.Element {
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

  // 🔥 FORMATAÇÃO DINÂMICA DO IBOVESPA
  const formatarIbovespa = (valor: string) => {
    if (!valor) return '136.985';
    
    // Se já está formatado, manter
    if (valor.includes('.')) return valor;
    
    // Se é número sem formatação, adicionar pontos
    const numero = parseInt(valor);
    if (!isNaN(numero)) {
      return numero.toLocaleString('pt-BR');
    }
    
    return valor;
  };

  // 🎯 DADOS FINAIS DOS CARDS
  const ibovespaFormatado = cardsData?.ibovespa?.value ? 
    formatarIbovespa(cardsData.ibovespa.value) : '136.985';

  console.log('🔥 SETTINGS TABLE - Dados dos cards:', {
    cardsData,
    ibovespaReal,
    ibovespaFormatado
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* 🔥 CARDS DE MERCADO - IBOVESPA E IFIX */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* IBOVESPA */}
        <Grid xs={12} sm={6} md={3}>
          <MarketCard
            title="IBOVESPA"
            subtitle="Índice da Bolsa Brasileira"
            value={ibovespaFormatado}
            trend={cardsData?.ibovespa?.trend || 'down'}
            diff={cardsData?.ibovespa?.diff}
            icon={cardsData?.ibovespa?.trend === 'up' ? 
              <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
        </Grid>

        {/* IFIX */}
        <Grid xs={12} sm={6} md={3}>
          <MarketCard
            title="ÍNDICE IFIX"
            subtitle="Fundos Imobiliários da B3"
            value={cardsData?.ifix?.value || '3.200'}
            trend={cardsData?.ifix?.trend || 'up'}
            diff={cardsData?.ifix?.diff || 0.24}
            icon={cardsData?.ifix?.trend === 'up' ? 
              <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
        </Grid>

        {/* CARTEIRA HOJE */}
        <Grid xs={12} sm={6} md={3}>
          <MarketCard
            title="CARTEIRA HOJE"
            subtitle="Performance da Carteira"
            value={cardsData?.carteiraHoje?.value || '88.7%'}
            trend={cardsData?.carteiraHoje?.trend || 'up'}
            diff={cardsData?.carteiraHoje?.diff}
            icon={cardsData?.carteiraHoje?.trend === 'up' ? 
              <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
        </Grid>

        {/* DIVIDEND YIELD */}
        <Grid xs={12} sm={6} md={3}>
          <MarketCard
            title="DIVIDEND YIELD"
            subtitle="Rendimento Médio dos FIIs"
            value={cardsData?.dividendYield?.value || '7.4%'}
            trend={cardsData?.dividendYield?.trend || 'up'}
            diff={cardsData?.dividendYield?.diff}
            icon={<TrendingUp size={20} />}
          />
        </Grid>
      </Grid>

      {/* 🔥 TABELA DE FIIs */}
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
              {rows.map((row, index) => {
                // Validation for each row
                if (!row || !row.id || !row.ticker) {
                  console.warn('Invalid FII row:', row);
                  return null;
                }

                try {
                  const performance = calculatePerformance(row.precoEntrada || '', row.precoAtual || '');
                  const globalIndex = index + 1; // Índice simples

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
      </Card>
    </Box>
  );
}
